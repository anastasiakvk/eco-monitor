import { NextRequest, NextResponse } from "next/server";
import { stations } from "@/data/stations";
import logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    logger.info({ method: "GET", path: "/api/stations" }, "Запит списку станцій");

    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    let result = [...stations];

    if (region) {
      result = result.filter((s) =>
        s.region.toLowerCase().includes(region.toLowerCase())
      );
    }
    if (type) {
      result = result.filter((s) => s.type === type);
    }

    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    logger.info({ total, page }, "Станції успішно повернуто");

    return NextResponse.json({ data: paginated, total, page, totalPages });

  } catch (err) {
    logger.error({ path: "/api/stations", error: err }, "Помилка отримання станцій");
    return NextResponse.json(
      { error: "Internal Server Error", message: "Помилка сервера" },
      { status: 500 }
    );
  }
}
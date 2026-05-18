import { NextRequest, NextResponse } from "next/server";
import { measurements } from "@/data/measurements";
import logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    logger.info({ method: "GET", path: "/api/measurements" }, "Запит вимірювань");

    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get("stationId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    let result = [...measurements];

    if (stationId) {
      result = result.filter((m) => m.stationId === stationId);
    }
    if (from) {
      result = result.filter((m) => new Date(m.timestamp) >= new Date(from));
    }
    if (to) {
      result = result.filter((m) => new Date(m.timestamp) <= new Date(to));
    }

    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    logger.info({ total, page, stationId }, "Вимірювання успішно повернуто");

    return NextResponse.json({ data: paginated, total, page, totalPages });

  } catch (err) {
    logger.error({ path: "/api/measurements", error: err }, "Помилка отримання вимірювань");
    return NextResponse.json(
      { error: "Internal Server Error", message: "Помилка сервера" },
      { status: 500 }
    );
  }
}
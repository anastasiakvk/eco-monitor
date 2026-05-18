import { NextRequest, NextResponse } from "next/server";
import { stations } from "@/data/stations";
import { measurements } from "@/data/measurements";
import logger from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    logger.info({ method: "GET", path: `/api/stations/${id}` }, "Запит даних станції");

    const station = stations.find((s) => s.id === id);

    if (!station) {
      logger.warn({ id }, "Станцію не знайдено");
      return NextResponse.json(
        { error: "Not Found", message: "Станцію не знайдено", statusCode: 404 },
        { status: 404 }
      );
    }

    const stationMeasurements = measurements
      .filter((m) => m.stationId === id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30);

    logger.info({ id, measurementsCount: stationMeasurements.length }, "Дані станції успішно повернуто");

    return NextResponse.json({
      data: { ...station, measurements: stationMeasurements },
    });

  } catch (err) {
    logger.error({ path: "/api/stations/[id]", error: err }, "Помилка отримання даних станції");
    return NextResponse.json(
      { error: "Internal Server Error", message: "Помилка сервера" },
      { status: 500 }
    );
  }
}
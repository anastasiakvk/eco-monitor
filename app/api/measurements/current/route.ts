import { NextResponse } from "next/server";
import { measurements } from "@/data/measurements";
import { stations } from "@/data/stations";
import logger from "@/lib/logger";

export async function GET() {
  try {
    logger.info({ method: "GET", path: "/api/measurements/current" }, "Запит поточних вимірювань");

    const current = stations.map((station) => {
      const latest = measurements
        .filter((m) => m.stationId === station.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return { station, measurement: latest ?? null };
    });

    logger.info({ count: current.length }, "Поточні виміри повернуто");

    return NextResponse.json({ data: current });
  } catch (err) {
    logger.error({ error: err }, "Помилка отримання поточних вимірювань");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

const logBuffer: object[] = [];

export function addLog(entry: object) {
  logBuffer.push(entry);
  if (logBuffer.length > 100) logBuffer.shift();
}

export async function GET() {
  logger.info({ message: "Запит переліку логів" });
  return NextResponse.json({ data: logBuffer, total: logBuffer.length });
}

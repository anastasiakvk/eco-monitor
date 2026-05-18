import { NextRequest, NextResponse } from "next/server";
import { trackEvent, getStats } from "@/lib/analytics";
import logger from "@/lib/logger";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.env.NODE_ENV === "production" ? "/tmp" : process.cwd(), "analytics-log.json");

function saveToFile(event: object) {
  try {
    let existing: object[] = [];
    if (fs.existsSync(LOG_FILE)) {
      const raw = fs.readFileSync(LOG_FILE, "utf-8");
      existing = JSON.parse(raw);
    }
    existing.push(event);
    fs.writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));
  } catch (e) {
    console.error("Помилка збереження аналітики у файл:", e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = { ...body, timestamp: new Date().toISOString() };
    trackEvent(body);
    saveToFile(event);
    logger.info({ event: body.event, page: body.page }, "Аналітична подія");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Помилка" }, { status: 400 });
  }
}

export async function GET() {
  try {
    const memStats = getStats();

    let fileEvents: Array<{ event?: string; page?: string }> = [];
    if (fs.existsSync(LOG_FILE)) {
      const raw = fs.readFileSync(LOG_FILE, "utf-8");
      fileEvents = JSON.parse(raw);
    }

    const pageViews: Record<string, number> = { ...memStats.pageViews };
    const eventCounts: Record<string, number> = { ...memStats.eventCounts };

    fileEvents.forEach((e) => {
      if (e.page) pageViews[e.page] = (pageViews[e.page] || 0) + 1;
      if (e.event) eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    const totalEvents = Math.max(memStats.totalEvents, fileEvents.length);

    return NextResponse.json({
      data: { totalEvents, pageViews, eventCounts }
    });
  } catch {
    return NextResponse.json({ data: getStats() });
  }
}
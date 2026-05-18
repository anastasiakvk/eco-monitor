export interface AnalyticsEvent {
  event: string;
  page?: string;
  stationId?: string;
  timestamp: string;
}

declare global {
  var __analytics_events: AnalyticsEvent[];
}

if (!global.__analytics_events) {
  global.__analytics_events = [];
}

export function trackEvent(data: Omit<AnalyticsEvent, "timestamp">) {
  const entry: AnalyticsEvent = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  global.__analytics_events.push(entry);
  if (global.__analytics_events.length > 200) {
    global.__analytics_events.shift();
  }
  console.log("[Analytics]", JSON.stringify(entry));
}

export function getStats() {
  const events = global.__analytics_events;
  const pageViews: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};

  events.forEach((e) => {
    if (e.page) pageViews[e.page] = (pageViews[e.page] || 0) + 1;
    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
  });

  return {
    totalEvents: events.length,
    pageViews,
    eventCounts,
  };
}
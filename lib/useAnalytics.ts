"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function usePageView() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "page_view",
        page: pathname,
      }),
    }).catch(() => {});
  }, [pathname]);
}

export function trackEvent(event: string, data?: object) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, ...data }),
  }).catch(() => {});
}
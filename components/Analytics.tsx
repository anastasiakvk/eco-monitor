"use client";
import { usePageView } from "@/lib/useAnalytics";

export default function Analytics() {
  usePageView();
  return null;
}
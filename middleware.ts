import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const pathname = new URL(request.url).pathname;
  const response = NextResponse.next();
  const duration = Date.now() - start;

  if (
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/analytics")
  ) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: request.method,
        pathname,
        duration: `${duration}ms`,
      })
    );
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
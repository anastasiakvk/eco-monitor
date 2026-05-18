import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Стискання відповідей
  compress: true,

  // Оптимізація зображень
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Заголовки кешування для статичних файлів
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },

  // Мінімізація bundle
  experimental: {
    optimizePackageImports: ["recharts", "leaflet"],
  },
};

export default nextConfig;
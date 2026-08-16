import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests directly to FastAPI backend to avoid browser CORS issues
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL ?? "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

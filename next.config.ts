import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "172.20.12.31"],
  reactStrictMode: true,
};

export default nextConfig;

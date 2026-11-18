import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    // This is deliberately compiled into the app bundle: it selects local-only
    // startup and static-safe routes. It is not a credential.
    NEXT_PUBLIC_ECLOSET_TARGET: "mobile",
    // The public HTTPS origin is compiled into the native bundle so its API
    // requests never resolve against capacitor://localhost.
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://e-closet-590.vercel.app",
  },
};

export default nextConfig;

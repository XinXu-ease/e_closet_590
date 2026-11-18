import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    // This is deliberately compiled into the app bundle: it selects local-only
    // startup and static-safe routes. It is not a credential.
    NEXT_PUBLIC_ECLOSET_TARGET: "mobile",
  },
};

export default nextConfig;

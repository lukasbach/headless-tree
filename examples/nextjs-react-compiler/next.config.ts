import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    browserDebugInfoInTerminal: true,
    typedEnv: true,
  },
  reactCompiler: true,
  typedRoutes: true,
  images: {
    unoptimized: true, // FIXME
  },
};

export default nextConfig;

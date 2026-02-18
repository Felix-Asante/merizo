import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  reactCompiler: {
    compilationMode: "annotation",
  },
};

export default nextConfig;

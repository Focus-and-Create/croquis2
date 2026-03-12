import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/croquis2",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

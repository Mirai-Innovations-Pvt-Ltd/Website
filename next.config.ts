import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* A stray lockfile exists higher up the drive (C:\Users\HP), so
     pin the tracing root to this project to keep builds
     deterministic. */
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;

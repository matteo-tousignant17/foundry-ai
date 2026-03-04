import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling better-sqlite3 — it's a native addon
  // that must be require()'d directly, not inlined into the JS bundle.
  serverExternalPackages: ["better-sqlite3"],
  // Include the better-sqlite3 native binary in the Vercel function bundle.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/better-sqlite3/**"],
  },
};

export default nextConfig;

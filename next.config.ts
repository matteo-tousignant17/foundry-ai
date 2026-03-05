import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling better-sqlite3 — it's a native addon
  // that must be require()'d directly, not inlined into the JS bundle.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;

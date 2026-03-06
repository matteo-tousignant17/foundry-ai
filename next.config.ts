import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql"],
  outputFileTracingIncludes: {
    "**": [
      "./node_modules/@libsql/linux-x64-gnu/**",
      "./node_modules/@libsql/linux-x64-musl/**",
      "./node_modules/@libsql/linux-arm64-gnu/**",
      "./node_modules/@libsql/linux-arm64-musl/**",
    ],
  },
};

export default nextConfig;

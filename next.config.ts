import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Include the Drizzle migration files in the serverless function bundle
    // so the runtime migrator can find them in /var/task/drizzle on Vercel.
    outputFileTracingIncludes: {
      "/**": ["./drizzle/**"],
    },
  },
};

export default nextConfig;

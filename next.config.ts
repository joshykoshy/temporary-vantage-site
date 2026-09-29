import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Single page with ~7 KB of Tailwind CSS: inlining removes the render-blocking request.
  experimental: { inlineCss: true },
};

export default nextConfig;

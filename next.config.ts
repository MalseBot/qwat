import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !! Only enable this if you're experiencing type issues
    // This might affect build performance
    ignoreBuildErrors: true,}
};

export default nextConfig;

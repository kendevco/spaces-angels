import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable turbopack-related features for Next.js 14 compatibility
    turbo: undefined,
  },
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

export default nextConfig;

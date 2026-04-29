import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['canvas', 'jsdom'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.jsdom = false;
    return config;
  },
  turbopack: {},
};

export default nextConfig;

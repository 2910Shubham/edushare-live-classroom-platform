import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server from other devices on LAN (smart boards / tablets).
  // Fixes Next dev resource blocking like /_next/webpack-hmr when accessed via 192.168.x.x host.
  allowedDevOrigins: ['192.168.1.9', '192.168.1.8', 'localhost', '127.0.0.1'],
  serverExternalPackages: ['canvas', 'jsdom'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.jsdom = false;
    return config;
  },
  turbopack: {},
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/activity',
        destination: '/',
      },
      {
        source: '/join',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;

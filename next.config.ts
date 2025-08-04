import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['zapllo.s3.ap-south-1.amazonaws.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

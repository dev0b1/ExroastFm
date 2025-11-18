import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  turbopack: {
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  // Exclude problematic packages from bundling
  serverExternalPackages: [
    'fluent-ffmpeg',
    '@ffmpeg-installer/ffmpeg',
    'canvas'
  ],
};

export default nextConfig;

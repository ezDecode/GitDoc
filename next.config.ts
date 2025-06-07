import type { NextConfig } from "next";

// Configuration for GitHub Pages deployment
const nextConfig: NextConfig = {
  output: 'export', // Static HTML export
  // basePath is required when deploying to GitHub Pages if the repo name is not custom domain
  basePath: process.env.NODE_ENV === 'production' ? '/GitDocument' : '',
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable server-side features for static export
  experimental: {
    appDocumentPreloading: false,
  },
};

export default nextConfig;

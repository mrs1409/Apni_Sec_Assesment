import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features needed for Netlify
  output: 'standalone',
  
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export default nextConfig;

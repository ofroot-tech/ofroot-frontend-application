import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { webpack }) => {
    // Surface a build-time warning if the critical env var is missing in Vercel/CI
    const required = ['NEXT_PUBLIC_API_BASE_URL'];
    for (const key of required) {
      if (!process.env[key]) {
        // eslint-disable-next-line no-console
        console.warn(`Warning: Missing ${key}. Set it in .env.local (dev) or Vercel Project Settings (prod).`);
      }
    }
    return config;
  },
};

export default nextConfig;

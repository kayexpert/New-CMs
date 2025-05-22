import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        // Allow images from Supabase storage
        protocol: 'https',
        hostname: 'bmpypfvovmlmsmpmmqau.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Quality is set at the component level, not here
  },
};

export default nextConfig;

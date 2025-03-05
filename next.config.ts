import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'pagerblob.blob.core.windows.net',
      'picsum.photos',
    ],
  },
  typescript: {
    // WARNING: This will allow production builds even if there are type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // WARNING: This will allow production builds even if there are lint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

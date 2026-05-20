/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { hostname: 'img.clerk.com' },
    ],
  },
};

module.exports = nextConfig;

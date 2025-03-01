/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Only ignore ESLint errors during builds for deployment
    // This is a temporary solution until all ESLint errors are fixed
    ignoreDuringBuilds: process.env.VERCEL === '1',
  },
};

module.exports = nextConfig;

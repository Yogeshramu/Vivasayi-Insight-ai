/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/ml/:path*',
        destination: `${process.env.ML_SERVICE_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@soloadvertiser/ui'],
  output: 'standalone',
};

module.exports = nextConfig;

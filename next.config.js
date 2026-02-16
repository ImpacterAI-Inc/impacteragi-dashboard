/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'export' output for dynamic API routes
  // output: 'export',
  images: {
    unoptimized: true
  },
  // Ensure environment variables are available
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  }
}

module.exports = nextConfig

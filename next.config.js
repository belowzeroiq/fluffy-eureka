/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  env: {
    NEXT_PUBLIC_RAPIDAPI_KEY: process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
    NEXT_PUBLIC_RAPIDAPI_HOST: process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
  },
  // Optimize for Vercel deployment
  swcMinify: true,
  // Enable compression
  compress: true,
  // Generate source maps for production
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig

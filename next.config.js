/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  // Optimize for Vercel deployment
  swcMinify: true,
  // Enable compression
  compress: true,
  // Generate source maps for production
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig

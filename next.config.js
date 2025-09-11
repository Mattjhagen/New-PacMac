/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer']
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin.html'
      },
      {
        source: '/app',
        destination: '/app.html'
      }
    ]
  }
}

module.exports = nextConfig

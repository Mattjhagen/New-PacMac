/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['puppeteer'],
  images: {
    domains: [
      'images.unsplash.com',
      'cdn.pixabay.com',
      'images.pexels.com',
      'store.storeimages.cdn-apple.com',
      'images.samsung.com',
      'lh3.googleusercontent.com',
      'www.apple.com',
      'www.samsung.com',
      'store.google.com',
      'www.oneplus.com',
      'www.gsmarena.com',
      'www.phonearena.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig

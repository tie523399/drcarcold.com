const withNextIntl = require('next-intl/plugin')(
  // This is the default path to your i18n configuration file
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 暫時禁用嚴格模式以避免hydration問題
  swcMinify: true,
  
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizePackageImports: ['lucide-react']
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 解決模組載入問題
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 修復可能的模組解析問題
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
  // Railway 優化配置
  trailingSlash: false,
  poweredByHeader: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // 環境變數處理
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 輸出配置
  output: 'standalone',
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/products/:path*',
        destination: '/zh/products/:path*',
        permanent: false,
      },
    ]
  },
  
  // Headers 配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
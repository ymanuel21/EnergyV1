import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const cspHeader = [
  "default-src 'self'",
  // Next.js scripts + Google Tag Manager
  `script-src 'self'${isDev ? " 'unsafe-eval'" : ''} 'unsafe-inline' https://www.googletagmanager.com`,
  // Next.js inline styles + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Images: self, data URIs, blobs, any HTTPS (for user-uploaded images)
  "img-src 'self' data: blob: https:",
  // Fonts: self + Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com",
  // API calls: self + Google Analytics
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  // No embedding from external sources
  "frame-src 'self'",
  // Block <object> and <embed>
  "object-src 'none'",
  // Restrict <base> to self
  "base-uri 'self'",
  // Forms can only submit to self (NextAuth login)
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  serverExternalPackages: ['pg', '@prisma/adapter-pg'],
  experimental: {
    serverComponentsExternalPackages: ['pg', '@prisma/adapter-pg', '@prisma/client'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;

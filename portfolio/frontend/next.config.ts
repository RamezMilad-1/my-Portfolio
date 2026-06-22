import type { NextConfig } from 'next';

const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';
let uploadsHost = 'localhost';
let uploadsPort = '3001';
let uploadsProtocol: 'http' | 'https' = 'http';
try {
  const u = new URL(apiBase);
  uploadsHost = u.hostname;
  uploadsPort = u.port || (u.protocol === 'https:' ? '443' : '80');
  uploadsProtocol = u.protocol === 'https:' ? 'https' : 'http';
} catch {
  /* keep defaults */
}

// Origin that actually serves uploaded files (the backend). Uploads are
// proxied through the Next server (see `rewrites` below) so they're same-origin
// and can go through the image optimizer.
const uploadsBase = (
  process.env.NEXT_PUBLIC_UPLOADS_BASE ??
  `${uploadsProtocol}://${uploadsHost}${uploadsPort ? `:${uploadsPort}` : ''}`
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    // Serve backend uploads from the frontend origin so `next/image` can
    // optimize them (the optimizer rejects cross-origin localhost URLs).
    return [
      {
        source: '/uploads/:path*',
        destination: `${uploadsBase}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      {
        protocol: uploadsProtocol,
        hostname: uploadsHost,
        port: uploadsPort,
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;

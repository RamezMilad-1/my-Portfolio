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

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: uploadsProtocol,
        hostname: uploadsHost,
        port: uploadsPort,
        pathname: '/uploads/**',
      },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;

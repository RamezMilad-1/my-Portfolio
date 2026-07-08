import type { NextConfig } from 'next';

// Backend origin for the production API proxy (e.g. https://xxx.onrender.com).
// When set, `/api/v1/*` is proxied through the frontend origin so the auth
// cookie is FIRST-PARTY: the browser stores it under the site's own domain,
// the /admin middleware can read it, and Safari/Chrome third-party-cookie
// blocking never applies. Unset in local dev — the frontend talks to
// localhost:3001 directly (same-site, so cookies already work).
const backendOrigin = process.env.BACKEND_ORIGIN?.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    if (!backendOrigin) return [];
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

/**
 * Production API proxy target (e.g. https://xxx.onrender.com). When set, `/api/v1/*` is served
 * through this site's own origin, so the admin session cookie is first-party: `proxy.ts` can read
 * it and browser third-party-cookie blocking never applies. Unset in local development, where the
 * browser talks to localhost:3001 directly (same-site, so cookies already work).
 */
const backendOrigin = process.env.BACKEND_ORIGIN?.replace(/\/+$/, '');

/**
 * Sent with every page. The CSP is limited to directives that can't break the app: the site's
 * pages can't be framed (clickjacking), and `<base>`/plugins/form targets are locked down.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: import.meta.dirname },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/projects', destination: '/#portfolio', permanent: true },
    ];
  },
  async rewrites() {
    if (!backendOrigin) return [];
    return [{ source: '/api/v1/:path*', destination: `${backendOrigin}/api/v1/:path*` }];
  },
};

export default nextConfig;

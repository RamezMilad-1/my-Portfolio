import { type NextRequest, NextResponse } from 'next/server';

/** Must match COOKIE_NAME on the backend. */
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'ramez_session';

/**
 * Optimistic gate for the dashboard: without a session cookie, go straight to the login page.
 * It only checks that the cookie exists — the API verifies the session on every request, and
 * an expired one sends the admin back to sign in.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const login = request.nextUrl.clone();
  login.pathname = '/login';
  login.search = '';
  login.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/admin/:path*'],
};

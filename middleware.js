// Strict, nonce-based Content-Security-Policy for the admin dashboard.
// Every request gets a fresh random nonce; Next.js adds it to its own
// <script> tags automatically, so no inline script without the nonce – and
// no 'unsafe-inline' or 'unsafe-eval' – can run on /admin.
import { NextResponse } from 'next/server';

export function middleware(request) {
  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV !== 'production';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    ...(process.env.VERCEL || process.env.FORCE_HTTPS === 'true' ? ['upgrade-insecure-requests'] : []),
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

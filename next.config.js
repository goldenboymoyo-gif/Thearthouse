/** @type {import('next').NextConfig} */
const path = require('path');
const projectRoot = __dirname;
const tempBase = process.env.NEXT_DIST_DIR;
// Only override the build output directory when explicitly requested (e.g. a
// local temp dir on Windows). On Vercel/Linux this stays the default `.next`.
const relativeDist = tempBase ? path.relative(projectRoot, tempBase) : null;

// Old Site123 addresses, so existing links and search results keep working.
const OLD_URLS = [
  ['/welcome-to-the-art-house-4-bedroom-self-catering-home-victoria-falls', '/the-art-house'],
  ['/what-s-around', '/explore'],
  ['/what-to-do-in-vic-falls/:path*', '/explore#things-to-do'],
  ['/what-our-guests-say', '/guest-reviews'],
  ['/published-articles', '/guest-reviews'],
  // The Journal page was removed.
  ['/articles', '/guest-reviews'],
  ['/contact-us', '/contact'],
  ['/outdoor-living-at-its-finest', '/the-art-house#outdoor-living'],
  ['/outdoor-living-at-its-finest/:slug', '/outdoor-living/:slug'],
  // The former dropdown sub-pages are now sections of two combined pages.
  ['/about', '/the-art-house'],
  ['/quick-look', '/the-art-house#quick-look'],
  ['/outdoor-living', '/the-art-house#outdoor-living'],
  ['/faq', '/the-art-house#faq'],
  ['/whats-around', '/explore'],
  ['/things-to-do', '/explore#things-to-do'],
  // Renamed activities.
  ['/things-to-do/bungee-jumping', '/things-to-do/adrenaline-experiences'],
  ['/things-to-do/sunset-experiences', '/things-to-do/food-and-drink-experience'],
];

// The Express backend (/backend) normally runs inside this project:
// pages/api/[...path].js hands every /api/* request to it. Optionally it can be
// deployed as its own Vercel project instead – then set BACKEND_URL (e.g.
// https://thearthouse-api.vercel.app) and /api/* is forwarded there.
const BACKEND_URL = (process.env.BACKEND_URL || '').replace(/\/+$/, '');
if (BACKEND_URL && !/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(BACKEND_URL) && !/^http:\/\/localhost(:\d+)?$/.test(BACKEND_URL)) {
  throw new Error('BACKEND_URL must be an https:// origin (no path).');
}

const isDev = process.env.NODE_ENV !== 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';

// Content-Security-Policy for the public pages, written for what the site
// actually loads: its own scripts, styles, fonts and images; the Google Maps
// embed on the contact section; nothing else. The admin dashboard gets a
// stricter nonce-based policy from middleware.js.
//
// 'unsafe-inline' for scripts: Next.js streams page data with small inline
// <script> tags on statically generated pages. Removing it would require a
// per-request nonce, which turns every page into a server-rendered page
// (slower, no CDN caching). The public pages render no user-supplied HTML,
// so the remaining XSS surface is small; 'unsafe-eval' is NOT allowed
// (only in local development, which React needs for debugging).
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${isPreview ? ' https://vercel.live' : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}${isPreview ? ' https://vercel.live wss://ws-us3.pusher.com' : ''}`,
  `frame-src https://maps.google.com https://www.google.com${isPreview ? ' https://vercel.live' : ''}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  // Only where the site is always served over HTTPS (Vercel); a local
  // `npm start` on http://localhost would otherwise break its own assets.
  ...(process.env.VERCEL || process.env.FORCE_HTTPS === 'true' ? ['upgrade-insecure-requests'] : []),
].join('; ');

const BASE_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Two years, all subdomains. Add "; preload" only once every subdomain of
  // the real domain is HTTPS-only and you intend to submit it to hstspreload.org.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig = {
  // Do not advertise the framework: keeps responses tidy and one less thing to
  // fingerprint.
  poweredByHeader: false,
  // Express is loaded by Node at runtime rather than bundled.
  serverExternalPackages: ['express'],
  compress: true,
  images: {
    // Real optimization: responsive srcset, WebP, lazy loading and reserved
    // space. Requires the `sharp` package (already installed).
    // WebP rather than AVIF: encoding is 3-5x cheaper, so the first (cold)
    // request for each size returns fast instead of stalling the LCP image.
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Only these qualities can be requested, so nobody can force thousands of
    // extra image transformations (CPU + Vercel image quota) by varying ?q=.
    qualities: [60, 75],
  },
  ...(relativeDist ? { distDir: relativeDist } : {}),
  async headers() {
    return [
      { source: '/:path*', headers: BASE_HEADERS },
      // Public pages (everything except the admin dashboard and the API, which
      // set their own stricter policies).
      { source: '/((?!admin|api).*)', headers: [{ key: 'Content-Security-Policy', value: CSP }] },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // SVG icons: never let one run scripts if opened directly.
      {
        source: '/icons/:path*',
        headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" }],
      },
    ];
  },
  async rewrites() {
    if (!BACKEND_URL) return [];
    return { beforeFiles: [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }] };
  },
  async redirects() {
    return OLD_URLS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

module.exports = nextConfig;
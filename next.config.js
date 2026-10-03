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
  ['/published-articles', '/articles'],
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
];

const nextConfig = {
  // Do not advertise the framework: keeps responses tidy and one less thing to
  // fingerprint.
  poweredByHeader: false,
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
  },
  ...(relativeDist ? { distDir: relativeDist } : {}),
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  async redirects() {
    return OLD_URLS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

module.exports = nextConfig;
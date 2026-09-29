/** @type {import('next').NextConfig} */
const path = require('path');
const projectRoot = __dirname;
const tempBase = process.env.NEXT_DIST_DIR;
// Only override the build output directory when explicitly requested (e.g. a
// local temp dir on Windows). On Vercel/Linux this stays the default `.next`.
const relativeDist = tempBase ? path.relative(projectRoot, tempBase) : null;

// Old Site123 addresses, so existing links and search results keep working.
const OLD_URLS = [
  ['/welcome-to-the-art-house-4-bedroom-self-catering-home-victoria-falls', '/about'],
  ['/what-s-around', '/whats-around'],
  ['/what-to-do-in-vic-falls/:path*', '/things-to-do'],
  ['/what-our-guests-say', '/guest-reviews'],
  ['/published-articles', '/articles'],
  ['/contact-us', '/contact'],
  ['/outdoor-living-at-its-finest', '/outdoor-living'],
  ['/outdoor-living-at-its-finest/:slug', '/outdoor-living/:slug'],
];

const nextConfig = {
  images: {
    unoptimized: true,
  },
  ...(relativeDist ? { distDir: relativeDist } : {}),
  async redirects() {
    return OLD_URLS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

module.exports = nextConfig;
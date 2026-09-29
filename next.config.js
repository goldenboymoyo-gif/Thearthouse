/** @type {import('next').NextConfig} */
const path = require('path');
const projectRoot = __dirname;
const tempBase = process.env.NEXT_DIST_DIR;
const relativeDist = tempBase
  ? path.relative(projectRoot, tempBase)
  : path.relative(projectRoot, 'C:\\Users\\Admin\\AppData\\Local\\Temp\\opencode\\arth-next');

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
  distDir: relativeDist,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return OLD_URLS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

module.exports = nextConfig;

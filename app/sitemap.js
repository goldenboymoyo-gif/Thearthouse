import { SITE, THINGS_TO_DO } from '@/lib/site';
import { OUTDOOR } from '@/lib/site';

export const dynamic = 'force-static';

const STATIC_PATHS = [
  '/',
  '/the-art-house',
  '/explore',
  '/gallery',
  '/guest-reviews',
  '/articles',
  '/contact',
];

export default function sitemap() {
  const lastModified = new Date();
  const entries = [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE.url}${path}`, lastModified, changeFrequency: 'monthly', priority: path === '/' ? 1 : 0.7 })),
    ...THINGS_TO_DO.activities.map((a) => ({
      url: `${SITE.url}/things-to-do/${a.slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...OUTDOOR.items.map((o) => ({
      url: `${SITE.url}/outdoor-living/${o.slug}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    })),
  ];
  return entries;
}

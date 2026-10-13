import { pageMeta } from '@/lib/seo';
import Explore from '@/components/Explore';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = pageMeta({
  title: 'Things to Do in Victoria Falls',
  description:
    'Explore Victoria Falls from The Art House: guided tours of the Falls, river cruises, rafting, safaris, adrenaline activities, culture and Ayurveda and yoga. We book them for you with no booking fee.',
  path: '/explore',
});

export default function ExplorePage() {
  return (
    <main className="page-main inside">
      <Explore />
      <Promo promo={PROMOS.discover} shapeColor="var(--color-white)" />
    </main>
  );
}

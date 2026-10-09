import Explore from '@/components/Explore';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = {
  title: 'Explore Victoria Falls, Things to Do Near The Art House',
  description:
    'Explore Victoria Falls from The Art House: the Falls on our doorstep, tours and activities we book at no additional cost, and local food and entertainment.',
  alternates: { canonical: '/explore' },
};

export default function ExplorePage() {
  return (
    <main className="page-main inside">
      <Explore />
      <Promo promo={PROMOS.discover} shapeColor="var(--color-white)" />
    </main>
  );
}

import WhatsAround from '@/components/WhatsAround';
import ThingsToDo from '@/components/ThingsToDo';
import PageSections from '@/components/PageSections';
import Promo from '@/components/Promo';
import { AROUND, PROMOS } from '@/lib/site';

export const metadata = {
  title: 'Explore Victoria Falls – What’s Around & What to Do',
  description:
    'What is around The Art House in Victoria Falls, Zimbabwe, and the best things to do – we gladly book your tours and activities at no additional cost.',
  alternates: { canonical: '/explore' },
};

const tours = AROUND.items.find((i) => i.title === 'Tours & Activities');

export default function ExplorePage() {
  return (
    <main className="page-main inside">
      <PageSections page="explore" />
      <WhatsAround headingLevel="h1" alt={false} intro />
      <ThingsToDo alt intro={tours.paragraphs.slice(0, 2).join('\n\n')} />
      <Promo promo={PROMOS.discover} shapeColor="var(--color-white)" />
    </main>
  );
}

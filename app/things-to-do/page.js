import ThingsToDo from '@/components/ThingsToDo';
import Promo from '@/components/Promo';
import { AROUND, PROMOS } from '@/lib/site';

export const metadata = {
  title: 'What To Do In Vic Falls',
  description:
    'Activities in Victoria Falls, the adventure capital of Africa – we gladly book your tours and activities at no additional cost.',
  alternates: { canonical: '/things-to-do' },
};

const tours = AROUND.items.find((i) => i.title === 'Tours & Activities');

export default function ThingsToDoPage() {
  return (
    <main className="page-main inside">
      <ThingsToDo headingLevel="h1" intro={tours.paragraphs.slice(0, 2).join('\n\n')} />
      <Promo promo={PROMOS.discover} shapeColor="var(--color-white)" />
    </main>
  );
}

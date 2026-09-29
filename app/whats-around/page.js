import WhatsAround from '@/components/WhatsAround';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = {
  title: "What's Around",
  description:
    'Victoria Falls, tours & activities, food & entertainment – what is around The Art House in Victoria Falls, Zimbabwe.',
  alternates: { canonical: '/whats-around' },
};

export default function WhatsAroundPage() {
  return (
    <main className="page-main inside">
      <WhatsAround headingLevel="h1" alt={false} intro />
      <Promo promo={PROMOS.discover} shapeColor="var(--color-white)" />
    </main>
  );
}

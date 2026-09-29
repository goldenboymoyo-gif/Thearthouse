import WelcomeSection from '@/components/WelcomeSection';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = {
  title: 'Welcome to The Art House – 4-Bedroom Self-Catering Home, Victoria Falls',
  description:
    'Welcome to The Art House – a private 4 bedroom self-catering home with a swimming pool in the heart of Victoria Falls, Zimbabwe. Sleeps 8, walking distance to the waterfall.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <main className="page-main inside">
      <WelcomeSection headingLevel="h1" />
      <Promo promo={PROMOS.waiting} shapeColor="var(--color-white)" />
    </main>
  );
}

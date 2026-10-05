import WelcomeSection from '@/components/WelcomeSection';
import QuickLook from '@/components/QuickLook';
import OutdoorLiving from '@/components/OutdoorLiving';
import FaqSection from '@/components/FaqSection';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = {
  title: 'The Art House – 4-Bedroom Self-Catering Home, Victoria Falls',
  description:
    'The Art House, Victoria Falls: a private 4-bedroom self-catering home with pool, sleeping 8. Quick look, outdoor living, rates from US$300 and answers to common questions.',
  alternates: { canonical: '/the-art-house' },
};

export default function TheArtHousePage() {
  return (
    <main className="page-main inside">
      <WelcomeSection headingLevel="h1" />
      <QuickLook />
      <OutdoorLiving />
      <FaqSection alt />
      <Promo promo={PROMOS.waiting} shapeColor="var(--color-white)" />
    </main>
  );
}

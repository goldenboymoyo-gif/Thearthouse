import { pageMeta } from '@/lib/seo';
import WelcomeSection from '@/components/WelcomeSection';
import QuickLook from '@/components/QuickLook';
import AyurvedaYoga from '@/components/AyurvedaYoga';
import FaqSection from '@/components/FaqSection';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = pageMeta({
  title: 'The Art House, 4 Bedroom Self-Catering Home with Swimming Pool',
  description:
    'A private 4 bedroom self-catering house with swimming pool in Victoria Falls, sleeping 8. Quick look, Ayurveda and yoga with your host Sara, rates from US$350 and answers to common questions.',
  path: '/the-art-house',
});

export default function TheArtHousePage() {
  return (
    <main className="page-main inside">
      <WelcomeSection headingLevel="h1" />
      <QuickLook />
      <AyurvedaYoga />
      <FaqSection alt />
      <Promo promo={PROMOS.waiting} shapeColor="var(--color-white)" />
    </main>
  );
}

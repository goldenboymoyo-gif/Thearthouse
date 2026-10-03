import FaqSection from '@/components/FaqSection';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = {
  title: 'FAQ',
  description:
    'Answers about staying at The Art House, Victoria Falls: rates, check-in times, minimum stay, bedrooms, distances to the Falls and airport, meals, pets and backup power.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <main className="page-main inside">
      <FaqSection headingLevel="h1" />
      <Promo promo={PROMOS.waiting} shapeColor="var(--color-white)" />
    </main>
  );
}

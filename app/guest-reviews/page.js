import Reviews from '@/components/Reviews';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = {
  title: 'What our Guests Say',
  description: 'What guests say about staying at The Art House Victoria Falls.',
  alternates: { canonical: '/guest-reviews' },
};

export default function GuestReviewsPage() {
  return (
    <main className="page-main inside">
      <Reviews headingLevel="h1" />
      <Promo promo={PROMOS.waiting} shapeColor="var(--color-white)" />
    </main>
  );
}

import { pageMeta } from '@/lib/seo';
import Reviews from '@/components/Reviews';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = pageMeta({
  title: 'Guest Reviews',
  description: 'What guests say about The Art House Victoria Falls. Rated 9.4/10 on Booking.com (66 reviews) and 5.0/5 on Airbnb (13 reviews).',
  path: '/guest-reviews',
});

export default function GuestReviewsPage() {
  return (
    <main className="page-main inside">
      <Reviews headingLevel="h1" />
      <Promo promo={PROMOS.waiting} shapeColor="var(--color-white)" />
    </main>
  );
}

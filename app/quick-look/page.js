import QuickLook from '@/components/QuickLook';
import Promo from '@/components/Promo';
import { PROMOS } from '@/lib/site';

export const metadata = {
  title: 'Quick Look',
  description:
    'The Art House at a glance: 4 bedrooms sleeping 8, 3 bathrooms, swimming pool, WiFi & Netflix, pet friendly and air conditioned.',
  alternates: { canonical: '/quick-look' },
};

export default function QuickLookPage() {
  return (
    <main className="page-main inside">
      <QuickLook headingLevel="h1" alt={false} />
      <Promo promo={PROMOS.peaceful} shapeColor="var(--color-white)" />
    </main>
  );
}

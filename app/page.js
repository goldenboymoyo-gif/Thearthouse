import { pageMeta } from '@/lib/seo';
import Hero from '@/components/Hero';
import Promo from '@/components/Promo';
import RatingsBar from '@/components/home/RatingsBar';
import HomeHighlights from '@/components/home/HomeHighlights';
import HomeIntro from '@/components/home/HomeIntro';
import HomeWelcome from '@/components/home/HomeWelcome';
import HomeMosaic from '@/components/home/HomeMosaic';
import HomeExplore from '@/components/home/HomeExplore';
import HomePlan from '@/components/home/HomePlan';
import HomeReview from '@/components/home/HomeReview';
import ContactSection from '@/components/ContactSection';
import { PROMOS, SITE } from '@/lib/site';

export const metadata = pageMeta({
  title: SITE.title,
  description: SITE.description,
  path: '/',
  absolute: true,
});

// A short, photo-led home page: who we are, what it looks like, what there is
// to do, the practical facts, one guest's words and how to book. Everything
// else lives on its own page.
export default function HomePage() {
  return (
    <main className="page-main home">
      <Hero />
      <RatingsBar />
      <HomeHighlights />
      <HomeIntro />
      <HomeWelcome />
      <HomeMosaic />
      <Promo promo={PROMOS.peaceful} shapeColor="var(--color-white)" />
      <HomeExplore />
      <HomePlan />
      <HomeReview />
      <Promo
        promo={PROMOS.waiting}
        shapeColor="var(--color-white)"
        buttons={[
          { label: 'Book Now', href: SITE.bookingUrl },
          { label: 'Contact Us', href: '/contact' },
        ]}
      />
      <ContactSection alt={false} />
    </main>
  );
}

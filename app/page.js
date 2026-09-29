import Hero from '@/components/Hero';
import WelcomeSection from '@/components/WelcomeSection';
import QuickLook from '@/components/QuickLook';
import Promo from '@/components/Promo';
import GallerySection from '@/components/GallerySection';
import OutdoorLiving from '@/components/OutdoorLiving';
import WhatsAround from '@/components/WhatsAround';
import ThingsToDo from '@/components/ThingsToDo';
import Reviews from '@/components/Reviews';
import ArticlePreview from '@/components/ArticlePreview';
import ContactSection from '@/components/ContactSection';
import { PROMOS } from '@/lib/site';

export const metadata = {
  title: { absolute: 'The Art House Victoria Falls - 4 Bedroom self-catering accommodation' },
  alternates: { canonical: '/' },
};

// Same sections, order and rhythm as the live home page; the longer sections
// show a preview and link to their own page.
export default function HomePage() {
  return (
    <main className="page-main home">
      <Hero />
      <WelcomeSection preview />
      <QuickLook cta />
      <Promo promo={PROMOS.peaceful} />
      <GallerySection limit={9} />
      <OutdoorLiving />
      <WhatsAround preview />
      <ThingsToDo limit={6} />
      <Promo promo={PROMOS.discover} />
      <Reviews cta />
      <ArticlePreview cta />
      <Promo promo={PROMOS.waiting} />
      <ContactSection />
    </main>
  );
}

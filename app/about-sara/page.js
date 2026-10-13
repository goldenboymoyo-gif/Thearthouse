import Link from 'next/link';
import Section from '@/components/Section';
import SmartImage from '@/components/SmartImage';
import { pageMeta } from '@/lib/seo';
import { IMAGE_ALTS } from '@/lib/site';

export const metadata = pageMeta({
  title: 'About Sara, Your Host',
  description:
    'Meet Sara, your host at The Art House Victoria Falls: an India trained, qualified Ayurveda and Yoga Therapy practitioner and Yoga teacher who runs retreats worldwide.',
  path: '/about-sara',
  image: '/images/ayurveda-yoga-at-the-falls.jpg',
});

const PHOTOS = ['/images/ayurveda-yoga-at-the-falls.jpg', '/images/ayurveda-yoga-in-the-garden.jpg', '/images/ayurveda-treatment.jpg'];

export default function AboutSaraPage() {
  return (
    <main className="page-main inside">
      <Section id="about-sara" title="About Sara, Your Host" headingLevel="h1">
        <div className="around-intro ayurveda-intro">
          <div className="around-intro-text">
            <p>
              Sara is your host at The Art House. She has spent years training in India and is a qualified Ayurveda and
              Yoga Therapy practitioner and a Yoga teacher.
            </p>
            <p>
              When she is in residence, you can book private yoga sessions either at The Art House or in nature and at the
              waterfall. She is available for Ayurveda Consultations, should you wish to learn more about your health and
              how to serve your own unique body well. Beauty and relaxation treatments can be arranged in the privacy of
              The Art House.
            </p>
            <p>
              Sara runs Ayurveda and Yoga Retreats Worldwide and is always open to discussing arranging a retreat
              tailor-made to your interests.
            </p>
            <div className="around-actions">
              <Link className="btn btn-xl" href="/things-to-do/ayurveda-and-yoga">
                Ayurveda &amp; Yoga
              </Link>
              <Link className="btn btn-xl btn-outline" href="/contact">
                Contact Sara
              </Link>
            </div>
          </div>
          <div className="ayurveda-photos">
            {PHOTOS.map((src) => (
              <SmartImage key={src} src={src} alt={IMAGE_ALTS[src]} sizes="(max-width: 767px) 46vw, 23vw" />
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}

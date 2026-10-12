import Link from 'next/link';
import Section from './Section';
import SmartImage from './SmartImage';
import { THINGS_TO_DO } from '@/lib/site';

// "Ayurveda and Yoga" on The Art House page (replaces Outdoor Living):
// Sara's yoga, Ayurveda and relaxation treatments, a key selling point.
const ay = THINGS_TO_DO.activities.find((a) => a.slug === 'ayurveda-and-yoga');

export default function AyurvedaYoga() {
  if (!ay) return null;
  const photos = [ay.image, ...(ay.gallery || [])].slice(0, 3);
  return (
    <Section id="ayurveda-and-yoga" title="Ayurveda and Yoga">
      <div className="around-intro ayurveda-intro">
        <div className="around-intro-text">
          <h2 className="explore-sub">Yoga, Ayurveda and Relaxation Treatments</h2>
          <p>
            Sara, your host, is an Ayurveda and Yoga Practitioner, India trained and qualified. When she is in residence,
            she can offer you bespoke yoga experiences and Ayurveda consultations. Beauty and relaxation treatments can be
            arranged in the privacy of The Art House.
          </p>
          <p>{ay.description}</p>
          <div className="around-actions">
            <Link className="btn btn-xl" href={`/things-to-do/${ay.slug}`}>
              Discover Ayurveda &amp; Yoga
            </Link>
            <Link className="btn btn-xl btn-outline" href="/contact">
              Enquire
            </Link>
          </div>
        </div>
        <div className="ayurveda-photos">
          {photos.map((src) => (
            <SmartImage key={src} src={src} alt="Ayurveda and yoga with Sara at The Art House" sizes="(max-width: 767px) 46vw, 23vw" />
          ))}
        </div>
      </div>
    </Section>
  );
}

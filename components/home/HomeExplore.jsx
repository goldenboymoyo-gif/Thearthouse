import Link from 'next/link';
import SmartImage from '../SmartImage';
import SectionHeading from '../SectionHeading';
import { img } from '@/lib/assets';

const CARDS = [
  {
    href: '/things-to-do/ayurveda-and-yoga',
    title: 'Yoga, Ayurveda and Relaxation Treatments',
    text: 'Sara, your host, is an Ayurveda and Yoga Practitioner, India trained and qualified. When she is in residence, she can offer you bespoke yoga experiences and Ayurveda consultations. Beauty and relaxation treatments can be arranged in the privacy of The Art House.',
    image: '/images/ayurveda-yoga-in-the-garden.jpg',
    alt: 'Private yoga session in the garden at The Art House',
  },
  {
    href: '/explore#things-to-do',
    title: 'Things to Do',
    text: 'We book your activities at no extra cost',
    image: img('2000_629b7ce577031.jpg'),
    alt: 'White-water rafting below the Victoria Falls',
  },
  {
    href: '/explore#food-and-entertainment',
    title: 'Food & Entertainment',
    text: 'Local tips on where to eat and unwind',
    image: img('800_629a53b525b5e.png'),
    alt: 'Food and entertainment in Victoria Falls',
  },
];

// Three picture cards that lead to the rest of the site.
export default function HomeExplore() {
  return (
    <section className="s-module home-explore">
      <SectionHeading title="Make the Most of Your Stay" />
      <div className="container" data-aos="fade-up">
        <div className="explore-grid">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="explore-card">
              <SmartImage src={c.image} alt={c.alt} sizes="(max-width: 767px) 92vw, 33vw" />
              <span className="explore-shade" aria-hidden="true" />
              <span className="explore-body">
                <span className="explore-title">{c.title}</span>
                <span className="explore-text">{c.text}</span>
                <span className="explore-more">
                  Explore
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

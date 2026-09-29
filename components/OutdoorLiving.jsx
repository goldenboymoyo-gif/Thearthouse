import Link from 'next/link';
import Section from './Section';
import { OUTDOOR } from '@/lib/site';

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 12h19M14 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

// "Outdoor Living at its finest" — two square photographs linking to their
// pages; the white caption panel slides in on hover (always shown on touch).
export default function OutdoorLiving({ headingLevel }) {
  return (
    <Section id="outdoor-living" title={OUTDOOR.title} headingLevel={headingLevel}>
      <div className="portfolio-grid">
        {OUTDOOR.items.map((item) => (
          <Link key={item.slug} href={`/outdoor-living/${item.slug}`} className="p-item" title={item.title}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <span className="p-overlay">
              <span className="p-title">
                {item.title}
                <Arrow />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

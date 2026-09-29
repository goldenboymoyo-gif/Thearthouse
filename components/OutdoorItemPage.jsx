import Link from 'next/link';
import SectionHeading from './SectionHeading';
import PortfolioImages from './PortfolioImages';
import { OUTDOOR } from '@/lib/site';

export function outdoorMetadata(slug) {
  const item = OUTDOOR.items.find((i) => i.slug === slug);
  return {
    title: item.title,
    description: item.sections[0].text || `${item.title} – Outdoor Living at The Art House Victoria Falls.`,
    alternates: { canonical: `/outdoor-living/${slug}` },
  };
}

// An "Outdoor Living" item page: title, text and full-width photographs.
export default function OutdoorItemPage({ slug }) {
  const item = OUTDOOR.items.find((i) => i.slug === slug);
  return (
    <main className="page-main inside">
      <section className="s-module portfolio-page">
        <SectionHeading title={item.title} as="h1" />
        <div className="container" data-aos="fade-up">
          {item.sections.map((sec, i) => (
            <div key={i}>
              {sec.heading ? (
                <div className="p-section-text">
                  <h4>{sec.heading}</h4>
                  {sec.text ? <p>{sec.text}</p> : null}
                </div>
              ) : null}
              <PortfolioImages images={sec.images} alt={sec.heading || item.title} />
            </div>
          ))}
          <div className="back-link">
            <Link className="btn btn-xl" href="/outdoor-living">
              Outdoor Living at its finest
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

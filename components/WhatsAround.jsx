import Section from './Section';
import CTA from './CTA';
import Link from 'next/link';
import { img } from '@/lib/assets';
import { AROUND } from '@/lib/site';
import SmartImage from './SmartImage';

function actionFor(title) {
  if (title === 'Victoria Falls') {
    return (
      <Link className="btn btn-sm" href="/things-to-do">
        Explore Vic Falls Activities
      </Link>
    );
  }
  if (title === 'Tours & Activities') {
    return (
      <>
        <Link className="btn btn-sm" href="/things-to-do">
          Browse Activities
        </Link>
        <Link className="btn btn-sm btn-outline" href="/contact">
          Enquire About Activities
        </Link>
      </>
    );
  }
  return (
    <Link className="btn btn-sm" href="/contact">
      Ask Us for Recommendations
    </Link>
  );
}

export default function WhatsAround({ preview = false, headingLevel, alt = true, intro = false }) {
  return (
    <Section id="whats-around" title={AROUND.title} alt={alt} headingLevel={headingLevel}>
      {intro ? (
        <div className="around-intro">
          <div className="around-intro-text">
            <h3>Discover What&apos;s Around Victoria Falls</h3>
            <p>
              From breathtaking natural wonders to local dining and unforgettable experiences, discover everything that
              makes Victoria Falls a special destination.
            </p>
          </div>
          <div className="around-intro-media">
            <SmartImage src={img('800_6298f74f99c75.jpg')} alt="The mighty Victoria Falls" sizes="(max-width: 767px) 92vw, 46vw" />
          </div>
        </div>
      ) : null}

      <div className="around-list">
        {AROUND.items.map((item, index) => (
          <article className={`around-item ${index % 2 === 1 ? 'reversed' : ''}`} key={item.title}>
            <div className="around-media">
              <SmartImage src={item.image} alt={item.title} sizes="(max-width: 767px) 92vw, 46vw" />
            </div>
            <div className="around-content">
              <h3>{item.title}</h3>
              {(preview ? item.paragraphs.slice(0, 1) : item.paragraphs).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <div className="around-actions">{actionFor(item.title)}</div>
            </div>
          </article>
        ))}
      </div>

      {preview ? <CTA href="/whats-around">Discover What&apos;s Around</CTA> : null}
    </Section>
  );
}
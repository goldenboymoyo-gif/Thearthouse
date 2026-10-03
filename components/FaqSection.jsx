import Section from './Section';
import CTA from './CTA';
import { FAQ } from '@/lib/faq';

// Frequently asked questions as real question-and-answer pairs, with
// FAQPage structured data so search engines and AI assistants can quote them.
export default function FaqSection({ headingLevel, limit, alt = false, id = 'faq' }) {
  const items = limit ? FAQ.items.slice(0, limit) : FAQ.items;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <Section id={id} title={FAQ.title} alt={alt} headingLevel={headingLevel}>
      {!limit ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /> : null}
      <div className="faq-list">
        {items.map((f, i) => (
          <details className="faq-item" key={f.q} open={i === 0}>
            <summary>
              <span>{f.q}</span>
              <span className="faq-toggle" aria-hidden="true" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      {limit ? <CTA href="/faq">See All Questions</CTA> : null}
    </Section>
  );
}

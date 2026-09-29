import Section from './Section';
import CTA from './CTA';
import { ARTICLES, SITE } from '@/lib/site';

export default function ArticlePreview({ headingLevel, cta = false, alt = true }) {
  const full = !cta;
  return (
    <Section id="published-articles" title={ARTICLES.title} alt={alt} headingLevel={headingLevel}>
      {full ? (
        <div className="ttd-intro">
          <h3>The Art House Journal</h3>
          <p>
            Stories, travel inspiration and helpful insights to help you discover Victoria Falls and make the most of
            your stay.
          </p>
        </div>
      ) : null}

      <div className="journal">
        {ARTICLES.items.map((a) => {
          const excerpt = a.text.split('\n\n')[0].replace('Follow the link to read more', '').trim();
          return (
            <article className="journal-card" key={a.href}>
              <a className="journal-media" href={a.href} target="_blank" rel="noopener noreferrer" aria-label={`${a.name} – read the article`}>
                <img src={a.image} alt={a.linkLabel} loading="lazy" />
                <span className="journal-tag">{a.name}</span>
              </a>
              <div className="journal-body">
                <h4>{a.name}</h4>
                <p className="journal-excerpt">{excerpt}</p>
                <a className="btn btn-sm btn-outline" href={a.href} target="_blank" rel="noopener noreferrer">
                  Read More
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <div className="section-cta row">
        <a className="btn btn-xl" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
          Book Your Stay
        </a>
      </div>
      {cta ? <CTA href="/articles">Read All Articles</CTA> : null}
    </Section>
  );
}
import Section from './Section';
import CTA from './CTA';
import Icon from './Icon';
import { QUICK_LOOK } from '@/lib/site';

export default function QuickLook({ headingLevel, cta = false, alt = true }) {
  return (
    <Section id="quick-look" title={QUICK_LOOK.title} alt={alt} headingLevel={headingLevel}>
      <div className="features">
        {QUICK_LOOK.items.map((item) => (
          <div className="feature" key={item.title}>
            <a className="feature-link" href={item.href} aria-label={`${item.title} – learn more`}>
              <span className="feature-inner">
                <span className="feature-media">
                  <img src={item.image} alt={item.alt || item.title} loading="lazy" />
                </span>
                <span className="feature-body">
                  <span className="feature-heading">
                    <span className="feature-icon">
                      <Icon name={item.icon} />
                    </span>
                    <span className="feature-title">{item.title}</span>
                  </span>
                  <span className="feature-text">{item.text}</span>
                  <span className="feature-more">Learn more</span>
                </span>
              </span>
            </a>
          </div>
        ))}
      </div>
      {cta ? <CTA href="/quick-look" className="tight">View Quick Look</CTA> : null}
    </Section>
  );
}
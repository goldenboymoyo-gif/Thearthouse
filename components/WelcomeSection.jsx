import Section from './Section';
import CTA from './CTA';
import { WELCOME } from '@/lib/site';

// "Welcome to The Art House" — photograph on the left, text on a light grey
// panel on the right. `preview` shows the opening paragraphs with a link to
// the full page.
export default function WelcomeSection({ preview = false, headingLevel }) {
  const paragraphs = preview ? WELCOME.paragraphs.slice(0, 2) : WELCOME.paragraphs;
  const text = `${WELCOME.intro}\n${paragraphs.join('\n\n')}`;
  return (
    <Section id="welcome" title={WELCOME.title} headingLevel={headingLevel}>
      <div className="welcome-block">
        <div className="welcome-image" style={{ backgroundImage: `url(${WELCOME.image})` }} role="img" aria-label="The Art House veranda" />
        <div className="welcome-text">
          <div>
            <p>{text}</p>
            {preview ? <CTA href="/about">Explore The Art House</CTA> : null}
          </div>
        </div>
      </div>
    </Section>
  );
}

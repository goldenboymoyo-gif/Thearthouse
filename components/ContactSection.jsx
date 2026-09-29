import Section from './Section';
import Icon from './Icon';
import ContactForm from './ContactForm';
import { CONTACT } from '@/lib/site';

export default function ContactSection({ headingLevel, alt = true }) {
  return (
    <Section
      id="contact"
      title="Contact us"
      alt={alt}
      headingLevel={headingLevel}
      after={
        <div className="contact-map">
          <iframe
            title="Map: 360 Gibson Road, Victoria Falls, Zimbabwe"
            src={CONTACT.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      }
    >
      <div className="contact-row">
        <div className="contact-details">
          <ul>
            <li>{CONTACT.address}</li>
          </ul>
          <ul>
            <li>
              <a href={CONTACT.phoneHref}>
                <Icon name="phone" />
                <span dir="ltr">{CONTACT.phone}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`}>
                <Icon name="envelope-o" />
                {CONTACT.email}
              </a>
            </li>
            <li>
              <Icon name="clock-o" style={{ color: 'var(--color-primary)' }} />
              {CONTACT.hours}
            </li>
          </ul>
          <div className="contact-social">
            <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Icon name="facebook" />
            </a>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Icon name="instagram" />
            </a>
          </div>
        </div>
        <div className="contact-form-col">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}

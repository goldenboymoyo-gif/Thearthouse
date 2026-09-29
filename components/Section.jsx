import SectionHeading from './SectionHeading';

// A content module of the live site: white or light-grey background, 100px
// vertical padding, centred uppercase title with the short green rule.
export default function Section({ id, title, alt = false, headingLevel = 'h2', className = '', after, children }) {
  return (
    <section id={id} className={`s-module ${alt ? 'alt' : ''} ${className}`}>
      {title ? <SectionHeading title={title} as={headingLevel} id={id ? `${id}-title` : undefined} /> : null}
      <div className="container s-content" data-aos="fade-up">
        {children}
      </div>
      {after}
    </section>
  );
}

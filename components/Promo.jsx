import Link from 'next/link';
import Parallax from './Parallax';
import Shape from './Shape';

// Full-width photographic banner with the slanted top and bottom edges
// ("PEACEFUL QUIET EXCLUSIVITY", "COME DISCOVER OUR PARADISE!", "SO WHAT ARE
// YOU WAITING FOR?").
export default function Promo({ promo, shapeColor: shapeOverride, buttons: buttonsOverride }) {
  const { title, subtitle, subtitleStyle, button, image, opacity, height } = promo;
  const buttons = buttonsOverride || (button ? [button] : []);
  const shapeColor = shapeOverride || promo.shapeColor;
  return (
    <section className="promo">
      <Parallax src={image} opacity={opacity} />
      <Shape position="top" fill={shapeColor} />
      <div className="container promo-inner" style={{ minHeight: height }}>
        <h3 className="promo-title" data-aos="fade-up">
          {title}
        </h3>
        {subtitle ? (
          <h4 className={`promo-subtitle ${subtitleStyle === 'italic' ? 'italic' : ''}`} data-aos="fade-up">
            {subtitle}
          </h4>
        ) : null}
        {buttons.length ? (
          <div className="promo-actions" data-aos="fade-up">
            {buttons.map((b, i) =>
              /^https?:/.test(b.href) ? (
                <a key={b.href} className={`btn btn-xl ${i ? 'btn-ghost' : ''}`} href={b.href} target="_blank" rel="noopener noreferrer">
                  {b.label}
                </a>
              ) : (
                <Link key={b.href} className={`btn btn-xl ${i ? 'btn-ghost' : ''}`} href={b.href}>
                  {b.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
      </div>
      <Shape position="bottom" fill={shapeColor} />
    </section>
  );
}

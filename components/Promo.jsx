import Link from 'next/link';
import Parallax from './Parallax';
import Shape from './Shape';

// Full-width photographic banner with the slanted top and bottom edges
// ("PEACEFUL QUIET EXCLUSIVITY", "COME DISCOVER OUR PARADISE!", "SO WHAT ARE
// YOU WAITING FOR?").
export default function Promo({ promo, shapeColor: shapeOverride }) {
  const { title, subtitle, subtitleStyle, button, image, opacity, height } = promo;
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
        {button ? (
          <div data-aos="fade-up">
            <Link className="btn btn-xl" href={button.href}>
              {button.label}
            </Link>
          </div>
        ) : null}
      </div>
      <Shape position="bottom" fill={shapeColor} />
    </section>
  );
}

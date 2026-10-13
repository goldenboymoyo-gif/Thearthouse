import { RATINGS } from '@/lib/site';

// Guest ratings shown as a clean band directly under the hero.
export default function RatingsBar() {
  const r = RATINGS;
  const items = [
    { score: r.booking.score, label: 'Booking.com', sub: `${r.booking.count} reviews`, href: r.booking.url },
    { score: r.airbnb.score, label: 'Airbnb', sub: `${r.airbnb.count} reviews`, href: r.airbnb.url },
    r.airbnbGuestFavourite && { score: 'Guest Favourite', label: 'Airbnb', href: r.airbnb.url },
    r.airbnbSuperhost && { score: 'Superhost', label: 'Airbnb', href: r.airbnb.url },
  ].filter(Boolean);
  return (
    <section className="ratings-bar" aria-label="Guest ratings">
      <ul>
        {items.map((i) => (
          <li key={i.score}>
            <a href={i.href} target="_blank" rel="noopener noreferrer">
              <span className="rb-score">{i.score}</span>
              <span className="rb-label">
                {i.label}
                {i.sub ? ` · ${i.sub}` : ''}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="rb-asof">Guest ratings as of {r.asOf}</p>
    </section>
  );
}

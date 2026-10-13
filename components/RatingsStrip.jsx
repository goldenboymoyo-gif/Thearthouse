import { RATINGS } from '@/lib/site';

// Clearly attributed guest ratings with links to each listing.
export default function RatingsStrip({ variant = 'in-hero', staff = false }) {
  const r = RATINGS;
  return (
    <div className={`ratings-strip ${variant}`}>
      <ul>
        <li>
          <a href={r.booking.url} target="_blank" rel="noopener noreferrer">
            <strong>{r.booking.score}</strong> guest rating on Booking.com ({r.booking.count} reviews)
          </a>
        </li>
        {staff ? (
          <li>
            <a href={r.booking.url} target="_blank" rel="noopener noreferrer">
              <strong>{r.booking.staff}</strong> Staff score on Booking.com
            </a>
          </li>
        ) : null}
        <li>
          <a href={r.airbnb.url} target="_blank" rel="noopener noreferrer">
            <strong>{r.airbnb.score}</strong> on Airbnb ({r.airbnb.count} reviews)
          </a>
        </li>
        {r.airbnbGuestFavourite ? <li>Airbnb Guest Favourite</li> : null}
        {r.airbnbSuperhost ? <li>Airbnb Superhost</li> : null}
      </ul>
      <p className="ratings-asof">Ratings as of {r.asOf}</p>
    </div>
  );
}

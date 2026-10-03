import Link from 'next/link';
import LineIcon from './LineIcon';
import { DISTANCES, SITE, STAY_INFO } from '@/lib/site';

const FACTS = [
  { icon: 'tag', label: 'Rates', value: `From ${STAY_INFO.rateFrom}`, sub: 'per night' },
  { icon: 'bed', label: 'Bedrooms', value: '4 bedrooms', sub: '2 King · 1 Double · 1 Twin' },
  { icon: 'login', label: 'Check-in', value: STAY_INFO.checkIn, sub: 'from' },
  { icon: 'logout', label: 'Check-out', value: STAY_INFO.checkOut, sub: 'by' },
  { icon: 'moon', label: 'Minimum stay', value: '2 nights', sub: '4 nights over major holidays' },
  { icon: 'utensils', label: 'Meals', value: 'Cook on request', sub: 'or ready-cooked meals, with notice' },
];

// "Plan Your Stay": the practical facts guests (and search engines) look for
// first — rates, rooms, times, minimum stay, meals and distances.
export default function StayDetails({ actions = true }) {
  return (
    <div className="plan" data-aos="fade-up">
      <ul className="plan-facts">
        {FACTS.map((f) => (
          <li key={f.label} className="plan-fact">
            <LineIcon name={f.icon} className="plan-fact-icon" />
            <span className="plan-fact-label">{f.label}</span>
            <span className="plan-fact-value">
              {f.sub === 'from' || f.sub === 'by' ? `${f.sub === 'from' ? 'From' : 'By'} ${f.value}` : f.value}
            </span>
            {f.sub !== 'from' && f.sub !== 'by' ? <span className="plan-fact-sub">{f.sub}</span> : null}
          </li>
        ))}
      </ul>

      <div className="plan-distances">
        <h3 className="plan-subheading">
          <LineIcon name="pin" /> How far is everything?
        </h3>
        <ul>
          {DISTANCES.map((d) => (
            <li key={d.place}>
              <LineIcon name={d.icon} className="plan-d-icon" />
              <span className="plan-d-km">{d.distance}</span>
              <span className="plan-d-place">{d.short}</span>
              <span className="plan-d-note">{d.note.replace(/^about an? /, '≈ ')}</span>
            </li>
          ))}
        </ul>
      </div>

      {actions ? (
        <div className="plan-actions">
          <a className="btn btn-xl" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
            Check Availability
          </a>
          <Link className="btn btn-xl btn-outline" href="/the-art-house#faq">
            Read the FAQ
          </Link>
        </div>
      ) : null}
    </div>
  );
}

import Icon from './Icon';
import { DISTANCES, STAY_INFO } from '@/lib/site';

// Rates, house rules and distances — the practical facts guests (and search
// engines) look for first.
export default function StayDetails() {
  return (
    <div className="stay-details" data-aos="fade-up">
      <div className="stay-col">
        <h3 className="stay-heading">Good to Know</h3>
        <dl className="stay-list">
          <div>
            <dt>Rates</dt>
            <dd>From {STAY_INFO.rateFrom} per night</dd>
          </div>
          <div>
            <dt>Check-in</dt>
            <dd>From {STAY_INFO.checkIn}</dd>
          </div>
          <div>
            <dt>Check-out</dt>
            <dd>By {STAY_INFO.checkOut}</dd>
          </div>
          <div>
            <dt>Minimum stay</dt>
            <dd>
              {STAY_INFO.minimumStay.map((m) => (
                <span key={m} className="stay-line">
                  {m}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Meals</dt>
            <dd>{STAY_INFO.meals}</dd>
          </div>
        </dl>
      </div>
      <div className="stay-col">
        <h3 className="stay-heading">Distances</h3>
        <dl className="stay-list">
          {DISTANCES.map((d) => (
            <div key={d.place}>
              <dt>
                <Icon name="location-arrow" className="stay-pin" />
                {d.place}
              </dt>
              <dd>
                {d.distance} <span className="stay-note">– {d.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

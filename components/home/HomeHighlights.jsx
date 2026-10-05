import LineIcon from '../LineIcon';
import { DISTANCES, STAY_INFO } from '@/lib/site';

const falls = DISTANCES.find((d) => d.icon === 'water');

const ITEMS = [
  { icon: 'bed', text: '4 Bedrooms' },
  { icon: 'users', text: 'Sleeps 8' },
  { icon: 'pool', text: 'Private Pool' },
  ...(falls ? [{ icon: 'water', text: `${falls.distance} to the Falls` }] : []),
  { icon: 'tag', text: `From ${STAY_INFO.rateFrom} / night` },
];

// A single line of the essentials, right under the top photograph.
export default function HomeHighlights() {
  return (
    <section className="home-highlights" aria-label="The Art House at a glance">
      <ul className="container">
        {ITEMS.map((i) => (
          <li key={i.text}>
            <LineIcon name={i.icon} />
            <span>{i.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

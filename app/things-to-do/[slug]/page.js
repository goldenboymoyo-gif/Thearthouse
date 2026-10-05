import Link from 'next/link';
import { notFound } from 'next/navigation';
import SmartImage from '@/components/SmartImage';
import { CONTACT, SITE, THINGS_TO_DO } from '@/lib/site';

export function generateStaticParams() {
  return THINGS_TO_DO.activities.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const { slug } = params;
  const activity = THINGS_TO_DO.activities.find((a) => a.slug === slug);
  if (!activity) return { title: 'Activity Not Found' };
  return {
    title: `${activity.title} | The Art House Victoria Falls`,
    description: `${activity.tagline}. Enquire with The Art House to arrange tours, activities and transfers in Victoria Falls.`,
    alternates: { canonical: `/things-to-do/${slug}` },
  };
}

export default function ActivityPage({ params }) {
  const { slug } = params;
  const activity = THINGS_TO_DO.activities.find((a) => a.slug === slug);
  if (!activity) notFound();

  return (
    <main className="page-main inside">
      <div className="container activity-detail">
        <Link className="activity-back" href="/explore#things-to-do">
          &larr; Back to Explore Victoria Falls
        </Link>

        <article>
          <header className="activity-hero">
            <SmartImage src={activity.full} alt={activity.title} sizes="(max-width: 767px) 100vw, 1200px" priority />
            <div className="activity-hero-caption">
              <span className="activity-kicker">Victoria Falls</span>
              <h1>{activity.title}</h1>
              <p>{activity.tagline}</p>
            </div>
          </header>

          <div className="activity-body">
            <p className="activity-desc">{activity.description}</p>

            <h2>What the experience involves</h2>
            <ul className="activity-highlights">
              {activity.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <aside className="activity-info">
              <h2>How to arrange it</h2>
              <p>
                The Art House team is glad to book this activity for you. We offer a comprehensive and highly
                personalised activity booking service and can also assist with holiday planning, transfers and bookings
                for surrounding destinations — all arranged on your behalf at no additional cost.
              </p>
              <p>
                <strong>Please note:</strong> the details above are general information about the experience. Operators,
                availability, schedules and pricing are confirmed on enquiry — we never confirm bookings online.
              </p>
              <div className="around-actions">
                <Link className="btn btn-xl" href="/contact">
                  Enquire About This Activity
                </Link>
                <a className="btn btn-xl btn-outline" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
                  Book Your Stay
                </a>
              </div>
              <p className="activity-contact">
                Or reach us any time at {CONTACT.email} · {CONTACT.phone}
              </p>
            </aside>
          </div>
        </article>

        <Link className="activity-back" href="/explore#things-to-do">
          &larr; Back to Explore Victoria Falls
        </Link>
      </div>
    </main>
  );
}
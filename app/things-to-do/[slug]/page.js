import { pageMeta } from '@/lib/seo';
import { ACTIVITY_GUIDES } from '@/lib/activity-guides';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SmartImage from '@/components/SmartImage';
import { CONTACT, IMAGE_ALTS, SITE, THINGS_TO_DO } from '@/lib/site';

export function generateStaticParams() {
  return THINGS_TO_DO.activities.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const { slug } = params;
  const activity = THINGS_TO_DO.activities.find((a) => a.slug === slug);
  if (!activity) return { title: 'Activity Not Found' };
  return {
    ...pageMeta({
      title: `${activity.title} in Victoria Falls`,
      description: `${activity.tagline}. Stay at The Art House, a 35-minute walk from the Falls; we arrange it for you with no booking fee.`,
      path: `/things-to-do/${activity.slug}`,
      image: activity.full,
    }),
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
          Back to Explore Victoria Falls
        </Link>

        <article>
          <header className="activity-hero">
            <SmartImage src={activity.full} alt={IMAGE_ALTS[activity.full] || activity.title} sizes="(max-width: 767px) 100vw, 1200px" priority />
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

            {ACTIVITY_GUIDES[activity.slug] ? (
              <section className="activity-guide">
                <h2>Good to know</h2>
                <dl>
                  {ACTIVITY_GUIDES[activity.slug].facts.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <h3>Our local tip</h3>
                <p>{ACTIVITY_GUIDES[activity.slug].tip}</p>
              </section>
            ) : null}

            {activity.gallery && activity.gallery.length ? (
              <div className="activity-gallery">
                {activity.gallery.map((src) => (
                  <SmartImage key={src} src={src} alt={IMAGE_ALTS[src] || activity.title} sizes="(max-width: 767px) 92vw, 33vw" />
                ))}
              </div>
            ) : null}

            <aside className="activity-info">
              <h2>How to arrange it</h2>
              {activity.arrange ? <p>{activity.arrange}</p> : null}
              <p hidden={Boolean(activity.arrange)}>
                The Art House team is glad to book this activity for you. We offer a comprehensive and highly
                personalised activity booking service and can also assist with holiday planning, transfers and bookings
                for surrounding destinations. We arrange everything on your behalf at no additional cost: we do not charge
                a booking fee, and you simply pay the operator&apos;s own price.
              </p>
              <p hidden={Boolean(activity.arrange)}>
                <strong>Please note:</strong> the details above are general information about the experience. Operators,
                availability, schedules and pricing are confirmed on enquiry, we never confirm bookings online.
              </p>
              <div className="around-actions">
                <Link className="btn btn-xl" href="/contact">
                  Enquire About This Activity
                </Link>
                <a className="btn btn-xl btn-outline" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
                  Book Your Stay
                </a>
              </div>
              <p>
                <Link href="/the-art-house">Stay at The Art House</Link>, a private 4 bedroom house with swimming pool, a
                35-minute walk from the Falls.
              </p>
              <p className="activity-contact">
                Or reach us any time at {CONTACT.email} · {CONTACT.phone}
              </p>
            </aside>
          </div>
        </article>

        <Link className="activity-back" href="/explore#things-to-do">
          Back to Explore Victoria Falls
        </Link>
      </div>
    </main>
  );
}
import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="page-main inside">
      <section className="s-module not-found">
        <SectionHeading title="Page not found" as="h1" />
        <div className="container">
          <p>Sorry, the page you are looking for could not be found.</p>
          <Link className="btn btn-xl" href="/">
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}

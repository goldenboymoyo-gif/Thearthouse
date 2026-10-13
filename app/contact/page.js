import { pageMeta } from '@/lib/seo';
import ContactSection from '@/components/ContactSection';

export const metadata = pageMeta({
  title: 'Contact Us',
  description:
    'Contact The Art House Victoria Falls, 360 Gibson Road, Victoria Falls, Zimbabwe. +263 77 260 6233, thearthousevf@gmail.com. Enquiries answered 7 days a week.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <main className="page-main inside">
      <ContactSection headingLevel="h1" alt={false} />
    </main>
  );
}

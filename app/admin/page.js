import { headers } from 'next/headers';
import AdminApp from './AdminApp';
import './admin.css';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

// Rendered per request so each response carries the fresh CSP nonce set by
// middleware.js (Next.js applies it to its scripts automatically).
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await headers();
  return <AdminApp />;
}

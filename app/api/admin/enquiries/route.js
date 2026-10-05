import { guard } from '@/lib/admin/auth';
import { StorageError } from '@/lib/admin/storage';
import { enquiriesEnabled, listEnquiries, setEnquiryStatus } from '@/lib/enquiries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fail = (e) =>
  Response.json({ error: e instanceof StorageError ? e.message : 'Something went wrong.' }, { status: e.status || 500 });

export async function GET(req) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    return Response.json({ enabled: enquiriesEnabled(), items: await listEnquiries() });
  } catch (e) {
    return fail(e);
  }
}

// PATCH { id, date, status }
export async function PATCH(req) {
  const denied = await guard(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  try {
    await setEnquiryStatus(String(body.id || ''), body.date, body.status);
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

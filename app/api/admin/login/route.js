import { cookies } from 'next/headers';
import {
  COOKIE,
  checkPassword,
  clearFailures,
  clientIp,
  cookieOptions,
  createToken,
  isAdmin,
  lockedOut,
  passwordConfigured,
  recordFailure,
  sameOrigin,
} from '@/lib/admin/auth';
import { storageMode } from '@/lib/admin/storage';
import { enquiriesEnabled } from '@/lib/enquiries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: is this browser logged in, and what is set up?
export async function GET() {
  return Response.json({
    loggedIn: await isAdmin(),
    configured: passwordConfigured(),
    storage: storageMode(),
    enquiries: enquiriesEnabled(),
  });
}

// POST { password }: log in.
export async function POST(req) {
  if (!sameOrigin(req)) return Response.json({ error: 'Bad origin.' }, { status: 403 });
  if (!passwordConfigured()) {
    return Response.json({ error: 'The admin password has not been set up yet (ADMIN_PASSWORD).' }, { status: 503 });
  }
  const ip = clientIp(req);
  if (lockedOut(ip)) {
    return Response.json({ error: 'Too many wrong passwords. Please wait 15 minutes and try again.' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(String(body.password || ''))) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 600));
    return Response.json({ error: 'That password is not correct.' }, { status: 401 });
  }
  clearFailures(ip);
  const jar = await cookies();
  jar.set(COOKIE, createToken(), cookieOptions);
  return Response.json({ ok: true });
}

// DELETE: log out.
export async function DELETE(req) {
  if (!sameOrigin(req)) return Response.json({ error: 'Bad origin.' }, { status: 403 });
  const jar = await cookies();
  jar.set(COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return Response.json({ ok: true });
}

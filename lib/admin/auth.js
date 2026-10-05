// Admin authentication: one password (ADMIN_PASSWORD), a signed httpOnly
// session cookie, a same-origin check on every change and a simple
// per-address lockout after repeated wrong passwords.
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'ah_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const password = () => process.env.ADMIN_PASSWORD || '';
const secret = () =>
  process.env.ADMIN_SECRET || crypto.createHash('sha256').update(`art-house-admin:${password()}`).digest('hex');

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const passwordConfigured = () => password().length > 0;

export function checkPassword(input) {
  return passwordConfigured() && safeEqual(input, password());
}

export function createToken() {
  const payload = b64(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 }));
  return `${payload}.${sign(payload)}`;
}

function validToken(token) {
  if (!token || !passwordConfigured()) return false;
  const [payload, sig] = String(token).split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: MAX_AGE,
};

export async function isAdmin() {
  const jar = await cookies();
  return validToken(jar.get(COOKIE)?.value);
}

function sameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return req.method === 'GET';
  try {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Returns a Response to send back when the request is not allowed, or null.
export async function guard(req) {
  if (!sameOrigin(req)) return Response.json({ error: 'Bad origin.' }, { status: 403 });
  if (!(await isAdmin())) return Response.json({ error: 'Please log in again.' }, { status: 401 });
  return null;
}

// --- lockout -------------------------------------------------------------
const attempts = new Map();
const WINDOW = 15 * 60 * 1000;
const LIMIT = 5;

export function clientIp(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
}

export function lockedOut(ip) {
  const a = attempts.get(ip);
  if (!a) return false;
  if (Date.now() - a.first > WINDOW) {
    attempts.delete(ip);
    return false;
  }
  return a.count >= LIMIT;
}

export function recordFailure(ip) {
  const a = attempts.get(ip);
  if (!a || Date.now() - a.first > WINDOW) attempts.set(ip, { first: Date.now(), count: 1 });
  else a.count += 1;
}

export const clearFailures = (ip) => attempts.delete(ip);

export { sameOrigin };

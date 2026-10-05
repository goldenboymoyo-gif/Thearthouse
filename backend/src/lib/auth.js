// Admin authentication & request guards.
//
// - Sessions: a random session id + issue/expiry times, signed with
//   HMAC-SHA256 and stored only in an httpOnly, Secure, SameSite=Strict cookie
//   (named __Host-… in production, which also pins it to this exact host).
//   The browser's JavaScript can never read it.
// - Signing key: ADMIN_SECRET if set (32+ characters), otherwise derived from
//   the admin password with scrypt – so changing the password or the secret
//   logs every session out.
// - Logout revokes the session id until it would have expired anyway.
// - Every state-changing request must carry an Origin header belonging to the
//   website (CSRF protection on top of SameSite=Strict) and a JSON body.
const crypto = require('crypto');
const config = require('../config');
const { HttpError } = require('./errors');
const { configured } = require('./password');
const limiter = require('./rateLimit');

const cookieName = () => (config.isProduction() ? '__Host-ah_admin' : 'ah_admin');

let derived = { from: null, key: null };
function signingKey() {
  const explicit = config.adminSecret();
  if (explicit.length >= 32) return explicit;
  const from = `${config.adminPasswordHash()}|${config.adminPassword()}`;
  if (derived.from !== from) {
    const key = crypto.scryptSync(from, 'art-house-admin-session-v2', 32, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    derived = { from, key };
  }
  return derived.key;
}

const sign = (data) => crypto.createHmac('sha256', signingKey()).update(data).digest('base64url');

function createSession() {
  const now = Date.now();
  const session = { v: 2, sid: crypto.randomBytes(18).toString('base64url'), iat: now, exp: now + config.sessionHours() * 3600 * 1000 };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, session };
}

function parseToken(token) {
  if (!token || typeof token !== 'string' || token.length > 512 || !configured()) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (s.v !== 2 || typeof s.sid !== 'string' || typeof s.exp !== 'number' || s.exp <= Date.now()) return null;
    if (s.exp - s.iat > 168 * 3600 * 1000) return null;
    return s;
  } catch {
    return null;
  }
}

function readCookie(req, name) {
  const header = String(req.headers.cookie || '');
  if (header.length > 8192) return null;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: config.isProduction(),
  sameSite: 'strict',
  path: '/',
  ...(maxAge !== undefined ? { maxAge } : {}),
});

function setSession(res) {
  const { token, session } = createSession();
  res.cookie(cookieName(), token, cookieOptions(session.exp - session.iat));
  return session;
}

const clearSession = (res) => res.clearCookie(cookieName(), cookieOptions());

// Returns the session if the request carries a valid, unrevoked one.
async function getSession(req) {
  const s = parseToken(readCookie(req, cookieName()));
  if (!s) return null;
  if ((await limiter.peek(`revoked:${s.sid}`)) > 0) return null;
  return s;
}

async function revokeSession(req) {
  const s = parseToken(readCookie(req, cookieName()));
  if (!s) return;
  const secondsLeft = Math.max(1, Math.ceil((s.exp - Date.now()) / 1000));
  await limiter.hit(`revoked:${s.sid}`, secondsLeft);
}

// ---- origin / CSRF ----------------------------------------------------------
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function requestHost(req) {
  // On Vercel the Host header is the address the visitor used.
  return String(req.headers.host || '').toLowerCase();
}

function originAllowed(req) {
  if (SAFE_METHODS.has(req.method)) return true;
  const origin = String(req.headers.origin || '').replace(/\/+$/, '');
  if (!origin || origin === 'null') return false;
  if (config.allowedOrigins().includes(origin)) return true;
  try {
    const u = new URL(origin);
    const host = requestHost(req);
    // Same-origin request (e.g. a *.vercel.app preview of this project).
    const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    return Boolean(host) && u.host.toLowerCase() === host && (u.protocol === 'https:' || local || !config.isProduction());
  } catch {
    return false;
  }
}

// Rejects cross-site state changes (CSRF) and non-JSON bodies.
function guardWrite(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (!originAllowed(req)) {
    require('./log').security('origin_rejected', req, { origin: String(req.headers.origin || '').slice(0, 100) });
    return next(new HttpError(403, 'Request not allowed.'));
  }
  const hasBody = Number(req.headers['content-length'] || 0) > 0 || req.headers['transfer-encoding'];
  if (hasBody && !req.is('application/json')) return next(new HttpError(415, 'Please send JSON.'));
  return next();
}

// Requires a logged-in admin. Attaches req.session.
function requireAdmin(req, _res, next) {
  getSession(req).then(
    (s) => {
      if (!s) return next(new HttpError(401, 'Please log in again.'));
      req.session = s;
      return next();
    },
    (e) => next(e)
  );
}

module.exports = {
  cookieName,
  setSession,
  clearSession,
  getSession,
  revokeSession,
  originAllowed,
  guardWrite,
  requireAdmin,
  _test: { createSession, parseToken },
};

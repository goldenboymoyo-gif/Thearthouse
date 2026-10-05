// One admin password (ADMIN_PASSWORD), a signed httpOnly session cookie, an
// allowed-origins check on every change, and a lockout after repeated wrong
// passwords.
const crypto = require('crypto');
const config = require('../config');
const { HttpError } = require('./errors');

const COOKIE = 'ah_admin';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const secret = () =>
  config.adminSecret() || crypto.createHash('sha256').update(`art-house-admin:${config.adminPassword()}`).digest('hex');
const sign = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const passwordConfigured = () => config.adminPassword().length > 0;
const checkPassword = (input) => passwordConfigured() && safeEqual(input, config.adminPassword());

function createToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE_MS })).toString('base64url');
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

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction(),
  sameSite: 'strict',
  path: '/',
  maxAge: MAX_AGE_MS,
});

const setSession = (res) => res.cookie(COOKIE, createToken(), cookieOptions());
const clearSession = (res) => res.clearCookie(COOKIE, { ...cookieOptions(), maxAge: undefined });
const isAdmin = (req) => validToken(readCookie(req, COOKIE));

// Changes (POST/PUT/PATCH/DELETE) must come from the website itself.
function originAllowed(req) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
  const origin = req.headers.origin;
  if (!origin) return false;
  const clean = origin.replace(/\/$/, '');
  if (config.allowedOrigins().includes(clean)) return true;
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function sameOrigin(req, _res, next) {
  if (!originAllowed(req)) return next(new HttpError(403, 'Bad origin.'));
  return next();
}

function requireAdmin(req, _res, next) {
  if (!originAllowed(req)) return next(new HttpError(403, 'Bad origin.'));
  if (!isAdmin(req)) return next(new HttpError(401, 'Please log in again.'));
  return next();
}

// --- lockout ---------------------------------------------------------------
const attempts = new Map();
const WINDOW = 15 * 60 * 1000;
const LIMIT = 5;

function lockedOut(ip) {
  const a = attempts.get(ip);
  if (!a) return false;
  if (Date.now() - a.first > WINDOW) {
    attempts.delete(ip);
    return false;
  }
  return a.count >= LIMIT;
}

function recordFailure(ip) {
  const a = attempts.get(ip);
  if (!a || Date.now() - a.first > WINDOW) attempts.set(ip, { first: Date.now(), count: 1 });
  else a.count += 1;
}

const clearFailures = (ip) => attempts.delete(ip);

module.exports = {
  COOKIE,
  passwordConfigured,
  checkPassword,
  setSession,
  clearSession,
  isAdmin,
  originAllowed,
  sameOrigin,
  requireAdmin,
  lockedOut,
  recordFailure,
  clearFailures,
  _test: { createToken, validToken },
};

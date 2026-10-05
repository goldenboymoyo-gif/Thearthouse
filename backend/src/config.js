// All settings come from environment variables (Vercel → Settings →
// Environment Variables, or .env.local / backend/.env when running locally).
// They are read on every call, so tests and local changes need no restart.
const path = require('path');
const fs = require('fs');

const env = (name, fallback = '') => String(process.env[name] ?? fallback).trim();

function intEnv(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = env(name);
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) return fallback;
  return n;
}

// Production = running on Vercel, or NODE_ENV=production (`npm start` sets it).
const isProduction = () => process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

// Where the website project lives when saving to local files (development).
function siteRoot() {
  const configured = env('SITE_ROOT');
  if (configured) return path.resolve(configured);
  return path.resolve(__dirname, '..', '..');
}

function localContentAvailable() {
  return fs.existsSync(path.join(siteRoot(), 'content', 'site-content.json'));
}

const DEFAULT_ORIGINS = ['https://www.thearthousevictoriafalls.com', 'https://thearthousevictoriafalls.com'];

// Website addresses allowed to send changes (POST/PUT/PATCH/DELETE) and to
// call the API cross-origin. The site's own address is always allowed too
// (see auth.originAllowed); this list is for extra domains.
function allowedOrigins() {
  const list = env('ALLOWED_ORIGINS')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter((s) => /^https?:\/\/[^/\s]+$/.test(s));
  const origins = list.length ? list : [...DEFAULT_ORIGINS];
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  if (!isProduction()) origins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000');
  return [...new Set(origins)];
}

// How to find the visitor's real IP address (used for rate limiting and logs).
//   vercel      – Vercel's edge sets x-real-ip / x-vercel-forwarded-for and
//                 overwrites anything the client sends (default on Vercel).
//   cloudflare  – trust CF-Connecting-IP. ONLY safe when the origin accepts
//                 traffic from Cloudflare alone (see SECURITY.md).
//   <number>    – number of trusted reverse proxies in front of the app; the
//                 IP is taken that many hops from the right of X-Forwarded-For.
//   none        – use the TCP connection address (default locally).
function trustProxy() {
  const v = env('TRUST_PROXY').toLowerCase();
  if (v === 'vercel' || v === 'cloudflare' || v === 'none') return v;
  if (/^\d+$/.test(v)) return Math.min(Number(v), 10);
  return process.env.VERCEL ? 'vercel' : 'none';
}

// Rate limits: "<max requests>/<window in seconds>". Override any of them with
// the environment variable shown, e.g. RATE_LIMIT_CONTACT=3/600.
const RATE_DEFAULTS = {
  global: ['RATE_LIMIT_GLOBAL', '300/60'], // every /api request, per IP
  contact: ['RATE_LIMIT_CONTACT', '5/600'], // contact form / booking requests, per IP
  contactGlobal: ['RATE_LIMIT_CONTACT_GLOBAL', '60/3600'], // all visitors together
  loginFail: ['RATE_LIMIT_LOGIN', '5/900'], // failed logins per IP before lock-out
  loginFailGlobal: ['RATE_LIMIT_LOGIN_GLOBAL', '50/3600'], // failed logins site-wide before slow-down
  adminRead: ['RATE_LIMIT_ADMIN_READ', '120/60'], // admin reads, per session
  adminWrite: ['RATE_LIMIT_ADMIN_WRITE', '30/600'], // saves & status changes, per session
  upload: ['RATE_LIMIT_UPLOAD', '40/3600'], // photo uploads, per session
};

function rateLimit(name) {
  const [envName, fallback] = RATE_DEFAULTS[name];
  const parse = (s) => {
    const m = /^(\d{1,6})\/(\d{1,6})$/.exec(String(s).trim());
    return m && Number(m[1]) > 0 && Number(m[2]) > 0 ? { max: Number(m[1]), windowSec: Number(m[2]) } : null;
  };
  return parse(env(envName)) || parse(fallback);
}

module.exports = {
  env,
  intEnv,
  isProduction,
  siteRoot,
  localContentAvailable,
  allowedOrigins,
  trustProxy,
  rateLimit,
  adminPassword: () => env('ADMIN_PASSWORD'),
  adminPasswordHash: () => env('ADMIN_PASSWORD_HASH'),
  adminSecret: () => env('ADMIN_SECRET'),
  sessionHours: () => intEnv('ADMIN_SESSION_HOURS', 12, { min: 1, max: 168 }),
  githubToken: () => env('ADMIN_GITHUB_TOKEN'),
  siteRepo: () => env('GITHUB_REPO', 'goldenboymoyo-gif/Thearthouse'),
  siteBranch: () => env('GITHUB_BRANCH', 'main'),
  dataRepo: () => env('GITHUB_DATA_REPO'),
  resendKey: () => env('RESEND_API_KEY'),
  contactFrom: () => env('CONTACT_FROM', 'The Art House Website <onboarding@resend.dev>'),
  contactTo: () => env('CONTACT_TO', 'thearthousevf@gmail.com'),
  upstashUrl: () => env('UPSTASH_REDIS_REST_URL'),
  upstashToken: () => env('UPSTASH_REDIS_REST_TOKEN'),
  enquiriesPerMonth: () => intEnv('ENQUIRIES_MAX_PER_MONTH', 1000, { min: 10, max: 5000 }),
};

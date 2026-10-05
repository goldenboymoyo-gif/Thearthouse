// All settings come from environment variables (set them in the Vercel
// project for the backend, or in .env when running locally). They are read
// on every request, so nothing needs a restart after a change locally.
const path = require('path');
const fs = require('fs');

const env = (name, fallback = '') => (process.env[name] ?? fallback).trim();

const isProduction = () => process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

// Where the website project lives when saving to local files (development).
// Defaults to the folder above /backend.
function siteRoot() {
  const configured = env('SITE_ROOT');
  if (configured) return path.resolve(configured);
  return path.resolve(__dirname, '..', '..');
}

function localContentAvailable() {
  return fs.existsSync(path.join(siteRoot(), 'content', 'site-content.json'));
}

const DEFAULT_ORIGINS = ['https://www.thearthousevictoriafalls.com', 'https://thearthousevictoriafalls.com'];

function allowedOrigins() {
  const list = env('ALLOWED_ORIGINS')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const origins = list.length ? list : DEFAULT_ORIGINS;
  if (!isProduction()) origins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000');
  return origins;
}

module.exports = {
  env,
  isProduction,
  siteRoot,
  localContentAvailable,
  allowedOrigins,
  adminPassword: () => env('ADMIN_PASSWORD'),
  adminSecret: () => env('ADMIN_SECRET'),
  githubToken: () => env('ADMIN_GITHUB_TOKEN'),
  siteRepo: () => env('GITHUB_REPO', 'goldenboymoyo-gif/Thearthouse'),
  siteBranch: () => env('GITHUB_BRANCH', 'main'),
  dataRepo: () => env('GITHUB_DATA_REPO'),
  resendKey: () => env('RESEND_API_KEY'),
  contactFrom: () => env('CONTACT_FROM', 'The Art House Website <onboarding@resend.dev>'),
  contactTo: () => env('CONTACT_TO', 'thearthousevf@gmail.com'),
};

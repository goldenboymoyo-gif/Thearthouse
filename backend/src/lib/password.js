// Admin password checking.
//
// Preferred: ADMIN_PASSWORD_HASH – a scrypt hash made with
//   npm --prefix backend run hash-password
// so the real password is never stored anywhere, not even in Vercel.
// Fallback: ADMIN_PASSWORD (plain text in the environment), compared in
// constant time. Either way the password itself is never logged or returned.
const crypto = require('crypto');
const config = require('../config');

const MIN_LENGTH = 12;
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password.normalize('NFKC'), salt, 32, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function parseHash(stored) {
  const m = /^scrypt\$(\d+)\$(\d+)\$(\d+)\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]+)$/.exec(stored || '');
  if (!m) return null;
  const [N, r, p] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (N < 2 ** 14 || N > 2 ** 20 || (N & (N - 1)) !== 0 || r < 8 || r > 32 || p < 1 || p > 4) return null;
  return { N, r, p, salt: Buffer.from(m[4], 'base64'), hash: Buffer.from(m[5], 'base64') };
}

// null when the admin login is usable, otherwise a reason it is switched off.
function passwordProblem() {
  const hash = config.adminPasswordHash();
  if (hash) return parseHash(hash) ? null : 'ADMIN_PASSWORD_HASH is not a valid hash.';
  const plain = config.adminPassword();
  if (!plain) return 'The admin password has not been set up yet.';
  if (config.isProduction() && plain.length < MIN_LENGTH) return `ADMIN_PASSWORD must be at least ${MIN_LENGTH} characters.`;
  return null;
}

const configured = () => passwordProblem() === null;

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function verifyPassword(input) {
  if (!configured() || typeof input !== 'string') return false;
  const stored = parseHash(config.adminPasswordHash());
  if (stored) {
    const { N, r, p, salt, hash } = stored;
    const test = crypto.scryptSync(input.normalize('NFKC'), salt, hash.length, { N, r, p, maxmem: 128 * N * r * 2 });
    return crypto.timingSafeEqual(test, hash);
  }
  return safeEqual(input, config.adminPassword());
}

module.exports = { hashPassword, verifyPassword, passwordProblem, configured, MIN_LENGTH };

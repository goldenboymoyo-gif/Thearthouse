// Rate limiting with fixed windows.
//
// Store: if UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set, counters
// live in Redis and are shared by every server instance (recommended on
// Vercel, where many short-lived instances run in parallel). Otherwise they
// live in this instance's memory: still effective against a single client
// hammering the site, but each instance counts separately – see SECURITY.md.
const config = require('../config');
const log = require('./log');
const { HttpError } = require('./errors');
const { fetchWithTimeout } = require('./http');

// ---- memory store ---------------------------------------------------------
const buckets = new Map();
const MAX_KEYS = 50000;

function memoryHit(key, windowSec) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.reset <= now) {
    if (buckets.size >= MAX_KEYS) {
      for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
      if (buckets.size >= MAX_KEYS) buckets.clear();
    }
    b = { count: 0, reset: now + windowSec * 1000 };
    buckets.set(key, b);
  }
  b.count += 1;
  return { count: b.count, resetMs: b.reset - now };
}

function memoryPeek(key) {
  const b = buckets.get(key);
  return b && b.reset > Date.now() ? b.count : 0;
}

// ---- Upstash Redis (REST) store -------------------------------------------
const useRedis = () => Boolean(config.upstashUrl() && config.upstashToken());

async function redis(commands) {
  const res = await fetchWithTimeout(
    `${config.upstashUrl().replace(/\/+$/, '')}/pipeline`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.upstashToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
    },
    2000
  );
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return (await res.json()).map((r) => r.result);
}

async function hit(key, windowSec) {
  if (useRedis()) {
    try {
      const k = `rl:${key}`;
      const [count, ttl] = await redis([
        ['INCR', k],
        ['TTL', k],
      ]);
      if (ttl < 0) await redis([['EXPIRE', k, windowSec]]);
      return { count: Number(count), resetMs: (ttl > 0 ? ttl : windowSec) * 1000 };
    } catch (e) {
      log.warn('rate_limit_store_unavailable', { reason: e.message });
    }
  }
  return memoryHit(key, windowSec);
}

async function peek(key) {
  if (useRedis()) {
    try {
      const [v] = await redis([['GET', `rl:${key}`]]);
      return Number(v) || 0;
    } catch (e) {
      log.warn('rate_limit_store_unavailable', { reason: e.message });
    }
  }
  return memoryPeek(key);
}

async function reset(key) {
  buckets.delete(key);
  if (useRedis()) {
    try {
      await redis([['DEL', `rl:${key}`]]);
    } catch {
      /* best effort */
    }
  }
}

// Count one request against limit `name` for `id`. Throws HttpError 429 (with
// Retry-After) when over the limit.
async function consume(name, id, req) {
  const { max, windowSec } = config.rateLimit(name);
  const { count, resetMs } = await hit(`${name}:${id}`, windowSec);
  if (count > max) {
    const retry = Math.max(1, Math.ceil(resetMs / 1000));
    if (count === max + 1 && req) log.security('rate_limited', req, { limit: name });
    const err = new HttpError(429, 'Too many requests. Please wait a little and try again.');
    err.retryAfter = retry;
    throw err;
  }
  return { remaining: max - count };
}

// Express middleware. `keyFn(req)` picks who is being limited (default: IP).
function limit(name, keyFn = (req) => req.clientIp) {
  return (req, res, next) => {
    consume(name, keyFn(req), req).then(
      () => next(),
      (err) => next(err)
    );
  };
}

module.exports = { limit, consume, peek, reset, hit, _memory: buckets };

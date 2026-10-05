// Security & behaviour tests for the API. Run with: npm test (in /backend)
// Uses a temporary copy of the website content – never your real files.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ah-api-'));
fs.mkdirSync(path.join(tmp, 'content'));
fs.copyFileSync(path.join(__dirname, '..', '..', 'content', 'site-content.json'), path.join(tmp, 'content', 'site-content.json'));
for (const k of ['VERCEL', 'ADMIN_GITHUB_TOKEN', 'ADMIN_PASSWORD_HASH', 'ADMIN_SECRET', 'TRUST_PROXY', 'UPSTASH_REDIS_REST_URL', 'ALLOWED_ORIGINS', 'RESEND_API_KEY']) delete process.env[k];
Object.assign(process.env, { SITE_ROOT: tmp, ADMIN_PASSWORD: 'test-password-123', NODE_ENV: 'development' });

const { createApp } = require('../src/app');
const limiter = require('../src/lib/rateLimit');
const { hashPassword } = require('../src/lib/password');

let server;
let base;
const ORIGIN = 'http://localhost:3000';
const PASSWORD = 'test-password-123';

test.before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});
test.beforeEach(() => limiter._memory.clear());

function call(p, { method = 'GET', body, raw, cookie, origin = ORIGIN, headers = {} } = {}) {
  const h = { ...headers };
  if (origin) h.Origin = origin;
  if (cookie) h.Cookie = cookie;
  if (body !== undefined) h['Content-Type'] = 'application/json';
  return fetch(base + p, { method, headers: h, body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined });
}

async function login() {
  const r = await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD } });
  assert.equal(r.status, 200);
  return r.headers.get('set-cookie').split(';')[0];
}

const JPEG_1x1 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

// ---- basics ---------------------------------------------------------------
test('health check and security headers', async () => {
  const r = await call('/api/health');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { status: 'ok' });
  assert.equal(r.headers.get('x-powered-by'), null);
  assert.equal(r.headers.get('cache-control'), 'no-store, max-age=0');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('unknown route and bad JSON give short JSON errors without internals', async () => {
  const a = await call('/api/nope');
  assert.equal(a.status, 404);
  const b = await call('/api/contact', { method: 'POST', raw: '{"name": ', headers: { 'Content-Type': 'application/json' } });
  assert.equal(b.status, 400);
  const text = await b.text();
  assert.ok(!/at |node_modules|SyntaxError|\/home\//.test(text), text);
});

test('oversized bodies are refused', async () => {
  const r = await call('/api/contact', { method: 'POST', body: { name: 'x'.repeat(200000), email: 'a@b.co' } });
  assert.equal(r.status, 413);
});

// ---- CORS / CSRF ------------------------------------------------------------
test('CORS only for allowed origins; never *', async () => {
  const good = await call('/api/health', { origin: ORIGIN });
  assert.equal(good.headers.get('access-control-allow-origin'), ORIGIN);
  const evil = await call('/api/health', { origin: 'https://evil.example' });
  assert.equal(evil.headers.get('access-control-allow-origin'), null);
});

test('state changes need the site origin and JSON (CSRF)', async () => {
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD }, origin: 'https://evil.example' })).status, 403);
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD }, origin: null })).status, 403);
  assert.equal((await call('/api/contact', { method: 'POST', body: { name: 'A', email: 'a@b.co' }, origin: 'null' })).status, 403);
  const form = await call('/api/contact', { method: 'POST', raw: 'name=A&email=a@b.co', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  assert.equal(form.status, 415);
});

// ---- authentication -----------------------------------------------------------
test('login: wrong password, unexpected fields, success with hardened cookie', async () => {
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: 'nope' } })).status, 401);
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD, admin: true } })).status, 400);
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: { $ne: 1 } } })).status, 400);
  const r = await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD } });
  assert.equal(r.status, 200);
  const sc = r.headers.get('set-cookie');
  assert.match(sc, /HttpOnly/);
  assert.match(sc, /SameSite=Strict/);
  assert.match(sc, /Path=\//);
  const cookie = sc.split(';')[0];
  const s = await (await call('/api/admin/login', { cookie })).json();
  assert.equal(s.loggedIn, true);
});

test('logged-out status reveals no set-up details', async () => {
  const s = await (await call('/api/admin/login')).json();
  assert.deepEqual(Object.keys(s).sort(), ['configured', 'loggedIn']);
});

test('brute force: lock-out after 5 failures, not bypassable with X-Forwarded-For', async () => {
  for (let i = 0; i < 5; i++) {
    const r = await call('/api/admin/login', { method: 'POST', body: { password: `wrong${i}` }, headers: { 'X-Forwarded-For': `9.9.9.${i}` } });
    assert.equal(r.status, 401);
  }
  const locked = await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD }, headers: { 'X-Forwarded-For': '8.8.8.8' } });
  assert.equal(locked.status, 429);
  assert.ok(Number(locked.headers.get('retry-after')) > 0);
});

test('forged, tampered and expired sessions are rejected', async () => {
  const cookie = await login();
  const [name, value] = cookie.split('=');
  const [payload, sig] = value.split('.');
  // tamper payload (extend expiry)
  const p = JSON.parse(Buffer.from(payload, 'base64url').toString());
  p.exp += 1e9;
  const forged = `${name}=${Buffer.from(JSON.stringify(p)).toString('base64url')}.${sig}`;
  assert.equal((await call('/api/admin/content', { cookie: forged })).status, 401);
  assert.equal((await call('/api/admin/content', { cookie: `${name}=garbage` })).status, 401);
  assert.equal((await call('/api/admin/content', { cookie: `${name}=${payload}.` })).status, 401);
  // expired token, correctly signed
  const auth = require('../src/lib/auth');
  const { token } = auth._test.createSession();
  const ep = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
  assert.ok(auth._test.parseToken(token));
  ep.exp = Date.now() - 1000;
  assert.equal(auth._test.parseToken(`${Buffer.from(JSON.stringify(ep)).toString('base64url')}.x`), null);
});

test('logout revokes the session on the server', async () => {
  const cookie = await login();
  assert.equal((await call('/api/admin/content', { cookie })).status, 200);
  assert.equal((await call('/api/admin/login', { method: 'DELETE', cookie })).status, 200);
  limiter._memory.forEach((v, k) => !k.startsWith('revoked:') && limiter._memory.delete(k));
  assert.equal((await call('/api/admin/content', { cookie })).status, 401);
});

test('changing the password invalidates existing sessions', async () => {
  const cookie = await login();
  process.env.ADMIN_PASSWORD = 'another-password-456';
  try {
    assert.equal((await call('/api/admin/content', { cookie })).status, 401);
  } finally {
    process.env.ADMIN_PASSWORD = PASSWORD;
  }
});

test('ADMIN_PASSWORD_HASH (scrypt) works instead of a plain password', async () => {
  process.env.ADMIN_PASSWORD_HASH = hashPassword('hashed-password-789');
  try {
    assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: PASSWORD } })).status, 401);
    assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: 'hashed-password-789' } })).status, 200);
  } finally {
    delete process.env.ADMIN_PASSWORD_HASH;
  }
});

// ---- authorization --------------------------------------------------------------
test('every admin endpoint requires a session', async () => {
  const cases = [
    ['GET', '/api/admin/content'],
    ['PUT', '/api/admin/content', { content: {} }],
    ['POST', '/api/admin/upload', { data: JPEG_1x1, width: 1, height: 1 }],
    ['GET', '/api/admin/enquiries'],
    ['PATCH', '/api/admin/enquiries', { id: 'aaaaaaaaaaaa', date: '2026-10-01T00:00:00.000Z', status: 'archived' }],
  ];
  for (const [method, p, body] of cases) {
    const r = await call(p, { method, body });
    assert.equal(r.status, 401, `${method} ${p}`);
  }
});

// ---- content ----------------------------------------------------------------------
test('content: validation blocks script links, foreign images, bad emails; prototype pollution ignored', async () => {
  const cookie = await login();
  const { content } = await (await call('/api/admin/content', { cookie })).json();
  const bad = (mutate) => {
    const c = structuredClone(content);
    mutate(c);
    return call('/api/admin/content', { method: 'PUT', body: { content: c }, cookie });
  };
  assert.equal((await bad((c) => (c.quickLook[0].href = 'javascript:alert(1)'))).status, 400);
  assert.equal((await bad((c) => (c.site.bookingUrl = 'javascript:alert(1)'))).status, 400);
  assert.equal((await bad((c) => (c.welcome.image = 'https://evil.example/x.png'))).status, 400);
  assert.equal((await bad((c) => (c.welcome.image = '/images/../../etc/passwd'))).status, 400);
  assert.equal((await bad((c) => (c.contact.email = 'not-an-email'))).status, 400);
  assert.equal((await bad((c) => (c.faq = Array(61).fill({ q: 'q', a: 'a' })))).status, 400);
  const c = structuredClone(content);
  c.stay.rateFrom = 'US$999';
  const polluted = JSON.parse(JSON.stringify({ content: c }).replace('{"_note"', '{"__proto__":{"polluted":1},"_note"'));
  const ok = await call('/api/admin/content', { method: 'PUT', body: polluted, cookie });
  assert.equal(ok.status, 200);
  assert.equal({}.polluted, undefined);
  const saved = JSON.parse(fs.readFileSync(path.join(tmp, 'content', 'site-content.json'), 'utf8'));
  assert.equal(saved.stay.rateFrom, 'US$999');
  assert.equal(Object.prototype.hasOwnProperty.call(saved, '__proto__'), false);
});

// ---- uploads ------------------------------------------------------------------------
test('uploads: real images only, safe random names, size read from the file', async () => {
  const cookie = await login();
  const ok = await call('/api/admin/upload', { method: 'POST', body: { data: JPEG_1x1, width: 9999, height: 9999, name: '../../etc/Pool <script>.JPG' }, cookie });
  assert.equal(ok.status, 200);
  const j = await ok.json();
  assert.match(j.src, /^\/images\/up-\d{14}-[a-f0-9]{8}-etc-pool-script\.jpg$/);
  assert.deepEqual([j.width, j.height], [1, 1]);
  assert.ok(fs.existsSync(path.join(tmp, 'public', j.src)));
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>').toString('base64');
  assert.equal((await call('/api/admin/upload', { method: 'POST', body: { data: svg, width: 1, height: 1 }, cookie })).status, 415);
  const fakeJpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.from('<html>not an image</html>')]).toString('base64');
  assert.equal((await call('/api/admin/upload', { method: 'POST', body: { data: fakeJpeg, width: 1, height: 1 }, cookie })).status, 415);
  assert.equal((await call('/api/admin/upload', { method: 'POST', body: { data: 'not base64!!', width: 1, height: 1 }, cookie })).status, 400);
});

// ---- contact form & enquiries ---------------------------------------------------------
test('contact: validation, honeypot, per-IP rate limit, admin inbox and IDOR-safe status updates', async () => {
  assert.equal((await call('/api/contact', { method: 'POST', body: { name: 'A', email: 'bad' } })).status, 400);
  const hp = await call('/api/contact', { method: 'POST', body: { name: 'Bot', email: 'bot@example.com', website: 'http://spam' } });
  assert.deepEqual(await hp.json(), { ok: true, delivered: true });
  const r = await call('/api/contact', {
    method: 'POST',
    body: { name: 'Jane\r\nBcc: x@evil.com', email: 'jane@example.com', message: '<img src=x onerror=alert(1)>', isAdmin: true, status: 'replied' },
  });
  assert.deepEqual(await r.json(), { ok: true, delivered: true });
  const cookie = await login();
  const { items } = await (await call('/api/admin/enquiries', { cookie })).json();
  assert.equal(items.length, 1, 'honeypot submission must not be stored');
  assert.equal(items[0].name, 'Jane Bcc: x@evil.com');
  assert.equal(items[0].status, 'new');
  assert.equal(items[0].isAdmin, undefined);
  const bad = [
    { id: items[0].id, date: '../../../etc/passwd', status: 'replied' },
    { id: '../x', date: items[0].date, status: 'replied' },
    { id: items[0].id, date: items[0].date, status: 'deleted' },
  ];
  for (const b of bad) assert.equal((await call('/api/admin/enquiries', { method: 'PATCH', body: b, cookie })).status, 400);
  assert.equal((await call('/api/admin/enquiries', { method: 'PATCH', body: { id: items[0].id, date: items[0].date, status: 'replied' }, cookie })).status, 200);
  // per-IP limit (5 per 10 minutes by default)
  limiter._memory.clear();
  let last;
  for (let i = 0; i < 6; i++) last = await call('/api/contact', { method: 'POST', body: { name: 'N', email: 'n@example.com' } });
  assert.equal(last.status, 429);
});

test('global API rate limit applies', async () => {
  process.env.RATE_LIMIT_GLOBAL = '3/60';
  try {
    for (let i = 0; i < 3; i++) assert.equal((await call('/api/health')).status, 200);
    assert.equal((await call('/api/health')).status, 429);
  } finally {
    delete process.env.RATE_LIMIT_GLOBAL;
  }
});

test('trusted proxy modes pick the right client IP', () => {
  const { clientIp } = require('../src/lib/clientIp');
  const req = (headers) => ({ headers, socket: { remoteAddress: '10.0.0.1' } });
  process.env.TRUST_PROXY = 'none';
  assert.equal(clientIp(req({ 'x-forwarded-for': '1.1.1.1' })), '10.0.0.1');
  process.env.TRUST_PROXY = '1';
  assert.equal(clientIp(req({ 'x-forwarded-for': '6.6.6.6, 2.2.2.2' })), '2.2.2.2');
  process.env.TRUST_PROXY = 'vercel';
  assert.equal(clientIp(req({ 'x-real-ip': '3.3.3.3', 'x-forwarded-for': '6.6.6.6' })), '3.3.3.3');
  process.env.TRUST_PROXY = 'cloudflare';
  assert.equal(clientIp(req({ 'cf-connecting-ip': 'not-an-ip' })), '10.0.0.1');
  delete process.env.TRUST_PROXY;
});

test('production refuses a short admin password', () => {
  const { passwordProblem } = require('../src/lib/password');
  const saved = { ...process.env };
  try {
    Object.assign(process.env, { NODE_ENV: 'production', ADMIN_PASSWORD: 'short' });
    assert.match(passwordProblem(), /at least 12/);
  } finally {
    process.env.NODE_ENV = saved.NODE_ENV;
    process.env.ADMIN_PASSWORD = saved.ADMIN_PASSWORD;
  }
});

test('shared Redis (Upstash REST) store is used when configured', async () => {
  const http = require('http');
  const store = new Map();
  const fake = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      assert.equal(req.headers.authorization, 'Bearer test-token');
      const out = JSON.parse(body).map(([cmd, key, arg]) => {
        if (cmd === 'INCR') store.set(key, (store.get(key) || 0) + 1);
        if (cmd === 'EXPIRE') return { result: 1 };
        if (cmd === 'TTL') return { result: store.has(`${key}:ttl`) ? 30 : -1 };
        if (cmd === 'DEL') store.delete(key);
        return { result: store.get(key) ?? null };
      });
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(out));
    });
  });
  await new Promise((r) => fake.listen(0, r));
  Object.assign(process.env, { UPSTASH_REDIS_REST_URL: `http://127.0.0.1:${fake.address().port}`, UPSTASH_REDIS_REST_TOKEN: 'test-token', RATE_LIMIT_GLOBAL: '2/60' });
  try {
    assert.equal((await call('/api/health')).status, 200);
    assert.equal((await call('/api/health')).status, 200);
    assert.equal((await call('/api/health')).status, 429);
    assert.equal(store.get('rl:global:127.0.0.1'), 3);
    assert.equal(limiter._memory.size, 0, 'memory store must not be used when Redis is configured');
  } finally {
    for (const k of ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'RATE_LIMIT_GLOBAL']) delete process.env[k];
    fake.close();
  }
});

// Run with: npm test   (uses a temporary copy of the content, never your files)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ah-api-'));
fs.mkdirSync(path.join(tmp, 'content'));
fs.copyFileSync(path.join(__dirname, '..', '..', 'content', 'site-content.json'), path.join(tmp, 'content', 'site-content.json'));
Object.assign(process.env, { SITE_ROOT: tmp, ADMIN_PASSWORD: 'test-password-123', NODE_ENV: 'development', ADMIN_GITHUB_TOKEN: '' });
delete process.env.VERCEL;

const { createApp } = require('../src/app');

let server;
let base;
const ORIGIN = 'http://localhost:3000';

test.before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

const call = (p, { method = 'GET', body, cookie, origin = ORIGIN } = {}) =>
  fetch(base + p, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(origin ? { Origin: origin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

let cookie;

test('health', async () => {
  const r = await call('/api/health');
  assert.equal(r.status, 200);
  assert.equal((await r.json()).status, 'ok');
});

test('unknown api route is JSON 404', async () => {
  const r = await call('/api/nope');
  assert.equal(r.status, 404);
  assert.ok((await r.json()).error);
});

test('login rejects wrong password, foreign origin; accepts right one', async () => {
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: 'nope' } })).status, 401);
  assert.equal((await call('/api/admin/login', { method: 'POST', body: { password: 'test-password-123' }, origin: 'https://evil.example' })).status, 403);
  const r = await call('/api/admin/login', { method: 'POST', body: { password: 'test-password-123' } });
  assert.equal(r.status, 200);
  cookie = r.headers.get('set-cookie').split(';')[0];
  assert.match(cookie, /^ah_admin=/);
  const s = await (await call('/api/admin/login', { cookie })).json();
  assert.equal(s.loggedIn, true);
  assert.equal(s.storage, 'local');
});

test('content needs login, validates, and saves', async () => {
  assert.equal((await call('/api/admin/content')).status, 401);
  const { content } = await (await call('/api/admin/content', { cookie })).json();
  content.stay.rateFrom = 'US$999';
  const bad = structuredClone(content);
  bad.contact.email = 'not-an-email';
  const r1 = await call('/api/admin/content', { method: 'PUT', body: { content: bad }, cookie });
  assert.equal(r1.status, 400);
  const r2 = await call('/api/admin/content', { method: 'PUT', body: { content, summary: 'rates' }, cookie });
  assert.equal(r2.status, 200);
  const saved = JSON.parse(fs.readFileSync(path.join(tmp, 'content', 'site-content.json'), 'utf8'));
  assert.equal(saved.stay.rateFrom, 'US$999');
});

test('upload accepts a JPEG and rejects other files', async () => {
  const jpeg = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==', 'base64');
  const ok = await call('/api/admin/upload', { method: 'POST', body: { data: jpeg.toString('base64'), width: 1, height: 1, name: 'Pool.JPG' }, cookie });
  assert.equal(ok.status, 200);
  const { src } = await ok.json();
  assert.ok(fs.existsSync(path.join(tmp, 'public', src)));
  const bad = await call('/api/admin/upload', { method: 'POST', body: { data: Buffer.from('<script>').toString('base64'), width: 1, height: 1 }, cookie });
  assert.equal(bad.status, 415);
});

test('contact form stores an enquiry the admin can see and update', async () => {
  assert.equal((await call('/api/contact', { method: 'POST', body: { name: 'A', email: 'bad' } })).status, 400);
  const r = await call('/api/contact', { method: 'POST', body: { name: 'Jane', email: 'jane@example.com', message: 'Hello' } });
  assert.deepEqual(await r.json(), { ok: true, delivered: true });
  const { items } = await (await call('/api/admin/enquiries', { cookie })).json();
  assert.equal(items.length, 1);
  assert.equal(items[0].name, 'Jane');
  const p = await call('/api/admin/enquiries', { method: 'PATCH', body: { id: items[0].id, date: items[0].date, status: 'replied' }, cookie });
  assert.equal(p.status, 200);
  const again = await (await call('/api/admin/enquiries', { cookie })).json();
  assert.equal(again.items[0].status, 'replied');
});

test('logout clears the session', async () => {
  const r = await call('/api/admin/login', { method: 'DELETE', cookie });
  assert.equal(r.status, 200);
  assert.match(r.headers.get('set-cookie'), /ah_admin=;/);
});

// /api/admin/* – the admin dashboard. Everything except the login endpoints
// requires a valid admin session (checked on the server for every request);
// there is only one role (owner/admin) and no per-user resources.
const crypto = require('crypto');
const express = require('express');
const config = require('../config');
const { route, HttpError } = require('../lib/errors');
const auth = require('../lib/auth');
const { body, schemas } = require('../lib/validate');
const limiter = require('../lib/rateLimit');
const { validateContent } = require('../lib/schema');
const { verifyPassword, passwordProblem, configured } = require('../lib/password');
const { storageMode, readFile, writeFile } = require('../lib/storage');
const { enquiriesEnabled, listEnquiries, setEnquiryStatus } = require('../lib/enquiries');
const { fetchWithTimeout } = require('../lib/http');
const log = require('../lib/log');

const router = express.Router();
const CONTENT_FILE = 'content/site-content.json';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- session ----------------------------------------------------------------

// GET /api/admin/login – is this browser logged in? Set-up details are only
// shown to a logged-in admin.
router.get(
  '/login',
  route(async (req, res) => {
    const session = await auth.getSession(req);
    if (!session) return res.json({ loggedIn: false, configured: configured() });
    return res.json({ loggedIn: true, configured: true, storage: storageMode(), enquiries: enquiriesEnabled() });
  })
);

// POST /api/admin/login { password }
router.post(
  '/login',
  body(schemas.login),
  route(async (req, res) => {
    const problem = passwordProblem();
    if (problem) throw new HttpError(503, problem);

    const ip = req.clientIp;
    const perIp = config.rateLimit('loginFail');
    if ((await limiter.peek(`loginFail:${ip}`)) >= perIp.max) {
      log.security('login_locked', req);
      const err = new HttpError(429, 'Too many wrong passwords. Please wait 15 minutes and try again.');
      err.retryAfter = perIp.windowSec;
      throw err;
    }
    // Many failures site-wide (credential stuffing from many addresses):
    // slow every attempt down instead of locking the owner out.
    if ((await limiter.peek('loginFailGlobal:all')) >= config.rateLimit('loginFailGlobal').max) await sleep(3000);

    if (!verifyPassword(req.body.password)) {
      await limiter.hit(`loginFail:${ip}`, perIp.windowSec);
      await limiter.hit('loginFailGlobal:all', config.rateLimit('loginFailGlobal').windowSec);
      log.security('login_failed', req);
      await sleep(500 + crypto.randomInt(300));
      throw new HttpError(401, 'That password is not correct.');
    }
    await limiter.reset(`loginFail:${ip}`);
    const session = auth.setSession(res);
    log.audit('login_success', req, { sid: session.sid.slice(0, 8) });
    res.json({ ok: true });
  })
);

// DELETE /api/admin/login – log out (revokes the session on the server too).
router.delete(
  '/login',
  route(async (req, res) => {
    await auth.revokeSession(req);
    auth.clearSession(res);
    log.audit('logout', req);
    res.json({ ok: true });
  })
);

// ---- everything below: admin only ---------------------------------------------
router.use(auth.requireAdmin);
router.use((req, res, next) =>
  limiter.limit(['GET', 'HEAD'].includes(req.method) ? 'adminRead' : 'adminWrite', (r) => r.session.sid)(req, res, next)
);

// Without a GitHub token the dashboard still shows the live content (read
// only) – the website repository is public, so it can be read without one.
async function publicContent() {
  const url = `https://raw.githubusercontent.com/${config.siteRepo()}/${encodeURIComponent(config.siteBranch())}/${CONTENT_FILE}`;
  const r = await fetchWithTimeout(url, { headers: { 'User-Agent': 'art-house-api' } });
  if (!r.ok) throw new HttpError(502, 'Could not load the website content.');
  return r.json();
}

router.get(
  '/content',
  route(async (req, res) => {
    if (storageMode() === 'none') return res.json({ content: await publicContent(), sha: null, readOnly: true });
    const cur = await readFile(CONTENT_FILE);
    if (!cur) throw new HttpError(404, 'The website content file was not found.');
    res.json({ content: JSON.parse(cur.text), sha: cur.sha });
  })
);

router.put(
  '/content',
  body(schemas.contentSave),
  route(async (req, res) => {
    const result = validateContent(req.body.content);
    if (!result.ok) throw new HttpError(400, `Not saved: ${result.error}.`);
    const summary = String(req.body.summary || 'website content').replace(/[^\w\s&,'-]/g, '').slice(0, 60) || 'website content';
    const saved = await writeFile(CONTENT_FILE, JSON.stringify(result.content, null, 2) + '\n', {
      sha: req.body.sha || undefined,
      message: `Admin: update ${summary}`,
    });
    log.audit('content_saved', req, { section: summary, commit: saved.commit ? saved.commit.slice(0, 10) : null });
    res.json({ ok: true, sha: saved.sha, content: result.content, mode: storageMode() });
  })
);

// ---- photos -------------------------------------------------------------------

const MAX_BYTES = 3.5 * 1024 * 1024;

// The file's real type is decided from its first bytes, never from the name
// or the browser's claim. SVG (which can contain scripts) is not accepted.
function imageKind(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

// Reads the pixel size from the file itself (PNG / JPEG / WebP headers).
function imageSize(buf, kind) {
  try {
    if (kind === 'png') return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (kind === 'webp') {
      const chunk = buf.subarray(12, 16).toString('latin1');
      if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
      return null;
    }
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  } catch {
    /* fall through */
  }
  return null;
}

// POST /api/admin/upload { data: base64, width, height, name }
router.post(
  '/upload',
  limiter.limit('upload', (r) => r.session.sid),
  body(schemas.upload),
  route(async (req, res) => {
    const buf = Buffer.from(req.body.data, 'base64');
    if (!buf.length || buf.length > MAX_BYTES) throw new HttpError(413, 'That photo is too large.');
    const ext = imageKind(buf);
    if (!ext) throw new HttpError(415, 'Please choose a JPG, PNG or WebP photo.');
    const size = imageSize(buf, ext);
    if (!size || size.width < 1 || size.height < 1 || size.width > 10000 || size.height > 10000) {
      throw new HttpError(415, 'That photo could not be read.');
    }
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const base =
      String(req.body.name || 'photo')
        .toLowerCase()
        .replace(/\.[a-z0-9]+$/, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'photo';
    const file = `up-${stamp}-${crypto.randomBytes(4).toString('hex')}-${base}.${ext}`;
    await writeFile(`public/images/${file}`, buf, { message: `Admin: add photo ${file}` });
    log.audit('photo_uploaded', req, { file, bytes: buf.length });
    res.json({ ok: true, src: `/images/${file}`, file, width: size.width, height: size.height });
  })
);

// ---- enquiries ----------------------------------------------------------------

router.get(
  '/enquiries',
  route(async (req, res) => {
    res.json({ enabled: enquiriesEnabled(), items: await listEnquiries() });
  })
);

router.patch(
  '/enquiries',
  body(schemas.enquiryStatus),
  route(async (req, res) => {
    await setEnquiryStatus(req.body.id, req.body.date, req.body.status);
    log.audit('enquiry_status_changed', req, { id: req.body.id, status: req.body.status });
    res.json({ ok: true });
  })
);

module.exports = router;

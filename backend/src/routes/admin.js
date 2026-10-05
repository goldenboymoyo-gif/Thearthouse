const crypto = require('crypto');
const express = require('express');
const { route, HttpError } = require('../lib/errors');
const auth = require('../lib/auth');
const { validateContent } = require('../lib/schema');
const { storageMode, readFile, writeFile } = require('../lib/storage');
const { enquiriesEnabled, listEnquiries, setEnquiryStatus } = require('../lib/enquiries');

const router = express.Router();
const CONTENT_FILE = 'content/site-content.json';

// ---- session --------------------------------------------------------------

// GET /api/admin/login – is this browser logged in, and what is set up?
router.get('/login', (req, res) => {
  res.json({
    loggedIn: auth.isAdmin(req),
    configured: auth.passwordConfigured(),
    storage: storageMode(),
    enquiries: enquiriesEnabled(),
  });
});

// POST /api/admin/login { password }
router.post(
  '/login',
  auth.sameOrigin,
  route(async (req, res) => {
    if (!auth.passwordConfigured()) throw new HttpError(503, 'The admin password has not been set up yet (ADMIN_PASSWORD).');
    if (auth.lockedOut(req.ip)) throw new HttpError(429, 'Too many wrong passwords. Please wait 15 minutes and try again.');
    if (!auth.checkPassword(String((req.body && req.body.password) || ''))) {
      auth.recordFailure(req.ip);
      await new Promise((r) => setTimeout(r, 600));
      throw new HttpError(401, 'That password is not correct.');
    }
    auth.clearFailures(req.ip);
    auth.setSession(res);
    res.json({ ok: true });
  })
);

// DELETE /api/admin/login – log out
router.delete('/login', auth.sameOrigin, (req, res) => {
  auth.clearSession(res);
  res.json({ ok: true });
});

// Everything below needs a logged-in admin.
router.use(auth.requireAdmin);

// ---- content --------------------------------------------------------------

router.get(
  '/content',
  route(async (req, res) => {
    const cur = await readFile(CONTENT_FILE);
    if (!cur) throw new HttpError(404, 'content/site-content.json was not found in the website repository.');
    res.json({ content: JSON.parse(cur.text), sha: cur.sha });
  })
);

router.put(
  '/content',
  route(async (req, res) => {
    const body = req.body || {};
    const result = validateContent(body.content);
    if (!result.ok) throw new HttpError(400, `Not saved: ${result.error}.`);
    const summary = String(body.summary || 'website content').replace(/[^\w\s&,'-]/g, '').slice(0, 60);
    const saved = await writeFile(CONTENT_FILE, JSON.stringify(result.content, null, 2) + '\n', {
      sha: body.sha || undefined,
      message: `Admin: update ${summary}`,
    });
    res.json({ ok: true, sha: saved.sha, content: result.content, mode: storageMode() });
  })
);

// ---- photos ---------------------------------------------------------------

const MAX_BYTES = 3.5 * 1024 * 1024;

function imageKind(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

// POST /api/admin/upload { data: base64, width, height, name }
// The dashboard resizes photos to at most 2000px before sending them.
router.post(
  '/upload',
  route(async (req, res) => {
    const body = req.body || {};
    if (typeof body.data !== 'string') throw new HttpError(400, 'No photo received.');
    const buf = Buffer.from(body.data, 'base64');
    if (!buf.length || buf.length > MAX_BYTES) throw new HttpError(413, 'That photo is too large.');
    const ext = imageKind(buf);
    if (!ext) throw new HttpError(415, 'Please choose a JPG, PNG or WebP photo.');
    const width = Math.round(Number(body.width));
    const height = Math.round(Number(body.height));
    if (!(width > 0 && height > 0 && width <= 10000 && height <= 10000)) throw new HttpError(400, 'Could not read the photo size.');
    const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const base =
      String(body.name || 'photo')
        .toLowerCase()
        .replace(/\.[a-z0-9]+$/, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'photo';
    const file = `up-${stamp}-${crypto.randomBytes(3).toString('hex')}-${base}.${ext}`;
    await writeFile(`public/images/${file}`, buf, { message: `Admin: add photo ${file}` });
    res.json({ ok: true, src: `/images/${file}`, file, width, height });
  })
);

// ---- enquiries ------------------------------------------------------------

router.get(
  '/enquiries',
  route(async (req, res) => {
    res.json({ enabled: enquiriesEnabled(), items: await listEnquiries() });
  })
);

router.patch(
  '/enquiries',
  route(async (req, res) => {
    const body = req.body || {};
    await setEnquiryStatus(String(body.id || ''), body.date, body.status);
    res.json({ ok: true });
  })
);

module.exports = router;

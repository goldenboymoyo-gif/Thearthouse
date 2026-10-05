// Contact-form messages and chatbot booking requests, kept for the admin
// dashboard's inbox. They contain guests' personal details, so they are never
// written to the public website repository: they go to a separate PRIVATE
// repository (GITHUB_DATA_REPO), or to the local .data folder in development.
const crypto = require('crypto');
const config = require('../config');
const { HttpError } = require('./errors');
const { storageMode, readFile, writeFile, listDir, data } = require('./storage');

const DIR = 'enquiries';
const STATUSES = ['new', 'replied', 'archived'];

function enquiriesEnabled() {
  const mode = storageMode();
  return mode === 'local' || (mode === 'github' && Boolean(config.dataRepo()));
}

const monthOf = (iso) => iso.slice(0, 7);

async function updateMonth(month, fn) {
  const file = `${DIR}/${month}.json`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const cur = await readFile(file, data());
    const list = cur ? JSON.parse(cur.text) : [];
    const next = fn(list);
    try {
      await writeFile(file, JSON.stringify(next, null, 2) + '\n', { sha: cur && cur.sha, message: `Enquiries ${month}` }, data());
      return next;
    } catch (e) {
      if (e.status !== 409 || attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return null;
}

// Only these fields are ever stored (no mass assignment).
const FIELDS = ['type', 'name', 'email', 'phone', 'message', 'checkIn', 'checkOut', 'adults', 'children'];

async function saveEnquiry(fields) {
  if (!enquiriesEnabled()) return false;
  const date = new Date().toISOString();
  const entry = { id: crypto.randomBytes(6).toString('hex'), date, status: 'new' };
  for (const k of FIELDS) if (typeof fields[k] === 'string' && fields[k]) entry[k] = fields[k];
  let stored = true;
  await updateMonth(monthOf(date), (list) => {
    // Hard cap so a flood of spam cannot grow the file without limit.
    if (list.length >= config.enquiriesPerMonth()) {
      stored = false;
      return list;
    }
    return [...list, entry];
  });
  return stored;
}

async function listEnquiries(months = 12) {
  if (!enquiriesEnabled()) return [];
  const files = (await listDir(DIR, data()))
    .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()
    .slice(0, months);
  const lists = await Promise.all(
    files.map(async (f) => {
      const cur = await readFile(`${DIR}/${f}`, data());
      return cur ? JSON.parse(cur.text) : [];
    })
  );
  return lists.flat().sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function setEnquiryStatus(id, date, status) {
  if (!/^[a-f0-9]{12}$/.test(id || '') || !STATUSES.includes(status) || typeof date !== 'string' || !/^\d{4}-\d{2}-/.test(date)) {
    throw new HttpError(400, 'Invalid request.');
  }
  let found = false;
  await updateMonth(monthOf(date), (list) =>
    list.map((e) => {
      if (e.id !== id) return e;
      found = true;
      return { ...e, status };
    })
  );
  if (!found) throw new HttpError(404, 'Enquiry not found.');
}

module.exports = { STATUSES, enquiriesEnabled, saveEnquiry, listEnquiries, setEnquiryStatus };

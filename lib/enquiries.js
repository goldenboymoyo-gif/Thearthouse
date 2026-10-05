// Stores every contact-form and chatbot booking enquiry so the owner can see
// them in the admin dashboard. Enquiries contain guests' personal details, so
// they are never written to the public website repository: they go to a
// separate PRIVATE repository (GITHUB_DATA_REPO), or to the local .data folder
// during development.
import crypto from 'crypto';
import { DATA_REPO, StorageError, listDir, readFile, storageMode, writeFile } from './admin/storage';

const DIR = 'enquiries';
export const STATUSES = ['new', 'replied', 'archived'];

export function enquiriesEnabled() {
  const mode = storageMode();
  return mode === 'local' || (mode === 'github' && Boolean(DATA_REPO()));
}

const monthOf = (iso) => iso.slice(0, 7);
const opts = () => ({ repo: DATA_REPO(), dataRepo: true });

async function update(month, fn) {
  const file = `${DIR}/${month}.json`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const cur = await readFile(file, opts());
    const list = cur ? JSON.parse(cur.text) : [];
    const next = fn(list);
    try {
      await writeFile(file, JSON.stringify(next, null, 2) + '\n', { ...opts(), sha: cur?.sha, message: `Enquiries ${month}` });
      return next;
    } catch (e) {
      if (!(e instanceof StorageError) || e.status !== 409 || attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return null;
}

export async function saveEnquiry(fields) {
  if (!enquiriesEnabled()) return false;
  const date = new Date().toISOString();
  const entry = { id: crypto.randomBytes(6).toString('hex'), date, status: 'new', ...fields };
  await update(monthOf(date), (list) => [...list, entry]);
  return true;
}

export async function listEnquiries(months = 12) {
  if (!enquiriesEnabled()) return [];
  const files = (await listDir(DIR, opts()))
    .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()
    .slice(0, months);
  const lists = await Promise.all(
    files.map(async (f) => {
      const cur = await readFile(`${DIR}/${f}`, opts());
      return cur ? JSON.parse(cur.text) : [];
    })
  );
  return lists.flat().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function setEnquiryStatus(id, date, status) {
  if (!STATUSES.includes(status) || typeof date !== 'string' || !/^\d{4}-\d{2}/.test(date)) {
    throw new StorageError('Invalid request.', 400);
  }
  let found = false;
  await update(monthOf(date), (list) =>
    list.map((e) => {
      if (e.id !== id) return e;
      found = true;
      return { ...e, status };
    })
  );
  if (!found) throw new StorageError('Enquiry not found.', 404);
}

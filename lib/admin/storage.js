// Where admin changes are saved.
//  - ADMIN_GITHUB_TOKEN set: files are committed to the GitHub repository
//    (GITHUB_REPO, branch GITHUB_BRANCH). Vercel redeploys on each commit.
//  - No token, during local development: files are written straight into this
//    project folder, so the dashboard can be tried out on your own computer.
import fs from 'fs/promises';
import path from 'path';

const API = 'https://api.github.com';
export const SITE_REPO = () => process.env.GITHUB_REPO || 'goldenboymoyo-gif/Thearthouse';
export const DATA_REPO = () => process.env.GITHUB_DATA_REPO || '';
const BRANCH = () => process.env.GITHUB_BRANCH || 'main';

export function storageMode() {
  if (process.env.ADMIN_GITHUB_TOKEN) return 'github';
  if (process.env.NODE_ENV !== 'production') return 'local';
  return 'none';
}

export class StorageError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

function notConfigured() {
  return new StorageError(
    'Saving is not set up yet: add ADMIN_GITHUB_TOKEN in the Vercel project settings (see ADMIN.md).',
    503
  );
}

async function gh(url, init = {}) {
  const res = await fetch(`${API}${url}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${process.env.ADMIN_GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'art-house-admin',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  return res;
}

const local = (p) => path.join(process.cwd(), p);

// Read a text file. Returns { text, sha } or null when it does not exist.
export async function readFile(filePath, { repo = SITE_REPO(), dataRepo = false } = {}) {
  const mode = storageMode();
  if (mode === 'github') {
    const branch = dataRepo ? '' : `?ref=${encodeURIComponent(BRANCH())}`;
    const res = await gh(`/repos/${repo}/contents/${filePath}${branch}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new StorageError(`GitHub read failed (${res.status}).`, 502);
    const json = await res.json();
    let text;
    if (json.content) text = Buffer.from(json.content, 'base64').toString('utf8');
    else {
      const raw = await gh(`/repos/${repo}/git/blobs/${json.sha}`);
      text = Buffer.from((await raw.json()).content, 'base64').toString('utf8');
    }
    return { text, sha: json.sha };
  }
  if (mode === 'local') {
    try {
      return { text: await fs.readFile(local(dataRepo ? path.join('.data', filePath) : filePath), 'utf8'), sha: null };
    } catch {
      return null;
    }
  }
  throw notConfigured();
}

// Write a file (text string or Buffer). `sha` is the version that was read;
// GitHub refuses the save if someone else changed the file in the meantime.
export async function writeFile(filePath, data, { sha, message, repo = SITE_REPO(), dataRepo = false } = {}) {
  const mode = storageMode();
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  if (mode === 'github') {
    const body = { message: message || `Update ${filePath} from admin dashboard`, content: buf.toString('base64') };
    if (!dataRepo) body.branch = BRANCH();
    if (sha) body.sha = sha;
    const res = await gh(`/repos/${repo}/contents/${filePath}`, { method: 'PUT', body: JSON.stringify(body) });
    if (res.status === 409 || res.status === 422) {
      throw new StorageError('This was changed somewhere else in the meantime. Reload and try again.', 409);
    }
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      throw new StorageError('GitHub refused the save – check that ADMIN_GITHUB_TOKEN can write to the repository.', 502);
    }
    if (!res.ok) throw new StorageError(`GitHub save failed (${res.status}).`, 502);
    const json = await res.json();
    return { sha: json.content?.sha, commit: json.commit?.sha };
  }
  if (mode === 'local') {
    const target = local(dataRepo ? path.join('.data', filePath) : filePath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buf);
    return { sha: null, commit: null };
  }
  throw notConfigured();
}

// List file names in a folder (data repo or local .data).
export async function listDir(dirPath, { repo = DATA_REPO() } = {}) {
  const mode = storageMode();
  if (mode === 'github') {
    const res = await gh(`/repos/${repo}/contents/${dirPath}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new StorageError(`GitHub read failed (${res.status}).`, 502);
    return (await res.json()).filter((f) => f.type === 'file').map((f) => f.name);
  }
  if (mode === 'local') {
    try {
      return await fs.readdir(local(path.join('.data', dirPath)));
    } catch {
      return [];
    }
  }
  throw notConfigured();
}

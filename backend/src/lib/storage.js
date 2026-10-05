// Where saves go:
//  - ADMIN_GITHUB_TOKEN set  -> committed to GitHub (the website repository, or
//    the private data repository for enquiries). Vercel redeploys the website
//    after each commit to the website repository.
//  - no token, not production -> written into the local project folder.
//  - otherwise                -> not configured.
const fs = require('fs/promises');
const path = require('path');
const config = require('../config');
const { HttpError } = require('./errors');

const API = 'https://api.github.com';

function storageMode() {
  if (config.githubToken()) return 'github';
  if (!config.isProduction() && config.localContentAvailable()) return 'local';
  return 'none';
}

const notConfigured = () =>
  new HttpError(503, 'Saving is not set up yet: add ADMIN_GITHUB_TOKEN to the backend’s environment variables (see backend/README.md).');

async function gh(url, init = {}) {
  return fetch(`${API}${url}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.githubToken()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'art-house-api',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
}

// target: { repo, branch, local } – see site() and data() below.
const site = () => ({ repo: config.siteRepo(), branch: config.siteBranch(), local: config.siteRoot() });
const data = () => ({ repo: config.dataRepo(), branch: null, local: path.join(config.siteRoot(), '.data') });

const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/');

async function readFile(filePath, target = site()) {
  const mode = storageMode();
  if (mode === 'github') {
    const ref = target.branch ? `?ref=${encodeURIComponent(target.branch)}` : '';
    const res = await gh(`/repos/${target.repo}/contents/${encodePath(filePath)}${ref}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new HttpError(502, `GitHub read failed (${res.status}).`);
    const json = await res.json();
    let b64 = json.content;
    if (!b64) {
      const blob = await gh(`/repos/${target.repo}/git/blobs/${json.sha}`);
      b64 = (await blob.json()).content;
    }
    return { text: Buffer.from(b64, 'base64').toString('utf8'), sha: json.sha };
  }
  if (mode === 'local') {
    try {
      return { text: await fs.readFile(path.join(target.local, filePath), 'utf8'), sha: null };
    } catch {
      return null;
    }
  }
  throw notConfigured();
}

async function writeFile(filePath, contents, { sha, message } = {}, target = site()) {
  const mode = storageMode();
  const buf = Buffer.isBuffer(contents) ? contents : Buffer.from(contents, 'utf8');
  if (mode === 'github') {
    const body = { message: message || `Update ${filePath}`, content: buf.toString('base64') };
    if (target.branch) body.branch = target.branch;
    if (sha) body.sha = sha;
    const res = await gh(`/repos/${target.repo}/contents/${encodePath(filePath)}`, { method: 'PUT', body: JSON.stringify(body) });
    if (res.status === 409 || res.status === 422) {
      throw new HttpError(409, 'This was changed somewhere else in the meantime. Reload and try again.');
    }
    if ([401, 403, 404].includes(res.status)) {
      throw new HttpError(502, 'GitHub refused the save – check that ADMIN_GITHUB_TOKEN can write to the repository.');
    }
    if (!res.ok) throw new HttpError(502, `GitHub save failed (${res.status}).`);
    const json = await res.json();
    return { sha: json.content && json.content.sha, commit: json.commit && json.commit.sha };
  }
  if (mode === 'local') {
    const dest = path.join(target.local, filePath);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buf);
    return { sha: null, commit: null };
  }
  throw notConfigured();
}

async function listDir(dirPath, target = data()) {
  const mode = storageMode();
  if (mode === 'github') {
    const res = await gh(`/repos/${target.repo}/contents/${encodePath(dirPath)}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new HttpError(502, `GitHub read failed (${res.status}).`);
    return (await res.json()).filter((f) => f.type === 'file').map((f) => f.name);
  }
  if (mode === 'local') {
    try {
      return await fs.readdir(path.join(target.local, dirPath));
    } catch {
      return [];
    }
  }
  throw notConfigured();
}

module.exports = { storageMode, readFile, writeFile, listDir, site, data };

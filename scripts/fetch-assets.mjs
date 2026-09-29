// Copies every Art House photograph, logo and icon into /public so the site
// never depends on the old Site123 CDN.  Usage:  npm run fetch-assets
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'lib', 'assets.json'), 'utf8'));

const jobs = [
  ...Object.entries(manifest.images).map(([f, url]) => ['images', f, url]),
  ...Object.entries(manifest.icons).map(([f, url]) => ['icons', f, url]),
];

let done = 0;
let skipped = 0;
const failed = [];
for (const [folder, file, url] of jobs) {
  const target = path.join(root, 'public', folder, file);
  try {
    await fs.access(target);
    skipped++;
    continue;
  } catch {}
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await res.arrayBuffer()));
    done++;
    process.stdout.write('.');
  } catch (e) {
    failed.push(`${file} (${e.message})`);
  }
}
console.log(`\nDownloaded ${done}, already present ${skipped}, failed ${failed.length}`);
if (failed.length) {
  console.log(failed.join('\n'));
  process.exitCode = 1;
}

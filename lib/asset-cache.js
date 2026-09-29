import { promises as fs } from 'fs';
import path from 'path';

const TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

// Serves an Art House asset that is not yet in /public. The file is read from
// the original CDN once, saved into /public/<folder> so it is served locally
// from then on, and returned. Only files listed in lib/assets.js are allowed.
export async function serveAsset(folder, file, sources) {
  const source = sources[file];
  if (!source) return new Response('Not found', { status: 404 });

  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const target = path.join(process.cwd(), 'public', folder, file);

  try {
    const local = await fs.readFile(target);
    return new Response(local, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {}

  let res;
  try {
    res = await fetch(source, { cache: 'no-store' });
  } catch {
    return Response.redirect(source, 307);
  }
  if (!res.ok) return new Response('Not found', { status: 404 });

  const body = Buffer.from(await res.arrayBuffer());
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body);
  } catch {
    // Read-only file systems (e.g. serverless hosting) simply skip the cache.
  }
  return new Response(body, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400' } });
}

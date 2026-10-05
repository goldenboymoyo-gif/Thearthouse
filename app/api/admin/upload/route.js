import crypto from 'crypto';
import { guard } from '@/lib/admin/auth';
import { StorageError, writeFile } from '@/lib/admin/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 3.5 * 1024 * 1024;

function kind(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

// POST { data: base64, width, height, name }: add a photo to /public/images.
// The browser resizes photos to at most 2000px before sending them.
export async function POST(req) {
  const denied = await guard(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.data !== 'string') return Response.json({ error: 'No photo received.' }, { status: 400 });
  const buf = Buffer.from(body.data, 'base64');
  if (!buf.length || buf.length > MAX_BYTES) return Response.json({ error: 'That photo is too large.' }, { status: 413 });
  const ext = kind(buf);
  if (!ext) return Response.json({ error: 'Please choose a JPG, PNG or WebP photo.' }, { status: 415 });
  const width = Math.round(Number(body.width));
  const height = Math.round(Number(body.height));
  if (!(width > 0 && height > 0 && width <= 10000 && height <= 10000)) {
    return Response.json({ error: 'Could not read the photo size.' }, { status: 400 });
  }
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const base = String(body.name || 'photo')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'photo';
  const file = `up-${stamp}-${crypto.randomBytes(3).toString('hex')}-${base}.${ext}`;
  try {
    await writeFile(`public/images/${file}`, buf, { message: `Admin: add photo ${file}` });
    return Response.json({ ok: true, src: `/images/${file}`, file, width, height });
  } catch (e) {
    return Response.json({ error: e instanceof StorageError ? e.message : 'Upload failed.' }, { status: e.status || 500 });
  }
}

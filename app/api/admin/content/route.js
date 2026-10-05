import bundled from '@/content/site-content.json';
import { guard } from '@/lib/admin/auth';
import { validateContent } from '@/lib/admin/schema';
import { StorageError, readFile, storageMode, writeFile } from '@/lib/admin/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FILE = 'content/site-content.json';

const fail = (e) =>
  Response.json({ error: e instanceof StorageError ? e.message : 'Something went wrong.' }, { status: e.status || 500 });

// GET: the latest saved content (from GitHub, so changes that are still
// being published show up straight away).
export async function GET(req) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    if (storageMode() === 'none') return Response.json({ content: bundled, sha: null, readOnly: true });
    const cur = await readFile(FILE);
    if (!cur) return Response.json({ content: bundled, sha: null });
    return Response.json({ content: JSON.parse(cur.text), sha: cur.sha });
  } catch (e) {
    return fail(e);
  }
}

// PUT { content, sha, summary }: save.
export async function PUT(req) {
  const denied = await guard(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request.' }, { status: 400 });
  const result = validateContent(body.content);
  if (!result.ok) return Response.json({ error: `Not saved: ${result.error}.` }, { status: 400 });
  const summary = String(body.summary || 'website content').replace(/[^\w\s&,'-]/g, '').slice(0, 60);
  try {
    const saved = await writeFile(FILE, JSON.stringify(result.content, null, 2) + '\n', {
      sha: body.sha || undefined,
      message: `Admin: update ${summary}`,
    });
    return Response.json({ ok: true, sha: saved.sha, content: result.content, mode: storageMode() });
  } catch (e) {
    return fail(e);
  }
}

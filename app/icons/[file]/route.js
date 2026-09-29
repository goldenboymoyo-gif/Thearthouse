import { ICON_SOURCES } from '@/lib/assets';
import { serveAsset } from '@/lib/asset-cache';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const { file } = await params;
  return serveAsset('icons', file, ICON_SOURCES);
}

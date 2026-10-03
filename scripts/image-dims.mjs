// Records the intrinsic width/height of every image in /public/images so pages
// can reserve layout space (no Cumulative Layout Shift) and hand exact
// dimensions to next/image.
//
//   node scripts/image-dims.mjs
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'images');
const out = path.join(process.cwd(), 'lib', 'image-dims.json');

const files = (await fs.readdir(dir)).filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
const dims = {};

for (const file of files) {
  try {
    const meta = await sharp(path.join(dir, file)).metadata();
    dims[file] = { width: meta.width, height: meta.height };
  } catch (err) {
    console.error(`skip ${file}: ${err.message}`);
  }
}

await fs.writeFile(out, `${JSON.stringify(dims, null, 2)}\n`);
console.log(`Wrote ${Object.keys(dims).length} image dimensions to lib/image-dims.json`);

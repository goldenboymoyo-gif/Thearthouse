// Every photograph, logo and icon used by the site is one of The Art House's
// own assets from the original Site123 website (listed in assets.json with the
// address it was originally published at). They are served locally from
// /public/images and /public/icons. Any file not yet copied into /public is
// fetched once from its original address by the route handlers in app/images
// and app/icons, and saved into /public. `npm run fetch-assets` copies them
// all in one go.
import manifest from './assets.json';
import dims from './image-dims.json';

export const IMAGE_SOURCES = manifest.images;
export const ICON_SOURCES = manifest.icons;

export const img = (file) => `/images/${file}`;
export const icon = (name) => `/icons/${name}.svg`;

// Intrinsic width/height of an image (see scripts/image-dims.mjs). Pass these to
// next/image so the browser reserves the right space before the image loads,
// which keeps Cumulative Layout Shift at zero.
export const imgDims = (file) => dims[file] || { width: 2000, height: 1333 };


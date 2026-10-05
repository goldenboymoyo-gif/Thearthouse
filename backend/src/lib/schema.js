// Shape of content/site-content.json – everything the admin dashboard can
// change. Every save is validated against this, so a mistake (or a stolen
// session) cannot inject scripts, foreign links or break the website build.
// Unknown fields are dropped.
const { z } = require('zod');

const oneLine = (max) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim())
    .pipe(z.string().min(1, 'is empty').max(max, `is too long (max ${max} characters)`));
const optLine = (max) =>
  z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z
      .string()
      .transform((s) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim())
      .pipe(z.string().max(max, `is too long (max ${max} characters)`))
      .optional()
  );
const text = (max) =>
  z
    .string()
    .transform((s) => s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim())
    .pipe(z.string().min(1, 'is empty').max(max, `is too long (max ${max} characters)`));
// Only https links to other sites (blocks javascript:, data: and http: links).
const httpsUrl = () =>
  oneLine(500).refine((s) => {
    try {
      const u = new URL(s);
      return u.protocol === 'https:' && !u.username && !u.password;
    } catch {
      return false;
    }
  }, 'must be a web address starting with https://');
// Photos must be files of this website.
const image = () => z.string().regex(/^\/images\/[A-Za-z0-9][A-Za-z0-9._-]{0,150}$/, 'must be a photo from the site');
// Links inside the site only (e.g. /the-art-house#faq).
const localHref = () => z.string().regex(/^\/(?!\/)[A-Za-z0-9\-._~/#]*$/, 'must be a link inside the website').max(200);
const int = (min, max) => z.coerce.number().int().min(min).max(max);
const list = (of, max, min = 0) => z.array(of).min(min, `needs at least ${min} item(s)`).max(max, `has too many items (max ${max})`);

const DISTANCE_ICONS = ['water', 'town', 'store', 'cart', 'plane', 'pin'];

const SCHEMA = z.object({
  _note: optLine(300),
  site: z.object({ bookingUrl: httpsUrl() }),
  contact: z.object({
    address: oneLine(300),
    phone: oneLine(60).refine((s) => /^[+()\-.\s\d]{6,}$/.test(s), 'must be a phone number'),
    email: oneLine(200).refine((s) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(s), 'must be an email address'),
    hours: oneLine(300),
    facebook: httpsUrl(),
    instagram: httpsUrl(),
  }),
  stay: z.object({
    rateFrom: oneLine(40),
    rateNote: oneLine(300),
    checkIn: oneLine(40),
    checkOut: oneLine(40),
    minimumStay: list(oneLine(200), 6, 1),
    meals: text(600),
  }),
  distances: list(
    z.object({ icon: z.enum(DISTANCE_ICONS), short: oneLine(40), place: oneLine(120), distance: oneLine(30), note: optLine(200) }),
    12
  ),
  welcome: z.object({ title: oneLine(200), intro: oneLine(300), image: image(), paragraphs: list(text(3000), 12, 1) }),
  quickLook: list(
    z.object({
      icon: z.string().regex(/^[A-Za-z0-9-]{1,80}$/, 'is not a valid icon'),
      title: oneLine(80),
      text: oneLine(300),
      image: image(),
      alt: oneLine(200),
      href: localHref(),
    }),
    12,
    1
  ),
  faq: list(z.object({ q: oneLine(300), a: text(2000) }), 60),
  explore: list(z.object({ title: oneLine(120), image: image(), paragraphs: list(text(3000), 8, 1) }), 3, 3),
  activities: list(
    z.object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase words joined by dashes').max(80),
      title: oneLine(120),
      tagline: oneLine(200),
      description: text(3000),
      highlights: list(oneLine(200), 10),
      image: image(),
      full: image().optional(),
    }),
    40,
    1
  ),
  reviews: list(
    z.object({ text: text(2000), name: oneLine(120), role: optLine(120), image: z.preprocess((v) => v || undefined, image().optional()), rating: int(1, 5) }),
    60
  ),
  gallery: list(z.object({ src: image(), width: int(1, 10000), height: int(1, 10000), alt: oneLine(200) }), 300),
  imageDims: z
    .record(z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,150}$/), z.object({ width: int(1, 10000), height: int(1, 10000) }))
    .default({})
    .refine((r) => Object.keys(r).length <= 1000, 'has too many entries'),
});

const describe = (issue) => {
  const where = issue.path.map((p) => (typeof p === 'number' ? `#${p + 1}` : p)).join(' › ');
  return `${where || 'content'} ${issue.message}`;
};

// Returns { ok: true, content } with cleaned content, or { ok: false, error }.
function validateContent(input) {
  const r = SCHEMA.safeParse(input);
  if (!r.success) return { ok: false, error: describe(r.error.issues[0]) };
  const slugs = new Set();
  for (const a of r.data.activities) {
    if (slugs.has(a.slug)) return { ok: false, error: `Two activities share the web address "${a.slug}"` };
    slugs.add(a.slug);
  }
  return { ok: true, content: r.data };
}

module.exports = { SCHEMA, DISTANCE_ICONS, validateContent, describe };

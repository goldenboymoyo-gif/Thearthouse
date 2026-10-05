// Shape of content/site-content.json (the website's editable content). Everything the dashboard saves is
// checked against this, so a bad save can never break the website build.
const str = (max = 300, opts = {}) => ({ t: 'str', max, ...opts });
const text = (max = 3000) => ({ t: 'str', max, multiline: true });
const url = () => ({ t: 'str', max: 500, pattern: /^https?:\/\/\S+$/, msg: 'must be a web address starting with https://' });
const image = () => ({ t: 'str', max: 200, pattern: /^\/images\/[A-Za-z0-9._-]+$/, msg: 'must be a photo from the site' });
const list = (of, max = 100, min = 0) => ({ t: 'list', of, max, min });
const obj = (fields) => ({ t: 'obj', fields });
const int = (min, max) => ({ t: 'int', min, max });

const DISTANCE_ICONS = ['water', 'town', 'store', 'cart', 'plane', 'pin'];

const SCHEMA = obj({
  _note: str(300, { optional: true }),
  site: obj({ bookingUrl: url() }),
  contact: obj({
    address: str(),
    phone: str(60, { pattern: /\d/, msg: 'must contain a phone number' }),
    email: str(200, { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'must be an email address' }),
    hours: str(),
    facebook: url(),
    instagram: url(),
  }),
  stay: obj({
    rateFrom: str(40),
    rateNote: str(300),
    checkIn: str(40),
    checkOut: str(40),
    minimumStay: list(str(200), 6, 1),
    meals: text(600),
  }),
  distances: list(
    obj({ icon: { t: 'enum', values: DISTANCE_ICONS }, short: str(40), place: str(120), distance: str(30), note: str(200, { optional: true }) }),
    12
  ),
  welcome: obj({ title: str(200), intro: str(300), image: image(), paragraphs: list(text(), 12, 1) }),
  quickLook: list(obj({ icon: str(80), title: str(80), text: str(300), image: image(), alt: str(200), href: str(200) }), 12, 1),
  faq: list(obj({ q: str(300), a: text(2000) }), 60),
  explore: list(obj({ title: str(120), image: image(), paragraphs: list(text(), 8, 1) }), 3, 3),
  activities: list(
    obj({
      slug: str(80, { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, msg: 'must be lowercase words joined by dashes' }),
      title: str(120),
      tagline: str(200),
      description: text(3000),
      highlights: list(str(200), 10),
      image: image(),
      full: { ...image(), optional: true },
    }),
    40,
    1
  ),
  reviews: list(obj({ text: text(2000), name: str(120), role: str(120, { optional: true }), image: { ...image(), optional: true }, rating: int(1, 5) }), 60),
  gallery: list(obj({ src: image(), width: int(1, 10000), height: int(1, 10000), alt: str(200) }), 300),
  imageDims: { t: 'dims' },
});

class Invalid extends Error {}

function check(spec, value, where) {
  const fail = (m) => {
    throw new Invalid(`${where} ${m}`);
  };
  switch (spec.t) {
    case 'str': {
      if (value === undefined || value === null || value === '') {
        if (spec.optional) return undefined;
        fail('is empty');
      }
      if (typeof value !== 'string') fail('must be text');
      const v = spec.multiline ? value.replace(/\r\n/g, '\n').trim() : value.replace(/\s+/g, ' ').trim();
      if (!v && !spec.optional) fail('is empty');
      if (v.length > spec.max) fail(`is too long (max ${spec.max} characters)`);
      if (spec.pattern && v && !spec.pattern.test(v)) fail(spec.msg || 'is not valid');
      return v || undefined;
    }
    case 'int': {
      const n = Number(value);
      if (!Number.isInteger(n) || n < spec.min || n > spec.max) fail(`must be a whole number from ${spec.min} to ${spec.max}`);
      return n;
    }
    case 'enum':
      if (!spec.values.includes(value)) fail('has an unknown value');
      return value;
    case 'list': {
      if (!Array.isArray(value)) fail('must be a list');
      if (value.length > spec.max) fail(`has too many items (max ${spec.max})`);
      if (value.length < spec.min) fail(`needs at least ${spec.min} item(s)`);
      return value.map((v, i) => check(spec.of, v, `${where} #${i + 1}`)).filter((v) => v !== undefined);
    }
    case 'obj': {
      if (!value || typeof value !== 'object' || Array.isArray(value)) fail('is missing');
      const out = {};
      for (const [k, s] of Object.entries(spec.fields)) {
        const v = check(s, value[k], where ? `${where} › ${k}` : k);
        if (v !== undefined) out[k] = v;
      }
      return out;
    }
    case 'dims': {
      const out = {};
      if (value && typeof value === 'object') {
        for (const [k, d] of Object.entries(value)) {
          if (!/^[A-Za-z0-9._-]+$/.test(k)) continue;
          const w = Number(d?.width);
          const h = Number(d?.height);
          if (Number.isInteger(w) && Number.isInteger(h) && w > 0 && h > 0 && w <= 10000 && h <= 10000) out[k] = { width: w, height: h };
        }
      }
      return out;
    }
    default:
      fail('unknown');
  }
  return undefined;
}

// Returns { ok: true, content } with cleaned content, or { ok: false, error }.
function validateContent(input) {
  try {
    const content = check(SCHEMA, input, '');
    const slugs = new Set();
    for (const a of content.activities) {
      if (slugs.has(a.slug)) throw new Invalid(`Two activities share the web address "${a.slug}"`);
      slugs.add(a.slug);
    }
    return { ok: true, content };
  } catch (e) {
    if (e instanceof Invalid) return { ok: false, error: e.message.replace(/^ /, '') };
    throw e;
  }
}

module.exports = { SCHEMA, DISTANCE_ICONS, validateContent };

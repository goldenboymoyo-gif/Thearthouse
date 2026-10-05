// Request-body schemas for every API endpoint, plus a middleware that rejects
// anything that does not match. The frontend's checks are only for comfort –
// this is the security boundary.
const { z } = require('zod');
const { HttpError } = require('./errors');
const { describe } = require('./schema');

const controlChars = /[\u0000-\u0008\u000b-\u001f\u007f]/g;
const line = (max) =>
  z
    .string()
    .max(max * 2)
    .transform((s) => s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max));
const optional = (schema) => z.preprocess((v) => (v === null || v === undefined ? '' : v), schema);

const EMAIL = /^[^\s@<>"(),;:\\[\]]+@[^\s@<>"(),;:\\[\]]+\.[^\s@<>"(),;:\\[\]]{2,}$/;

// Public: contact form and the chat assistant's booking requests. Unknown
// fields are ignored (not rejected) so the existing forms keep working.
const contact = z.object({
  name: line(200).pipe(z.string().min(1, 'Please provide your name')),
  email: line(200).pipe(z.string().regex(EMAIL, 'Please provide a valid email address')),
  phone: optional(line(60)).pipe(z.string().regex(/^[+()\-.\s\d]*$/, 'Please provide a valid phone number')),
  message: optional(
    z
      .string()
      .max(10000)
      .transform((s) => s.replace(/\r\n?/g, '\n').replace(controlChars, '').trim().slice(0, 5000))
  ),
  type: optional(z.enum(['', 'contact', 'booking'])),
  checkIn: optional(line(20)),
  checkOut: optional(line(20)),
  adults: optional(z.union([z.string(), z.number()]).transform((v) => String(v).replace(/\D/g, '').slice(0, 3))),
  children: optional(z.union([z.string(), z.number()]).transform((v) => String(v).replace(/\D/g, '').slice(0, 3))),
  website: optional(z.string().max(200)), // honeypot – real visitors leave it empty
});

const login = z.object({ password: z.string().min(1).max(256) }).strict();

const enquiryStatus = z
  .object({
    id: z.string().regex(/^[a-f0-9]{12}$/),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/),
    status: z.enum(['new', 'replied', 'archived']),
  })
  .strict();

const upload = z
  .object({
    data: z.string().min(1).max(5 * 1024 * 1024).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'is not valid base64'),
    width: z.coerce.number().int().min(1).max(10000),
    height: z.coerce.number().int().min(1).max(10000),
    name: optional(z.string().max(255)),
  })
  .strict();

const contentSave = z
  .object({
    content: z.unknown(),
    sha: z.string().regex(/^[a-f0-9]{40}$/).nullish(),
    summary: optional(z.string().max(100)),
  })
  .strict();

// Middleware: replaces req.body with the validated, cleaned value.
function body(schema) {
  return (req, _res, next) => {
    const r = schema.safeParse(req.body === undefined ? {} : req.body);
    if (!r.success) {
      const issue = r.error.issues[0];
      const friendly = issue.message && !/^(Invalid|Expected|Unrecognized|Too)/.test(issue.message) ? issue.message : `Invalid request: ${describe(issue)}`;
      return next(new HttpError(400, friendly));
    }
    req.body = r.data;
    return next();
  };
}

module.exports = { body, schemas: { contact, login, enquiryStatus, upload, contentSave } };

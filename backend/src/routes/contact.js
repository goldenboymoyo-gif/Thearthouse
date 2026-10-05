// POST /api/contact – public: contact form and the chat assistant's booking
// requests. Answers { ok, delivered }; when nothing could deliver the
// message (delivered: false) the website opens the visitor's email app.
const express = require('express');
const { route, HttpError } = require('../lib/errors');
const { body, schemas } = require('../lib/validate');
const { limit, consume } = require('../lib/rateLimit');
const { saveEnquiry } = require('../lib/enquiries');
const { sendEnquiryEmail } = require('../lib/mail');
const log = require('../lib/log');

const router = express.Router();

router.post(
  '/',
  limit('contact'),
  body(schemas.contact),
  route(async (req, res) => {
    const b = req.body;
    // Honeypot filled in → almost certainly a bot. Pretend success, store nothing.
    if (b.website) {
      log.security('contact_honeypot', req);
      return res.json({ ok: true, delivered: true });
    }
    // Site-wide cap protects the inbox, GitHub and email quotas from floods
    // spread over many IP addresses.
    await consume('contactGlobal', 'all', req);

    const isBooking = b.type === 'booking';
    const fields = { type: isBooking ? 'booking' : 'contact', name: b.name, email: b.email, phone: b.phone, message: b.message };
    if (isBooking) Object.assign(fields, { checkIn: b.checkIn, checkOut: b.checkOut, adults: b.adults, children: b.children });

    let stored = false;
    try {
      stored = await saveEnquiry(fields);
    } catch (e) {
      log.error('enquiry_store_failed', { reason: e.message });
    }
    const emailed = await sendEnquiryEmail({ ...fields, isBooking });
    log.audit('enquiry_received', req, { kind: fields.type, stored, emailed });
    if (!stored && !emailed && !res.headersSent) {
      // Nothing could take the message: the website falls back to the visitor's email app.
      return res.json({ ok: true, delivered: false });
    }
    return res.json({ ok: true, delivered: true });
  })
);

router.all('/', (req, res, next) => next(new HttpError(405, 'Method not allowed.')));

module.exports = router;

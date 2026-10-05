const express = require('express');
const { route, HttpError } = require('../lib/errors');
const { sameOrigin } = require('../lib/auth');
const { saveEnquiry } = require('../lib/enquiries');
const { sendEnquiryEmail } = require('../lib/mail');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => String(v || '').trim().slice(0, max);

// Light spam protection: at most 8 messages per address every 10 minutes.
const recent = new Map();
function tooMany(ip) {
  const now = Date.now();
  const list = (recent.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  recent.set(ip, list);
  if (recent.size > 5000) recent.clear();
  return list.length > 8;
}

// POST /api/contact – contact form and chatbot booking requests.
// Answers { ok, delivered }. When nothing could deliver the message
// (delivered: false) the website opens the visitor's email app instead.
router.post(
  '/',
  sameOrigin,
  route(async (req, res) => {
    const body = req.body || {};
    if (clean(body.website, 200)) return res.json({ ok: true, delivered: true }); // honeypot
    if (tooMany(req.ip)) throw new HttpError(429, 'Too many messages – please try again in a few minutes.');

    const fields = {
      name: clean(body.name, 200),
      email: clean(body.email, 200),
      phone: clean(body.phone, 60),
      message: clean(body.message, 5000),
    };
    const isBooking = body.type === 'booking';
    const booking = isBooking
      ? { checkIn: clean(body.checkIn, 20), checkOut: clean(body.checkOut, 20), adults: clean(body.adults, 10), children: clean(body.children, 10) }
      : {};
    if (!fields.name || !EMAIL_RE.test(fields.email)) {
      throw new HttpError(400, 'Please provide your name and a valid email address.');
    }

    let stored = false;
    try {
      stored = await saveEnquiry({ type: isBooking ? 'booking' : 'contact', ...fields, ...booking });
    } catch (e) {
      console.error('Could not store enquiry:', e.message);
    }
    const emailed = await sendEnquiryEmail({ ...fields, ...booking, isBooking });
    res.json({ ok: true, delivered: stored || emailed });
  })
);

module.exports = router;

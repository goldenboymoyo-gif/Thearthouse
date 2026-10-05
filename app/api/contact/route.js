import { CONTACT } from '@/lib/site';
import { saveEnquiry } from '@/lib/enquiries';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => String(v || '').trim().slice(0, max);

// Contact form endpoint. To deliver messages by email, set RESEND_API_KEY
// (https://resend.com) and optionally CONTACT_FROM / CONTACT_TO. Without it
// the endpoint answers { delivered: false } and the form opens the visitor's
// email app with the message filled in instead.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }
  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 60);
  const message = clean(body.message, 5000);
  const isBooking = body.type === 'booking';
  const checkIn = clean(body.checkIn, 20);
  const checkOut = clean(body.checkOut, 20);
  const adults = clean(body.adults, 10);
  const children = clean(body.children, 10);
  if (!name || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, message: 'Please provide your name and a valid email address.' }, { status: 400 });
  }

  // Keep a copy for the admin dashboard's enquiries inbox.
  let stored = false;
  try {
    stored = await saveEnquiry({
      type: isBooking ? 'booking' : 'contact',
      name,
      email,
      phone,
      message,
      ...(isBooking ? { checkIn, checkOut, adults, children } : {}),
    });
  } catch {
    stored = false;
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ ok: true, delivered: stored });

  const bookingLines = isBooking
    ? [
        '----- Booking enquiry -----',
        `Check-in: ${checkIn}`,
        `Check-out: ${checkOut}`,
        `Adults: ${adults}`,
        `Children: ${children}`,
        '---------------------------',
      ].filter(Boolean)
    : [];
  const text = [
    `Name: ${name}`,
    phone ? `Phone: ${phone}` : null,
    `Email: ${email}`,
    '',
    ...bookingLines,
    message,
  ]
    .filter((l) => l !== null)
    .join('\n');
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'The Art House Website <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO || CONTACT.email],
        reply_to: email,
        subject: isBooking ? `Booking enquiry from ${name}` : `Website enquiry from ${name}`,
        text,
      }),
    });
    return Response.json({ ok: true, delivered: res.ok || stored });
  } catch {
    return Response.json({ ok: true, delivered: stored });
  }
}

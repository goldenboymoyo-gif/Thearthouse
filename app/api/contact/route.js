import { CONTACT } from '@/lib/site';

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
  if (!name || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, message: 'Please provide your name and a valid email address.' }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ ok: true, delivered: false });

  const text = [`Name: ${name}`, phone ? `Phone: ${phone}` : null, `Email: ${email}`, '', message]
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
        subject: `Website enquiry from ${name}`,
        text,
      }),
    });
    return Response.json({ ok: true, delivered: res.ok });
  } catch {
    return Response.json({ ok: true, delivered: false });
  }
}

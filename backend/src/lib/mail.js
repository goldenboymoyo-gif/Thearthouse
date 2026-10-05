// Sends enquiries by email through Resend (https://resend.com) when
// RESEND_API_KEY is set. Returns true when the email was accepted.
const config = require('../config');
const { fetchWithTimeout } = require('./http');

// Names go into the subject line: strip anything that could start a new header.
const headerSafe = (s) => String(s || '').replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ').slice(0, 120);

async function sendEnquiryEmail({ name, email, phone, message, isBooking, checkIn, checkOut, adults, children }) {
  const key = config.resendKey();
  if (!key) return false;
  const lines = [
    `Name: ${name}`,
    phone ? `Phone: ${phone}` : null,
    `Email: ${email}`,
    '',
    ...(isBooking
      ? ['----- Booking enquiry -----', `Check-in: ${checkIn}`, `Check-out: ${checkOut}`, `Adults: ${adults}`, `Children: ${children}`, '---------------------------']
      : []),
    message,
  ].filter((l) => l !== null);
  try {
    const res = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: config.contactFrom(),
        to: [config.contactTo()],
        reply_to: email,
        subject: isBooking ? `Booking enquiry from ${headerSafe(name)}` : `Website enquiry from ${headerSafe(name)}`,
        text: lines.join('\n'),
      }),
    }, 8000);
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = { sendEnquiryEmail };

// Sends enquiries by email through Resend (https://resend.com) when
// RESEND_API_KEY is set. Returns true when the email was accepted.
const config = require('../config');

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
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: config.contactFrom(),
        to: [config.contactTo()],
        reply_to: email,
        subject: isBooking ? `Booking enquiry from ${name}` : `Website enquiry from ${name}`,
        text: lines.join('\n'),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = { sendEnquiryEmail };

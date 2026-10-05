'use client';

import { useState } from 'react';
import { CONTACT } from '@/lib/site';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-.\s\d]{6,}$/;

const FIELDS = {
  section: [
    { name: 'name', placeholder: 'Name', required: true, half: true },
    { name: 'phone', placeholder: 'Phone', half: true },
    { name: 'email', placeholder: 'Email address', required: true },
    { name: 'message', placeholder: 'Message', textarea: true },
  ],
  popup: [
    { name: 'name', placeholder: 'Full Name', label: 'Full Name', required: true, half: true },
    { name: 'email', placeholder: 'Email address', label: 'Email address', required: true, half: true },
    { name: 'message', placeholder: 'Description', label: 'Description', textarea: true, rows: 4 },
  ],
};

function mailtoFor(values) {
  const subject = `Website enquiry from ${values.name}`;
  const body = [
    `Name: ${values.name}`,
    values.phone ? `Phone: ${values.phone}` : null,
    `Email: ${values.email}`,
    '',
    values.message || '',
  ]
    .filter((l) => l !== null)
    .join('\n');
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// The live site's contact form (Name, Phone, Email address, Message).
// Messages are posted to /api/contact. When the server has no email service
// configured, the visitor's own email app opens with the message filled in,
// so an enquiry is never lost.
export default function ContactForm({ variant = 'section' }) {
  const fields = FIELDS[variant];
  const [values, setValues] = useState({ name: '', phone: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e = {};
    if (!values.name.trim()) e.name = 'This field is required.';
    if (!values.email.trim()) e.email = 'This field is required.';
    else if (!EMAIL_RE.test(values.email.trim())) e.email = 'Please enter a valid email.';
    if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) e.phone = 'Please enter a valid phone number.';
    return e;
  };

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const honeypot = e.currentTarget.elements.website?.value || '';
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        // "website" is a hidden honeypot field: people never see it, spam bots fill it in.
        body: JSON.stringify({ ...values, website: honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.delivered) {
        setStatus({ type: 'success', text: 'Thank you for contacting us. We will get back to you as soon as possible.' });
        setValues({ name: '', phone: '', email: '', message: '' });
      } else {
        window.location.href = mailtoFor(values);
        setStatus({
          type: 'success',
          text: `Your email app has been opened with your message. Please press send to reach us at ${CONTACT.email}.`,
        });
      }
    } catch {
      window.location.href = mailtoFor(values);
      setStatus({
        type: 'success',
        text: `Your email app has been opened with your message. Please press send to reach us at ${CONTACT.email}.`,
      });
    } finally {
      setSending(false);
    }
  };

  const renderField = (f) => {
    const common = {
      id: `${variant}-${f.name}`,
      name: f.name,
      placeholder: f.placeholder,
      value: values[f.name],
      onChange,
      className: `form-control ${errors[f.name] ? 'invalid' : ''}`,
      'aria-invalid': Boolean(errors[f.name]),
      'aria-required': f.required || undefined,
    };
    return (
      <div className="form-group" key={f.name}>
        {f.label ? <label htmlFor={common.id}>{f.label}</label> : <label htmlFor={common.id} className="sr-only">{f.placeholder}</label>}
        {f.textarea ? (
          <textarea {...common} rows={f.rows || 3} />
        ) : (
          <input {...common} type={f.name === 'email' ? 'email' : f.name === 'phone' ? 'tel' : 'text'} />
        )}
        {errors[f.name] ? <span className="field-error">{errors[f.name]}</span> : null}
      </div>
    );
  };

  const halves = fields.filter((f) => f.half);
  const rest = fields.filter((f) => !f.half);

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      {status ? <div className={`form-message ${status.type}`} role="status">{status.text}</div> : null}
      <div className="hp-field" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <div className="form-row">{halves.map(renderField)}</div>
      {rest.map(renderField)}
      <button type="submit" className="btn btn-block" disabled={sending} aria-label="Contact Us">
        {variant === 'popup' ? 'Send' : 'Contact Us'}
      </button>
    </form>
  );
}

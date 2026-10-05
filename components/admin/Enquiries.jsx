'use client';

import { useMemo, useState } from 'react';
import { Panel } from './ui';

const FILTERS = [
  ['new', 'New'],
  ['replied', 'Replied'],
  ['archived', 'Archived'],
  ['all', 'All'],
];

const fmt = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const waLink = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  return d.length >= 8 ? `https://wa.me/${d}` : null;
};

export default function Enquiries({ state, reload, setStatus }) {
  const [filter, setFilter] = useState('new');
  const items = useMemo(
    () => (state.items || []).filter((e) => filter === 'all' || (e.status || 'new') === filter),
    [state.items, filter]
  );

  if (state.enabled === false) {
    return (
      <Panel title="Enquiries" intro="Messages from the contact form and booking requests from the chat assistant.">
        <div className="adm-note">
          The enquiries inbox is not switched on yet. Guests&apos; details must be kept private, so they are saved in a separate
          <strong> private</strong> GitHub repository. Set <code>GITHUB_DATA_REPO</code> in Vercel (see ADMIN.md). Until then,
          enquiries still arrive by email if email sending is set up.
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Enquiries"
      intro="Messages from the contact form and booking requests from the chat assistant."
      actions={
        <button type="button" className="adm-btn adm-btn-ghost" onClick={reload} disabled={state.loading}>
          {state.loading ? 'Loading…' : 'Refresh'}
        </button>
      }
    >
      <div className="adm-filters" role="tablist">
        {FILTERS.map(([k, l]) => {
          const count = k === 'all' ? (state.items || []).length : (state.items || []).filter((e) => (e.status || 'new') === k).length;
          return (
            <button key={k} type="button" role="tab" aria-selected={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
              {l} <span>{count}</span>
            </button>
          );
        })}
      </div>
      {state.error ? <div className="adm-note error">{state.error}</div> : null}
      {!state.loading && !items.length ? <p className="adm-empty">Nothing here.</p> : null}
      <div className="adm-enquiries">
        {items.map((e) => {
          const wa = waLink(e.phone);
          const subject = encodeURIComponent(e.type === 'booking' ? 'Your booking enquiry – The Art House Victoria Falls' : 'Re: your message to The Art House Victoria Falls');
          return (
            <article className={`adm-enquiry ${e.status || 'new'}`} key={e.id}>
              <header>
                <div>
                  <span className={`adm-badge ${e.type}`}>{e.type === 'booking' ? 'Booking request' : 'Message'}</span>
                  <h3>{e.name}</h3>
                  <time dateTime={e.date}>{fmt(e.date)}</time>
                </div>
                <select value={e.status || 'new'} aria-label="Status" onChange={(ev) => setStatus(e, ev.target.value)}>
                  <option value="new">New</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </header>
              {e.type === 'booking' ? (
                <dl className="adm-booking">
                  <div>
                    <dt>Check-in</dt>
                    <dd>{e.checkIn || '–'}</dd>
                  </div>
                  <div>
                    <dt>Check-out</dt>
                    <dd>{e.checkOut || '–'}</dd>
                  </div>
                  <div>
                    <dt>Adults</dt>
                    <dd>{e.adults || '–'}</dd>
                  </div>
                  <div>
                    <dt>Children</dt>
                    <dd>{e.children || '0'}</dd>
                  </div>
                </dl>
              ) : null}
              {e.message ? <p className="adm-msg">{e.message}</p> : null}
              <div className="adm-contact-links">
                <a className="adm-btn adm-btn-small" href={`mailto:${e.email}?subject=${subject}`} onClick={() => (e.status || 'new') === 'new' && setStatus(e, 'replied')}>
                  Reply by email
                </a>
                {wa ? (
                  <a className="adm-btn adm-btn-small adm-btn-ghost" href={wa} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                ) : null}
                {e.phone ? (
                  <a className="adm-btn adm-btn-small adm-btn-ghost" href={`tel:${e.phone.replace(/[^\d+]/g, '')}`}>
                    Call {e.phone}
                  </a>
                ) : null}
                <span className="adm-email">{e.email}</span>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

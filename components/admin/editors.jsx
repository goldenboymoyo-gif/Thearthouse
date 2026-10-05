'use client';

import { useRef, useState } from 'react';
import { Card, Field, ImageField, LinesEditor, ListEditor, Panel, thumb, uploadPhoto } from './ui';

const DISTANCE_ICONS = [
  ['water', 'Waterfall'],
  ['town', 'Town'],
  ['store', 'Shop'],
  ['cart', 'Supermarket'],
  ['plane', 'Airport'],
  ['pin', 'Place'],
];

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

// When the rate or a time changes, the same words are updated in the rate
// sentence and in the FAQ answers, so the whole site stays consistent.
function useLinkedField(c, set, ctx, key) {
  const start = useRef(null);
  return {
    value: c.stay[key],
    onFocus: () => {
      start.current = c.stay[key];
    },
    onChange: (v) => set((n) => (n.stay[key] = v)),
    onBlur: (e) => {
      const from = String(start.current || '').trim();
      const to = String(e.target.value || '').trim();
      start.current = null;
      if (!from || !to || from === to || from.length < 3) return;
      const hits = (t) => Boolean(t && t.includes(from));
      const count = (key !== 'rateNote' && hits(c.stay.rateNote) ? 1 : 0) + c.faq.filter((f) => hits(f.a)).length;
      if (!count) return;
      const swap = (t) => (hits(t) ? t.split(from).join(to) : t);
      set((n) => {
        if (key !== 'rateNote') n.stay.rateNote = swap(n.stay.rateNote);
        n.faq = n.faq.map((f) => ({ ...f, a: swap(f.a) }));
      });
      ctx.notify(`Also changed “${from}” to “${to}” in ${count} other place${count > 1 ? 's' : ''} (rate sentence / FAQ).`);
    },
  };
}

export function StayEditor({ c, set, ctx }) {
  const rate = useLinkedField(c, set, ctx, 'rateFrom');
  const checkIn = useLinkedField(c, set, ctx, 'checkIn');
  const checkOut = useLinkedField(c, set, ctx, 'checkOut');
  return (
    <Panel title="Rates, stay details & contact" intro="Shown in “Plan Your Stay”, Quick Look, the FAQ answers you write, the chatbot and the footer.">
      <Card title="Rates & times">
        <div className="adm-grid2">
          <Field label="Rates from" {...rate} placeholder="US$300" hint="Also updates the rate sentence and FAQ answers." required />
          <Field label="Rate sentence" value={c.stay.rateNote} onChange={(v) => set((n) => (n.stay.rateNote = v))} required />
          <Field label="Check-in" {...checkIn} placeholder="2:00 pm" required />
          <Field label="Check-out" {...checkOut} placeholder="10:00 am" required />
        </div>
        <LinesEditor label="Minimum stay" items={c.stay.minimumStay} min={1} max={6} addLabel="Add rule" onChange={(v) => set((n) => (n.stay.minimumStay = v))} />
        <Field label="Meals" textarea rows={3} value={c.stay.meals} onChange={(v) => set((n) => (n.stay.meals = v))} required />
      </Card>
      <Card title="Booking & contact">
        <Field label="Online booking link (Book Now button)" type="url" value={c.site.bookingUrl} onChange={(v) => set((n) => (n.site.bookingUrl = v))} required />
        <div className="adm-grid2">
          <Field label="Phone" value={c.contact.phone} onChange={(v) => set((n) => (n.contact.phone = v))} required />
          <Field label="Email" type="email" value={c.contact.email} onChange={(v) => set((n) => (n.contact.email = v))} required />
        </div>
        <Field label="Address" value={c.contact.address} onChange={(v) => set((n) => (n.contact.address = v))} required />
        <Field label="Opening hours line" value={c.contact.hours} onChange={(v) => set((n) => (n.contact.hours = v))} required />
        <div className="adm-grid2">
          <Field label="Facebook link" type="url" value={c.contact.facebook} onChange={(v) => set((n) => (n.contact.facebook = v))} required />
          <Field label="Instagram link" type="url" value={c.contact.instagram} onChange={(v) => set((n) => (n.contact.instagram = v))} required />
        </div>
      </Card>
    </Panel>
  );
}

export function DistancesEditor({ c, set }) {
  return (
    <Panel title="Distances" intro="“How far is everything?” on the home page and The Art House page.">
      <ListEditor
        items={c.distances}
        max={12}
        addLabel="Add place"
        itemTitle={(d) => d.place || 'New place'}
        newItem={{ icon: 'pin', short: '', place: '', distance: '', note: '' }}
        onChange={(v) => set((n) => (n.distances = v))}
        renderItem={(d, upd) => (
          <>
            <div className="adm-grid2">
              <Field label="Place" value={d.place} onChange={(v) => upd({ ...d, place: v })} required />
              <Field label="Short name (for the icons)" value={d.short} onChange={(v) => upd({ ...d, short: v })} required />
              <Field label="Distance" value={d.distance} onChange={(v) => upd({ ...d, distance: v })} placeholder="3 km" required />
              <div className="adm-field">
                <label>Icon</label>
                <select value={d.icon} onChange={(e) => upd({ ...d, icon: e.target.value })}>
                  {DISTANCE_ICONS.map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Field label="Note" value={d.note} onChange={(v) => upd({ ...d, note: v })} placeholder="about a 25-minute walk" />
          </>
        )}
      />
    </Panel>
  );
}

export function WelcomeEditor({ c, set, ctx }) {
  return (
    <Panel title="Welcome text" intro="The first section of The Art House page, and the home page introduction photo.">
      <Card>
        <Field label="Heading" value={c.welcome.title} onChange={(v) => set((n) => (n.welcome.title = v))} required />
        <Field label="Opening line" value={c.welcome.intro} onChange={(v) => set((n) => (n.welcome.intro = v))} required />
        <ImageField value={c.welcome.image} ctx={ctx} onChange={(v) => set((n) => (n.welcome.image = v))} />
        <LinesEditor label="Paragraphs" textarea items={c.welcome.paragraphs} min={1} max={12} addLabel="Add paragraph" onChange={(v) => set((n) => (n.welcome.paragraphs = v))} />
      </Card>
    </Panel>
  );
}

export function QuickLookEditor({ c, set, ctx }) {
  return (
    <Panel title="Quick Look" intro="The six feature tiles (bedrooms, bathrooms, pool…). The icons stay the same; change the words and photos.">
      <ListEditor
        items={c.quickLook}
        fixed
        itemTitle={(q) => q.title}
        onChange={(v) => set((n) => (n.quickLook = v))}
        renderItem={(q, upd) => (
          <div className="adm-split">
            <div>
              <Field label="Title" value={q.title} onChange={(v) => upd({ ...q, title: v })} required />
              <Field label="Text" textarea rows={2} value={q.text} onChange={(v) => upd({ ...q, text: v })} required />
              <Field label="Photo description (for Google & screen readers)" value={q.alt} onChange={(v) => upd({ ...q, alt: v })} required />
            </div>
            <ImageField value={q.image} ctx={ctx} onChange={(v) => upd({ ...q, image: v })} />
          </div>
        )}
      />
    </Panel>
  );
}

export function FaqEditor({ c, set }) {
  return (
    <Panel title="Frequently asked questions" intro="Shown on The Art House page and given to Google as FAQ results.">
      <ListEditor
        items={c.faq}
        max={60}
        addLabel="Add question"
        itemTitle={(f, i) => `${i + 1}. ${f.q || 'New question'}`}
        newItem={{ q: '', a: '' }}
        onChange={(v) => set((n) => (n.faq = v))}
        renderItem={(f, upd) => (
          <>
            <Field label="Question" value={f.q} onChange={(v) => upd({ ...f, q: v })} required />
            <Field label="Answer" textarea rows={3} value={f.a} onChange={(v) => upd({ ...f, a: v })} required />
          </>
        )}
      />
    </Panel>
  );
}

export function ExploreEditor({ c, set, ctx }) {
  const labels = ['Top of the Explore page', 'Things to Do introduction', 'Food & Entertainment'];
  return (
    <Panel title="Explore page" intro="The three text blocks of the Explore Victoria Falls page. The activity cards are edited under Activities.">
      <ListEditor
        items={c.explore}
        fixed
        itemTitle={(e, i) => labels[i]}
        onChange={(v) => set((n) => (n.explore = v))}
        renderItem={(e, upd, i) => (
          <>
            <Field label="Heading" value={e.title} onChange={(v) => upd({ ...e, title: v })} required />
            {i !== 1 ? <ImageField value={e.image} ctx={ctx} onChange={(v) => upd({ ...e, image: v })} /> : null}
            <LinesEditor label="Paragraphs" textarea items={e.paragraphs} min={1} max={8} addLabel="Add paragraph" onChange={(v) => upd({ ...e, paragraphs: v })} />
          </>
        )}
      />
    </Panel>
  );
}

export function ActivitiesEditor({ c, set, ctx }) {
  return (
    <Panel title="Activities" intro="The activity cards on the Explore page. Each one has its own page with the full description.">
      <ListEditor
        items={c.activities}
        min={1}
        max={40}
        addLabel="Add activity"
        itemTitle={(a) => a.title || 'New activity'}
        newItem={() => ({ _new: true, slug: '', title: '', tagline: '', description: '', highlights: [], image: c.activities[0]?.image })}
        onChange={(v) => set((n) => (n.activities = v))}
        renderItem={(a, upd) => (
          <div className="adm-split">
            <div>
              <Field
                label="Title"
                value={a.title}
                required
                onChange={(v) => upd({ ...a, title: v, ...(a._new ? { slug: slugify(v) } : {}) })}
              />
              <Field label="Short line on the card" value={a.tagline} onChange={(v) => upd({ ...a, tagline: v })} required />
              <Field label="Description" textarea rows={5} value={a.description} onChange={(v) => upd({ ...a, description: v })} required />
              <LinesEditor label="Highlights" items={a.highlights || []} max={10} addLabel="Add highlight" onChange={(v) => upd({ ...a, highlights: v })} />
              <p className="adm-hint">
                Page address: <code>/things-to-do/{a.slug || '…'}</code>
              </p>
            </div>
            <ImageField value={a.image} ctx={ctx} onChange={(v) => upd({ ...a, image: v, full: v })} />
          </div>
        )}
      />
    </Panel>
  );
}

export function ReviewsEditor({ c, set, ctx }) {
  return (
    <Panel title="Guest reviews" intro="Shown on the Guest Reviews page; the home page shows one of them.">
      <ListEditor
        items={c.reviews}
        max={60}
        addLabel="Add review"
        itemTitle={(r) => r.name || 'New review'}
        newItem={{ text: '', name: '', role: '', rating: 5 }}
        onChange={(v) => set((n) => (n.reviews = v))}
        renderItem={(r, upd) => (
          <div className="adm-split">
            <div>
              <div className="adm-grid2">
                <Field label="Guest name" value={r.name} onChange={(v) => upd({ ...r, name: v })} required />
                <Field label="Where they are from" value={r.role} onChange={(v) => upd({ ...r, role: v })} />
              </div>
              <Field label="Review" textarea rows={4} value={r.text} onChange={(v) => upd({ ...r, text: v })} required />
              <div className="adm-field">
                <label>Stars</label>
                <div className="adm-stars" role="radiogroup" aria-label="Stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button type="button" key={s} role="radio" aria-checked={r.rating === s} className={s <= r.rating ? 'on' : ''} onClick={() => upd({ ...r, rating: s })}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <ImageField label="Photo (optional)" optional value={r.image} ctx={ctx} onChange={(v) => upd({ ...r, image: v })} />
          </div>
        )}
      />
    </Panel>
  );
}

export function GalleryEditor({ c, set, ctx }) {
  const input = useRef(null);
  const [busy, setBusy] = useState('');
  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    for (let i = 0; i < files.length; i++) {
      setBusy(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const up = await uploadPhoto(files[i]);
        ctx.addPhoto(up);
        set((n) => n.gallery.unshift({ src: up.src, width: up.width, height: up.height, alt: 'Photo of The Art House, Victoria Falls' }));
      } catch (err) {
        ctx.notify(err.message, 'error');
      }
    }
    setBusy('');
  };
  const update = (i, patch) => set((n) => Object.assign(n.gallery[i], patch));
  const move = (i, d) =>
    set((n) => {
      const [it] = n.gallery.splice(i, 1);
      n.gallery.splice(i + d, 0, it);
    });
  const remove = (i) => {
    if (window.confirm('Remove this photo from the gallery?')) set((n) => n.gallery.splice(i, 1));
  };
  return (
    <Panel
      title="Gallery"
      intro={`${c.gallery.length} photos. New photos are added at the top. Write a short description for each one – it helps Google and visitors using screen readers.`}
      actions={
        <>
          <button type="button" className="adm-btn" disabled={Boolean(busy)} onClick={() => input.current?.click()}>
            {busy || '+ Upload photos'}
          </button>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={onFiles} />
        </>
      }
    >
      <div className="adm-gallery">
        {c.gallery.map((g, i) => (
          <div className="adm-gallery-item" key={g.src + i}>
            <div className="adm-gallery-img">
              <img src={thumb(g.src, ctx.previews)} alt="" loading="lazy" />
              <div className="adm-gallery-tools">
                <button type="button" className="adm-icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier" title="Move earlier">
                  ←
                </button>
                <button type="button" className="adm-icon" disabled={i === c.gallery.length - 1} onClick={() => move(i, 1)} aria-label="Move later" title="Move later">
                  →
                </button>
                <button type="button" className="adm-icon danger" onClick={() => remove(i)} aria-label="Remove" title="Remove">
                  ✕
                </button>
              </div>
            </div>
            <textarea rows={2} aria-label="Photo description" value={g.alt} onChange={(e) => update(i, { alt: e.target.value })} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

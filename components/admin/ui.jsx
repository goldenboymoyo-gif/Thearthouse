'use client';

import { useId, useRef, useState } from 'react';
import dims from '@/lib/image-dims.json';

export function Field({ label, hint, value, onChange, textarea = false, rows = 4, type = 'text', placeholder, required, onFocus, onBlur }) {
  const id = useId();
  return (
    <div className="adm-field">
      <label htmlFor={id}>
        {label}
        {required ? <span className="adm-req"> *</span> : null}
      </label>
      {textarea ? (
        <textarea id={id} rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
      )}
      {hint ? <p className="adm-hint">{hint}</p> : null}
    </div>
  );
}

export function Panel({ title, intro, children, actions }) {
  return (
    <section className="adm-panel">
      <header className="adm-panel-head">
        <div>
          <h2>{title}</h2>
          {intro ? <p>{intro}</p> : null}
        </div>
        {actions ? <div className="adm-panel-actions">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}

export function Card({ title, children, tools }) {
  return (
    <div className="adm-card">
      {title || tools ? (
        <div className="adm-card-head">
          <h3>{title}</h3>
          {tools}
        </div>
      ) : null}
      <div className="adm-card-body">{children}</div>
    </div>
  );
}

// Edits a list: move up/down, remove and add items.
export function ListEditor({ items, onChange, renderItem, newItem, itemTitle, addLabel = 'Add', min = 0, max = 100, fixed = false }) {
  const move = (i, d) => {
    const next = [...items];
    const [it] = next.splice(i, 1);
    next.splice(i + d, 0, it);
    onChange(next);
  };
  const remove = (i) => {
    if (!window.confirm('Remove this item? (Nothing changes on the website until you press Save.)')) return;
    onChange(items.filter((_, j) => j !== i));
  };
  const setItem = (i, v) => onChange(items.map((it, j) => (j === i ? v : it)));
  return (
    <div className="adm-list">
      {items.map((it, i) => (
        <Card
          key={i}
          title={itemTitle ? itemTitle(it, i) : `#${i + 1}`}
          tools={
            fixed ? null : (
              <div className="adm-tools">
                <button type="button" className="adm-icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" title="Move up">
                  ↑
                </button>
                <button type="button" className="adm-icon" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down" title="Move down">
                  ↓
                </button>
                <button type="button" className="adm-icon danger" disabled={items.length <= min} onClick={() => remove(i)} aria-label="Remove" title="Remove">
                  ✕
                </button>
              </div>
            )
          }
        >
          {renderItem(it, (v) => setItem(i, v), i)}
        </Card>
      ))}
      {!fixed && items.length < max ? (
        <button type="button" className="adm-btn adm-btn-add" onClick={() => onChange([...items, typeof newItem === 'function' ? newItem() : newItem])}>
          + {addLabel}
        </button>
      ) : null}
    </div>
  );
}

// Simple list of text lines (paragraphs, highlights, minimum-stay rules).
export function LinesEditor({ label, items, onChange, textarea = false, addLabel = 'Add line', min = 0, max = 20 }) {
  return (
    <div className="adm-field">
      <label>{label}</label>
      <div className="adm-lines">
        {items.map((line, i) => (
          <div className="adm-line" key={i}>
            {textarea ? (
              <textarea rows={4} value={line} onChange={(e) => onChange(items.map((l, j) => (j === i ? e.target.value : l)))} />
            ) : (
              <input value={line} onChange={(e) => onChange(items.map((l, j) => (j === i ? e.target.value : l)))} />
            )}
            <button
              type="button"
              className="adm-icon danger"
              disabled={items.length <= min}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label="Remove"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length < max ? (
          <button type="button" className="adm-btn adm-btn-small" onClick={() => onChange([...items, ''])}>
            + {addLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ---- photos ---------------------------------------------------------------

const fileOf = (src) => String(src || '').split('/').pop();

// Thumbnail URL. Photos uploaded in this session are shown from the browser
// (they only appear on the live site after it has been republished).
export function thumb(src, previews, w = 384) {
  if (!src) return '';
  if (previews && previews[src]) return previews[src];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=60`;
}

export function knownPhotos(content) {
  const set = new Set(Object.keys(dims).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith('400_6298f24')));
  Object.keys(content.imageDims || {}).forEach((f) => set.add(f));
  (content.gallery || []).forEach((g) => set.add(fileOf(g.src)));
  // Prefer the large version of a photo when several sizes exist.
  const files = [...set];
  const byId = new Map();
  for (const f of files) {
    const id = f.replace(/^\d+_/, '');
    const size = parseInt(f, 10) || 0;
    const cur = byId.get(id);
    if (!cur || size > (parseInt(cur, 10) || 0)) byId.set(id, f);
  }
  return [...byId.values()].sort().reverse().map((f) => `/images/${f}`);
}

async function resizeToBase64(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  let quality = 0.85;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUrl.length > 4.2e6 && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }
  return { dataUrl, width, height };
}

// Upload one photo; returns { src, width, height, preview }.
export async function uploadPhoto(file) {
  if (!/^image\//.test(file.type)) throw new Error(`${file.name} is not a photo.`);
  const { dataUrl, width, height } = await resizeToBase64(file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: dataUrl.split(',')[1], width, height, name: file.name }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Upload failed.');
  return { src: json.src, width, height, preview: dataUrl };
}

export function PhotoPicker({ content, previews, onPick, onClose }) {
  const photos = knownPhotos(content);
  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label="Choose a photo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal-box">
        <div className="adm-modal-head">
          <h3>Choose a photo</h3>
          <button type="button" className="adm-icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="adm-pick-grid">
          {photos.map((src) => (
            <button type="button" key={src} className="adm-pick" onClick={() => onPick(src)}>
              <img src={thumb(src, previews, 256)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// A photo with "Upload new" and "Choose from site photos".
export function ImageField({ label = 'Photo', value, onChange, ctx, optional = false }) {
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const input = useRef(null);
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const up = await uploadPhoto(file);
      ctx.addPhoto(up);
      onChange(up.src);
    } catch (err) {
      ctx.notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="adm-field">
      <label>{label}</label>
      <div className="adm-image">
        <div className="adm-image-thumb">{value ? <img src={thumb(value, ctx.previews)} alt="" /> : <span>No photo</span>}</div>
        <div className="adm-image-actions">
          <button type="button" className="adm-btn adm-btn-small" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? 'Uploading…' : 'Upload new photo'}
          </button>
          <button type="button" className="adm-btn adm-btn-small adm-btn-ghost" disabled={busy} onClick={() => setPicking(true)}>
            Choose from site photos
          </button>
          {optional && value ? (
            <button type="button" className="adm-btn adm-btn-small adm-btn-ghost" onClick={() => onChange(undefined)}>
              Remove photo
            </button>
          ) : null}
          <input ref={input} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
      </div>
      {picking ? (
        <PhotoPicker
          content={ctx.content}
          previews={ctx.previews}
          onClose={() => setPicking(false)}
          onPick={(src) => {
            onChange(src);
            setPicking(false);
          }}
        />
      ) : null}
    </div>
  );
}

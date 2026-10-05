'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ActivitiesEditor,
  DistancesEditor,
  ExploreEditor,
  FaqEditor,
  GalleryEditor,
  QuickLookEditor,
  ReviewsEditor,
  StayEditor,
  WelcomeEditor,
} from '@/components/admin/editors';
import Enquiries from '@/components/admin/Enquiries';
import { Panel } from '@/components/admin/ui';

const TABS = [
  ['overview', 'Overview'],
  ['enquiries', 'Enquiries'],
  ['stay', 'Rates & contact'],
  ['distances', 'Distances'],
  ['welcome', 'Welcome text'],
  ['quicklook', 'Quick Look'],
  ['faq', 'FAQ'],
  ['explore', 'Explore page'],
  ['activities', 'Activities'],
  ['reviews', 'Reviews'],
  ['gallery', 'Gallery'],
];

const TAB_SUMMARY = {
  stay: 'rates and contact details',
  distances: 'distances',
  welcome: 'welcome text',
  quicklook: 'Quick Look',
  faq: 'FAQ',
  explore: 'Explore page',
  activities: 'activities',
  reviews: 'reviews',
  gallery: 'gallery',
};

async function api(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error || `Request failed (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return json;
}

function Login({ session, onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="adm-login">
      <form className="adm-login-box" onSubmit={submit}>
        <img src="/images/400_6298f24fee429.png" alt="The Art House Victoria Falls" width="160" />
        <h1>Website admin</h1>
        {session.offline ? (
          <div className="adm-note error">
            The website&apos;s backend can&apos;t be reached right now. Please reload this page in a minute; if it keeps happening, check the
            latest deployment in Vercel (see ADMIN.md).
          </div>
        ) : !session.configured ? (
          <div className="adm-note error">
            The admin password has not been set up yet. Add <code>ADMIN_PASSWORD</code> to the Vercel project&apos;s environment variables (or
            to <code>.env.local</code> on your computer) and restart. See ADMIN.md.
          </div>
        ) : (
          <>
            <label htmlFor="adm-pass">Password</label>
            <input id="adm-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
            {error ? <p className="adm-error">{error}</p> : null}
            <button className="adm-btn adm-btn-block" disabled={busy || !password}>
              {busy ? 'Checking…' : 'Log in'}
            </button>
          </>
        )}
        <a className="adm-back" href="/">
          ← Back to the website
        </a>
      </form>
    </div>
  );
}

function Overview({ session, content, enquiries, go }) {
  const fresh = (enquiries.items || []).filter((e) => (e.status || 'new') === 'new').length;
  const stats = [
    ['Rate from', content.stay.rateFrom, 'stay'],
    ['New enquiries', session.enquiries ? String(fresh) : '–', 'enquiries'],
    ['Gallery photos', String(content.gallery.length), 'gallery'],
    ['FAQ questions', String(content.faq.length), 'faq'],
    ['Activities', String(content.activities.length), 'activities'],
    ['Reviews', String(content.reviews.length), 'reviews'],
  ];
  return (
    <Panel title="Welcome back" intro="Choose what you would like to change. Nothing changes on the website until you press Save.">
      {session.storage === 'none' ? (
        <div className="adm-note error">
          <strong>View-only mode.</strong> Saving is not switched on yet. In Vercel → this project → Settings → Environment Variables,
          add <code>ADMIN_GITHUB_TOKEN</code> (a GitHub token with “Contents: Read and write”) and redeploy. See ADMIN.md.
        </div>
      ) : null}
      {session.storage === 'local' ? (
        <div className="adm-note">Local mode: changes are written straight into the project folder on this computer.</div>
      ) : null}
      <div className="adm-stats">
        {stats.map(([l, v, t]) => (
          <button type="button" className="adm-stat" key={l} onClick={() => go(t)}>
            <span className="adm-stat-value">{v}</span>
            <span className="adm-stat-label">{l}</span>
          </button>
        ))}
      </div>
      <div className="adm-card">
        <div className="adm-card-body adm-howto">
          <h3>How publishing works</h3>
          <ol>
            <li>Make your changes in any section.</li>
            <li>
              Press <strong>Save changes</strong> at the bottom of the screen.
            </li>
            <li>The website updates itself – new text and photos are live in about 1–2 minutes.</li>
          </ol>
        </div>
      </div>
    </Panel>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('overview');
  const [content, setContent] = useState(null);
  const [sha, setSha] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [previews, setPreviews] = useState({});
  const [loadError, setLoadError] = useState('');
  const [enquiries, setEnquiries] = useState({ items: [], loading: false, enabled: undefined });
  const [menuOpen, setMenuOpen] = useState(false);

  const notify = useCallback((text, type = 'ok') => {
    setToast({ text, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), toast.type === 'error' ? 8000 : 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadSession = useCallback(async () => {
    try {
      setSession(await api('/api/admin/login'));
    } catch {
      setSession({ loggedIn: false, configured: true, offline: true });
    }
  }, []);

  const loadContent = useCallback(async () => {
    setLoadError('');
    try {
      const data = await api('/api/admin/content');
      setContent(data.content);
      setSha(data.sha);
      setDirty(false);
    } catch (err) {
      if (err.status === 401) setSession((s) => ({ ...s, loggedIn: false }));
      setLoadError(err.message);
    }
  }, []);

  const loadEnquiries = useCallback(async () => {
    setEnquiries((s) => ({ ...s, loading: true, error: '' }));
    try {
      const data = await api('/api/admin/enquiries');
      setEnquiries({ items: data.items, enabled: data.enabled, loading: false });
    } catch (err) {
      setEnquiries((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (session?.loggedIn) {
      loadContent();
      loadEnquiries();
    }
  }, [session?.loggedIn, loadContent, loadEnquiries]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Change content: set((draft) => { draft.stay.rateFrom = 'US$350' })
  const set = useCallback((fn) => {
    setContent((c) => {
      const next = structuredClone(c);
      fn(next);
      return next;
    });
    setDirty(true);
  }, []);

  const addPhoto = useCallback(
    ({ src, width, height, preview }) => {
      setPreviews((p) => ({ ...p, [src]: preview }));
      set((n) => {
        n.imageDims = { ...(n.imageDims || {}), [src.split('/').pop()]: { width, height } };
      });
    },
    [set]
  );

  const save = async () => {
    setSaving(true);
    try {
      const data = await api('/api/admin/content', {
        method: 'PUT',
        body: JSON.stringify({ content, sha, summary: TAB_SUMMARY[tab] || 'website content' }),
      });
      setSha(data.sha);
      setContent(data.content);
      setDirty(false);
      notify(
        data.mode === 'local'
          ? 'Saved to the project files. Refresh the website to see the changes.'
          : 'Saved! Your changes will be live on the website in about 1–2 minutes.'
      );
    } catch (err) {
      if (err.status === 401) setSession((s) => ({ ...s, loggedIn: false }));
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (window.confirm('Discard all unsaved changes?')) loadContent();
  };

  const logout = async () => {
    if (dirty && !window.confirm('You have unsaved changes. Log out anyway?')) return;
    await api('/api/admin/login', { method: 'DELETE' }).catch(() => {});
    setDirty(false);
    setContent(null);
    setSession((s) => ({ ...s, loggedIn: false }));
  };

  const setEnquiryStatus = async (e, status) => {
    setEnquiries((s) => ({ ...s, items: s.items.map((x) => (x.id === e.id ? { ...x, status } : x)) }));
    try {
      await api('/api/admin/enquiries', { method: 'PATCH', body: JSON.stringify({ id: e.id, date: e.date, status }) });
    } catch (err) {
      notify(err.message, 'error');
      loadEnquiries();
    }
  };

  const go = (t) => {
    setTab(t);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  if (!session) return <div className="adm-loading">Loading…</div>;
  if (!session.loggedIn) return <Login session={session} onDone={loadSession} />;

  const ctx = { content, previews, addPhoto, notify };
  const props = { c: content, set, ctx };
  const newCount = (enquiries.items || []).filter((e) => (e.status || 'new') === 'new').length;
  const current = TABS.find(([k]) => k === tab)?.[1];

  return (
    <div className="adm">
      <header className="adm-top">
        <button type="button" className="adm-menu-btn" aria-expanded={menuOpen} aria-controls="adm-nav" onClick={() => setMenuOpen((v) => !v)}>
          <span aria-hidden="true">☰</span> <span className="adm-menu-label">{current}</span>
        </button>
        <a className="adm-brand" href="/admin">
          <img src="/images/400_6298f24fee429.png" alt="" width="64" />
          <span>Admin</span>
        </a>
        <div className="adm-top-actions">
          <a className="adm-btn adm-btn-ghost adm-btn-small" href="/" target="_blank" rel="noopener noreferrer">
            View website
          </a>
          <button type="button" className="adm-btn adm-btn-ghost adm-btn-small" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <div className="adm-body">
        <nav id="adm-nav" className={`adm-nav ${menuOpen ? 'open' : ''}`} aria-label="Admin sections">
          {TABS.map(([k, l]) => (
            <button type="button" key={k} className={tab === k ? 'on' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}>
              {l}
              {k === 'enquiries' && newCount ? <span className="adm-count">{newCount}</span> : null}
            </button>
          ))}
          <a className="adm-nav-site" href="/" target="_blank" rel="noopener noreferrer">
            View website ↗
          </a>
        </nav>
        <main className="adm-main">
          {loadError ? (
            <div className="adm-note error">
              {loadError}{' '}
              <button type="button" className="adm-btn adm-btn-small" onClick={loadContent}>
                Try again
              </button>
            </div>
          ) : null}
          {!content && !loadError ? <div className="adm-loading">Loading content…</div> : null}
          {content ? (
            <>
              {tab === 'overview' ? <Overview session={session} content={content} enquiries={enquiries} go={go} /> : null}
              {tab === 'enquiries' ? <Enquiries state={enquiries} reload={loadEnquiries} setStatus={setEnquiryStatus} /> : null}
              {tab === 'stay' ? <StayEditor {...props} /> : null}
              {tab === 'distances' ? <DistancesEditor {...props} /> : null}
              {tab === 'welcome' ? <WelcomeEditor {...props} /> : null}
              {tab === 'quicklook' ? <QuickLookEditor {...props} /> : null}
              {tab === 'faq' ? <FaqEditor {...props} /> : null}
              {tab === 'explore' ? <ExploreEditor {...props} /> : null}
              {tab === 'activities' ? <ActivitiesEditor {...props} /> : null}
              {tab === 'reviews' ? <ReviewsEditor {...props} /> : null}
              {tab === 'gallery' ? <GalleryEditor {...props} /> : null}
            </>
          ) : null}
        </main>
      </div>
      {dirty ? (
        <div className="adm-savebar" role="region" aria-label="Unsaved changes">
          <span>{session.storage === 'none' ? 'View-only – saving is not switched on yet' : 'Unsaved changes'}</span>
          <div>
            <button type="button" className="adm-btn adm-btn-ghost" onClick={discard} disabled={saving}>
              Discard
            </button>
            <button type="button" className="adm-btn" onClick={save} disabled={saving || session.storage === 'none'}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className={`adm-toast ${toast.type}`} role="status" key={toast.id}>
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

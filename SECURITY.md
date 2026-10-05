# Security – The Art House Victoria Falls website

This document describes how the site is protected, what must be configured at
deployment level, and how to check it. It contains **no secrets**.

## 1. Architecture

```
Visitor ──HTTPS──► Vercel edge (TLS, DDoS protection, optional WAF rules)
                     │
                     ├─ static pages, images  (Next.js, prerendered; public CSP)
                     ├─ /admin                (Next.js, per-request nonce CSP, middleware.js)
                     └─ /api/*  ──► Express backend (backend/), run by pages/api/[...path].js
                                       │  (or a separate Vercel project via BACKEND_URL)
                                       ├─► GitHub website repo   – content/site-content.json, public/images/
                                       ├─► GitHub private repo   – enquiries/ (guests' personal data)
                                       ├─► Resend (optional)     – enquiry e-mails
                                       └─► Upstash Redis (optional) – shared rate-limit counters
```

There is **no database and no user accounts**. The only privileged identity is
the owner (one admin password). Content is a single JSON file in git, so every
change is versioned and can be rolled back with `git revert`.

## 2. API security model

| Endpoint | Access | Input validation | Rate limits | Notes |
| --- | --- | --- | --- | --- |
| `GET /api/health` | public | – | global | returns only `{status:"ok"}` |
| `POST /api/contact` | public, site origin only | zod (`validate.js#contact`), unknown fields ignored, honeypot | 5/10 min per IP; 60/h site-wide; global | stores enquiry (max 1000/month) + optional e-mail |
| `GET /api/admin/login` | public | – | global | logged-out answer reveals only `loggedIn`, `configured` |
| `POST /api/admin/login` | public, site origin only | zod strict | lock-out after 5 failures/15 min per IP; site-wide slow-down after 50 failures/h | constant-time compare, random delay |
| `DELETE /api/admin/login` | site origin only | – | global | revokes the session server-side |
| `GET /api/admin/content` | **admin** | – | 120/min per session | |
| `PUT /api/admin/content` | **admin** | zod strict wrapper + full content schema (`schema.js`) | 30/10 min per session | https-only links, site-only images, in-site hrefs |
| `POST /api/admin/upload` | **admin** | zod strict, magic-byte type check, real pixel size parsed | 40/h + 30/10 min per session | JPG/PNG/WebP only (no SVG), random name, ≤3.5 MB |
| `GET /api/admin/enquiries` | **admin** | – | 120/min per session | |
| `PATCH /api/admin/enquiries` | **admin** | zod strict (hex id, ISO date, enum status) | 30/10 min per session | month file derived from validated date (no traversal) |
| `GET /images/:file`, `/icons/:file` | public | exact allow-list of asset names | CDN | fallback fetch only to fixed https URLs (no SSRF) |

Every `/api` request passes, in order: client-IP detection → security headers
→ CORS → global rate limit (300/min per IP) → origin + JSON-only guard →
size-limited JSON parser (100 kB; 5 MB for uploads) → route limits →
schema validation → authentication → handler → sanitised JSON error.

## 3. Authentication

* One admin password. Preferred: **`ADMIN_PASSWORD_HASH`** (scrypt, N=2^15,
  r=8, p=1, random salt) generated with `npm --prefix backend run
  hash-password`; the plain password is then stored nowhere. Fallback:
  `ADMIN_PASSWORD` (must be ≥12 characters in production; compared in
  constant time).
* Session = random 144-bit id + issue/expiry time, HMAC-SHA256-signed with
  `ADMIN_SECRET` (≥32 chars) or a key derived from the password with scrypt.
  Lifetime `ADMIN_SESSION_HOURS` (default 12, max 168).
* Cookie `__Host-ah_admin` (production): `HttpOnly`, `Secure`,
  `SameSite=Strict`, `Path=/`, host-only. JavaScript cannot read it.
* Logout revokes the session id until its expiry. Changing the password or
  `ADMIN_SECRET` invalidates **all** sessions immediately.
* Wrong password → generic message, 0.5–0.8 s delay, counted per IP and
  site-wide. There are no usernames, so no account enumeration; there is no
  registration, password reset or e-mail verification (password changes are
  made by updating the environment variable).

## 4. Authorization

A single role (admin). `requireAdmin` runs on the server before every
`/api/admin/*` handler except login/logout; the frontend's login screen is
only a convenience. There are no per-user resources, so IDOR/BOLA reduces to
"is this an admin" – enquiry ids are additionally format-checked and looked
up only inside the month file named by the validated date.

## 5. CSRF and CORS

* State-changing requests (POST/PUT/PATCH/DELETE) must send an `Origin` that
  is the site itself or listed in `ALLOWED_ORIGINS`, and a JSON body
  (`Content-Type: application/json` – HTML forms cannot send that
  cross-site). Together with `SameSite=Strict` cookies this blocks CSRF.
* CORS headers are only sent for origins in `ALLOWED_ORIGINS` (never `*`),
  with credentials. Same-origin use (the normal case) needs no CORS.

## 6. Security headers

| Header | Public pages | /admin | /api |
| --- | --- | --- | --- |
| Content-Security-Policy | `next.config.js` (self + Google Maps frame) | per-request nonce + `strict-dynamic` (`middleware.js`) | `default-src 'none'` |
| Strict-Transport-Security | 2 years, includeSubDomains | same | same |
| X-Frame-Options / frame-ancestors | DENY / 'none' | same | same |
| X-Content-Type-Options | nosniff | nosniff | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin | same | no-referrer |
| Permissions-Policy | camera, mic, geolocation, payment, usb, serial, bluetooth, topics off | same | – |
| Cross-Origin-Opener-Policy | same-origin | same | – |
| Cross-Origin-Resource-Policy | – (images may be shown by search engines) | same-origin | same-origin |
| Cache-Control | CDN-cached | no-store | no-store |

Why the public CSP keeps `script-src 'unsafe-inline'`: Next.js streams page
data through small inline scripts on prerendered pages. A nonce would force
every page to be server-rendered per request (slower, no CDN caching). The
public pages render no user-supplied HTML, structured data is escaped
(`lib/jsonld.js`) and `'unsafe-eval'` is not allowed. The admin page, the
only place with authenticated power, uses the strict nonce policy.
`Cross-Origin-Embedder-Policy` is deliberately **not** set: it would break the
Google Maps embed.

## 7. Input validation & XSS

* All request bodies: zod schemas in `backend/src/lib/validate.js`; site
  content: `backend/src/lib/schema.js` (lengths, list sizes, https-only URLs,
  `/images/…` only, in-site links only, control characters stripped,
  unknown fields dropped – also neutralises `__proto__` pollution).
* React escapes all rendered text; the only raw HTML is JSON-LD, serialised by
  `lib/jsonld.js` which escapes `<`, `>`, `&`, U+2028/2029.
* Enquiries (untrusted public input) are shown in the admin as plain text;
  `mailto:`/`tel:`/`wa.me` links are built from validated values.

## 8. File uploads

Admin only; base64 JSON ≤3.5 MB decoded; type decided from magic bytes
(JPEG/PNG/WebP – SVG and everything else refused); pixel size read from the
file; name = `up-<timestamp>-<random>-<sanitised>.ext`; stored in
`public/images/` via a git commit and served as a static file with the
correct `Content-Type` and `nosniff` (never executed). The browser resizes
photos to ≤2000 px before upload.

## 9. Data, storage & secrets

* No database. Content → public website repo (it is public website text).
  Enquiries (names, e-mails, phones, messages) → a **private** repository.
* Secrets are environment variables only, read on the server; nothing is
  prefixed `NEXT_PUBLIC_`, so none can reach the browser bundle.
* `.gitignore` excludes `.env*` (except `*.example`), keys and certificates.
* A repository scan found **no committed secrets**. The admin password was,
  however, shared in plain text during set-up – rotate it (see §13).
* The GitHub token should be a fine-grained token limited to the two
  repositories with *Contents: Read and write* only, and an expiry date.

## 10. Rate limiting & resilience

Limits are configurable as `<max>/<seconds>` (see §12). Counters live in
Upstash Redis when `UPSTASH_REDIS_REST_*` is set (shared by all serverless
instances) and otherwise in each instance's memory – still effective against a
single abusive client, but an attacker spread over many instances gets more
attempts. **Recommended in production: configure Upstash** (free tier is
enough) and/or edge rate-limit rules (§14).

Other limits: JSON body 100 kB (uploads 5 MB; Vercel caps at 4.5 MB),
outbound calls time out (GitHub 15 s, Resend 8 s, Redis 2 s, asset fetch
8 s), function max duration 20 s, ≤1000 stored enquiries per month,
image optimiser qualities pinned to 60/75, self-hosted server header/request
timeouts.

When the site-wide contact limit is hit, the form falls back to opening the
visitor's e-mail app, so real guests can still reach the owner.

## 11. Logging & monitoring

`backend/src/lib/log.js` writes one JSON object per line (Vercel → Logs, or a
log drain). Events: `login_success`, `login_failed`, `login_locked`,
`logout`, `content_saved`, `photo_uploaded`, `enquiry_status_changed`,
`enquiry_received`, `contact_honeypot`, `rate_limited`, `origin_rejected`,
`server_error`, `rate_limit_store_unavailable`. Keys that look sensitive
(password, token, cookie, secret, message, email, phone, data…) are
redacted automatically. Suggested alerts: >20 `login_failed`/hour,
any `server_error` spike, any `login_success` from an unexpected country.

## 12. Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD_HASH` | one of these two | scrypt hash of the admin password (preferred) |
| `ADMIN_PASSWORD` | one of these two | plain admin password, ≥12 chars (fallback) |
| `ADMIN_SECRET` | recommended | ≥32 random chars to sign sessions (`openssl rand -base64 48`) |
| `ADMIN_SESSION_HOURS` | no | session lifetime, default 12 |
| `ADMIN_GITHUB_TOKEN` | for saving | fine-grained GitHub token (2 repos, Contents RW) |
| `GITHUB_DATA_REPO` | for enquiries | `owner/private-repo` for enquiries |
| `GITHUB_REPO`, `GITHUB_BRANCH` | no | website repo/branch (defaults set) |
| `ALLOWED_ORIGINS` | no | extra site origins, comma-separated (defaults to the real domain) |
| `TRUST_PROXY` | no | `vercel` (auto on Vercel), `cloudflare`, a hop count, or `none` |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | recommended | shared rate-limit store |
| `RATE_LIMIT_GLOBAL`, `RATE_LIMIT_CONTACT`, `RATE_LIMIT_CONTACT_GLOBAL`, `RATE_LIMIT_LOGIN`, `RATE_LIMIT_LOGIN_GLOBAL`, `RATE_LIMIT_ADMIN_READ`, `RATE_LIMIT_ADMIN_WRITE`, `RATE_LIMIT_UPLOAD` | no | override limits, format `max/seconds` |
| `ENQUIRIES_MAX_PER_MONTH` | no | cap on stored enquiries per month (default 1000) |
| `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` | no | e-mail each enquiry |
| `BACKEND_URL` | no | only if the backend runs as a separate project |
| `FORCE_HTTPS` | no | self-hosting behind a proxy: `true` adds upgrade-insecure-requests; `false` disables the HTTP→HTTPS redirect |

Set them for **Production** only; preview deployments then have no admin
access at all.

## 13. Deployment requirements (must be done outside the code)

1. **Rotate the admin password** (it was shared in chat): run
   `npm --prefix backend run hash-password`, put the result in
   `ADMIN_PASSWORD_HASH`, delete `ADMIN_PASSWORD`, add `ADMIN_SECRET`,
   redeploy. Do this in every Vercel project that has admin variables.
2. Keep the GitHub token fine-grained, two repos only, Contents RW, with an
   expiry; rotate it if it is ever exposed (GitHub → Settings → Developer
   settings → revoke).
3. Make sure `thearthouse-data` stays **private**.
4. Create a free Upstash Redis database and set the two `UPSTASH_*`
   variables.
5. Vercel → Settings → Deployment Protection: protect preview deployments.
6. Vercel Firewall (or Cloudflare) rules, recommended:
   * rate-limit `POST /api/admin/login` to ~10/min per IP;
   * rate-limit `POST /api/contact` to ~10/10 min per IP;
   * challenge/block known bad bots; enable Attack Challenge Mode during an
     attack.
7. Custom domain: add it to the Vercel project; Vercel issues TLS and
   redirects HTTP→HTTPS automatically. Add `; preload` to HSTS only once you
   are sure every subdomain is HTTPS.
8. If Cloudflare is put in front: set `TRUST_PROXY=cloudflare` **and** make the
   origin accept traffic only from Cloudflare (otherwise the header can be
   forged). On Vercel itself keep the default.
9. Enable GitHub 2FA and Vercel 2FA for every account with access.

## 14. Backups

Content and photos are in git (full history). Enquiries are in the private
repo (full history). Back up by cloning both repositories periodically
(`git clone --mirror`), or enable GitHub's repository archive export. Restore =
`git revert`/push or re-upload.

## 15. Incident response basics

1. **Suspected admin compromise**: change the password (new
   `ADMIN_PASSWORD_HASH`) and `ADMIN_SECRET` → redeploy (all sessions die);
   revoke and recreate the GitHub token; review the website repo history for
   unexpected `Admin:` commits and revert them.
2. **Spam flood**: lower `RATE_LIMIT_CONTACT*`, enable Vercel Attack
   Challenge Mode, add a firewall rule.
3. **Leaked secret**: revoke at the provider first, then replace the variable
   and redeploy.
4. Check Vercel Logs for the JSON events in §11 to establish what happened.

## 16. Running the security checks locally

```
npm ci && npm --prefix backend ci
npm run test:api          # 20 API security tests (auth, CSRF, CORS, limits, uploads, validation…)
npm run audit             # dependency vulnerabilities (website + backend)
npm run build             # production build
```

## 17. Known limitations / residual risks

* Without Upstash, rate-limit counters and session revocation are per
  serverless instance.
* Single shared admin password (no per-person accounts, no 2FA). Adding a
  proper identity provider (e.g. Vercel/Clerk/Auth0 with MFA) is the next
  step if more people need access.
* The GitHub token can write any file in the website repository; a GitHub
  App with path restrictions would be stricter.
* Public-page CSP allows inline scripts (see §6).
* Old Site123 HTML snapshots remain in the repository root; they are not
  served and contain no secrets, but can be deleted.

# The Art House API (Express)

The backend for thearthousevictoriafalls.com: contact form, chatbot booking
requests, the admin dashboard (login, content, photo uploads) and the
enquiries inbox.

```
backend/
  src/index.js        entry point – exports the Express app (Vercel) or listens (npm start)
  src/app.js          middleware, routes, JSON error handler
  src/config.js       environment variables
  src/routes/         contact.js, admin.js
  src/lib/            auth, storage (GitHub / local files), schema, enquiries, mail
  test/               node --test API tests
```

## Endpoints

| Method | Path | |
| --- | --- | --- |
| GET | `/api/health` | status check |
| POST | `/api/contact` | contact form / booking request → stored + emailed |
| GET | `/api/admin/login` | session status |
| POST | `/api/admin/login` | `{ password }` → sets session cookie |
| DELETE | `/api/admin/login` | log out |
| GET / PUT | `/api/admin/content` | read / save `content/site-content.json` |
| POST | `/api/admin/upload` | `{ data (base64), width, height, name }` → `public/images/…` |
| GET / PATCH | `/api/admin/enquiries` | list / `{ id, date, status }` |

All `/api/admin/*` routes except login need the session cookie. Every
POST/PUT/PATCH/DELETE must come from an address in `ALLOWED_ORIGINS`.

## Where data is saved

There is no database. With `ADMIN_GITHUB_TOKEN` set:

- **Website content and photos** are committed to the website repository
  (`GITHUB_REPO`). Vercel rebuilds the website after each commit – changes are
  live in 1–2 minutes.
- **Enquiries** (guests' names, emails, phones) are committed to a separate
  **private** repository (`GITHUB_DATA_REPO`), one JSON file per month.

Without a token in development, everything is written to the local project
folder (enquiries go to `.data/`, which git ignores).

## Running locally

From the website folder, `npm run dev` already runs this backend inside the
same server (see `../server/index.js`) – put `ADMIN_PASSWORD=…` in the
website's `.env.local`.

To run the backend on its own:

```
cd backend
npm install
cp .env.example .env   # fill in ADMIN_PASSWORD
npm run dev            # http://localhost:4000
npm test
```

## Deploying on Vercel (one time)

1. Vercel → **Add New… → Project** → import the same GitHub repository
   (`Thearthouse`) a second time.
2. **Root Directory**: `backend`. Framework preset: **Express** (detected
   automatically). Project name e.g. `thearthouse-api`.
3. **Environment Variables**: everything in `.env.example`
   (`ADMIN_PASSWORD`, `ADMIN_GITHUB_TOKEN`, `GITHUB_DATA_REPO`, …).
4. Deploy, then open `https://<backend-project>.vercel.app/api/health` – it
   should answer `{"status":"ok"}`.
5. In the **website** project → Environment Variables add
   `BACKEND_URL=https://<backend-project>.vercel.app` and redeploy the website.
   The website now forwards `/api/*` to the backend.

`vercel.json` skips backend redeploys when a commit doesn't touch `/backend`
(for example when the owner saves content).

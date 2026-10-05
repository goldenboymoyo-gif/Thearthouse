# Admin dashboard

The owner can change the website at **/admin** (for example
`https://www.thearthousevictoriafalls.com/admin`) without touching any code:

| Section | What it changes |
| --- | --- |
| Enquiries | Contact-form messages and chat booking requests (reply by email / WhatsApp, mark as replied or archived) |
| Rates & contact | Rate from, check-in/out, minimum stay, meals, phone, email, address, social links, booking link |
| Distances | “How far is everything?” list |
| Welcome text | The Art House introduction and its photo |
| Quick Look | The six feature tiles |
| FAQ | Questions and answers (also sent to Google as FAQ results) |
| Explore page | The text blocks of the Explore page |
| Activities | Activity cards and their own pages |
| Reviews | Guest reviews and star ratings |
| Gallery | Upload, reorder, describe and remove photos |

Everything the dashboard edits is stored in `content/site-content.json`.

## How it fits together

```
Browser ──► website (Next.js, Vercel project 1)
              │  /api/*  is forwarded (BACKEND_URL)
              ▼
            backend (Express, /backend, Vercel project 2)
              ├─► GitHub: website repo  – content/site-content.json, public/images/
              └─► GitHub: private data repo – enquiries/
```

The backend is a normal Express app – see **backend/README.md** for its
endpoints, tests and deployment steps.

When the owner presses **Save changes**, the backend commits the new
`content/site-content.json` (and any uploaded photos in `public/images/`) to the
website repository. Vercel rebuilds the website, so changes are live in about
1–2 minutes. Enquiries contain guests' names, emails and phone numbers, so they
are **never** saved in the public website repository – they go to a separate
**private** repository.

## One-time setup

1. **Private repository for enquiries** – on GitHub create a new **private**
   repository, e.g. `thearthouse-data` (tick “Add a README”).
2. **GitHub token** – GitHub → Settings → Developer settings → Personal access
   tokens → *Fine-grained tokens* → Generate new token:
   - Repository access: *Only select repositories* → `Thearthouse` and
     `thearthouse-data`.
   - Repository permissions → **Contents: Read and write**.
3. **Backend project on Vercel** – Add New… → Project → import `Thearthouse`
   again → **Root Directory: `backend`** → Environment Variables:
   - `ADMIN_PASSWORD` – the owner's password
   - `ADMIN_GITHUB_TOKEN` – the token from step 2
   - `GITHUB_DATA_REPO` = `goldenboymoyo-gif/thearthouse-data`
   - optional: `RESEND_API_KEY` (also email every enquiry), `ALLOWED_ORIGINS`
   Deploy, then check `https://<backend>.vercel.app/api/health`.
4. **Website project on Vercel** – Settings → Environment Variables:
   - `BACKEND_URL` = `https://<backend>.vercel.app`
   Redeploy the website.

## Trying it on your own computer

`.env.local` in the project folder (never committed):

```
ADMIN_PASSWORD="your-password"
```

Use the quotes – without them a `#` in the password is treated as a comment.
`npm run dev` runs the website **and** the backend together; open
http://localhost:3000/admin. Without `ADMIN_GITHUB_TOKEN`, saves are written
straight into the project files (enquiries into `.data/`, which git ignores).
Backend tests: `npm run test:api`.

## Security notes

- One password, checked on the server; the login lasts 7 days in an httpOnly,
  same-site cookie. Changing `ADMIN_PASSWORD` logs everyone out.
- Five wrong passwords lock that address out for 15 minutes.
- Changes are only accepted from the website's own addresses.
- Every save is checked against a fixed shape (`backend/src/lib/schema.js`), so
  a mistake can't break the website build. Only JPG/PNG/WebP photos can be
  uploaded; the dashboard resizes them to at most 2000px first.
- `/admin` is hidden from search engines.

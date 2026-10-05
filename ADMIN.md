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

## How saving works

When the owner presses **Save changes**, the dashboard commits the new
`content/site-content.json` (and any uploaded photos in `public/images/`) to the
GitHub repository. Vercel sees the commit and republishes the site, so changes
are live in about 1–2 minutes.

Enquiries contain guests' names, emails and phone numbers, so they are **never**
saved in the public website repository. They go to a separate **private**
GitHub repository.

## One-time setup (Vercel)

1. **Admin password** – Vercel → Project → Settings → Environment Variables:
   - `ADMIN_PASSWORD` = a long password for the owner (12+ characters).
2. **GitHub access token** – on GitHub: Settings → Developer settings →
   Personal access tokens → *Fine-grained tokens* → Generate new token:
   - Repository access: *Only select repositories* → `Thearthouse` and the
     private data repository from step 3.
   - Permissions → Repository permissions → **Contents: Read and write**.
   - Add it in Vercel as `ADMIN_GITHUB_TOKEN`.
3. **Private repository for enquiries** – create a new **private** repository
   on GitHub (e.g. `thearthouse-data`, tick “Add a README”). Add in Vercel:
   - `GITHUB_DATA_REPO` = `goldenboymoyo-gif/thearthouse-data`
4. Optional:
   - `GITHUB_REPO` (default `goldenboymoyo-gif/Thearthouse`)
   - `GITHUB_BRANCH` (default `main`)
   - `RESEND_API_KEY` to also receive every enquiry by email.
5. Redeploy once (Deployments → ⋯ → Redeploy) so the new variables are used.

## Trying it on your own computer

Create a file called `.env.local` in the project folder:

```
ADMIN_PASSWORD=choose-a-password
```

Run `npm run dev` and open http://localhost:3000/admin. Without
`ADMIN_GITHUB_TOKEN`, saves are written straight into the project files on your
computer (and enquiries into the `.data` folder, which git ignores), so you can
commit and push them yourself.

## Security notes

- One password, checked on the server; the login lasts 7 days in an httpOnly,
  same-site cookie. Changing `ADMIN_PASSWORD` logs everyone out.
- Five wrong passwords lock that address out for 15 minutes.
- Every save is checked against a fixed shape (`lib/admin/schema.js`), so a
  mistake can't break the website build. Only photos (JPG/PNG/WebP) can be
  uploaded; they are resized to at most 2000px in the browser first.
- `/admin` is hidden from search engines.

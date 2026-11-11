# Ramez Milad — Portfolio

**Live site:** [my-portfolio-orpin-ten-70.vercel.app](https://my-portfolio-orpin-ten-70.vercel.app)

A personal portfolio with a built-in admin CMS. All site content — profile, projects, certificates, timeline, tech stack — lives in MongoDB Atlas and is managed through the admin UI. Images, videos and the résumé PDF are stored on Cloudinary. Each showcased project lives in its own GitHub repo and is linked out by URL.

## Stack

- **Frontend** — Next.js 16 (App Router, Server Components, ISR) · React 19 · Tailwind CSS 4 · Framer Motion · Radix UI · TanStack Query and React Hook Form (admin only)
- **Backend** — NestJS 11 · Mongoose 8 · MongoDB Atlas · JWT in an httpOnly cookie
- **Media** — Cloudinary, uploaded straight from the browser with a signature from the API
- **Hosting** — Vercel (frontend) · Render (API) · MongoDB Atlas (data) · Cloudinary (media), all on free tiers
- **Runtime** — Node.js 22

## Layout

```
my-Portfolio/
├── backend/                 NestJS API (prefix /api/v1)
│   ├── src/
│   │   ├── config/          env validation, config + database modules
│   │   ├── common/          shared pipes, filters, guards, validators, base CRUD service
│   │   ├── auth/            login / logout / me, global JWT guard, session cookie
│   │   ├── admins/          admin accounts (created only from the CLI)
│   │   ├── cli/             create-admin command
│   │   ├── profile/ projects/ media/ team/ certificates/ timeline/ tech/ messages/ health/
│   │   ├── app.module.ts    wiring: throttler, validation, error filter
│   │   └── app.setup.ts     HTTP setup shared by main.ts and the e2e tests
│   └── test/                end-to-end tests (in-memory MongoDB)
└── frontend/                Next.js public site + admin UI
    └── src/
        ├── app/(public)/    home page and project pages (server-rendered, cached)
        ├── app/admin/       dashboard (client-side, behind the session cookie)
        ├── app/login/       sign-in page
        ├── app/api/revalidate/   purges the public cache after admin saves
        ├── components/      home/, project/, tech/, layout/, motion/, ui/, admin/
        ├── lib/api/         content.ts (server reads) · client.ts (browser requests)
        ├── lib/admin/       React Query hooks, uploads, mutations
        └── proxy.ts         redirects signed-out visitors away from /admin
```

## How it works

- **Public pages are static.** The home page and every project page are rendered on the server from the API and cached (ISR). Visitors get prebuilt HTML; the API is only called when the cache refreshes.
- **Saves show up immediately.** After every admin save the dashboard calls `POST /api/revalidate`, which checks the admin session with the API and purges the cached pages. As a safety net, pages also refresh every 5 minutes.
- **Secure by default.** Every API route requires a signed-in admin unless it's explicitly marked public (the public content reads, login, the contact form and the health check). Drafts are only visible to the admin.
- **Uploads skip the API.** The admin asks the API for a signed upload ticket, the browser uploads the file directly to Cloudinary, and the API then verifies the asset with Cloudinary before saving it. Limits: images 10 MB, videos 100 MB, PDFs 10 MB.
- **Deleting is safe.** Media still used by a project, the profile or a certificate can't be deleted (the API answers 409 and names where it's used). Deleting a collaborator also unlinks them from every project.

## Local development

```sh
# Backend
cd backend
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm install
npm run start:dev       # → http://localhost:3001/api/v1

# Frontend (second terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev             # → http://localhost:3000
```

Open `http://localhost:3000` for the public site and `http://localhost:3000/login` for the admin.

### Creating an admin account

There is no sign-up endpoint. Create (or reset) an admin from the backend folder, with `MONGO_URI` pointing at the target database:

```sh
npm run create-admin -- --email you@example.com
```

It prompts for the password without echoing it (at least 12 characters), or reads it from `ADMIN_PASSWORD` when that is set. Running it again for an existing email updates the password.

### Checks

Both packages have the same scripts, and CI (`.github/workflows/ci.yml`) runs them on every push and pull request:

```sh
npm run format:check    # Prettier (config at the repo root)
npm run lint            # ESLint
npm run typecheck       # TypeScript
npm test                # backend only: end-to-end API tests against an in-memory MongoDB
npm run build
```

## What the admin can do

Sign in at `/login`, then use the sidebar:

- **Dashboard** — counts and quick links
- **Projects** — create, edit, delete, drag to reorder, draft/published. Each project has tagline, problem, description, architecture, outcome, tech tags, features, highlights, GitHub/live URLs with custom button labels, role, a cover and an ordered media gallery with captions, and collaborators
- **Media** — library of everything uploaded, with captions and usage-aware delete
- **Certificates / Timeline / Tech** — the Experience and Tech Stack sections of the public site
- **Collaborators** — people (name + GitHub + LinkedIn) you can attach to projects
- **Profile** — name, headlines, bio, education, availability, email, avatar, résumé, social links, focus areas, and the section headings of the public site
- **Messages** — contact-form submissions, with read/unread

The public site renders only what's in the database — sections and labels with no content simply don't appear.

## Security

- Every route is protected unless marked `@Public()`; the guard re-checks the admin role on each request
- Passwords hashed with bcrypt (12 rounds); login answers the same error, in the same time, for unknown emails and wrong passwords
- Session JWT in an httpOnly cookie; `JWT_SECRET` must be random and at least 32 characters in production or the API refuses to start
- All environment variables are validated at startup
- Rate limits per client IP: 100 requests/minute overall, 5 logins/minute, 5 contact messages per 10 minutes; the contact form also has a honeypot field
- Request bodies are validated and unknown fields rejected; JSON bodies are capped at 256 KB
- Security headers on both apps (helmet on the API; `X-Frame-Options`, `nosniff`, HSTS, `Referrer-Policy`, `Permissions-Policy` and a framing CSP on the site)

## Deployment

| Piece       | Where                                              | URL                                          |
| ----------- | -------------------------------------------------- | -------------------------------------------- |
| Frontend    | Vercel (root directory `frontend`, Next.js preset) | https://my-portfolio-orpin-ten-70.vercel.app |
| Backend API | Render                                             | https://my-portfolio-api-bj3x.onrender.com   |
| Database    | MongoDB Atlas                                      | —                                            |
| Media       | Cloudinary                                         | —                                            |

The API is **proxied through the frontend origin** in production (`/api/v1/*` → backend, see `rewrites` in `frontend/next.config.ts`). The session cookie is therefore first-party on the site's own domain: `proxy.ts` can read it to guard `/admin`, and browser third-party-cookie blocking never applies. Don't point `NEXT_PUBLIC_API_BASE` at the backend host directly.

When a change touches both apps, **deploy the backend first**, then the frontend.

- **Frontend → Vercel.** Env vars:

  ```
  NEXT_PUBLIC_API_BASE=/api/v1                                        # same-origin, through the proxy
  BACKEND_ORIGIN=https://my-portfolio-api-bj3x.onrender.com           # proxy target + server-side reads
  NEXT_PUBLIC_SITE_URL=https://my-portfolio-orpin-ten-70.vercel.app   # sitemap, robots.txt, link previews
  # SESSION_COOKIE_NAME=ramez_session                                 # only if COOKIE_NAME is changed
  ```

- **Backend → Render.** Build: `npm ci && npm run build`. Start: `npm run start:prod`. Env vars:

  ```
  NODE_ENV=production
  MONGO_URI=mongodb+srv://…            # MongoDB Atlas connection string
  JWT_SECRET=…                         # node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64'))"
  COOKIE_SECURE=true
  CORS_ORIGIN=https://my-portfolio-orpin-ten-70.vercel.app
  CLOUDINARY_CLOUD_NAME=…
  CLOUDINARY_API_KEY=…
  CLOUDINARY_API_SECRET=…
  # Optional, shown with their defaults:
  # PORT=3001                          # Render sets this itself
  # COOKIE_NAME=ramez_session
  # COOKIE_SAMESITE=lax
  # CLIENT_IP_HEADER=cf-connecting-ip  # Render is behind Cloudflare
  # TRUST_PROXY=1
  ```

Because content lives in Atlas and media on Cloudinary, deploys are stateless: nothing on the server's disk needs to survive a redeploy.

### Keeping the free tier awake

Render's free tier puts the API to sleep after 15 minutes without traffic, and waking it takes about a minute. Public pages are served from the Vercel cache, so visitors aren't affected, but the admin and the contact form would be:

- `GET /api/v1/health` returns `{ ok: true }` instantly, without touching the database, and skips the rate limiter.
- A [cron-job.org](https://cron-job.org) job (free) pings `https://my-portfolio-api-bj3x.onrender.com/api/v1/health` **every 10 minutes**, so the API never goes idle long enough to sleep. It also emails on failure, doubling as an uptime monitor.

Render's free plan includes 750 instance-hours per month — enough for exactly **one** always-on service, which is why only the backend lives on Render.

### Post-deploy checks

- Public site renders with real content; editing something in the admin shows up on the site right after saving
- `/login` → admin dashboard loads; `/admin` while signed out redirects to `/login`
- Uploading an image in **Media** works
- Several wrong logins in quick succession → HTTP 429
- `curl https://my-portfolio-api-bj3x.onrender.com/api/v1/health` → `{"ok":true}`

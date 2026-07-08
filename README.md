# Ramez Milad — Portfolio

A personal portfolio with a built-in admin CMS. All site content — profile, projects, certificates, timeline, tech stack — lives in MongoDB Atlas and is managed through the admin UI. Images and videos are stored on Cloudinary. Each showcased project lives in its own GitHub repo and is linked out by URL; the portfolio doesn't host them.

## Stack

- **Frontend** — Next.js 16 (App Router) · React 19 · Tailwind 4 · TanStack Query · Axios · Framer Motion · Radix UI
- **Backend** — NestJS 11 · Mongoose · MongoDB Atlas · JWT-in-cookie auth
- **Media** — Cloudinary (images and videos are uploaded straight from the admin; the database stores their Cloudinary URLs)

## Layout

```
my-Portfolio/
├── frontend/   Next.js public site + admin UI
└── backend/    NestJS API
```

Backend modules: `auth`, `admins`, `profile`, `projects`, `media`, `team`, `certificates`, `timeline`, `tech`, `messages`.

## Local development

```sh
# Backend
cd backend
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm install
npm run start:dev       # → http://localhost:3001 (API prefix /api/v1)

# Frontend (second terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev             # → http://localhost:3000
```

Open `http://localhost:3000` for the public site, `http://localhost:3000/login` for the admin.

### Creating an admin account

Set `AUTH_REGISTER_ENABLED=true` in the backend env, register at `/createuser`, then set it back to `false`. Registration is disabled by default so the endpoint isn't exposed in production.

## What the admin can do

Sign in at `/login`, then use the sidebar:

- **Dashboard** — counts and quick links
- **Projects** — create, edit, delete, reorder. Each project has tagline, problem, description, architecture, outcome, tech tags, features, highlights, GitHub/live URLs with custom button labels, role, media gallery with per-image titles, team picker, draft/published status
- **Media** — drop-zone uploader for images and videos. Files are uploaded to Cloudinary and reused across project galleries, avatar, and resume
- **Certificates / Timeline / Tech** — the Experience and Tech Stack sections of the public site
- **Team** — collaborator roster (name + GitHub + LinkedIn) you can attach to projects
- **Profile** — display name, headline, bio, education, availability, email, avatar, resume, social links, and every section heading on the public site
- **Messages** — contact-form submissions

The public site renders only what's in the database — sections and labels with no content simply don't appear.

## Security hardening (already in place)

- `helmet` for HTTP response security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.)
- `@nestjs/throttler` global rate limit (100 req/min/IP) plus a stricter limit on `/auth/login` to defeat brute-force
- `ValidationPipe` with `whitelist: true` + `forbidNonWhitelisted: true` rejects unknown fields in request bodies
- Passwords hashed with `bcrypt`; JWT in an `httpOnly` cookie with configurable `secure`/`sameSite` for cross-origin deploys
- `trust proxy` enabled so client IPs are accurate behind Vercel / Render / Nginx
- Uploads limited to 100MB with a MIME allowlist, buffered in memory and streamed to Cloudinary (nothing touches the server's disk)
- Backend warns loudly at startup if `JWT_SECRET` is missing or still the placeholder

## Deployment

The API is **proxied through the frontend origin** in production (`/api/v1/*` → backend, see `rewrites` in `frontend/next.config.ts`). The auth cookie is therefore first-party on the site's own domain: the `/admin` middleware can read it, and Safari/Chrome third-party-cookie blocking never applies. Don't point `NEXT_PUBLIC_API_BASE` at the backend host directly — a cross-domain cookie can't guard `/admin`.

- **Frontend → Vercel.** Env vars:

  ```
  NEXT_PUBLIC_API_BASE=/api/v1                        # same-origin, goes through the proxy
  BACKEND_ORIGIN=https://your-backend.onrender.com    # proxy target + server-side fetches
  NEXT_PUBLIC_SITE_URL=https://your-portfolio-domain.com
  ```

- **Backend → Render** (or Railway/Fly). Build: `npm install && npm run build`. Start: `npm run start:prod`. Env vars:

  ```
  PORT=                      # usually set by the host automatically
  MONGO_URI=mongodb+srv://…  # MongoDB Atlas connection string
  JWT_SECRET=…               # node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64'))"
  NODE_ENV=production
  AUTH_REGISTER_ENABLED=false
  COOKIE_NAME=ramez_session
  COOKIE_SECURE=true
  CORS_ORIGIN=https://your-portfolio-domain.com
  CLOUDINARY_CLOUD_NAME=…
  CLOUDINARY_API_KEY=…
  CLOUDINARY_API_SECRET=…
  ```

Because content lives in Atlas and media on Cloudinary, deploys are stateless: nothing on the server's disk needs to survive a redeploy.

### Post-deploy checks

- Public site renders with real content
- `/login` → admin dashboard loads
- Backend logs show **no JWT_SECRET warning** at startup
- Several wrong logins in quick succession → HTTP 429
- `curl -I https://your-backend.../api/v1/projects` → response includes `x-frame-options`, `referrer-policy`, etc.

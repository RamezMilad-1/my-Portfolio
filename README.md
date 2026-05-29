# Ramez Milad — Portfolio

A personal portfolio with a built-in admin CMS. **Local-only** — runs on your Mac against a local MongoDB. Each showcased project lives in its own GitHub repo and is linked out by URL; the portfolio doesn't host them.

## Stack

- **Frontend** — Next.js 16 (App Router) · React 19 · Tailwind 4 · TanStack Query · Axios · Framer Motion · Radix UI
- **Backend** — NestJS 11 · Mongoose · MongoDB · JWT-in-cookie auth
- **Storage** — Files on disk under `portfolio/backend/uploads/` (avatars, project galleries, resume)

## Layout

```
my-Portfolio/
└── portfolio/
    ├── frontend/   Next.js public site + admin UI
    └── backend/    NestJS API
```

Backend modules: `auth`, `admins`, `profile`, `projects`, `media`, `team`.

## Prerequisites

```sh
brew install node mongodb-community
brew services start mongodb-community
mongosh    # confirms MongoDB is up at localhost:27017
```

Node 20 or 22 recommended.

## One-time setup

```sh
# Backend
cd portfolio/backend
cp .env.example .env
npm install
npm run db:seed          # profile + 4 sample projects
npm run create-admin     # prompts for email + password

# Frontend
cd ../frontend
cp .env.local.example .env.local
npm install
```

## Daily run (two terminals)

```sh
# Terminal 1 — backend
cd portfolio/backend
npm run start:dev        # → http://localhost:3001

# Terminal 2 — frontend
cd portfolio/frontend
npm run dev              # → http://localhost:3000
```

Open `http://localhost:3000` for the public site, `http://localhost:3000/login` for the admin.

## What the admin can do

Sign in at `/login`, then use the sidebar:

- **Dashboard** — counts and quick links
- **Projects** — create, edit, delete, reorder. Each project has tagline, problem, description, architecture, outcome, tech tags, features list, GitHub URL, optional live URL, role, media gallery, team picker, draft/published status
- **Media** — drop-zone uploader for images and videos. Files land in `portfolio/backend/uploads/`. Used for project galleries and avatars
- **Team** — minimal collaborator roster (name + GitHub + LinkedIn) you can attach to multiple projects
- **Profile** — edit display name, headline, bio, education, availability, email, avatar, resume, and social links

## Adding a new project

1. Sign in at `/login` → **Projects** → **New project**.
2. Fill in name, slug (e.g. `my-cool-app`), tagline, problem, description, architecture, outcome, tech list, features, role, GitHub URL.
3. (Optional) **Live URL** — leave blank for now. The detail page shows a "live demo not currently hosted" badge instead of a broken button. Fill it in later if you deploy the project.
4. Upload screenshots/videos in the **Media** section of the project form, or pick from previously uploaded ones.
5. Set **Status: published** and save. Mark **Featured** if you want it on the homepage.

## Changing your profile photo

Admin → **Profile** → click **Upload** next to **Avatar**, pick the image, then **Save profile**. The file is stored under `portfolio/backend/uploads/images/` and the homepage hero updates immediately.

## Notes

- The admin's JWT lives in an httpOnly cookie (`ramez_session`). Unauthenticated requests to `/admin/*` redirect to `/login`.
- Skills shown on the homepage are auto-derived from the union of all projects' tech tags — no manual skills list to maintain.
- Project `liveUrl` is just a string field. Empty by default; the public UI handles missing demos gracefully.
- Uploads are gitignored. Don't commit large media into the repo.

## Security hardening (already in place)

- `helmet` for HTTP response security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.)
- `@nestjs/throttler` global rate limit (100 req/min/IP) plus a stricter limit on `/auth/login` (5 attempts/min/IP) to defeat brute-force
- `ValidationPipe` with `whitelist: true` + `forbidNonWhitelisted: true` rejects any unknown fields in request bodies
- Login passwords hashed with `bcrypt`
- JWT in `httpOnly` cookie (XSS-proof) with configurable `secure` and `sameSite` for cross-origin production deploys
- `trust proxy` enabled so client IPs are accurate behind Vercel / Render / Railway / Nginx
- File uploads limited to 100MB with a MIME allowlist; filenames are random UUIDs (no path traversal)
- Backend logs a loud `[SECURITY WARN]` at startup if `JWT_SECRET` is missing or still the placeholder

## When you're ready to deploy

**Fill in your real content via the admin first.** Your local screenshots, problem/outcome text, avatar, and resume are reusable — only the database and uploaded files are per-environment.

### 1. Generate a real JWT secret

```sh
node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64'))"
```

Copy the output. **Do not put it in any file in the repo** — it goes into your hosting platform's env-var settings.

### 2. Set up MongoDB Atlas (free tier)

Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com), add a database user, allow access from `0.0.0.0/0` (or restrict to your backend host's IP), and copy the connection string. It looks like:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ramez_portfolio?retryWrites=true&w=majority
```

### 3. Production env vars

Set these on the **backend host** (Render / Railway / Fly), NOT in any `.env` in the repo:

```
PORT=                      # usually set by the host automatically
MONGO_URI=mongodb+srv://…  # from step 2
JWT_SECRET=…               # from step 1
NODE_ENV=production
COOKIE_NAME=ramez_session
COOKIE_DOMAIN=             # leave empty for cross-origin Vercel + Render
COOKIE_SECURE=true
COOKIE_SAMESITE=none
CORS_ORIGIN=https://your-portfolio-domain.com
UPLOADS_DIR=./uploads      # only matters if your host gives you a persistent disk
```

`COOKIE_SECURE=true` and `COOKIE_SAMESITE=none` are **required** when frontend and backend live on different domains. Without them the auth cookie won't be sent.

On the **frontend host** (Vercel):

```
NEXT_PUBLIC_API_BASE=https://your-backend-host.example.com/api/v1
NEXT_PUBLIC_UPLOADS_BASE=https://your-backend-host.example.com
NEXT_PUBLIC_SITE_NAME=Ramez Milad
```

### 4. Deploy

- **Frontend → Vercel** (free). Push the repo, set env vars, deploy.
- **Backend → Render** (free) or **Railway** ($5/mo). Build: `npm install && npm run build`. Start: `npm run start:prod`.
- For uploads to survive deploys on Render, attach a **Persistent Disk** ($1/mo, 1GB) mounted at `/opt/render/project/src/uploads`. Without this, uploads disappear on every redeploy.

### 5. Migrate your local content to Atlas

```sh
# locally, after you've filled in everything you want via admin
mongodump --uri="mongodb://localhost:27017/ramez_portfolio" --out=./dump

# then push to Atlas
mongorestore --uri="<your atlas connection string>" --nsFrom="ramez_portfolio.*" --nsTo="ramez_portfolio.*" ./dump
```

Or paste content manually into the production admin — only takes ~30 minutes for 4 projects + 1 profile.

### 6. Re-upload media

The image and video files in `portfolio/backend/uploads/` live on your laptop's disk; the database stores paths to them. When you deploy, re-upload the same files via the production admin's Media uploader.

### 7. Final checks

- Visit your production URL → public site renders
- `/login` → sign in with your admin credentials → admin dashboard loads
- Tail backend logs to confirm **no JWT_SECRET warning** at startup
- Try 6 wrong logins in quick succession → 6th gets HTTP 429
- `curl -I https://your-backend.../api/v1/projects` → response includes `x-frame-options`, `referrer-policy`, etc.

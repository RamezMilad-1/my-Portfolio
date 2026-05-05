# Ramez Milad — Portfolio (local build)

A premium personal portfolio with a built-in admin CMS, mirroring the HR System's tech stack: **Next.js 16 + React 19 + Tailwind 4** front end, **NestJS 11 + Mongoose + MongoDB** back end, two processes, JWT-in-cookie auth.

The portfolio also runs each showcased project locally on a dedicated port, so the **"Open project"** button on every project detail page lands on a working app — no dependency on Vercel/Railway availability.

## Layout

```
ramez-portfolio (this folder)
├── portfolio/
│   ├── frontend/   Next.js 16 + Tailwind 4 + TanStack Query + Axios + Framer Motion
│   └── backend/    NestJS 11 + Mongoose + MongoDB + JWT-in-cookie
│
├── projects/       Git submodules pointing at the existing GitHub repos
│   ├── events-ticketing-system-berlin       (RamezMilad-1)
│   ├── nyc-collision-studio                 (RamezMilad-1)
│   ├── restaurant-reservation-system        (kiroreda963)
│   └── semester-5-software-project          (WefhLNUE — HR System with 18 nested submodules)
│
├── run-all.ps1     One-shot launcher for the whole system
└── _legacy/        One-time backup of the original project folders (delete when comfortable)
```

## Prerequisites

1. **Node.js 20 or 22** (`node -v`).
2. **MongoDB 8.x Community** running on `localhost:27017`.
   - The installer is at the workspace root: `mongodb-windows-x86_64-8.2.7-signed.msi`.
   - Run it, choose **Complete**, and enable "Install MongoDB as a Service" (default).
   - Verify by running `mongosh` — should connect to `localhost:27017`.
3. **Git** (already used to clone the submodules).

## Unified data layer

All apps share **one MongoDB instance** on `localhost:27017`. Inside that instance each app uses its own database — necessary because their schemas are different (an `EarlyHub.users` row is structured differently from a `BellaVista.users` row, and merging them would corrupt data).

| App                 | Database                  |
|---------------------|---------------------------|
| Portfolio           | `ramez_portfolio`         |
| EarlyHub            | `EventBooking`            |
| Bella Vista         | `bellavista`              |
| HR System           | `hr_system`               |
| NYC Collision Studio| _(none — static data)_    |

Open MongoDB Compass against `mongodb://localhost:27017` and you'll see all five DBs side-by-side.

## Port map

| App                  | Frontend           | Backend         |
|----------------------|--------------------|-----------------|
| Portfolio            | `:3000`            | `:3001`         |
| EarlyHub             | `:4002`            | `:4001`         |
| Bella Vista          | `:4004`            | `:4003`         |
| HR System            | `:4006`            | `:4005`         |
| NYC Collision Studio | https://nyc-collision-studio.vercel.app  (no local server) | — |

## Quick start (zero to working)

### 1. First-time only — seed the portfolio DB and create your admin

```powershell
cd portfolio/backend
copy .env.example .env
npm install
npm run db:seed          # profile + 4 known projects
npm run create-admin     # prompts for email + password
```

(If you've done this already, skip this section.)

### 2. Boot everything

```powershell
.\run-all.ps1
```

The launcher:

- Checks MongoDB is running and starts it if not.
- Runs `npm install` in any app whose `node_modules` is missing (3 sub-projects on first run — takes a few minutes).
- Spawns 8 PowerShell windows, one per service, each named `ramez-portfolio :: <service>`.
- Prints the URL list when done.

Then open **http://localhost:3000** and click any project card → **Open project** to launch the live app on its dedicated port.

### 3. Stop everything

```powershell
.\run-all.ps1 -Stop
```

This kills any process holding ports 3000, 3001, 4001-4006.

### Skip-install for daily use

Once each app has its `node_modules`:

```powershell
.\run-all.ps1 -SkipInstall
```

## Surgical-design principles

- **Submodules untouched against GitHub.** No tracked file in any of the 4 project repos has been modified. `git submodule foreach 'git status --porcelain'` is empty (modulo the gitignored `.env` files we drop in).
- **EarlyHub's tracked `frontend/.env`** points at `:3001` (their original local default). The launcher overrides `VITE_API_BASE_URL` via shell env at runtime, so the file stays clean.
- **Vite ports** are passed via `--port 4002 --strictPort` etc. on the command line, not via project config files.
- **NestJS ports** are read from `process.env.PORT`, set in each project's local `.env` file (gitignored by their own `.gitignore`).

## Daily dev (without the launcher)

If you want hot-reload visible in VS Code's integrated terminals:

```powershell
# Portfolio backend
cd portfolio/backend       ; npm run start:dev

# Portfolio frontend
cd portfolio/frontend      ; npm run dev

# EarlyHub backend
cd projects/events-ticketing-system-berlin/backend     ; npm run dev

# EarlyHub frontend (note the env override + port)
cd projects/events-ticketing-system-berlin/frontend
$env:VITE_API_BASE_URL = "http://localhost:4001/api/v1"
npm run dev -- --port 4002 --strictPort

# Bella Vista backend
cd projects/restaurant-reservation-system/backend      ; npm run start:dev

# Bella Vista frontend
cd projects/restaurant-reservation-system/frontend     ; npm run dev -- --port 4004 --strictPort

# HR System backend
cd projects/semester-5-software-project/backend        ; npm run start:dev

# HR System frontend
cd projects/semester-5-software-project/frontend       ; npm run dev -- --port 4006
```

## What the portfolio admin can do

1. Open `/login`, sign in with the credentials from `npm run create-admin`.
2. The admin sidebar exposes:
   - **Dashboard** — counts + quick links.
   - **Projects** — table with create / edit / delete. The editor handles tagline, description (markdown), architecture write-up, tech list, features list, GitHub & live URLs, role, **media gallery** (upload + select), **team picker**.
   - **Media** — drop zone for images / videos. Files land in `portfolio/backend/uploads/`.
   - **Team** — roster of people you can attach to multiple projects.
   - **Profile** — edit bio, headline, avatar, resume URL, social links, skills, timeline.
   - **Folder scan** — walks `projects/*`, detects tech stack, lets you import any new folder as a draft project.

## Adding a new project

1. Drop the new project folder into `projects/`, ideally as a Git submodule:
   ```powershell
   git submodule add https://github.com/<user>/<repo>.git projects/<name>
   ```
2. Add a `.env` file in the new project pointing at MongoDB (mirroring the existing ones).
3. Add an entry to `run-all.ps1`'s `$services` array on a free port (4007+).
4. In the portfolio admin, open `/admin/scan` → **Run scan** → **Import**.
5. The project lands as a draft. Edit it, set `liveUrl` to `http://localhost:<your port>`, set status `published`.

## Submodule maintenance

```powershell
# After a fresh clone of this repo
git submodule update --init --recursive

# Pull every submodule's latest main
git submodule update --remote --merge

# Verify all submodules are checked out
git submodule status
```

## Notes & deliberate decisions

- The portfolio repo (this directory) is a local Git repo with **no remote**. You can `git remote add origin …` whenever you want to publish — submodule SHAs travel with it.
- "Open project" opens the local app in a **new tab** (`target="_blank"`). The portfolio is never replaced or iframed.
- The admin's JWT lives in an httpOnly cookie (`ramez_session`). The Next.js proxy redirects unauthenticated `/admin/*` to `/login`. Every protected NestJS route is also guarded independently with `JwtAuthGuard`.
- Media files are stored on disk under `portfolio/backend/uploads/`. Gitignored.

## When you're ready to deploy

1. `git remote add origin … && git push -u origin main`.
2. Switch the portfolio's `MONGO_URI` to a MongoDB Atlas free-tier cluster (and update the URLs file similarly).
3. Deploy `portfolio/frontend` to Vercel and `portfolio/backend` to Render or Railway.
4. Set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none` in the portfolio backend `.env` for cross-origin cookies.
5. The 4 showcased projects keep their existing remotes (or redeploy them however you prefer); update each project's `liveUrl` row in the portfolio DB to point at the public URL.

/* Production seed for ramez_portfolio (MongoDB Atlas).
 * Run: NODE_PATH=<backend>/node_modules node seed.cjs
 * - Preserves the admin account + all dump media (files already in backend/uploads).
 * - Rewrites projects/profile/timeline/tech/team/certificates with curated content.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { BSON } = require('bson');

const BACKEND = '/Users/refkarezkall/Desktop/ramez/portf/my-Portfolio/backend';
const DUMP = '/Users/refkarezkall/Desktop/ramez/portf/my-Portfolio/dump/ramez_portfolio';
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, 'media_manifest.json'), 'utf8'));

const MONGO_URI = fs.readFileSync(path.join(BACKEND, '.env'), 'utf8')
  .split('\n').find(l => l.startsWith('MONGO_URI=')).slice('MONGO_URI='.length).trim();

function readBson(file) {
  const buf = fs.readFileSync(path.join(DUMP, file));
  const docs = []; let off = 0;
  while (off < buf.length) { const len = buf.readInt32LE(off); docs.push(BSON.deserialize(buf.subarray(off, off + len), { promoteValues: true })); off += len; }
  return docs;
}

const oid = (s) => new ObjectId(s);
const now = new Date();

/* ---------------- media captions for existing dump media (by originalName) ---------------- */
const CAPTIONS_BY_ORIGINAL = {
  'home-discover.png': 'Home — hot events, categories and the venue grid',
  'home.png': 'Home page',
  'event-details.png': 'Event details with per-tier availability',
  'event-detail-theater.png': 'Theatre event — entry to the seat picker',
  'theater-seat-picker.png': 'Interactive theatre seat picker',
  'booking-multitier.png': 'Multi-tier ticket checkout',
  'forgot-password.png': 'OTP password reset (3-step wizard)',
  'event-detail-party.png': 'Event details — party category',
  'event-detail-concert.png': 'Event details — concert category',
  'outlets.png': 'Physical ticket outlets directory',
  'profile.png': 'User profile',
  'admin-users.png': 'Admin — user management with role updates',
  'admin-events.png': 'Admin — event approval queue',
  'organizer-my-events.png': 'Organiser — my events',
  'organizer-create-event.png': 'Organiser — create event with custom fields',
  'organizer-analytics.png': 'Organiser analytics — KPIs, %-booked and sales donut',
  // Bella Vista (github asset filenames)
  '540154850-4a21017b-f856-490e-98bc-18ffb9a11f35.png': 'Customer reviews & ratings',
  '540154655-75f7abf6-f576-4ce1-a83c-c3dd02b981d3.png': 'Login with test-account quick-fill',
  '540154680-620b4765-1dac-4deb-8217-daacf4d2c817.png': 'Homepage — featured dishes and restaurant info',
  '540154857-843eb123-b8fc-4f0e-834d-98632ff9e1ea.png': 'Admin dashboard — operations overview',
  '540154762-e9f29bf1-8ac7-4fdc-b74b-56d708179baa.png': 'Book a table — date & time selection',
  '540154887-fce8d933-2d3a-4fba-ab84-d51e569525d4.png': 'Menu browsing with item details',
  '540154780-a45a6b9d-fbb2-4a92-bf3d-b86febd5ba89.png': 'Manage reservations',
  '540155074-5bbcc366-d206-4b76-9afe-f7a3c3ca06d0.png': 'Leave a review',
  '540154789-83fed9e0-fa24-4765-ad30-45a3b8a30c9f.png': 'Orders — place and track food orders',
};

/* ---------------- team members (linked only) ---------------- */
const TM = {
  kiro:    { _id: new ObjectId(), name: 'Kiro Reda',            githubUrl: 'https://github.com/kiroreda963',        linkedinUrl: '' },
  daniel:  { _id: new ObjectId(), name: 'Daniel Nagy',          githubUrl: 'https://github.com/Daniel-Nagyy',       linkedinUrl: '' },
  kanzy:   { _id: new ObjectId(), name: 'Kanzy Hany',           githubUrl: 'https://github.com/kanzyhany',          linkedinUrl: '' },
  seif:    { _id: new ObjectId(), name: 'Seif Nazmy',           githubUrl: 'https://github.com/seif999999',         linkedinUrl: '' },
  abdo:    { _id: new ObjectId(), name: 'Abdelrahman Youssef',  githubUrl: 'https://github.com/Abdo0077',           linkedinUrl: '' },
  fawzy:   { _id: new ObjectId(), name: 'Yassin Fawzy',         githubUrl: 'https://github.com/Fawzy29',            linkedinUrl: '' },
  tahoon:  { _id: new ObjectId(), name: 'Mohamed Tahoon',       githubUrl: 'https://github.com/Tahhoon22',          linkedinUrl: '' },
  wael:    { _id: new ObjectId(), name: 'Mohamed Wael',         githubUrl: 'https://github.com/mohamedwael15',      linkedinUrl: '' },
  mikhaeel:{ _id: new ObjectId(), name: 'Mikhaeel Atef Rizk',   githubUrl: 'https://github.com/mikhaeelatefrizk',   linkedinUrl: '' },
  ammar:   { _id: new ObjectId(), name: 'Ammar Abdelkhalek',    githubUrl: 'https://github.com/Aster-00',           linkedinUrl: '' },
};
const teamMembers = Object.values(TM).map(m => ({ ...m, createdAt: now, updatedAt: now }));
const link = (...ms) => ms.map(m => ({ memberId: m._id }));

/* ---------------- projects ---------------- */
const dumpProjects = readBson('projects.bson');
const bySlug = Object.fromEntries(dumpProjects.map(p => [p.slug, p]));
const mediaIds = (slug) => (bySlug[slug]?.media ?? []).map(id => oid(String(id)));

const SPOT_ID = new ObjectId();
const spotMediaDocs = MANIFEST.spotwise.map((m, i) => ({
  _id: new ObjectId(),
  projectId: SPOT_ID,
  kind: 'image',
  storagePath: `uploads/images/${m.file}`,
  url: `/uploads/images/${m.file}`,
  caption: m.caption,
  position: i,
  sizeBytes: m.sizeBytes,
  originalName: m.originalName,
  createdAt: now, updatedAt: now,
}));
const coverMediaDocs = [
  { _id: new ObjectId(), kind: 'image', storagePath: `uploads/images/${MANIFEST.covers.spotwise.file}`, url: `/uploads/images/${MANIFEST.covers.spotwise.file}`, caption: 'SpotWise — cover', position: 0, sizeBytes: MANIFEST.covers.spotwise.sizeBytes, originalName: 'spotwise-cover.png', createdAt: now, updatedAt: now },
  { _id: new ObjectId(), kind: 'image', storagePath: `uploads/images/${MANIFEST.covers.internship.file}`, url: `/uploads/images/${MANIFEST.covers.internship.file}`, caption: 'Java Persistence Lab — cover', position: 0, sizeBytes: MANIFEST.covers.internship.sizeBytes, originalName: 'java-lab-cover.png', createdAt: now, updatedAt: now },
];

const projects = [
  {
    _id: SPOT_ID,
    slug: 'spotwise-ai-travel-planner',
    name: 'SpotWise — AI Travel Planner',
    tagline: 'Community travel-discovery app: real places shared by travellers, explored on a live map, and turned into day-by-day itineraries by AI.',
    problem: 'Travel gems are scattered across blogs and social apps — unverified and hard to trust — and building a day-by-day itinerary for a new city still takes hours.',
    description: 'SpotWise is a Flutter app where travellers share the places they love and everyone else explores them on a live map, saves and reviews them, and plans trips. Google Gemini turns those community-approved spots into a costed, day-by-day itinerary. Every submission passes admin moderation before going public, and the app opens straight into a browsable experience — no login wall. With blank API keys it runs entirely on built-in demo data: about 60 spots across 13 cities.',
    architecture: 'Strict layering: screens read only from Provider state, and providers call only services. Firebase Realtime Database over raw HTTP (no SDK lock-in), Firebase Auth REST with a local Hive fallback, OpenStreetMap + Nominatim for maps and geocoding, and Gemini for itinerary generation with an on-device fallback. A small service locator swaps every integration between live cloud and local mock based on .env keys.',
    outcome: 'Shipped like a product: clean dart analyze, unit + widget tests, CI on every push, a release APK and a live web demo — about 20,000 lines of Dart across 116 files.',
    tech: ['Flutter', 'Dart', 'Firebase', 'Google Gemini', 'OpenStreetMap', 'Hive', 'Provider', 'GitHub Actions'],
    features: [
      'Map-first discovery — OpenStreetMap with marker clustering and custom category pins',
      'Destination-first home with country/city picker, featured rail and personalised recommendations',
      'Community spot submissions with camera/gallery photos and GPS capture',
      'Admin moderation queue — every spot is approved before going public',
      'AI trip planner — Gemini builds a scheduled, budget-aware itinerary from approved spots',
      'Trip planner with day-by-day stops, notes and a budget breakdown, saved offline with Hive',
      'Push notifications (FCM) plus on-device reminders and an in-app notification centre',
      'Offline-resilient: local cache, connectivity banner, graceful empty/error/loading states',
    ],
    highlights: [
      'Runs with zero configuration — blank .env boots the whole app on built-in demo data',
      'Every dependency chosen on a free, no-credit-card path (OSM instead of Google Maps billing, Gemini free tier)',
      'Approval events auto-notify users through a DB-record + polling-stream design — Cloud Functions UX at $0',
      'Dual auth implementation: Firebase Auth REST and a fully offline Hive-backed fallback',
    ],
    githubUrl: 'https://github.com/RamezMilad-1/spot_wise',
    liveUrl: 'https://ramezmilad-1.github.io/spot_wise/',
    liveLabel: 'Web Demo', sourceLabel: 'Source',
    role: 'Lead developer — architecture and every feature, end to end',
    coverImageUrl: `/uploads/images/${MANIFEST.covers.spotwise.file}`,
    team: [], media: spotMediaDocs.map(m => m._id), gallery: [],
    category: 'Mobile · AI', isFeatured: true, status: 'published', position: 0,
    createdAt: now, updatedAt: now,
  },
  {
    _id: oid(String(bySlug['eventhub-events-ticketing-system']._id)),
    slug: 'eventhub-events-ticketing-system',
    name: 'EventHub — Berlin Events Ticketing',
    tagline: 'Production-deployed MERN ticketing platform — multi-tier tickets, an interactive theatre seat picker and three role-based dashboards.',
    problem: 'Ticketing has to survive real concurrency: two people grabbing the same theatre seat, tiered inventories that must never oversell, and password resets that can’t leak which emails exist.',
    description: 'A full-stack MERN platform for discovering and booking events in Berlin. Visitors browse approved events with debounced search and shareable URL filters; organisers create events with multi-tier pricing, auto-calculated theatre seating and an analytics dashboard; admins approve events and manage users and outlets. Rebuilt from a university team prototype into the deployed product, live on Render with MongoDB Atlas and public test accounts.',
    architecture: 'React 18 + Vite + Tailwind frontend over an Express 4 REST API with Mongoose 7. JWT is issued both as an httpOnly cookie and a Bearer token, so auth survives third-party-cookie blocking across Render’s cross-site subdomains. Bookings re-check taken seats inside the transaction, and tier inventory decrements in a single findOneAndUpdate. OTP reset codes are SHA-256-hashed with a 10-minute TTL and delivered over Brevo’s HTTPS API, because Render’s free tier blocks SMTP.',
    outcome: 'Live in production on Render + Atlas. Password-reset emails arrive in ~30 seconds where the naive SMTP route hung for two minutes — and no seat can ever be double-booked.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Tailwind CSS', 'JWT', 'Recharts', 'Render'],
    features: [
      'Three role-based dashboards (visitor, organiser, admin) with route-level access control',
      'Atomic theatre-seat allocation — concurrent bookings of the same seat are rejected at the database layer',
      'Multi-tier ticket inventory (VIP, Standard, Early Bird) updated in a single write to prevent overselling',
      'OTP password reset: hashed codes, 10-minute expiry, 5-attempt lockout, enumeration-safe responses',
      '"Hot Events" carousel ranked by real ticket sales',
      'Debounced search plus URL-driven category, venue and date filters — every view is shareable',
      'Organiser analytics: KPIs, per-event %-booked bar chart and sold-vs-remaining donut',
      'Admin approval queue, user role management and a physical ticket-outlets directory',
      'Client-side image compression for event posters and avatars',
    ],
    highlights: [
      'Diagnosed why browsers drop cookies between *.onrender.com subdomains (Public Suffix List) and designed dual Bearer/cookie auth around it',
      'Swapped blocked SMTP for Brevo’s HTTPS transactional API, with a console fallback so local dev needs zero email setup',
      'Production resilience: Mongoose boot retry loop, graceful shutdown and rate-limited auth endpoints',
    ],
    githubUrl: 'https://github.com/RamezMilad-1/events-ticketing-system-berlin',
    liveUrl: 'https://events-ticketing-system-berlin-3.onrender.com',
    liveLabel: 'Live Demo', sourceLabel: 'Source',
    role: 'Lead developer — rebuilt a team prototype into the deployed product (20 of 29 commits)',
    coverImageUrl: '/uploads/images/eb5677aa-dc58-4560-bb8e-110c57da4250.png',
    team: link(TM.abdo, TM.fawzy, TM.tahoon, TM.wael, TM.mikhaeel),
    media: mediaIds('eventhub-events-ticketing-system'), gallery: [],
    category: 'Full-Stack Web', isFeatured: true, status: 'published', position: 1,
    createdAt: now, updatedAt: now,
  },
  {
    _id: oid(String(bySlug['nyc-collision-studio']._id)),
    slug: 'nyc-collision-studio',
    name: 'NYC Collision Studio',
    tagline: 'Fifteen years of NYC crash data — a 2M+ row Python pipeline feeding an instant-filter React dashboard with one-click PDF reports.',
    problem: 'NYC Open Data publishes over two million collision records split across two messy datasets — far too large and inconsistent to explore interactively in a browser.',
    description: 'An end-to-end data project. Jupyter notebooks clean both datasets, recover missing boroughs and streets with rule-based and KNN imputation, merge them on COLLISION_ID, and emit one pre-computed JSON index. A React 19 dashboard reads that index so anyone can filter crashes by borough, year, contributing factor or vehicle type in real time — with free-text search, shareable URLs and a print-clean PDF export.',
    architecture: 'Two stages. Python (pandas, scikit-learn) notebooks produce a single data artefact holding the citywide summary, every pre-calculated filter result and a 10,000-row sample. In the browser, an indexed lookup answers any one- or two-dimension filter with exact totals — no rows are ever scanned at runtime — and rare combinations fall back to scaled representative samples. One CSS-variable design system drives both light and dark themes.',
    outcome: 'Live on Vercel with instant chart updates over 2M+ records, full keyboard navigation, focus-trapped dialogs and reduced-motion support.',
    tech: ['React', 'TypeScript', 'Python', 'pandas', 'scikit-learn', 'Jupyter', 'Recharts', 'Vite', 'Vercel'],
    features: [
      'Dual independent filter sets (charts vs. table), both saved into the URL for shareable views',
      'Pre-built index answers common filter combinations instantly — no scanning millions of rows',
      'Exact fatality and injury counts read straight from index cells, not estimates',
      'Free-text search mode — “Brooklyn 2022 pedestrian” filters the record explorer live',
      'One-click, high-resolution, print-friendly PDF report of the current view',
      'Light and dark modes built on a single soft-glass design system',
      'Accessible: keyboard navigation, focus traps, live loading announcements, reduced motion',
      'Fast first paint — a 10,000-row sample renders while the full dataset streams in',
    ],
    highlights: [
      'Zero backend: the whole site reads one pre-computed JSON artefact and still shows exact numbers',
      'Missing boroughs and streets recovered with a layered strategy — rules, nearest-record lookups, then KNN over coordinates',
      'PDF export forces a light-mode snapshot, strips blur effects and applies a print stylesheet for vector-clean output',
    ],
    githubUrl: 'https://github.com/RamezMilad-1/NYC-Collision-Studio',
    liveUrl: 'https://nyc-collision-studio.vercel.app',
    liveLabel: 'Live Demo', sourceLabel: 'Source',
    role: 'Frontend end-to-end plus data cleaning with KNN imputation — all 23 commits',
    coverImageUrl: '/uploads/images/dbff1de4-ef03-40fb-b49d-59d22f1b2d60.png',
    team: [], media: mediaIds('nyc-collision-studio'), gallery: [],
    category: 'Data Engineering', isFeatured: true, status: 'published', position: 2,
    createdAt: now, updatedAt: now,
  },
  {
    _id: oid(String(bySlug['hr-system-semester-5']._id)),
    slug: 'hr-system-semester-5',
    name: 'HR System — Semester 5 Project',
    tagline: 'Enterprise-style HR platform built by ~20 students as 18 git submodules — I built the payroll self-service slice end to end.',
    problem: 'An HR department needs one integrated system for the whole employee lifecycle — profiles, leaves, time, recruitment, performance and the full payroll pipeline — built under real product-team conditions.',
    description: 'A modular HR management system where each of nine business domains is an independent pair of repositories — a NestJS backend module and a Next.js frontend module — composed into one deployable product via git submodules. On the Payroll Tracking subteam, I designed the salary and compensation schemas and built the Employee Self-Service slice: fourteen requirement endpoints (payslips, PDF download, tax/insurance/unpaid-leave deduction breakdowns, salary history) plus the eight Next.js pages that consume them.',
    architecture: 'Next.js 16 + React 19 frontend and a NestJS backend with MongoDB via Mongoose. JWT-in-cookie auth with role-based guards across five payroll roles (Employee, Payroll Specialist, Payroll Manager, HR Manager, Finance). The payroll-tracking module alone exposes ~40 REST endpoints with PDFKit payslip generation. Eighteen submodule repos keep each domain independently owned, merged by a central integrator.',
    outcome: 'Deployed to Vercel as one integrated product assembled from 18 independently developed repositories; my Employee Self-Service phase shipped complete with all eight frontend pages.',
    tech: ['NestJS', 'Next.js', 'TypeScript', 'MongoDB', 'Mongoose', 'JWT', 'PDFKit', 'Tailwind CSS'],
    features: [
      'Payslip viewing, full history and PDF download for every employee',
      'Deduction breakdowns: tax, insurance, misconduct and unpaid leave',
      'Salary history, employer contributions and compensation views',
      'Expense claims and disputes with two-level approval (specialist → manager)',
      'Refund processing and finance reports for the finance role',
      'Role-gated dashboards for five distinct user types',
      'Companion modules: org structure, leaves, time management, recruitment, performance',
    ],
    highlights: [
      'Requirement-traceable delivery — REQ-PY-1 through REQ-PY-14 implemented and testable in one sprint',
      '18-git-submodule architecture: clean ownership per domain, integrated into one deployment',
      'Second collaboration with the same core teammates — personal branches merged by an integrator',
    ],
    githubUrl: 'https://github.com/WefhLNUE/semester-5-software-project',
    liveUrl: 'https://semester-5-software-project.vercel.app',
    liveLabel: 'Live Demo', sourceLabel: 'Source',
    role: 'Payroll Tracking subteam — schemas, 14 self-service endpoints, 8 Next.js pages',
    coverImageUrl: '/uploads/images/f96db1d7-19cc-487a-88e8-0cd994cbdee8.png',
    team: link(TM.kiro, TM.daniel, TM.ammar),
    media: mediaIds('hr-system-semester-5'), gallery: [],
    category: 'Enterprise · Team', isFeatured: true, status: 'published', position: 3,
    createdAt: now, updatedAt: now,
  },
  {
    _id: oid(String(bySlug['bella-vista-restaurant']._id)),
    slug: 'bella-vista-restaurant',
    name: 'Bella Vista — Restaurant Platform',
    tagline: 'Reservations, menu ordering and reviews in one app — with a feedback module tested from unit specs all the way to Cypress E2E.',
    problem: 'Restaurants juggle bookings, menus, orders and reviews across separate tools; Bella Vista unifies the diner and admin flows in one application — and, as a software-testing course project, every module had to prove itself with tests.',
    description: 'A team-built full-stack app where diners browse the menu, book tables, place orders and leave reviews, and admins manage everything from a dashboard. I owned the Feedback & Reviews module end to end: two Mongoose schemas (restaurant-level and per-menu-item reviews), the NestJS service and controller, the homepage reviews section, the all-reviews page, and the admin feedback dashboard with reply and delete.',
    architecture: 'React (Vite) + Tailwind frontend over a modular NestJS backend (auth, reservations, feedback, dashboard, menu-order) with MongoDB and JWT + Passport. The feedback module resolves each reviewer’s name and avatar through populated userId references. Tested at three levels: Jest unit specs for service and controller, an integration spec, and a Cypress E2E test of the real submission flow.',
    outcome: 'Deployed with the frontend on Vercel and the backend on Railway. The feedback module shipped with a complete test pyramid — it was a testing course, and testing was the point.',
    tech: ['NestJS', 'React', 'MongoDB', 'TypeScript', 'Jest', 'Cypress', 'Tailwind CSS', 'JWT'],
    features: [
      'Table reservations with date and time selection',
      'Menu browsing with rich item details and food ordering',
      'Restaurant-level reviews plus per-menu-item ratings',
      'Homepage reviews section, all-reviews page and add-feedback form',
      'Admin feedback dashboard with reply and delete',
      'Menu CRUD, reservation oversight and order status tracking for admins',
      'Analytics dashboard with feedback summary',
    ],
    highlights: [
      'Two-level feedback data model — restaurant-wide and per-item reviews keyed by menuItemId',
      'Stats computation moved from a React function into a tested backend service',
      'Full test pyramid on one module: unit, integration and browser E2E',
    ],
    githubUrl: 'https://github.com/kiroreda963/restaurant-reservation-system',
    liveUrl: 'https://restaurant-reservation-system-blond.vercel.app',
    liveLabel: 'Live Demo', sourceLabel: 'Source',
    role: 'Feedback & Reviews module owner — schemas, API, UI and the full test suite',
    coverImageUrl: '/uploads/images/b1b76376-36dc-4e70-ad53-8d951315fe1b.png',
    team: link(TM.kiro, TM.kanzy, TM.daniel, TM.seif),
    media: mediaIds('bella-vista-restaurant'), gallery: [],
    category: 'Full-Stack Web', isFeatured: false, status: 'published', position: 4,
    createdAt: now, updatedAt: now,
  },
  {
    _id: new ObjectId(),
    slug: 'java-persistence-lab',
    name: 'Java Persistence Lab — FAB Misr',
    tagline: 'Internship deep-dive through the Java data-access stack: raw JDBC to Hibernate to JPA to a Spring Boot REST API, one layer at a time.',
    problem: 'Modern Java backends stack Spring Data on JPA on Hibernate on JDBC — and using only the top layer makes debugging and performance tuning guesswork.',
    description: 'Six progressive projects built during my backend internship at FAB Misr (First Abu Dhabi Bank), each implementing the same kind of data-driven application one abstraction level higher: hand-rolled JDBC DAOs, Hibernate with XML mappings, vendor-neutral JPA with a University↔Student relationship, and finally a Spring Boot REST API with entities, Spring Data repositories, services, controllers and a data seeder — all against MySQL.',
    architecture: 'Each stage uses the standard patterns of its layer: DAO and connection management on raw JDBC, SessionFactory lifecycle on Hibernate, EntityManager and persistence units on JPA, and controller → service → repository on Spring Boot 3.5 — the same layering I now apply in my NestJS projects.',
    outcome: 'Completed the full progression in one week (August 2025), finishing with a working REST API — the foundation for the schema-first backend work in my later projects.',
    tech: ['Java', 'Spring', 'Hibernate', 'MySQL', 'Maven', 'JPA', 'JDBC'],
    features: [
      'Raw-SQL CRUD through hand-written JDBC DAOs',
      'Hibernate configured via hibernate.cfg.xml and XML entity mappings',
      'JPA persistence unit with a many-to-one University↔Student relationship',
      'Spring Boot REST API with Spring Data repositories, services and seeded data',
      'The same domain re-implemented at every abstraction level',
    ],
    highlights: [
      'Bottom-up learning path — each project removes boilerplate the previous one required, making visible exactly what each framework abstracts away',
      'One entity pair carried from plain JPA into Spring Data to isolate what Spring adds',
    ],
    githubUrl: '', liveUrl: '', liveLabel: 'Live Demo', sourceLabel: 'Source',
    role: 'Intern — built all six stages solo',
    coverImageUrl: `/uploads/images/${MANIFEST.covers.internship.file}`,
    team: [], media: [], gallery: [],
    category: 'Internship', isFeatured: false, status: 'published', position: 5,
    createdAt: now, updatedAt: now,
  },
];

/* ---------------- timeline ---------------- */
const timeline = [
  { year: 'Aug 2025', type: 'work', organization: 'FAB Misr — First Abu Dhabi Bank', topic: 'Backend Engineering Intern',
    body: 'Hands-on internship through the Java data-access stack — JDBC, Hibernate, JPA and Spring Boot against MySQL. Six working projects in one week.' },
  { year: 'Nov 2025 – Jan 2026', type: 'education', organization: 'GIU — Software Testing course', topic: 'Bella Vista — feedback module owner',
    body: 'Owned the feedback module of a five-person NestJS + React app: schemas, API, UI, and its unit, integration and Cypress E2E tests.' },
  { year: 'Dec 2025', type: 'education', organization: 'GIU — Semester 5 software project', topic: 'HR System — payroll self-service',
    body: 'Built the payslip self-service slice of a 20-student modular HR platform: salary schemas, fourteen requirement endpoints and eight Next.js pages across an 18-submodule architecture.' },
  { year: 'May 2026', type: 'achievement', organization: '', topic: 'NYC Collision Studio shipped',
    body: 'Cleaned and merged 2M+ NYC Open Data crash records in Python, then deployed an instant-filter React dashboard with one-click PDF reports on Vercel.' },
  { year: 'May 2026', type: 'achievement', organization: '', topic: 'EventHub goes to production',
    body: 'Rebuilt a university MERN prototype into a deployed ticketing platform — atomic seat booking, multi-tier inventory and OTP password reset over Brevo HTTPS.' },
  { year: 'Jun 2026', type: 'achievement', organization: 'GIU Berlin — Mobile Development', topic: 'SpotWise launched',
    body: 'Built and shipped a full Flutter travel app — maps, Gemini AI trip planner, moderation and push notifications — with CI, tests and a live web demo.' },
].map((t, i) => ({ _id: new ObjectId(), ...t, position: i, isPublished: true, createdAt: now, updatedAt: now }));

/* ---------------- tech (names chosen to match the site's icon mapping) ---------------- */
const TECH = {
  'Languages': ['TypeScript', 'JavaScript', 'Java', 'Python', 'Dart'],
  'Frontend': ['React', 'Next.js', 'Flutter', 'Tailwind CSS', 'Vite'],
  'Backend': ['Node.js', 'NestJS', 'Express', 'Spring'],
  'Databases & Cloud': ['MongoDB', 'MySQL', 'Firebase', 'Vercel', 'Render', 'Railway'],
  'Data & AI': ['pandas', 'NumPy', 'scikit-learn', 'Jupyter'],
  'Testing & Tools': ['Jest', 'Cypress', 'Postman', 'Git', 'GitHub Actions', 'JWT'],
};
const techItems = Object.entries(TECH).flatMap(([category, names], gi) =>
  names.map((name, i) => ({ _id: new ObjectId(), name, category, position: gi * 100 + i, isPublished: true, createdAt: now, updatedAt: now })));

/* ---------------- certificates ---------------- */
const certificates = [{
  _id: new ObjectId(),
  title: 'Backend Engineering Internship — FAB Misr',
  issuer: 'First Abu Dhabi Bank (FAB) Misr',
  issuedAt: 'August 2025',
  credentialUrl: '',
  imageUrl: '/uploads/images/73de9ed2-25f1-4fb2-a75c-d9e7bc222833.jpg',
  description: 'Hands-on backend internship covering Java, JDBC, Hibernate, JPA and Spring Boot against MySQL.',
  position: 0, isPublished: true, createdAt: now, updatedAt: now,
}];

/* ---------------- profile (keeps user's avatar/resume/socials; fills gaps) ---------------- */
const dumpProfile = readBson('profiles.bson')[0];
const profile = {
  ...dumpProfile,
  headlines: ['Full-Stack Developer', 'TypeScript · React · NestJS', 'Flutter & data-driven apps'],
  stats: { yearsCoding: 3, projectsShipped: 6, technologies: 30 },
  aboutCapabilities: (dumpProfile.aboutCapabilities || []).filter(c => !/my name is ramez/i.test(c)),
  aboutFactAcademics: 'B.Sc. Computer Science — GIU',
  aboutFocusKicker: 'Focus',
  aboutFocusTitle: 'What I work on',
  aboutFocusSubtitle: 'Three lanes I keep shipping in.',
  aboutFocusBlocks: [
    { heading: 'Full-stack product work', body: 'React and Next.js frontends over NestJS or Express APIs — typed end to end, with auth, validation and admin dashboards.' },
    { heading: 'Data-heavy interfaces', body: 'Python pipelines feeding fast, pre-computed UIs — two-million-record datasets explored at interactive speed.' },
    { heading: 'Mobile with Flutter', body: 'A full production app: maps, offline storage, push notifications and an AI trip planner.' },
  ],
  heroCTALabel: 'View my work',
  heroSeeking: 'Seeking software engineering internships & junior roles',
  portfolioSubtitle: 'Production-grade projects — built end to end, deployed, and open to inspection.',
  updatedAt: now,
};
delete profile.skills; delete profile.timeline; delete profile.__v;

/* ---------------- media: dump docs (with captions) + spotwise + covers ---------------- */
const dumpMedia = readBson('media.bson').map(m => ({
  ...m,
  _id: oid(String(m._id)),
  projectId: m.projectId ? oid(String(m.projectId)) : undefined,
  caption: m.caption || CAPTIONS_BY_ORIGINAL[m.originalName] || '',
}));
dumpMedia.forEach(m => { delete m.__v; if (m.projectId === undefined) delete m.projectId; });
const allMedia = [...dumpMedia, ...spotMediaDocs, ...coverMediaDocs];

/* ---------------- admin (preserve login) ---------------- */
const admin = readBson('admins.bson')[0];
admin._id = oid(String(admin._id)); delete admin.__v;

/* ---------------- run ---------------- */
(async () => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(); // db name comes from the URI
  console.log('connected to db:', db.databaseName);

  const before = {};
  for (const c of ['projects', 'media', 'teammembers', 'techitems', 'timelineentries', 'certificates', 'profiles', 'admins']) {
    before[c] = await db.collection(c).countDocuments();
  }
  console.log('before:', JSON.stringify(before));

  for (const [name, docs] of [
    ['projects', projects], ['media', allMedia], ['teammembers', teamMembers],
    ['techitems', techItems], ['timelineentries', timeline], ['certificates', certificates],
  ]) {
    await db.collection(name).deleteMany({});
    await db.collection(name).insertMany(docs);
  }
  await db.collection('profiles').replaceOne({ _id: 'singleton' }, profile, { upsert: true });
  const existingAdmin = await db.collection('admins').findOne({ email: admin.email });
  if (!existingAdmin) await db.collection('admins').insertOne(admin);

  const after = {};
  for (const c of Object.keys(before)) after[c] = await db.collection(c).countDocuments();
  console.log('after:', JSON.stringify(after));
  await client.close();
  console.log('SEED COMPLETE');
})().catch(e => { console.error('SEED FAILED:', e.message); process.exit(1); });

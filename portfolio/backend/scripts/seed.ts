import 'dotenv/config';
import 'reflect-metadata';
import mongoose from 'mongoose';
import { ProfileSchema } from '../src/profile/profile.schema';
import { ProjectSchema } from '../src/projects/project.schema';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/ramez_portfolio';

const PROJECTS = [
  {
    slug: 'earlyhub-events-ticketing',
    name: 'EarlyHub — Berlin Events Ticketing',
    tagline:
      'Multi-tier ticketing platform for concerts, theatre, sports, and conferences in Berlin.',
    description:
      'A full-stack MERN application that lets visitors discover events in Berlin and book tickets in seconds. Three roles (Standard User, Organizer, System Admin), JWT-in-cookie auth with OTP password recovery, multi-tier tickets, theater seat selection, an outlets directory, and a complete admin dashboard.',
    architecture:
      'React 18 (Vite) frontend with Tailwind CSS and React Router 6, talking to a Node.js + Express + Mongoose backend. JWT in httpOnly cookie for auth; nodemailer for OTP delivery; Mongo transactions for booking integrity with a graceful fallback for standalone Mongo.',
    tech: ['React', 'Vite', 'Tailwind', 'Node.js', 'Express', 'Mongoose', 'MongoDB', 'JWT'],
    features: [
      'Browse and filter events by name, category, date, location',
      'Multi-tier ticket booking (general / VIP / orchestra / etc.)',
      'Theater seat picker prevents double-booking',
      'Organizer analytics with bar/pie charts (Recharts)',
      'Admin event approval workflow',
      'OTP password recovery via email (3-step wizard)',
    ],
    githubUrl: 'https://github.com/RamezMilad-1/events-ticketing-system-berlin',
    liveUrl: 'http://localhost:4002',
    role: 'Full-stack developer',
    isFeatured: true,
    status: 'published',
    position: 0,
    folderPath: 'projects/events-ticketing-system-berlin',
  },
  {
    slug: 'nyc-collision-studio',
    name: 'NYC Collision Studio',
    tagline:
      'Interactive analysis of NYC motor vehicle collisions with downloadable PDF reports.',
    description:
      'End-to-end data engineering and analysis project on NYC Open Data. Cleaned and merged the Crashes and Persons datasets via Jupyter, then built a single-page React + Plotly application that lets users explore patterns, contributing factors, and temporal trends and export findings as PDF.',
    architecture:
      'Pipeline: raw NYC Open Data → Jupyter notebooks for cleaning + merging on COLLISION_ID → JSONL exports for the web. React 19 (Vite) front end uses Plotly.js and Recharts for visuals and html2pdf.js for client-side PDF generation. Pre-aggregations are computed at build time via a Node script for fast load.',
    tech: ['React', 'Vite', 'Plotly', 'Recharts', 'Jupyter', 'Python', 'TypeScript'],
    features: [
      'Interactive dashboards on cleaned NYC collision data',
      'Filtering by borough, vehicle type, factor, time of day',
      'Client-side PDF export of selected views',
      'Pre-computed aggregations for sub-second load',
    ],
    githubUrl: 'https://github.com/RamezMilad-1/NYC-Collision-Studio',
    liveUrl: 'https://nyc-collision-studio.vercel.app',
    role: 'Solo developer',
    isFeatured: true,
    status: 'published',
    position: 1,
    folderPath: 'projects/nyc-collision-studio',
  },
  {
    slug: 'bella-vista-restaurant',
    name: 'Bella Vista — Restaurant Reservation System',
    tagline:
      'End-to-end reservation, menu, and order management for a fictitious restaurant.',
    description:
      'Bella Vista lets diners browse the menu, book tables with date/time selection, place orders, and leave reviews; admins manage menu, reservations, orders, and feedback through a dedicated dashboard. Built as a team project with React 19, NestJS, and MongoDB. Cypress covers the critical user flows.',
    architecture:
      'React 19 (Vite) + Tailwind front end calls a NestJS backend organized into auth, dashboard, menu-order, reservations, and feedback modules. JWT + Passport for auth. MongoDB via Mongoose. Cypress E2E suite. Vercel + Railway for production deployment.',
    tech: ['React', 'Vite', 'Tailwind', 'NestJS', 'MongoDB', 'Mongoose', 'JWT', 'Cypress'],
    features: [
      'User auth with login + registration',
      'Menu browsing with rich item details',
      'Table reservations with date/time selection',
      'Order placement and tracking',
      'Feedback + ratings',
      'Admin dashboard with analytics',
      'Cypress E2E coverage',
    ],
    githubUrl: 'https://github.com/kiroreda963/restaurant-reservation-system',
    liveUrl: 'http://localhost:4004',
    role: 'Full-stack developer (team project)',
    isFeatured: true,
    status: 'published',
    position: 2,
    folderPath: 'projects/restaurant-reservation-system',
  },
  {
    slug: 'hr-system-semester-5',
    name: 'HR System — Semester 5 Software Project',
    tagline:
      'Enterprise-grade HR platform: profiles, leaves, payroll, performance, recruitment, time-management.',
    description:
      'Most ambitious project to date. A modular HR system covering employee profiles, change-request workflows, leaves, payroll (configuration / execution / tracking), performance, recruitment, and time-management. Architected as 18 git submodules so each module is an independent repo with its own history. Built as a team under the WefhLNUE organization.',
    architecture:
      'Next.js 16 + React 19 + Tailwind 4 frontend talks to a NestJS 11 backend via Axios + TanStack Query. Mongoose schemas in MongoDB. JWT-in-cookie auth with role-based access (Employee, Department Head, HR Admin, System Admin). DocuSeal integration for e-signatures, PDFKit for generated documents. The entire codebase is organized as 18 git submodules — 9 backend modules + 9 corresponding frontend modules — each in its own repo for independent ownership.',
    tech: [
      'Next.js',
      'React',
      'Tailwind',
      'TypeScript',
      'TanStack Query',
      'Axios',
      'NestJS',
      'MongoDB',
      'Mongoose',
      'JWT',
      'PDFKit',
      'DocuSeal',
    ],
    features: [
      'Employee self-service profile (view + edit + change requests)',
      'Manager team views with privacy boundaries',
      'HR Admin profile editing + role assignment',
      'Configurable workflow approval rules',
      'Leaves management',
      'Payroll configuration / execution / tracking',
      'Performance reviews',
      'Recruitment pipeline',
      'Time management',
      'E-signature via DocuSeal',
      'PDF generation for letters and reports',
    ],
    githubUrl: 'https://github.com/WefhLNUE/semester-5-software-project',
    liveUrl: 'http://localhost:4006',
    role: 'Full-stack developer (team project, multiple modules)',
    isFeatured: true,
    status: 'published',
    position: 3,
    folderPath: 'projects/semester-5-software-project',
  },
];

async function run() {
  console.log(`[seed] connecting to ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const Profile = mongoose.model('Profile', ProfileSchema);
  const Project = mongoose.model('Project', ProjectSchema);

  // Profile (singleton)
  const profile = await Profile.findById('singleton').exec();
  if (!profile) {
    await Profile.create({
      _id: 'singleton',
      displayName: 'Ramez Milad',
      headline: '3rd-year Computer Science student · Software Engineering major',
      bio: 'Full-stack developer with a focus on TypeScript, React, NestJS, and modern data-heavy interfaces. I build production-grade student projects that ship.',
      email: '',
      socials: {
        github: 'https://github.com/RamezMilad-1',
        linkedin: '',
      },
      skills: [
        {
          category: 'Frontend',
          items: [
            { name: 'React', level: 'advanced' },
            { name: 'Next.js', level: 'advanced' },
            { name: 'TypeScript', level: 'advanced' },
            { name: 'Tailwind CSS', level: 'advanced' },
            { name: 'TanStack Query', level: 'intermediate' },
          ],
        },
        {
          category: 'Backend',
          items: [
            { name: 'Node.js', level: 'advanced' },
            { name: 'NestJS', level: 'advanced' },
            { name: 'Express', level: 'advanced' },
            { name: 'JWT auth', level: 'advanced' },
            { name: 'REST API design', level: 'advanced' },
          ],
        },
        {
          category: 'Data',
          items: [
            { name: 'MongoDB / Mongoose', level: 'advanced' },
            { name: 'Python (data engineering)', level: 'intermediate' },
            { name: 'Plotly / Recharts', level: 'intermediate' },
          ],
        },
        {
          category: 'Tooling',
          items: [
            { name: 'Git / submodules', level: 'advanced' },
            { name: 'Vite', level: 'advanced' },
            { name: 'Cypress', level: 'intermediate' },
            { name: 'Vercel / Railway', level: 'intermediate' },
          ],
        },
      ],
      timeline: [
        { year: '2024', title: 'Started 3rd year — Software Engineering major' },
        { year: '2024', title: 'Built EarlyHub events platform (MERN, JWT, OTP)' },
        { year: '2025', title: 'Shipped NYC Collision Studio to Vercel' },
        { year: '2025', title: 'Co-built Bella Vista restaurant system (React + NestJS)' },
        { year: '2026', title: 'Co-built HR System — 18-submodule modular architecture' },
      ],
    });
    console.log('[seed] profile created');
  } else {
    console.log('[seed] profile already exists, skipping');
  }

  // Projects
  for (const p of PROJECTS) {
    const existing = await Project.findOne({ slug: p.slug }).exec();
    if (existing) {
      console.log(`[seed] project '${p.slug}' exists, skipping`);
      continue;
    }
    await Project.create(p);
    console.log(`[seed] inserted '${p.slug}'`);
  }

  await mongoose.disconnect();
  console.log('[seed] done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

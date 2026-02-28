# CivicSens

**Report civic issues. AI prioritizes. City acts.**

CivicSens is an AI-driven civic triage platform: citizens submit infrastructure reports (potholes, leaks, hazards), and the system classifies and scores each ticket so municipal staff can respond to the right things first.

---

## Demo

**Live app:** [CivicSens on Vercel](https://civic-sens.vercel.app/)

- **Landing:** Clear value proposition, problem, who it’s for, and one strong differentiator (AI classification).
- **User flow:** Log in with email → submit reports (optional photo) → get ticket ID → track status.
- **Admin flow:** Log in with email + password → dashboard with live ledger, status updates, and hotspot view.

---

## Problem statement

Citizens report potholes, water leaks, and safety hazards through scattered channels (phone, email, paper). Tickets land in generic queues with no clear priority, so urgent issues get the same treatment as routine ones. Municipal staff lack a single view of what’s critical and where.

**CivicSens** gives:

1. **One place** for citizens to submit and track reports.
2. **AI classification and priority scoring** so every ticket gets a category (e.g. Infrastructure, Emergency) and priority (P1–P3) from the description.
3. **A single dashboard** for staff to triage, update status, and see hotspots.

---

## Features

| Area | Feature |
|------|--------|
| **Landing** | Hero, problem/solution, who it’s for, differentiator (AI + priority), CTAs to Report and Admin. |
| **Auth** | Email-based user login; email + password admin login. Session via httpOnly cookie (signed). |
| **Reports** | Submit description + optional photo; AI category/priority/estimated response time; ticket ID returned. |
| **Tracker** | Look up status by ticket ID (Submitted → Verified → Dispatched → Resolved). |
| **Admin** | Live ledger, filter/search, status dropdowns, radar-style hotspot panel, theme toggle. |
| **Production feel** | Loading states, error states, empty states, success toasts, form validation (required description), responsive layout. |

---

## Tech stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, Lucide icons |
| **Backend** | Next.js API routes (auth, reports, uploads) |
| **Data** | Supabase (PostgreSQL + Storage) |
| **Auth** | Custom session (HMAC-signed cookie, `AUTH_SECRET`), env-based admin credentials |
| **Deploy** | Vercel |

---

## Architecture

```mermaid
flowchart LR
  subgraph Client
    A[Landing /]
    B[Login]
    C[Dashboard]
    D[Admin]
  end

  subgraph API
    E[/api/auth/login]
    F[/api/auth/logout]
    G[/api/reports]
    H[/api/uploads]
  end

  subgraph Data
    I[(Supabase PG)]
    J[(Storage)]
  end

  A --> B
  B --> E
  B --> C
  B --> D
  C --> G
  C --> H
  D --> I
  E --> F
  G --> I
  H --> J
```

- **Landing (`/`):** Public; explains problem, audience, and AI differentiator; CTAs to login.
- **Login (`/login`):** User (email) or Admin (email + password). Sets httpOnly session cookie.
- **Dashboard (`/dashboard`):** Protected (user session). Submit reports (optional image via `/api/uploads`), query reports; report creation and image URL stored via `/api/reports` and Supabase.
- **Admin (`/admin`):** Protected (admin session). Reads/updates `reports` via Supabase client; live ledger and status updates.

---

## Screenshots

| View | Description |
|------|-------------|
| **Landing** | Hero line, problem/who it’s for, AI differentiator section, CTAs. |
| **Login** | User vs Admin toggle, email (and password for admin), themed form. |
| **Dashboard** | Report form (description + optional image), tracker sidebar, success modal and toasts. |
| **Admin** | Sidebar nav, metric cards, live ledger table, status dropdowns, radar/hotspot panel. |

*(Add actual screenshots under `docs/screenshots/` or embed in this section.)*

---

## Setup

**Full credentials reference:** [docs/CREDENTIALS.md](docs/CREDENTIALS.md)

### 1. Clone and install

```bash
git clone <repo-url>
cd myapp
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `AUTH_SECRET` | Yes | Long random string for signing session cookies |
| `ADMIN_EMAIL` | For admin | Admin login email |
| `ADMIN_PASSWORD` | For admin | Admin login password |
| `SUPABASE_SERVICE_ROLE_KEY` | For uploads/inserts | Server-only; used for storage and report inserts |
| `SUPABASE_REPORT_IMAGES_BUCKET` | No | Default: `report-images` |

### 3. Supabase

- Create a **Storage** bucket (e.g. `report-images`). Make it **public** if you want image URLs to work for previews.
- Ensure the `reports` table exists (e.g. `ticket_id`, `category`, `description`, `image_url`, `status`, `priority_level`, `risk_assessment`, `latitude`, `longitude`, `created_at`, `updated_at`). Optional: `reporter_email`.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Get started** for user login and **Admin login** for admin.

---

## Project overview (for recruiters)

- **What it is:** A full-stack civic reporting app with role-based access (citizen vs admin), AI-driven classification, and a production-style UI (loading/error/empty states, toasts, validation).
- **Differentiator:** One strong feature—**AI classification and priority scoring**—applied to every report so staff can triage by urgency and category.
- **Docs:** This README covers problem, features, tech stack, architecture, demo, and setup so the repo stands on its own.

---

*CivicSens — built with Next.js, Supabase, and Tailwind. Author: [@prtyxydv](https://github.com/prtyxydv).*

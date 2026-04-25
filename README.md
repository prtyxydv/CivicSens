# CivicSens 🏛️

**Bridging the gap between citizens and city hall with AI-driven triage.**
A dual-platform solution for real-time civic reporting and municipal workforce management.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://civic-sens.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blue)](https://supabase.com/)

---

## 🚀 Overview
CivicSens is an AI-driven civic triage platform designed to solve the "Inbox Zero" problem for municipal authorities. While citizens submit infrastructure reports (potholes, leaks, hazards), the system automatically classifies and scores each ticket so staff can prioritize critical emergencies over routine maintenance.

> **Note:** A previous iteration of this platform was successfully acquired/sold, demonstrating its real-world utility and market potential.

---

## 🔑 Explore the Admin Dashboard
I have provided a guest account so recruiters and developers can see the **Admin Experience** without needing to register.

* **URL:** [civic-sens.vercel.app/admin](https://civic-sens.vercel.app/admin)
* **Username:** `admin@civicsens.com`
* **Password:** `ABC12345`

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS 4, Lucide Icons |
| **Backend** | Next.js API Routes (Serverless) |
| **Database** | Supabase (PostgreSQL) + Row Level Security (RLS) |
| **Auth** | Custom session (HMAC-signed httpOnly cookies) |
| **Storage** | Supabase Storage (for report images) |
| **Deployment** | Vercel |

---

## ✨ Features
### 🏙️ For Citizens
* **Rapid Reporting:** Submit issues with descriptions and optional photo uploads.
* **Live Tracker:** Look up the status of a report using a unique Ticket ID (Submitted → Verified → Dispatched → Resolved).
* **Responsive Design:** Fully optimized for mobile users reporting on the go.

### 👮 For Admin (The "Brain")
* **AI-Priority Engine:** Tickets are auto-scored (P1-P3) to ensure high-risk hazards are handled first.
* **Live Ledger:** A production-style dashboard to triage, search, and update ticket statuses in real-time.
* **Hotspot View:** Radar-style panel to identify geographical clusters of recurring issues.

---

## 🏗️ Architecture & Security
* **Server-Side Security:** Secure operations (like report inserts and storage) are handled via the `SUPABASE_SERVICE_ROLE_KEY` to prevent client-side data tampering.
* **Secure Auth:** Admin sessions are managed via `AUTH_SECRET` signed cookies, mitigating XSS and session hijacking risks.
* **Production Feel:** Includes loading states, error handling, success toasts, and empty-state handling for a seamless UX.

---

## 📸 Screenshots
<p align="center">
  <img src="https://github.com/user-attachments/assets/59e86b8a-e904-443b-8919-afd3f56a5ccd" alt="CivicSens Dashboard" width="800">
  <br>
  <i>The Unified Reporting Dashboard: Combining reporting and tracking in one clean UI.</i>
</p>

---

## ⚙️ Local Setup

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/prtyxydv/CivicSens.git](https://github.com/prtyxydv/CivicSens.git)
   cd CivicSens
   npm install

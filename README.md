# 🏛️ CivicSens: AI-Driven Municipal Triage & Reporting
**A Full-Stack SaaS Solution bridging the gap between Citizens and City Governance.**

[![Live Demo](https://img.shields.io/badge/Demo-Live_on_Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://civic-sens.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_15-Framework-000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-UI-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 💡 The Problem & The Vision
Most civic reporting tools are "black holes"—tickets go in, but priority is lost in a massive queue. **CivicSens** was built to solve the **Triage Crisis**. By using automated classification and risk assessment, we ensure that a hazardous infrastructure failure is prioritized over a cosmetic request.

> **✨ Proven Success:** An earlier iteration of this logic was successfully acquired/sold, demonstrating market viability and real-world demand.

---

## 🔑 Admin Showcase (Access for Recruiters)
I have built a dedicated **Admin Command Center** to demonstrate workforce management logic. 
* **URL:** [civic-sens.vercel.app/admin](https://civic-sens.vercel.app/admin)
* **Username:** `admin@civicsens.com` | **Password:** `ABC12345`

---

## 🛠️ System Architecture & Modules

### 1. Citizen Portal (Reporting & Tracking)
* **Dynamic Form Submission:** Supports descriptions and multi-part data handling.
* **Smart Ticket ID Generation:** Instant tracking code for transparency.
* **Status Look-up:** Real-time state updates (Submitted → Verified → Dispatched → Resolved).

### 2. Admin Command Center (The Engine)
* **AI-Triage Ledger:** Automatically assigns **Priority Levels (P1-P3)** based on issue severity.
* **Hotspot Analysis:** Radar-style panel to identify geographical clusters of high-volume reports.
* **Status Management:** Secure dropdowns to update the lifecycle of a ticket in the PostgreSQL database.

### 3. Security & Scalability
* **Auth:** Custom HMAC-signed `httpOnly` cookies for secure admin sessions.
* **Database:** Integrated with **Supabase (PostgreSQL)** using Row Level Security (RLS).
* **Storage:** Image handling via Supabase Storage buckets for visual proof of issues.

---

## 💻 Tech Stack Deep Dive
* **Frontend:** Next.js 15 (App Router) for Server-Side Rendering (SSR) and SEO.
* **Styling:** Tailwind CSS 4 for a modern, responsive "Glassmorphism" UI.
* **Backend:** Next.js API Routes (Serverless) for lean, high-speed execution.
* **Dev Tools:** Lucide Icons, React 19, Git/GitHub for version control.

---

## 📸 Visual Walkthrough
<p align="center">
  <img src="https://github.com/user-attachments/assets/59e86b8a-e904-443b-8919-afd3f56a5ccd" alt="CivicSens Interface" width="900" style="border-radius: 10px; border: 1px solid #ddd;">
  <br>
  <i>The Unified Reporting Dashboard: Combining the simplicity of reporting with the power of tracking.</i>
</p>

---

## 🚀 Evolution & Future Roadmap
This project is in active development. I am currently refactoring the core to handle higher user loads.
- [x] **Phase 1:** MVP with Firebase (Sold)
- [x] **Phase 2:** Full-stack migration to Next.js + Supabase (Current)
- [ ] **Phase 3:** Integration of a Mapbox/Google Maps API for Heatmap visualization.
- [ ] **Phase 4:** Automated Email/SMS notifications for status changes.

---

## ⚙️ How to Run Locally
1. **Clone:** `git clone https://github.com/prtyxydv/CivicSens.git`
2. **Install:** `npm install`
3. **Configure:** Set up `.env.local` with your Supabase keys (Ref: `docs/CREDENTIALS.md`).
4. **Launch:** `npm run dev`

---

## 📬 Let's Connect
I am currently seeking **Summer Internship 2026** opportunities in **Full-Stack Development** or **Data Science**.
* **GitHub:** [@prtyxydv](https://github.com/prtyxydv)
* **LinkedIn:** [https://www.linkedin.com/in/pratyaksh-yadav-526485367/]

---
*Built with ❤️ to improve city life through technology.*

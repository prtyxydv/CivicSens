# CivicSens – Credentials & setup

Copy `.env.example` to `.env.local` and fill in real values. **Never commit `.env.local`.**

---

## Required variables

| Variable | Where to get it | Example (placeholder) |
|----------|-----------------|------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public | `eyJhbGciOiJIUzI1NiIs...` |
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` (or any 32+ char secret) | `a1b2c3d4e5...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role (secret) | `eyJhbGciOiJIUzI1NiIs...` |

---

## Admin login (optional but recommended)

| Variable | Purpose | Example |
|----------|---------|---------|
| `ADMIN_EMAIL` | Email used for admin login at `/login?role=admin` | `admin@example.com` |
| `ADMIN_PASSWORD` | Password for that admin user | `YourSecurePassword123` |

If these are missing, admin login will return a 500 error.

---

## Optional

| Variable | Purpose | Default |
|----------|---------|---------|
| `SUPABASE_REPORT_IMAGES_BUCKET` | Storage bucket name for report images | `report-images` |

---

## Supabase setup

1. **Database:** Ensure table `reports` exists with columns: `id`, `ticket_id`, `category`, `description`, `image_url`, `status`, `priority_level`, `risk_assessment`, `latitude`, `longitude`, `created_at`, `updated_at`. Optional: `reporter_email`.
2. **Storage:** Create a bucket (e.g. `report-images`). Make it **public** if you want report image URLs to load in the app.
3. **RLS:** Server uses `SUPABASE_SERVICE_ROLE_KEY` for uploads and report inserts, so RLS can stay strict for anon; service role bypasses RLS.

---

## Quick start

```bash
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

Open `http://localhost:3000` → Get started → login with any email (user) or admin email + password (admin).

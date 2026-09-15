# HostelHub 🏨

> **Connect. Report. Improve.**
>
> A production-ready hostel management platform for college students and management.

---

## Overview

HostelHub allows students to report maintenance complaints, track their resolution in real-time, and rate daily mess food quality — all from their mobile phones. Management can view, assign, and resolve complaints from an admin dashboard backed by a real PostgreSQL database.

---

## Features

### Student
- 🔐 Secure login with session persistence
- 📋 Submit maintenance complaints with photo upload
- 🔢 Unique complaint tracking number (e.g. `HH-2026-00125`)
- 📊 Real-time status timeline with full audit history
- ✅ Resolution verification + reopen if not solved
- 🍛 Daily mess ratings (Breakfast / Lunch / Dinner)
- 🔔 In-app notifications for every status change
- 👤 Editable profile

### Admin
- 📊 Live dashboard with real complaint/mess statistics
- 🔍 Search, filter, sort all complaints
- 👨‍🔧 Assign staff to complaints (auto-notifies student)
- 📝 Update complaint status with audit trail
- 🍽️ Mess analytics — average ratings, trends, recent reviews
- 👥 Student and staff management

### Security
- JWT authentication (7-day sessions)
- bcrypt password hashing (12 rounds)
- Role-based route protection (student / admin)
- Students cannot access another student's data
- All secrets in environment variables (never hardcoded)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Auth | JWT + bcrypt (custom, server-side) |
| Charts | Recharts |
| Icons | Lucide React |

---

## Project Structure

```
MCS Hostel/
├── client/           # Vite + React frontend
│   ├── src/
│   │   ├── pages/    # student/ and admin/ pages
│   │   ├── layouts/  # StudentLayout, AdminLayout
│   │   ├── components/
│   │   ├── contexts/ # AuthContext
│   │   ├── services/ # api.ts (axios)
│   │   └── types/    # TypeScript types
│   ├── .env          # VITE_API_URL
│   └── .env.example
├── server/           # Express API
│   ├── src/
│   │   ├── routes/   # auth, complaints, mess, notifications, admin, upload
│   │   ├── db/       # supabase.ts client, seed.ts
│   │   └── middleware/
│   ├── .env          # JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
│   └── .env.example
└── supabase/         # Database setup
    ├── schema.sql    # Tables, indexes, triggers
    ├── seed.sql      # Development demo data
    └── rls.sql       # Row Level Security policies
```

---

## Environment Variables

### server/.env

```env
PORT=3001
JWT_SECRET=your_super_strong_secret_key_min_32_chars
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### client/.env

```env
VITE_API_URL=http://localhost:3001
```

---

## Supabase Setup

### 1. Create a Supabase project

Go to [https://supabase.com](https://supabase.com) → New Project → Choose a region close to your users.

### 2. Run the schema

In the Supabase dashboard → **SQL Editor** → New query → paste contents of `supabase/schema.sql` → Run.

### 3. Create the Storage bucket

In the Supabase dashboard → **Storage** → New bucket:
- Name: `complaint-photos`
- Public: ✅ (checked)

Or run in SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-photos', 'complaint-photos', true);
```

### 4. (Optional) Run RLS policies

Paste `supabase/rls.sql` in SQL Editor and run. This is for future direct frontend access — the current Express server bypasses RLS using the service-role key.

### 5. Get your credentials

Supabase dashboard → **Settings** → **API**:
- **Project URL** → `SUPABASE_URL`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Database Setup

The schema creates these tables:
- `profiles` — users (students + admins)
- `staff` — maintenance staff
- `complaints` — maintenance complaints
- `complaint_status_history` — full audit trail
- `complaint_feedback` — student resolution verification
- `mess_reviews` — daily meal ratings
- `notifications` — in-app notification system

---

## Local Development

### Prerequisites
- Node.js 18+
- A Supabase project (see above)

### Setup

```bash
# 1. Clone/open the project
cd "MCS Hostel"

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Configure server environment
cp server/.env.example server/.env
# Edit server/.env with your Supabase credentials and JWT_SECRET

# 4. Run schema in Supabase SQL Editor
# (paste supabase/schema.sql)

# 5. Seed with demo data (optional)
cd server && npm run seed
# OR paste supabase/seed.sql in Supabase SQL Editor

# 6. Start the server
cd server && npm run dev

# 7. Start the client (in a new terminal)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Accounts & Authentication

HostelHub uses passwordless **Email OTP Authentication** dispatched via Gmail SMTP:

| Role | Email | Access |
|---|---|---|
| Admin | `hostelhub.support@gmail.com`, `akashstar321123@gmail.com` | Opens Admin Panel (`/admin`) directly |
| Student | Any valid student email | Student Dashboard (`/student`) after onboarding |
| Demo Student | `student@hostelhub.demo` | Student Dashboard (`/student`) |
| Demo Admin | `admin@hostelhub.demo` | Admin Dashboard (`/admin`) |

---

## Developer

Developed & Maintained by **Shubham Gupta**.
- **WhatsApp**: [+91 9118111575](https://wa.me/919118111575)
- **Email**: hostelhub.support@gmail.com

---

## Admin Role Setup

To make a user an admin, update their role in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'their@email.com';
```

Or in the Supabase Table Editor → profiles → find user → edit role field.

---

## Production Build

```bash
# Build client
cd client && npm run build
# Output: client/dist/

# Build server
cd server && npm run build
# Output: server/dist/
```

For production:
- Set `NODE_ENV=production` in server environment
- Set `VITE_API_URL` to your production API URL before building client
- Deploy `client/dist/` to a static host (Vercel, Netlify, etc.)
- Deploy `server/` to a Node.js host (Railway, Render, Fly.io, etc.)

---

## Database Security

- The Express server uses the **service-role key** and runs all queries server-side
- The service-role key is **never** exposed to the browser
- Passwords are hashed with bcrypt (12 rounds)
- JWTs expire after 7 days
- RLS policies in `supabase/rls.sql` provide a secondary defense layer

---

## API Reference (Quick)

```
POST   /api/auth/login              Login
POST   /api/auth/register           Register student
GET    /api/auth/me                 Get current user
PATCH  /api/auth/profile            Update profile
POST   /api/auth/change-password    Change password

GET    /api/complaints              List complaints (filtered)
POST   /api/complaints              Submit complaint
GET    /api/complaints/:id          Get complaint detail
GET    /api/complaints/:id/history  Status history
PATCH  /api/complaints/:id/status   Update status (admin)
POST   /api/complaints/:id/feedback Student resolution feedback

POST   /api/mess/reviews            Submit mess review
GET    /api/mess/today              Today's mess summary
GET    /api/mess/analytics          Analytics (admin)

GET    /api/notifications           Get user notifications
PATCH  /api/notifications/read-all  Mark all read

GET    /api/admin/stats             Dashboard statistics
GET    /api/admin/staff             Staff list
PATCH  /api/admin/complaints/:id/assign  Assign staff

POST   /api/upload/complaint-photo  Upload image to Supabase Storage
```

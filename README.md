# Space2Standard Carpentry & Admin Dashboard

Space2Standard is a premium, full-stack carpentry business website designed for showcasing artisanal craftsmanship and managing a bespoke furniture collection.

## 🏗️ Project Overview

- **Public Storefront:** 3D Hero scene (Three.js), dynamic product catalog, announcements marquee, and artisanal checkout flow.
- **Admin Dashboard:** Secure management portal with real-time KPI cards, full CRUD for products and announcements, image uploads to Supabase Storage, and order status management.
- **Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, and Supabase.

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd space2standard
npm install
```

### 2. Supabase Setup

1.  **Create a New Project:** Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Database Schema:** Run the SQL provided in `supabase/schema.sql` in the Supabase SQL Editor to initialize your tables and RLS policies.
3.  **Storage Buckets:** Create two public storage buckets named `products` and `announcements` in the Supabase Storage dashboard.
4.  **Realtime:** Enable Realtime for the `orders` table in the Database settings (Replication) to receive new order notifications in the dashboard.

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Admin Access

To access the admin dashboard at `/admin`, you must:
1.  Sign up a user via the Supabase Auth dashboard or through your site.
2.  In the `profiles` table, update the user's `role` to `'admin'`.
3.  Login at `/admin/login`.

### 5. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to view the public site.

## 🎨 Design System

- **Primary Background:** `#1a1a2e` (Deep Charcoal)
- **Accent Gold:** `#c9a84c` (Prices, CTAs)
- **Warm Cream:** `#e8d5b7` (Primary Text)
- **Typography:** Cormorant Garamond (Headings), Inter (Body)

## 📦 Key Commands

- `npm run dev`: Start development server.
- `npm run build`: Create an optimized production build.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint to check for code quality issues.

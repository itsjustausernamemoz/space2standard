# Space2Standard — Luxury Artisan E-Commerce

A high-end, bespoke e-commerce platform and admin dashboard for **Space2Standard**, a luxury carpentry business. Built with React, Vite, and Supabase.

## 🏗️ Project Structure

```text
├── apps/
│   ├── storefront/      # Public-facing luxury shop (Vite + React)
│   └── dashboard/       # Protected admin management suite (Vite + React)
├── shared/              # Shared TypeScript types and utility functions
└── supabase/            # Database schema, RLS policies, and Edge Functions
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Supabase CLI (optional, but recommended for Edge Functions)

### 2. Environment Setup
Create a `.env` file in both `apps/storefront` and `apps/dashboard` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Setup
1. Create a new Supabase project.
2. Execute the contents of `supabase/schema.sql` in the Supabase SQL Editor.
3. Set up the `product-images` storage bucket (Public).

### 4. Installation & Development

```bash
# Install dependencies for both apps
cd apps/storefront && npm install
cd ../dashboard && npm install

# Run Storefront
cd apps/storefront && npm run dev

# Run Dashboard
cd apps/dashboard && npm run dev
```

## 💎 Design Philosophy

### Storefront
- **Aesthetic**: Luxury, minimal, and persuasive.
- **Typography**: Playfair Display (Headings) & Inter (Body).
- **Palette**: Walnut (#3d2314), Gold (#c9a84c), Cream (#f5f0e8).

### Admin Dashboard
- **Aesthetic**: Professional dark mode suite.
- **Palette**: Charcoal (#121212), Success Gold (#c9a84c).

## 🛠️ Tech Stack

- **Frontend**: Vite, React 19, Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions).
- **Reporting**: Recharts for analytics, @react-pdf/renderer for document generation.

## 📜 License
Privately developed for Space2Standard.

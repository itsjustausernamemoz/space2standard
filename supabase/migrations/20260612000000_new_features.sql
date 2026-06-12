-- ============================================================
-- Space2Standard — New Features Migration (2026-06-12)
-- Paste in Supabase SQL Editor to apply
-- ============================================================

-- Production Jobs: track items through manufacturing stages
create table if not exists production_jobs (
  id           uuid default gen_random_uuid() primary key,
  order_id     uuid references orders(id) on delete set null,
  product_name text not null,
  client_name  text,
  stage        text not null default 'queued',
  -- queued | materials | cutting | assembly | finishing | qc | ready | delivered
  priority     text not null default 'normal',
  -- low | normal | high | urgent
  assigned_to  text,
  quantity     integer not null default 1,
  due_date     date,
  notes        text,
  started_at   timestamptz,
  completed_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Suppliers: vendors who supply raw materials
create table if not exists suppliers (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  contact_name  text,
  email         text,
  phone         text,
  address       text,
  materials     text,
  payment_terms text,
  notes         text,
  is_active     boolean not null default true,
  created_at    timestamptz default now()
);

-- Purchase Orders: orders placed to suppliers for raw materials
create table if not exists purchase_orders (
  id                uuid default gen_random_uuid() primary key,
  supplier_id       uuid references suppliers(id) on delete set null,
  po_number         text,
  status            text not null default 'draft',
  -- draft | sent | received | partial | cancelled
  items             jsonb not null default '[]',
  total_amount      numeric(12,2) not null default 0,
  expected_delivery date,
  notes             text,
  created_at        timestamptz default now()
);

-- Expenses: operational cost tracking
create table if not exists expenses (
  id           uuid default gen_random_uuid() primary key,
  category     text not null,
  -- Materials | Labor | Utilities | Transport | Marketing | Rent | Equipment | Other
  description  text not null,
  amount       numeric(12,2) not null,
  expense_date date not null default current_date,
  supplier_id  uuid references suppliers(id) on delete set null,
  receipt_url  text,
  notes        text,
  created_at   timestamptz default now()
);

-- Appointments: client meetings, site visits, deliveries
create table if not exists appointments (
  id                 uuid default gen_random_uuid() primary key,
  client_name        text not null,
  client_email       text,
  client_phone       text,
  type               text not null default 'consultation',
  -- consultation | site_visit | delivery | showroom | follow_up
  appointment_date   date not null,
  appointment_time   time not null,
  duration_minutes   integer not null default 60,
  status             text not null default 'scheduled',
  -- scheduled | confirmed | completed | cancelled | no_show
  notes              text,
  order_id           uuid references orders(id) on delete set null,
  created_at         timestamptz default now()
);

-- ── RLS ──────────────────────────────────────────────────────

alter table production_jobs  enable row level security;
alter table suppliers        enable row level security;
alter table purchase_orders  enable row level security;
alter table expenses         enable row level security;
alter table appointments     enable row level security;

create policy "Auth manage production_jobs"
  on production_jobs for all to authenticated using (true) with check (true);

create policy "Auth manage suppliers"
  on suppliers for all to authenticated using (true) with check (true);

create policy "Auth manage purchase_orders"
  on purchase_orders for all to authenticated using (true) with check (true);

create policy "Auth manage expenses"
  on expenses for all to authenticated using (true) with check (true);

create policy "Auth manage appointments"
  on appointments for all to authenticated using (true) with check (true);

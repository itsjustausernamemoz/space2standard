-- ============================================================
-- Space2Standard — Full Database Schema (v2)
-- Run this against a fresh Supabase project ONCE.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  role        text check (role in ('admin', 'customer')) default 'customer',
  full_name   text,
  email       text,
  phone       text,
  created_at  timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Admin full access profiles"
  on profiles for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. PRODUCTS
-- ─────────────────────────────────────────────────────────────
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text,
  description     text,
  dimensions      text,
  materials       text,
  price           numeric(10,2) not null check (price >= 0),
  discount_type   text check (discount_type in ('percent', 'fixed')),
  discount_value  numeric(10,2) check (discount_value >= 0),
  stock_quantity  int default 0 check (stock_quantity >= 0),
  is_published    boolean default false,
  is_featured     boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table products enable row level security;

create policy "Public can view published products"
  on products for select using (is_published = true);

create policy "Admin full access products"
  on products for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 3. PRODUCT IMAGES
-- ─────────────────────────────────────────────────────────────
create table if not exists product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid references products(id) on delete cascade,
  storage_url  text not null,
  is_primary   boolean default false,
  sort_order   int default 0
);

alter table product_images enable row level security;

create policy "Public can view product images"
  on product_images for select using (true);

create policy "Admin full access product images"
  on product_images for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 4. ORDERS
-- ─────────────────────────────────────────────────────────────
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text,
  delivery_address  text,
  special_notes     text,
  status            text check (status in ('new','contacted','in_progress','completed','cancelled')) default 'new',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table orders enable row level security;

-- Anyone can submit an order (no auth required)
create policy "Anyone can insert order"
  on orders for insert with check (true);

create policy "Admin full access orders"
  on orders for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 5. ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
create table if not exists order_items (
  id                     uuid primary key default gen_random_uuid(),
  order_id               uuid references orders(id) on delete cascade,
  product_id             uuid references products(id) on delete set null,
  product_name_snapshot  text not null,
  unit_price_snapshot    numeric(10,2) not null,
  quantity               int not null check (quantity > 0),
  discount_applied       numeric(10,2) default 0
);

alter table order_items enable row level security;

create policy "Anyone can insert order items"
  on order_items for insert with check (true);

create policy "Admin full access order items"
  on order_items for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 6. DOCUMENTS (invoices & quotations)
-- ─────────────────────────────────────────────────────────────
create table if not exists documents (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references orders(id) on delete set null,
  type            text check (type in ('invoice', 'quotation')) not null,
  line_items      jsonb not null default '[]',
  subtotal        numeric(10,2) not null,
  discount_total  numeric(10,2) default 0,
  vat_rate        numeric(5,2) default 15,
  vat_amount      numeric(10,2) default 0,
  grand_total     numeric(10,2) not null,
  pdf_url         text,
  created_at      timestamptz default now()
);

alter table documents enable row level security;

create policy "Admin full access documents"
  on documents for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 7. STOCK LOG
-- ─────────────────────────────────────────────────────────────
create table if not exists stock_log (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid references products(id) on delete cascade,
  change_amount  int not null,
  reason         text,
  admin_note     text,
  recorded_at    timestamptz default now()
);

alter table stock_log enable row level security;

create policy "Admin full access stock log"
  on stock_log for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 8. ANNOUNCEMENTS
-- ─────────────────────────────────────────────────────────────
create table if not exists announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  type        text check (type in ('announcement', 'special', 'advert')) default 'announcement',
  image_url   text,
  is_active   boolean default true,
  expires_at  timestamptz,
  created_at  timestamptz default now()
);

alter table announcements enable row level security;

create policy "Public can view active announcements"
  on announcements for select using (is_active = true);

create policy "Admin full access announcements"
  on announcements for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 9. SETTINGS
-- ─────────────────────────────────────────────────────────────
create table if not exists settings (
  key    text primary key,
  value  text
);

alter table settings enable row level security;

create policy "Admin full access settings"
  on settings for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Seed default settings
insert into settings (key, value) values
  ('vat_rate', '15'),
  ('low_stock_threshold', '3'),
  ('business_name', 'Space2Standard'),
  ('business_address', ''),
  ('business_phone', ''),
  ('business_email', ''),
  ('admin_email', '')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────
-- 10. UPDATED_AT TRIGGER (products, orders)
-- ─────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on products
  for each row execute procedure set_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 11. STORAGE BUCKET POLICY (run in Supabase Studio → Storage)
-- ─────────────────────────────────────────────────────────────
-- Create a bucket called 'product-images' with public access ON.
-- Then add this policy:
--
-- insert policy: authenticated users with admin role only
-- (set via Supabase Studio bucket policies UI)

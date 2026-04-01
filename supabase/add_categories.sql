-- ============================================================
-- Space2Standard — Add Categories Table & Migration
-- Run this script in your Supabase SQL Editor.
-- ============================================================

-- 1. Create categories table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

alter table categories enable row level security;

-- Public can view categories
create policy "Public can view categories"
  on categories for select using (true);

-- Admin can manage categories
create policy "Admin full access categories"
  on categories for all using (is_admin());

-- 2. Modify products table to include category_id
-- We preserve the old `category` column momentarily for safety, but we'll use `category_id` going forward.
alter table products 
add column if not exists category_id uuid references categories(id) on delete set null;

-- 3. (Optional Migration) If you want to automatically convert existing text 'category' into real categories:
insert into categories (name, slug)
select distinct category, lower(regexp_replace(category, '[^a-zA-Z0-9]', '-', 'g'))
from products
where category is not null and category != ''
on conflict (slug) do nothing;

update products p
set category_id = c.id
from categories c
where p.category = c.name and p.category_id is null;

-- 4. Rebuild the `place_order` RPC to ensure compatibility if needed (it doesn't touch products table schema directly, only `order_items`, so it's safe).

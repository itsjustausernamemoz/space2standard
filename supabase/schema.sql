-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'customer')) default 'customer',
  full_name text,
  email text,
  phone text,
  created_at timestamp default now()
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  price numeric(10,2) not null,
  discount_percent numeric(5,2) default 0,
  discounted_price numeric(10,2) generated always as (price - (price * discount_percent / 100)) stored,
  stock_quantity int default 0,
  images text[], -- array of Supabase storage URLs
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Announcements / Adverts
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  type text check (type in ('announcement', 'special', 'advert')) default 'announcement',
  image_url text,
  is_active boolean default true,
  expires_at timestamp,
  created_at timestamp default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  delivery_address text,
  status text check (status in ('pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled')) default 'pending',
  total_amount numeric(10,2),
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Order Items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text,
  quantity int not null,
  unit_price numeric(10,2),
  discount_percent numeric(5,2) default 0,
  subtotal numeric(10,2)
);

-- Row Level Security (RLS)

-- Products: public read, admin write
alter table products enable row level security;
create policy "Public can view active products" on products for select using (is_active = true);
create policy "Admin full access products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Announcements: public read active, admin write
alter table announcements enable row level security;
create policy "Public can view active announcements" on announcements for select using (is_active = true);
create policy "Admin full access announcements" on announcements for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders: customers see own, admin sees all
alter table orders enable row level security;
create policy "Customers view own orders" on orders for select using (customer_id = auth.uid());
create policy "Anyone can create order" on orders for insert with check (true);
create policy "Admin full access orders" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

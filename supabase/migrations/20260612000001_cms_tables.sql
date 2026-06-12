-- ============================================================
-- Space2Standard — CMS Tables (2026-06-12)
-- Paste in Supabase SQL Editor to apply
-- ============================================================

-- Key-value store for editable website content (hero text, section copy, etc.)
create table if not exists site_content (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

-- Announcements: news, promotions, updates posted to the website
create table if not exists announcements (
  id         uuid default gen_random_uuid() primary key,
  title      text not null,
  body       text,
  type       text not null default 'info',
  -- info | promo | alert | news
  cta_label  text,
  cta_url    text,
  is_active  boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Testimonials: client quotes shown on the website
create table if not exists testimonials (
  id          uuid default gen_random_uuid() primary key,
  client_name text not null,
  client_role text,
  quote       text not null,
  rating      int not null default 5,
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz default now()
);

-- FAQs: frequently asked questions shown on the /faqs page
create table if not exists faqs (
  id         uuid default gen_random_uuid() primary key,
  question   text not null,
  answer     text not null,
  category   text not null default 'General',
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz default now()
);

-- ── RLS ──────────────────────────────────────────────────────

alter table site_content  enable row level security;
alter table announcements enable row level security;
alter table testimonials  enable row level security;
alter table faqs          enable row level security;

-- Authenticated users (admins) can manage all content
create policy "Auth manage site_content"
  on site_content for all to authenticated using (true) with check (true);

create policy "Auth manage announcements"
  on announcements for all to authenticated using (true) with check (true);

create policy "Auth manage testimonials"
  on testimonials for all to authenticated using (true) with check (true);

create policy "Auth manage faqs"
  on faqs for all to authenticated using (true) with check (true);

-- Storefront (anonymous) can read active/published content
create policy "Public read site_content"
  on site_content for select to anon using (true);

create policy "Public read active announcements"
  on announcements for select to anon using (is_active = true);

create policy "Public read active testimonials"
  on testimonials for select to anon using (is_active = true);

create policy "Public read active faqs"
  on faqs for select to anon using (is_active = true);

-- ── Seed default site_content ─────────────────────────────────
insert into site_content (key, value) values
  ('hero_eyebrow',        'Excellence in Craftsmanship'),
  ('hero_tagline',        'Bespoke furniture crafted to your vision.'),
  ('hero_subtext',        'Built to last generations.'),
  ('hero_cta_primary',    'Order a Piece'),
  ('hero_cta_secondary',  'Explore Collection'),
  ('featured_eyebrow',    'Our Masterpieces'),
  ('featured_heading',    'Featured Collection'),
  ('artisan_eyebrow',     'The Artisan Way'),
  ('artisan_heading',     'From Tree to Table'),
  ('artisan_body',        'At Space2Standard, we don''t just build furniture; we curate masterpieces. Our process combines ancient woodworking techniques with modern precision to create pieces that are as functional as they are beautiful.'),
  ('artisan_block_1_title','Sustainably Sourced'),
  ('artisan_block_1_desc', 'We only use premium hardwoods from Namibian forests.'),
  ('artisan_block_2_title','Hand-Rubbed Finishes'),
  ('artisan_block_2_desc', 'Natural oils and waxes that age gracefully over decades.'),
  ('artisan_block_3_title','Bespoke Engineering'),
  ('artisan_block_3_desc', 'Intricate joinery that removes the need for visible fasteners.')
on conflict (key) do nothing;

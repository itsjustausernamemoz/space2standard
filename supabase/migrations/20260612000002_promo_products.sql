-- Add discount_percent to announcements
alter table announcements add column if not exists discount_percent numeric(5,2);

-- Junction table: which products are attached to a promo announcement
create table if not exists announcement_products (
  announcement_id uuid not null references announcements(id) on delete cascade,
  product_id      uuid not null references products(id)      on delete cascade,
  primary key (announcement_id, product_id)
);

alter table announcement_products enable row level security;

create policy "Public read announcement_products"
  on announcement_products for select using (true);

create policy "Authenticated manage announcement_products"
  on announcement_products for all using (auth.role() = 'authenticated');

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';

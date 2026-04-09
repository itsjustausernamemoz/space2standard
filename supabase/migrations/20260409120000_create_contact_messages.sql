-- Create contact_messages table
create table if not exists public.contact_messages (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    subject text,
    message text not null,
    status text check (status in ('new', 'read', 'replied')) default 'new',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Policies
-- 1. Public can insert (from storefront)
create policy "Anyone can insert contact messages"
on public.contact_messages for insert
with check (true);

-- 2. Admins can view/update
create policy "Admins can view all contact messages"
on public.contact_messages for select
using (public.is_admin());

create policy "Admins can update contact messages"
on public.contact_messages for update
using (public.is_admin());

-- Trigger for updated_at
create trigger set_updated_at_contact_messages
    before update on public.contact_messages
    for each row execute procedure public.set_updated_at();

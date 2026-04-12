-- Create communication_logs table for mailbox threading
create table if not exists public.communication_logs (
    id uuid default gen_random_uuid() primary key,
    client_id uuid references public.clients(id) on delete set null,
    parent_id uuid references public.communication_logs(id) on delete set null,
    type text not null check (type in ('inbound', 'outbound')),
    sender_name text not null,
    sender_email text not null,
    recipient_email text not null,
    subject text,
    body text not null,
    metadata jsonb default '{}'::jsonb, -- Store thing like { document_id: '...', document_type: 'invoice' }
    admin_id uuid references auth.users(id) on delete set null,
    status text default 'delivered',
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.communication_logs enable row level security;

-- Policies
create policy "Admins can manage all communication logs"
on public.communication_logs for all
using (public.is_admin());

-- Migrate existing contact_messages to communication_logs (Optional but good for history)
insert into public.communication_logs (type, sender_name, sender_email, recipient_email, subject, body, created_at)
select 
    'inbound' as type,
    name as sender_name,
    email as sender_email,
    'studio@space2standard.com' as recipient_email, -- Mock business email
    subject,
    message as body,
    created_at
from public.contact_messages
on conflict do nothing;

-- Add client_id to contact_messages for better linking if not exists
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name='contact_messages' and column_name='client_id') then
        alter table public.contact_messages add column client_id uuid references public.clients(id);
    end if;
end $$;

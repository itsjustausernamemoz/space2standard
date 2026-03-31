-- Create system-assets bucket if it doesn't exist
insert into storage.buckets (id, name, public)
select 'system-assets', 'system-assets', true
where not exists (
    select 1 from storage.buckets where id = 'system-assets'
);

-- RLS Policies for system-assets
-- Allow public to read
create policy "Allow Public Read system-assets"
on storage.objects for select
using ( bucket_id = 'system-assets' );

-- Allow authenticated users (admins) to upload/update/delete
create policy "Allow Admin Upload system-assets"
on storage.objects for insert
with check ( bucket_id = 'system-assets' AND auth.role() = 'authenticated' );

create policy "Allow Admin Update system-assets"
on storage.objects for update
using ( bucket_id = 'system-assets' AND auth.role() = 'authenticated' );

create policy "Allow Admin Delete system-assets"
on storage.objects for delete
using ( bucket_id = 'system-assets' AND auth.role() = 'authenticated' );

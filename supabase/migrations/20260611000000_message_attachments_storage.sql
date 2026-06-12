-- Create message-attachments bucket for email file attachments
insert into storage.buckets (id, name, public)
select 'message-attachments', 'message-attachments', true
where not exists (
    select 1 from storage.buckets where id = 'message-attachments'
);

-- Allow public to read (so public URLs in emails work)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow Public Read message-attachments'
  ) then
    execute 'create policy "Allow Public Read message-attachments"
      on storage.objects for select
      using ( bucket_id = ''message-attachments'' )';
  end if;
end $$;

-- Allow authenticated users (admins) to upload
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow Admin Upload message-attachments'
  ) then
    execute 'create policy "Allow Admin Upload message-attachments"
      on storage.objects for insert
      with check ( bucket_id = ''message-attachments'' AND auth.role() = ''authenticated'' )';
  end if;
end $$;

-- Allow authenticated users to update their uploads
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow Admin Update message-attachments'
  ) then
    execute 'create policy "Allow Admin Update message-attachments"
      on storage.objects for update
      using ( bucket_id = ''message-attachments'' AND auth.role() = ''authenticated'' )';
  end if;
end $$;

-- Allow authenticated users to delete their uploads
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow Admin Delete message-attachments'
  ) then
    execute 'create policy "Allow Admin Delete message-attachments"
      on storage.objects for delete
      using ( bucket_id = ''message-attachments'' AND auth.role() = ''authenticated'' )';
  end if;
end $$;

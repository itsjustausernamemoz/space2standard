-- Expand contact_messages status constraint
ALTER TABLE public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;
ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_status_check 
    CHECK (status IN ('new', 'read', 'replied', 'archived', 'deleted', 'unread'));

-- Add is_flagged to both tables for importance tracking
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;
ALTER TABLE public.communication_logs ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;

-- Add archived and deleted statuses to communication_logs logic
-- Currently it doesn't have a check, so we just allow it.
-- But let's add an explicit status for consistency if we wanted, 
-- though it already has 'status text default delivered'.
-- We'll just use 'archived' and 'deleted' as strings there too.

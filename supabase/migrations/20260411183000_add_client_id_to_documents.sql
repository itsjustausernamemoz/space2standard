-- Migration: Add client_id to documents and enhance revenue tracking
-- Created: 2026-04-11

-- 1. Add client_id column to documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- 2. Update the revenue calculation function to handle client_id directly
CREATE OR REPLACE FUNCTION public.update_client_revenue()
RETURNS TRIGGER AS $$
DECLARE
    target_client_id UUID;
BEGIN
    -- Determine the client ID:
    -- Priority 1: Direct link on the document (standalone or linked)
    -- Priority 2: Fallback to order's client if possible
    IF NEW.client_id IS NOT NULL THEN
        target_client_id := NEW.client_id;
    ELSIF NEW.order_id IS NOT NULL THEN
        SELECT c.id INTO target_client_id
        FROM public.orders o
        JOIN public.clients c ON o.customer_email = c.email
        WHERE o.id = NEW.order_id
        LIMIT 1;
    END IF;

    IF target_client_id IS NOT NULL AND NEW.type = 'invoice' THEN
        -- Recalculate total revenue for this specific client
        UPDATE public.clients
        SET total_revenue = (
            SELECT COALESCE(SUM(grand_total), 0)
            FROM public.documents
            WHERE (client_id = target_client_id OR (order_id IN (SELECT id FROM public.orders WHERE customer_email = (SELECT email FROM public.clients WHERE id = target_client_id))))
            AND type = 'invoice'
        )
        WHERE id = target_client_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Initial backfill: Update total_revenue for all clients based on either direct link or order connection
UPDATE public.clients c
SET total_revenue = (
    SELECT COALESCE(SUM(d.grand_total), 0)
    FROM public.documents d
    LEFT JOIN public.orders o ON d.order_id = o.id
    WHERE (d.client_id = c.id OR o.customer_email = c.email)
    AND d.type = 'invoice'
);

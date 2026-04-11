-- Create function to update client total_revenue
CREATE OR REPLACE FUNCTION public.update_client_revenue()
RETURNS TRIGGER AS $$
DECLARE
    client_email TEXT;
BEGIN
    -- Get the customer email from the associated order
    SELECT customer_email INTO client_email 
    FROM public.orders 
    WHERE id = NEW.order_id;

    IF client_email IS NOT NULL AND NEW.type = 'invoice' THEN
        -- Recalculate total revenue for this client email
        UPDATE public.clients
        SET total_revenue = (
            SELECT COALESCE(SUM(grand_total), 0)
            FROM public.documents d
            JOIN public.orders o ON d.order_id = o.id
            WHERE o.customer_email = client_email AND d.type = 'invoice'
        )
        WHERE email = client_email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for when a new document is issued
DROP TRIGGER IF EXISTS update_client_revenue_trigger ON public.documents;
CREATE TRIGGER update_client_revenue_trigger
AFTER INSERT OR UPDATE OF grand_total, type ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_client_revenue();

-- Initial backfill for existing clients
UPDATE public.clients c
SET total_revenue = (
    SELECT COALESCE(SUM(d.grand_total), 0)
    FROM public.documents d
    JOIN public.orders o ON d.order_id = o.id
    WHERE o.customer_email = c.email AND d.type = 'invoice'
);

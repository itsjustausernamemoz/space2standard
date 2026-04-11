-- 1. Add 'pending' to the status check constraint for orders
-- Note: If the constraint exists, we might need to drop and recreate it.
-- Let's try to add it gracefully.
DO $$ 
BEGIN 
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
    ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('new', 'pending', 'completed', 'cancelled', 'contacted', 'in_progress'));
END $$;

-- 2. Add order_number column if it doesn't exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- 3. Function to generate high-fidelity order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_num TEXT;
BEGIN
    IF NEW.order_number IS NULL THEN
        -- Generate a unique 6-digit hex suffix from the UUID
        new_num := 'S2S-ORD-' || UPPER(substring(md5(NEW.id::text) from 1 for 6));
        NEW.order_number := new_num;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger for order number generation
DROP TRIGGER IF EXISTS trigger_generate_order_number ON public.orders;
CREATE TRIGGER trigger_generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();

-- 5. Backfill existing orders with order numbers
UPDATE public.orders SET order_number = 'S2S-ORD-' || UPPER(substring(md5(id::text) from 1 for 6)) WHERE order_number IS NULL;

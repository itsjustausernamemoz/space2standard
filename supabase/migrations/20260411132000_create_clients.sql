-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Simple policy for admin access
CREATE POLICY "Allow full access to authenticated users" ON public.clients
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to handle order -> client sync
CREATE OR REPLACE FUNCTION public.sync_order_to_client()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.clients (full_name, email, phone, address)
    VALUES (NEW.customer_name, NEW.customer_email, NEW.customer_phone, NEW.delivery_address)
    ON CONFLICT (email) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, clients.phone),
        address = COALESCE(EXCLUDED.address, clients.address),
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync on new order
CREATE TRIGGER sync_order_to_client_trigger
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_to_client();

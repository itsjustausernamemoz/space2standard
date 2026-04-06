-- Add Product Reviews Table
CREATE TABLE public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT true, -- Auto-approve by default for immediate feedback
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Reviews are viewable by everyone."
ON public.product_reviews FOR SELECT
USING (true);

-- Allow anyone (including guests) to insert reviews
CREATE POLICY "Anyone can insert a review."
ON public.product_reviews FOR INSERT
WITH CHECK (true);

-- Allow admins full access
CREATE POLICY "Admins can manage reviews."
ON public.product_reviews FOR ALL
USING (auth.role() = 'authenticated');

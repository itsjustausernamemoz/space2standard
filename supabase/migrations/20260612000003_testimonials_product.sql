-- Add product_id to testimonials so each review can be linked to a specific product.
-- This enables best-seller tracking and the reviews page to show which product a review is about.
ALTER TABLE testimonials
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES products(id) ON DELETE SET NULL;

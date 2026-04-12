-- Ledger Automation: Payment Tracking & Workflow Synchronization
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS payment_terms TEXT;

-- Insert default payment terms if not exists
INSERT INTO settings (key, value) 
VALUES ('ledger_default_terms', 'Payment is due within 7 days of invoice date. 50% deposit required for custom artisan pieces.')
ON CONFLICT (key) DO NOTHING;

-- Ensure inventory tracking is possible by having stock_quantity
-- (Already exists on products, but good to verify in logic)

-- Update communication_logs to support payment events
ALTER TABLE communication_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

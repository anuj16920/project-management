-- ─── FIX: Add missing invoice columns (007_finance.sql ALTER TABLE may not have applied) ──
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS title         TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS description   TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency      TEXT DEFAULT 'INR';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal      NUMERIC(14,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_percent   NUMERIC(5,2)  DEFAULT 18;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount    NUMERIC(14,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount      NUMERIC(14,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total         NUMERIC(14,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at       TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes         TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_id    UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Back-fill total from amount for any existing rows
UPDATE invoices SET total = amount WHERE total = 0 AND amount IS NOT NULL;

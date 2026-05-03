-- ─── EXPENSE CATEGORIES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#6366F1',
  icon       TEXT DEFAULT 'receipt'
);
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ec_tenant" ON expense_categories FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── EXPENSES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency      TEXT DEFAULT 'INR',
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_by       TEXT,                   -- profile uid
  receipt_url   TEXT,
  notes         TEXT,
  status        TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  approved_by   TEXT,
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exp_tenant ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exp_date   ON expenses(date);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exp_tenant" ON expenses FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── INVOICES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  client_uid     TEXT,                  -- profile uid of client
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  currency       TEXT DEFAULT 'INR',
  subtotal       NUMERIC(14,2) DEFAULT 0,
  tax_percent    NUMERIC(5,2)  DEFAULT 18,
  tax_amount     NUMERIC(14,2) DEFAULT 0,
  discount       NUMERIC(14,2) DEFAULT 0,
  total          NUMERIC(14,2) DEFAULT 0,
  status         TEXT DEFAULT 'draft'
                   CHECK (status IN ('draft','sent','viewed','paid','overdue','cancelled')),
  due_date       DATE,
  paid_at        TIMESTAMPTZ,
  payment_method TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, invoice_number)
);
CREATE INDEX IF NOT EXISTS idx_inv_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inv_client ON invoices(client_uid);
CREATE INDEX IF NOT EXISTS idx_inv_status ON invoices(status);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_tenant" ON invoices FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── INVOICE LINE ITEMS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    NUMERIC(10,2) DEFAULT 1,
  unit_price  NUMERIC(14,2) DEFAULT 0,
  amount      NUMERIC(14,2) DEFAULT 0
);
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ii_tenant" ON invoice_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM invoices i
    WHERE i.id = invoice_id
      AND i.tenant_id = get_my_tenant_id()
  ));

-- ─── PAYMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id     UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount         NUMERIC(14,2) NOT NULL,
  currency       TEXT DEFAULT 'INR',
  payment_method TEXT DEFAULT 'bank_transfer'
                   CHECK (payment_method IN ('bank_transfer','upi','card','cash','cheque','stripe','razorpay')),
  transaction_id TEXT,
  paid_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pay_tenant  ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pay_invoice ON payments(invoice_id);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_tenant" ON payments FOR ALL
  USING (tenant_id = get_my_tenant_id());
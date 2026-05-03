-- ─── SAVED REPORTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL
                 CHECK (type IN (
                   'revenue','expenses','projects','tasks',
                   'employees','clients','invoices','custom'
                 )),
  filters      JSONB DEFAULT '{}',
  created_by   TEXT NOT NULL,
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule     TEXT,          -- cron-like: 'daily','weekly','monthly'
  last_run_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_tenant ON saved_reports(tenant_id);
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_tenant" ON saved_reports FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── REPORT EXPORTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_exports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  report_id   UUID REFERENCES saved_reports(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  format      TEXT NOT NULL CHECK (format IN ('csv','pdf','excel')),
  storage_path TEXT,
  public_url  TEXT,
  exported_by TEXT NOT NULL,
  row_count   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exports_tenant" ON report_exports FOR ALL
  USING (tenant_id = get_my_tenant_id());
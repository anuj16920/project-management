-- ─── CLIENTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_uid  TEXT,
  company_name TEXT NOT NULL,
  industry     TEXT,
  website      TEXT,
  address      TEXT,
  city         TEXT,
  country      TEXT DEFAULT 'India',
  gstin        TEXT,
  source       TEXT,
  notes        TEXT,
  status       TEXT DEFAULT 'active'
                 CHECK (status IN ('active','inactive','prospect','churned')),
  total_value  NUMERIC(14,2) DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clients_tenant  ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_profile ON clients(profile_uid);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_tenant" ON clients FOR ALL USING (tenant_id = get_my_tenant_id());

-- ─── CONTACTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  position    TEXT,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(client_id);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_tenant" ON contacts FOR ALL USING (tenant_id = get_my_tenant_id());

-- ─── DEALS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  title          TEXT NOT NULL DEFAULT 'New Deal',
  value          NUMERIC(14,2) DEFAULT 0,
  stage          TEXT DEFAULT 'lead'
                   CHECK (stage IN ('lead','qualified','proposal','negotiation','won','lost')),
  expected_close DATE,
  notes          TEXT,
  assigned_to    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_deals_tenant ON deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_client ON deals(client_id);
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deals_tenant" ON deals FOR ALL USING (tenant_id = get_my_tenant_id());

-- ─── CRM ACTIVITIES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  actor_uid   TEXT,
  type        TEXT DEFAULT 'note'
                CHECK (type IN ('call','email','meeting','note','task')),
  title       TEXT NOT NULL,
  description TEXT,
  is_done     BOOLEAN DEFAULT FALSE,
  due_at      TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_act_tenant ON crm_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_act_client ON crm_activities(client_id);
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_act_tenant" ON crm_activities FOR ALL USING (tenant_id = get_my_tenant_id());

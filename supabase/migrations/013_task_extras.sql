-- ─── TASK EXTRAS ──────────────────────────────────────────────────────────────

-- parent_id for subtasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_id  UUID REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position   INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS logged_hrs NUMERIC(8,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hrs NUMERIC(8,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags       TEXT[];

-- ─── TASK COMMENTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_uid  TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tc_task   ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_tc_tenant ON task_comments(tenant_id);
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tc_tenant" ON task_comments FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── TASK ATTACHMENTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploader_uid TEXT NOT NULL,
  name         TEXT NOT NULL,
  url          TEXT NOT NULL,
  size         BIGINT DEFAULT 0,
  mime_type    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ta_task   ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_ta_tenant ON task_attachments(tenant_id);
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ta_tenant" ON task_attachments FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── TASK TIME LOGS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_time_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_uid     TEXT NOT NULL,
  hours        NUMERIC(6,2) NOT NULL,
  description  TEXT,
  logged_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ttl_task   ON task_time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_ttl_tenant ON task_time_logs(tenant_id);
ALTER TABLE task_time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ttl_tenant" ON task_time_logs FOR ALL
  USING (tenant_id = get_my_tenant_id());

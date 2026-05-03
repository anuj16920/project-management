-- ─── FILE FOLDERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS file_folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  parent_id   UUID REFERENCES file_folders(id) ON DELETE CASCADE,
  created_by  TEXT NOT NULL,
  color       TEXT DEFAULT '#6366F1',
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_folders_tenant ON file_folders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON file_folders(parent_id);
ALTER TABLE file_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "folders_tenant" ON file_folders FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── FILES ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  folder_id     UUID REFERENCES file_folders(id) ON DELETE SET NULL,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id       UUID REFERENCES tasks(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size          BIGINT NOT NULL DEFAULT 0,
  storage_path  TEXT NOT NULL,
  public_url    TEXT,
  uploaded_by   TEXT NOT NULL,
  description   TEXT,
  tags          TEXT[] DEFAULT '{}',
  is_starred    BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_files_tenant   ON files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_files_folder   ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_project  ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_uploader ON files(uploaded_by);
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "files_tenant" ON files FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── FILE SHARES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS file_shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_by   TEXT NOT NULL,
  shared_with TEXT,               -- firebase_uid, NULL = public link
  token       TEXT UNIQUE,        -- for public link sharing
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shares_tenant" ON file_shares FOR ALL
  USING (EXISTS (
    SELECT 1 FROM files f
    WHERE f.id = file_id
      AND f.tenant_id = get_my_tenant_id()
  ));
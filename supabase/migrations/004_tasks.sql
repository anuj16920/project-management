-- Projects extended
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority    TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date  DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags        TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_color TEXT DEFAULT '#6366F1';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress    INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Milestones
CREATE TABLE milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  due_date    DATE,
  is_done     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_milestones_project ON milestones(project_id);
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_tenant" ON milestones FOR ALL USING (tenant_id = get_my_tenant_id());

-- Project Members
CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_uid    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','manager','member','viewer')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_uid)
);
CREATE INDEX idx_pm_project ON project_members(project_id);
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_tenant" ON project_members FOR ALL USING (tenant_id = get_my_tenant_id());

-- Project Activity Log
CREATE TABLE project_activity (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor_uid   TEXT NOT NULL,
  action      TEXT NOT NULL,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pa_project ON project_activity(project_id);
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pa_tenant" ON project_activity FOR ALL USING (tenant_id = get_my_tenant_id());
-- ─── DEPARTMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  head_uid    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dept_tenant" ON departments FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── EMPLOYEES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_uid      TEXT NOT NULL UNIQUE,
  department_id    UUID REFERENCES departments(id) ON DELETE SET NULL,
  employee_code    TEXT,
  designation      TEXT,
  employment_type  TEXT DEFAULT 'full_time'
                     CHECK (employment_type IN ('full_time','part_time','contract','intern')),
  date_of_joining  DATE,
  date_of_birth    DATE,
  phone            TEXT,
  address          TEXT,
  emergency_contact TEXT,
  salary           NUMERIC(14,2) DEFAULT 0,
  bank_account     TEXT,
  ifsc_code        TEXT,
  pan_number       TEXT,
  status           TEXT DEFAULT 'active'
                     CHECK (status IN ('active','inactive','on_leave','terminated')),
  avatar_url       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_emp_tenant  ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_emp_profile ON employees(profile_uid);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emp_tenant" ON employees FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── ATTENDANCE ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_uid TEXT NOT NULL,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in     TIMESTAMPTZ,
  clock_out    TIMESTAMPTZ,
  status       TEXT DEFAULT 'present'
                 CHECK (status IN ('present','absent','half_day','late','holiday','on_leave')),
  work_hours   NUMERIC(5,2),
  notes        TEXT,
  UNIQUE(tenant_id, employee_uid, date)
);
CREATE INDEX IF NOT EXISTS idx_att_tenant ON attendance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_att_emp    ON attendance(employee_uid);
CREATE INDEX IF NOT EXISTS idx_att_date   ON attendance(date);
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "att_tenant" ON attendance FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── LEAVE TYPES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_types (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  days_allowed INTEGER DEFAULT 12,
  is_paid      BOOLEAN DEFAULT TRUE,
  color        TEXT DEFAULT '#6366F1'
);
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lt_tenant" ON leave_types FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── LEAVE REQUESTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_uid   TEXT NOT NULL,
  leave_type_id  UUID REFERENCES leave_types(id),
  from_date      DATE NOT NULL,
  to_date        DATE NOT NULL,
  days           INTEGER NOT NULL DEFAULT 1,
  reason         TEXT,
  status         TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','cancelled')),
  reviewed_by    TEXT,
  reviewed_at    TIMESTAMPTZ,
  review_note    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lr_tenant ON leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lr_emp    ON leave_requests(employee_uid);
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lr_tenant" ON leave_requests FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── PAYROLL ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_uid  TEXT NOT NULL,
  month         INTEGER NOT NULL,
  year          INTEGER NOT NULL,
  basic_salary  NUMERIC(14,2) DEFAULT 0,
  hra           NUMERIC(14,2) DEFAULT 0,
  allowances    NUMERIC(14,2) DEFAULT 0,
  deductions    NUMERIC(14,2) DEFAULT 0,
  tax           NUMERIC(14,2) DEFAULT 0,
  net_salary    NUMERIC(14,2) DEFAULT 0,
  status        TEXT DEFAULT 'draft'
                  CHECK (status IN ('draft','processed','paid')),
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, employee_uid, month, year)
);
CREATE INDEX IF NOT EXISTS idx_payroll_tenant ON payroll(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_emp    ON payroll(employee_uid);
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payroll_tenant" ON payroll FOR ALL
  USING (tenant_id = get_my_tenant_id());
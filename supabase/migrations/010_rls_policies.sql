-- Enable RLS
ALTER TABLE tenants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's tenant_id
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE firebase_uid = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE firebase_uid = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Tenants: users only see their own tenant
CREATE POLICY "tenant_isolation" ON tenants
  FOR ALL USING (id = get_my_tenant_id());

-- Profiles: users see only profiles in their tenant
CREATE POLICY "profiles_tenant_isolation" ON profiles
  FOR SELECT USING (tenant_id = get_my_tenant_id());

-- Profiles: admins can insert/update in their tenant
CREATE POLICY "profiles_admin_write" ON profiles
  FOR ALL USING (
    tenant_id = get_my_tenant_id()
    AND get_my_role() IN ('admin','super_admin')
  );

-- Profiles: users can update their own row
CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (firebase_uid = auth.uid());
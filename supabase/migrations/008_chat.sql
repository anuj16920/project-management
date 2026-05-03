-- ─── CHAT ROOMS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT,
  type        TEXT DEFAULT 'direct'
                CHECK (type IN ('direct','group','project')),
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_by  TEXT NOT NULL,              -- firebase_uid
  avatar_url  TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rooms_tenant ON chat_rooms(tenant_id);
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_tenant" ON chat_rooms FOR ALL
  USING (tenant_id = get_my_tenant_id());

-- ─── ROOM MEMBERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_room_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_uid    TEXT NOT NULL,              -- firebase_uid
  role        TEXT DEFAULT 'member'
                CHECK (role IN ('admin','member')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_uid)
);
CREATE INDEX IF NOT EXISTS idx_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON chat_room_members(user_uid);
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_tenant" ON chat_room_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM chat_rooms r
    WHERE r.id = room_id
      AND r.tenant_id = get_my_tenant_id()
  ));

-- ─── MESSAGES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_uid  TEXT NOT NULL,              -- firebase_uid
  content     TEXT,
  type        TEXT DEFAULT 'text'
                CHECK (type IN ('text','image','file','system')),
  file_url    TEXT,
  file_name   TEXT,
  file_size   INTEGER,
  reply_to    UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_edited   BOOLEAN DEFAULT FALSE,
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msgs_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_msgs_sender ON chat_messages(sender_uid);
CREATE INDEX IF NOT EXISTS idx_msgs_created ON chat_messages(created_at);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msgs_tenant" ON chat_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM chat_rooms r
    WHERE r.id = room_id
      AND r.tenant_id = get_my_tenant_id()
  ));

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_uid    TEXT NOT NULL,              -- firebase_uid (recipient)
  type        TEXT NOT NULL
                CHECK (type IN (
                  'task_assigned','task_updated','task_completed',
                  'project_created','project_updated',
                  'invoice_sent','invoice_paid',
                  'expense_approved','expense_rejected',
                  'mention','message','leave_approved','leave_rejected',
                  'general'
                )),
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,                       -- frontend route to navigate to
  is_read     BOOLEAN DEFAULT FALSE,
  meta        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_user   ON notifications(user_uid);
CREATE INDEX IF NOT EXISTS idx_notif_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notif_read   ON notifications(is_read);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_tenant" ON notifications FOR ALL
  USING (tenant_id = get_my_tenant_id());
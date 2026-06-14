-- FireSafe ITM - Supabase Schema
-- Run this in the Supabase SQL editor after creating your project.
-- All tables use Row Level Security (RLS) with tenant isolation.

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'free',   -- free | pro | enterprise
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Tenants are managed by service-role only; no direct user access.

-- ============================================================
-- PROFILES  (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'inspector',  -- admin | manager | inspector
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);

-- Users can read/update their own profile.
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  cnpj          TEXT,
  address       TEXT,
  city          TEXT,
  state         TEXT,
  zip_code      TEXT,
  contact_name  TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_companies_tenant_id ON companies(tenant_id);

CREATE POLICY "companies_tenant_isolation" ON companies
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  contact     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_properties_tenant_id  ON properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_properties_company_id ON properties(company_id);

CREATE POLICY "properties_tenant_isolation" ON properties
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- FIRE PUMPS
-- ============================================================
CREATE TABLE IF NOT EXISTS fire_pumps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,
  property_id     UUID REFERENCES properties(id) ON DELETE SET NULL,
  tag             TEXT,
  manufacturer    TEXT,
  model           TEXT,
  serial_number   TEXT,
  driver_type     TEXT,   -- electric | diesel | steam
  rated_capacity  NUMERIC,
  rated_pressure  NUMERIC,
  install_date    DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE fire_pumps ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_fire_pumps_tenant_id   ON fire_pumps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fire_pumps_property_id ON fire_pumps(property_id);

CREATE POLICY "fire_pumps_tenant_isolation" ON fire_pumps
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- INSPECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS inspections (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type                  TEXT NOT NULL,
  frequency             TEXT,
  date                  TEXT NOT NULL,
  property_id           UUID REFERENCES properties(id) ON DELETE SET NULL,
  property_name         TEXT,
  property_address      TEXT,
  property_phone        TEXT,
  inspector_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  inspector_name        TEXT,
  company_id            UUID REFERENCES companies(id) ON DELETE SET NULL,
  company_data          JSONB,
  inspector_data        JSONB,
  checklist             JSONB,
  test_data             JSONB,
  observations          TEXT,
  signature             TEXT,
  contract_no           TEXT,
  geo_location          JSONB,
  fire_pump_data        JSONB,
  fire_pump_panel_data  JSONB,
  fm85a_data            JSONB,
  status                TEXT NOT NULL DEFAULT 'draft',  -- draft | completed | reviewed
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inspections_tenant_id   ON inspections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inspections_property_id ON inspections(property_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date        ON inspections(date DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_status      ON inspections(status);

CREATE POLICY "inspections_tenant_isolation" ON inspections
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- INSPECTION PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS inspection_photos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id       UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  checklist_item_id   TEXT,
  storage_key         TEXT NOT NULL,
  caption             TEXT,
  mime_type           TEXT NOT NULL DEFAULT 'image/jpeg',
  size_bytes          INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inspection_photos_inspection_id ON inspection_photos(inspection_id);

-- Access is inherited via inspection ownership; join check below.
CREATE POLICY "inspection_photos_tenant_isolation" ON inspection_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inspections i
      JOIN profiles p ON p.id = auth.uid()
      WHERE i.id = inspection_photos.inspection_id
        AND i.tenant_id = p.tenant_id
    )
  );

-- ============================================================
-- INSPECTION SCHEDULES
-- ============================================================
CREATE TABLE IF NOT EXISTS inspection_schedules (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id            UUID REFERENCES companies(id) ON DELETE SET NULL,
  property_id           UUID REFERENCES properties(id) ON DELETE SET NULL,
  fire_pump_id          UUID REFERENCES fire_pumps(id) ON DELETE SET NULL,
  inspection_type       TEXT NOT NULL,
  frequency             TEXT NOT NULL,
  start_date            TEXT,
  last_inspection_date  TEXT,
  next_due_date         TEXT,
  notification_id       TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inspection_schedules ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_schedules_tenant_id    ON inspection_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_due     ON inspection_schedules(next_due_date);

CREATE POLICY "schedules_tenant_isolation" ON inspection_schedules
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- LICENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS licenses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID REFERENCES tenants(id) ON DELETE SET NULL,
  key_hash         TEXT NOT NULL UNIQUE,   -- SHA-256 of the license key; never store plaintext
  validity_months  INTEGER NOT NULL,
  device_id        TEXT,
  activated_at     TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  is_used          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_licenses_key_hash   ON licenses(key_hash);
CREATE INDEX IF NOT EXISTS idx_licenses_tenant_id  ON licenses(tenant_id);

-- Licenses are managed by service-role only; no direct user access.

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,        -- e.g. 'inspection.create', 'license.activate'
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id  ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id    ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Admins and managers can read their tenant's audit log; writes are service-role only.
CREATE POLICY "audit_log_read_own_tenant" ON audit_log
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

-- ============================================================
-- HELPER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_fire_pumps_updated_at
  BEFORE UPDATE ON fire_pumps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_schedules_updated_at
  BEFORE UPDATE ON inspection_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

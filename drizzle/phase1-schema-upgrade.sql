-- ============================================================================
-- YETO v1.6 PHASE 1: DATABASE SCHEMA UPGRADE
-- Full Provenance Tracking & Historical Data Support (2010-2026)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- ENUMS FOR DATA GOVERNANCE
-- ============================================================================

CREATE TYPE IF NOT EXISTS regime_tag AS ENUM (
  'NATIONAL_UNIFIED',
  'IRG_ADEN',
  'DFA_SANAA',
  'MIXED',
  'NOT_APPLICABLE'
);

CREATE TYPE IF NOT EXISTS source_tier AS ENUM ('T1','T2','T3');

CREATE TYPE IF NOT EXISTS source_status AS ENUM ('ACTIVE','INACTIVE','PENDING','DEPRECATED');

CREATE TYPE IF NOT EXISTS ingestion_run_status AS ENUM ('RUNNING','SUCCESS','FAILED','PARTIAL');

CREATE TYPE IF NOT EXISTS gap_ticket_status AS ENUM ('OPEN','IN_PROGRESS','RESOLVED','WONT_FIX');

CREATE TYPE IF NOT EXISTS severity_level AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');

CREATE TYPE IF NOT EXISTS content_visibility AS ENUM ('PUBLIC','PREMIUM','INTERNAL');

CREATE TYPE IF NOT EXISTS content_status AS ENUM ('DRAFT','UNDER_REVIEW','PUBLISHED','RETRACTED','ARCHIVED');

CREATE TYPE IF NOT EXISTS approval_stage AS ENUM (
  'DRAFTING',
  'EVIDENCE',
  'CONSISTENCY',
  'SAFETY',
  'AR_COPY',
  'EN_COPY',
  'STANDARDS',
  'FINAL_APPROVAL'
);

CREATE TYPE IF NOT EXISTS approval_result AS ENUM ('PASS','FAIL','NEEDS_HUMAN','SKIPPED');

CREATE TYPE IF NOT EXISTS indicator_frequency AS ENUM ('DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUAL','IRREGULAR');

CREATE TYPE IF NOT EXISTS data_value_kind AS ENUM ('NUMERIC','TEXT','JSON');

CREATE TYPE IF NOT EXISTS lang_code AS ENUM ('EN','AR');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- CALENDAR TABLE (2010-2026 DAILY TIMELINE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_day (
  day date PRIMARY KEY,
  iso_year integer NOT NULL,
  iso_week integer NOT NULL,
  month integer NOT NULL,
  quarter integer NOT NULL,
  day_of_week integer NOT NULL,
  is_weekend boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_year ON calendar_day(iso_year);
CREATE INDEX IF NOT EXISTS idx_calendar_month ON calendar_day(iso_year, month);
CREATE INDEX IF NOT EXISTS idx_calendar_quarter ON calendar_day(iso_year, quarter);

-- Populate calendar for 2010-2026
DO $$
DECLARE
  v_date date := '2010-01-01'::date;
  v_end_date date := '2026-12-31'::date;
BEGIN
  WHILE v_date <= v_end_date LOOP
    INSERT INTO calendar_day (day, iso_year, iso_week, month, quarter, day_of_week, is_weekend)
    VALUES (
      v_date,
      EXTRACT(YEAR FROM v_date)::integer,
      EXTRACT(WEEK FROM v_date)::integer,
      EXTRACT(MONTH FROM v_date)::integer,
      EXTRACT(QUARTER FROM v_date)::integer,
      EXTRACT(DOW FROM v_date)::integer,
      EXTRACT(DOW FROM v_date) IN (0, 6)
    )
    ON CONFLICT (day) DO NOTHING;
    
    v_date := v_date + INTERVAL '1 day';
  END LOOP;
END $$;

-- ============================================================================
-- ENHANCED SOURCE REGISTRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS source_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text,
  publisher text,
  url text,
  tier source_tier NOT NULL DEFAULT 'T2',
  status source_status NOT NULL DEFAULT 'ACTIVE',
  description_en text,
  description_ar text,
  license text,
  contact_email text,
  api_endpoint text,
  api_auth_type text,
  data_formats text[],
  update_frequency text,
  geographic_coverage text,
  temporal_coverage_start date,
  temporal_coverage_end date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_source_registry_updated_at
BEFORE UPDATE ON source_registry
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed major sources (T1 - Tier 1)
INSERT INTO source_registry (source_code, name_en, name_ar, publisher, url, tier, status, description_en, license)
VALUES
  ('CBY_ADEN', 'Central Bank of Yemen - Aden', 'البنك المركزي اليمني - عدن', 'Central Bank of Yemen', 'https://cby.gov.ye', 'T1', 'ACTIVE', 'Official monetary authority for Aden-controlled areas', 'Public Domain'),
  ('CBY_SANAA', 'Central Bank of Yemen - Sana''a', 'البنك المركزي اليمني - صنعاء', 'Central Bank of Yemen', 'https://cby.gov.ye', 'T1', 'ACTIVE', 'Official monetary authority for Sana''a-controlled areas', 'Public Domain'),
  ('WORLD_BANK', 'World Bank', 'البنك الدولي', 'World Bank', 'https://data.worldbank.org', 'T1', 'ACTIVE', 'International development data', 'CC BY 4.0'),
  ('IMF', 'International Monetary Fund', 'صندوق النقد الدولي', 'IMF', 'https://www.imf.org', 'T1', 'ACTIVE', 'Global economic and financial data', 'Public Domain'),
  ('OCHA', 'UN Office for Coordination of Humanitarian Affairs', 'مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية', 'OCHA', 'https://fts.ocha.org', 'T1', 'ACTIVE', 'Humanitarian funding and response data', 'CC BY 4.0'),
  ('WFP', 'World Food Programme', 'برنامج الغذاء العالمي', 'WFP', 'https://wfp.org', 'T1', 'ACTIVE', 'Food security and market monitoring', 'CC BY 4.0'),
  ('UNHCR', 'UN Refugee Agency', 'المفوضية السامية للأمم المتحدة لشؤون اللاجئين', 'UNHCR', 'https://unhcr.org', 'T1', 'ACTIVE', 'Refugee and displacement statistics', 'CC BY 4.0'),
  ('UNICEF', 'UN Children''s Fund', 'منظمة الأمم المتحدة للطفولة', 'UNICEF', 'https://unicef.org', 'T1', 'ACTIVE', 'Child welfare and development indicators', 'CC BY 4.0')
ON CONFLICT (source_code) DO NOTHING;

-- ============================================================================
-- ENHANCED INGESTION RUN TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingestion_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES source_registry(id) ON DELETE CASCADE,
  run_date date NOT NULL,
  run_time timestamptz NOT NULL DEFAULT NOW(),
  status ingestion_run_status NOT NULL DEFAULT 'RUNNING',
  records_processed integer DEFAULT 0,
  records_inserted integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  execution_time_seconds numeric,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_run_source ON ingestion_run(source_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_run_date ON ingestion_run(run_date DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_run_status ON ingestion_run(status);

-- ============================================================================
-- ENHANCED OBSERVATION TABLE WITH VERSIONING
-- ============================================================================

ALTER TABLE IF EXISTS observation
ADD COLUMN IF NOT EXISTS vintage_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS revision_no integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS confidence numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS is_estimate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS quality_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes text;

-- Create unique constraint for versioning
CREATE UNIQUE INDEX IF NOT EXISTS idx_observation_versioning 
ON observation(series_id, obs_date, vintage_date, revision_no);

-- ============================================================================
-- GAP TICKET SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS gap_ticket (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_type text NOT NULL,
  title text NOT NULL,
  description text,
  severity severity_level NOT NULL DEFAULT 'MEDIUM',
  status gap_ticket_status NOT NULL DEFAULT 'OPEN',
  related_source_id uuid REFERENCES source_registry(id) ON DELETE SET NULL,
  related_indicator_id uuid,
  related_series_id uuid,
  assigned_to uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  resolved_at timestamptz,
  resolution_notes text
);

CREATE INDEX IF NOT EXISTS idx_gap_ticket_status ON gap_ticket(status);
CREATE INDEX IF NOT EXISTS idx_gap_ticket_severity ON gap_ticket(severity);
CREATE INDEX IF NOT EXISTS idx_gap_ticket_source ON gap_ticket(related_source_id);
CREATE INDEX IF NOT EXISTS idx_gap_ticket_created ON gap_ticket(created_at DESC);

CREATE TRIGGER trg_gap_ticket_updated_at
BEFORE UPDATE ON gap_ticket
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- MULTI-AGENT APPROVAL ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text,
  description text,
  stage approval_stage NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Seed approval agents
INSERT INTO agent (agent_key, name_en, name_ar, stage, description)
VALUES
  ('evidence_agent', 'Evidence Validator', 'مدقق الأدلة', 'EVIDENCE', 'Validates all claims against sources'),
  ('consistency_agent', 'Consistency Checker', 'مدقق التناسق', 'CONSISTENCY', 'Checks for contradictions'),
  ('safety_agent', 'Safety Screener', 'فاحص الأمان', 'SAFETY', 'Screens for harmful content'),
  ('ar_translator', 'Arabic Translator', 'المترجم العربي', 'AR_COPY', 'Validates Arabic translation'),
  ('en_translator', 'English Translator', 'المترجم الإنجليزي', 'EN_COPY', 'Validates English translation'),
  ('format_agent', 'Format Checker', 'فاحص الصيغة', 'STANDARDS', 'Checks formatting and style'),
  ('uniqueness_agent', 'Uniqueness Detector', 'كاشف التفرد', 'CONSISTENCY', 'Detects plagiarism'),
  ('quality_agent', 'Quality Scorer', 'مقيم الجودة', 'FINAL_APPROVAL', 'Scores content quality')
ON CONFLICT (agent_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS agent_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agent(id) ON DELETE CASCADE,
  content_item_id uuid,
  stage approval_stage NOT NULL,
  result approval_result NOT NULL DEFAULT 'SKIPPED',
  score numeric DEFAULT 0,
  notes text,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  run_started_at timestamptz NOT NULL DEFAULT NOW(),
  run_ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_run_stage ON agent_run(stage);
CREATE INDEX IF NOT EXISTS idx_agent_run_result ON agent_run(result);
CREATE INDEX IF NOT EXISTS idx_agent_run_created ON agent_run(created_at DESC);

-- ============================================================================
-- CONTENT EVIDENCE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid,
  claim_text text NOT NULL,
  lang lang_code NOT NULL,
  source_id uuid REFERENCES source_registry(id) ON DELETE SET NULL,
  document_id uuid,
  url text,
  page_ref text,
  extracted_quote text,
  confidence numeric DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_evidence_source ON content_evidence(source_id);
CREATE INDEX IF NOT EXISTS idx_content_evidence_created ON content_evidence(created_at DESC);

-- ============================================================================
-- DOCUMENT TEXT CHUNKS WITH EMBEDDINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_text_chunk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid,
  chunk_index integer NOT NULL,
  page_start integer,
  page_end integer,
  text_en text,
  text_ar text,
  embedding vector(1536),
  citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_chunk_document ON document_text_chunk(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunk_embedding ON document_text_chunk USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- BILINGUAL GLOSSARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS glossary_term (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_en text NOT NULL UNIQUE,
  term_ar text NOT NULL UNIQUE,
  definition_en text NOT NULL,
  definition_ar text NOT NULL,
  category text,
  context text,
  related_terms text[],
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_glossary_term_updated_at
BEFORE UPDATE ON glossary_term
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- ROLE-BASED ACCESS CONTROL
-- ============================================================================

CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'editor', 'analyst', 'subscriber', 'citizen');

ALTER TABLE IF EXISTS user_account
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'citizen',
ADD COLUMN IF NOT EXISTS organization text,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify calendar table
SELECT COUNT(*) as calendar_days FROM calendar_day WHERE day >= '2010-01-01' AND day <= '2026-12-31';

-- Verify source registry
SELECT COUNT(*) as sources FROM source_registry WHERE status = 'ACTIVE';

-- Verify agents
SELECT COUNT(*) as agents FROM agent WHERE is_active = true;

-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('calendar_day', 'source_registry', 'ingestion_run', 'gap_ticket', 'agent', 'agent_run', 'content_evidence', 'document_text_chunk', 'glossary_term', 'audit_log')
ORDER BY table_name;

=== BEGIN FILE: db/schema.sql ===

-- Yemen Economic Transparency Observatory (YETO)
-- PostgreSQL Schema (Jan 2026) — Evidence-first, audit-ready, bilingual.
--
-- Run with:
--   psql "$DATABASE_URL" -f db/schema.sql
--
-- Notes:
-- - Optional extensions are enabled only if available.
-- - All user-facing claims must be traceable to Source IDs (src_id) and artifacts.

BEGIN;

CREATE SCHEMA IF NOT EXISTS yeto;
SET search_path = yeto, public;

-- -----------------------------
-- Extensions (best-effort)
-- -----------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
  EXCEPTION WHEN undefined_file THEN
    RAISE NOTICE 'pgvector extension not installed; embeddings will use float8[] columns.';
  END;
END$$;

DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS timescaledb;
  EXCEPTION WHEN undefined_file THEN
    RAISE NOTICE 'timescaledb extension not installed; using plain Postgres tables.';
  END;
END$$;

-- -----------------------------
-- Types
-- -----------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_lang') THEN
    CREATE TYPE yeto_lang AS ENUM ('en','ar');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_tier') THEN
    CREATE TYPE yeto_tier AS ENUM ('T1','T2','T3');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_access_method') THEN
    CREATE TYPE yeto_access_method AS ENUM ('API','WEB','PORTAL','DOCUMENTS','SCRAPE','MANUAL','SATELLITE','SUBSCRIPTION','MIXED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_quality_status') THEN
    CREATE TYPE yeto_quality_status AS ENUM ('VERIFIED','PROVISIONAL','ESTIMATED','EXPERIMENTAL','UNKNOWN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_regime') THEN
    CREATE TYPE yeto_regime AS ENUM ('NATIONAL','ADEN_IRG','SANAA_DFA','BOTH','UNKNOWN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_freq') THEN
    CREATE TYPE yeto_freq AS ENUM ('DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUAL','IRREGULAR','EVENT','ADHOC');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_content_type') THEN
    CREATE TYPE yeto_content_type AS ENUM ('REPORT','BRIEF','DASHBOARD_ANNOTATION','TIMELINE_EVENT','METHODOLOGY','GLOSSARY','NEWS_UPDATE','DATASET_DOC','SANCTION_BULLETIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_approval_stage') THEN
    CREATE TYPE yeto_approval_stage AS ENUM ('ALPHA_INGEST','BETA_EVIDENCE','GAMMA_CONSISTENCY','DELTA_COMPLIANCE','EPSILON_EDITORIAL','ZETA_UNIQUENESS','FINAL_PUBLISH');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'yeto_approval_status') THEN
    CREATE TYPE yeto_approval_status AS ENUM ('PENDING','IN_REVIEW','APPROVED','CHANGES_REQUIRED','REJECTED','SKIPPED');
  END IF;
END $$;

-- -----------------------------
-- Utility functions
-- -----------------------------
CREATE OR REPLACE FUNCTION yeto.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------
-- Core registry: Sources
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.source (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src_id text NOT NULL UNIQUE,                     -- e.g., SRC-001
  src_numeric_id integer NOT NULL UNIQUE,          -- 1..N (stable ordering)
  name_en text NOT NULL,
  name_ar text,
  category text,
  tier yeto_tier,
  institution text,
  url text,
  url_raw text,
  access_method yeto_access_method,
  update_frequency text,
  license text,
  reliability_score numeric(5,2),
  geographic_coverage text,
  typical_lag_days integer,
  auth text,
  data_fields text,
  ingestion_method text,
  notes text,
  origin text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_source_name_trgm ON yeto.source USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_source_category ON yeto.source (category);
CREATE INDEX IF NOT EXISTS idx_source_tier ON yeto.source (tier);
CREATE INDEX IF NOT EXISTS idx_source_active ON yeto.source (active);

DROP TRIGGER IF EXISTS trg_source_updated_at ON yeto.source;
CREATE TRIGGER trg_source_updated_at
BEFORE UPDATE ON yeto.source
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Geography registry
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.geo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geo_type text NOT NULL CHECK (geo_type IN ('COUNTRY','REGION','GOVERNORATE','DISTRICT','CITY','CUSTOM')),
  code text UNIQUE,                                -- ISO/admin code if available
  name_en text NOT NULL,
  name_ar text,
  parent_id uuid REFERENCES yeto.geo(id) ON DELETE SET NULL,
  lat numeric(9,6),
  lon numeric(9,6),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geo_parent ON yeto.geo(parent_id);
CREATE INDEX IF NOT EXISTS idx_geo_name_trgm ON yeto.geo USING gin (name_en gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_geo_updated_at ON yeto.geo;
CREATE TRIGGER trg_geo_updated_at
BEFORE UPDATE ON yeto.geo
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Indicator registry
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.indicator (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_code citext NOT NULL UNIQUE,           -- stable code (from source or YETO canonical)
  name_en text NOT NULL,
  name_ar text,
  description_en text,
  description_ar text,
  unit text,
  currency text,
  base_year integer,
  sector text,
  sub_sector text,
  sdg text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_indicator_sector ON yeto.indicator(sector);
CREATE INDEX IF NOT EXISTS idx_indicator_name_trgm ON yeto.indicator USING gin (name_en gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_indicator_updated_at ON yeto.indicator;
CREATE TRIGGER trg_indicator_updated_at
BEFORE UPDATE ON yeto.indicator
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Time-series series registry
-- Disagreement Mode: separate series per source/regime.
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_key text NOT NULL UNIQUE,                 -- deterministic hashable key
  indicator_id uuid NOT NULL REFERENCES yeto.indicator(id) ON DELETE RESTRICT,
  source_id uuid NOT NULL REFERENCES yeto.source(id) ON DELETE RESTRICT,
  geo_id uuid NOT NULL REFERENCES yeto.geo(id) ON DELETE RESTRICT,
  freq yeto_freq NOT NULL,
  regime yeto_regime NOT NULL DEFAULT 'UNKNOWN',
  unit_override text,
  currency_override text,
  scale text,
  methodology text,
  start_date date,
  end_date date,
  quality_status yeto_quality_status NOT NULL DEFAULT 'UNKNOWN',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(indicator_id, source_id, geo_id, freq, regime, COALESCE(methodology,''))
);

CREATE INDEX IF NOT EXISTS idx_series_indicator ON yeto.series(indicator_id);
CREATE INDEX IF NOT EXISTS idx_series_source ON yeto.series(source_id);
CREATE INDEX IF NOT EXISTS idx_series_geo ON yeto.series(geo_id);

DROP TRIGGER IF EXISTS trg_series_updated_at ON yeto.series;
CREATE TRIGGER trg_series_updated_at
BEFORE UPDATE ON yeto.series
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Ingestion runs & tasks
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.ingestion_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_key text NOT NULL UNIQUE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  status text NOT NULL CHECK (status IN ('RUNNING','SUCCEEDED','FAILED','PARTIAL','CANCELLED')),
  trigger text NOT NULL CHECK (trigger IN ('SCHEDULE','MANUAL','BACKFILL','WEBHOOK')),
  initiated_by text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_run_status ON yeto.ingestion_run(status);

DROP TRIGGER IF EXISTS trg_ingestion_run_updated_at ON yeto.ingestion_run;
CREATE TRIGGER trg_ingestion_run_updated_at
BEFORE UPDATE ON yeto.ingestion_run
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.ingestion_task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_run_id uuid NOT NULL REFERENCES yeto.ingestion_run(id) ON DELETE CASCADE,
  src_id text,                                    -- convenience copy
  source_id uuid REFERENCES yeto.source(id) ON DELETE SET NULL,
  task_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','RUNNING','SUCCEEDED','FAILED','SKIPPED')),
  started_at timestamptz,
  ended_at timestamptz,
  rows_read integer,
  rows_written integer,
  error_summary text,
  logs_uri text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_task_run ON yeto.ingestion_task(ingestion_run_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_task_source ON yeto.ingestion_task(source_id);

DROP TRIGGER IF EXISTS trg_ingestion_task_updated_at ON yeto.ingestion_task;
CREATE TRIGGER trg_ingestion_task_updated_at
BEFORE UPDATE ON yeto.ingestion_task
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Artifacts (raw evidence)
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.artifact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES yeto.source(id) ON DELETE SET NULL,
  src_id text,
  artifact_type text NOT NULL CHECK (artifact_type IN ('CSV','XLSX','JSON','PDF','HTML','IMAGE','TEXT','OTHER')),
  title text,
  source_url text,
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  sha256 text,
  bytes bigint,
  mime_type text,
  storage_uri text NOT NULL,                       -- e.g., s3://bucket/key (do not expose publicly)
  license text,
  language yeto_lang,
  extracted_text text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifact_source ON yeto.artifact(source_id);
CREATE INDEX IF NOT EXISTS idx_artifact_retrieved ON yeto.artifact(retrieved_at);
CREATE INDEX IF NOT EXISTS idx_artifact_sha ON yeto.artifact(sha256);

DROP TRIGGER IF EXISTS trg_artifact_updated_at ON yeto.artifact;
CREATE TRIGGER trg_artifact_updated_at
BEFORE UPDATE ON yeto.artifact
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Transformations & lineage
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.transformation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text NOT NULL,
  description text,
  code_ref text,                                   -- git ref or container tag
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yeto.transformation_step (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transformation_id uuid NOT NULL REFERENCES yeto.transformation(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  step_name text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(transformation_id, step_index)
);

-- -----------------------------
-- Observations (time series values)
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.observation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES yeto.series(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date,
  period_label text,
  value_num numeric,
  value_text text,
  unit text,
  currency text,
  value_scale text,
  quality_status yeto_quality_status NOT NULL DEFAULT 'UNKNOWN',
  confidence_grade text,
  is_latest boolean NOT NULL DEFAULT true,
  revision_of uuid REFERENCES yeto.observation(id) ON DELETE SET NULL,
  ingestion_run_id uuid REFERENCES yeto.ingestion_run(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(series_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_observation_series_period ON yeto.observation(series_id, period_start);
CREATE INDEX IF NOT EXISTS idx_observation_period ON yeto.observation(period_start);

DROP TRIGGER IF EXISTS trg_observation_updated_at ON yeto.observation;
CREATE TRIGGER trg_observation_updated_at
BEFORE UPDATE ON yeto.observation
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- Timescale hypertable (best effort)
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
    BEGIN
      EXECUTE "SELECT create_hypertable('yeto.observation','period_start', if_not_exists => TRUE)";
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not create hypertable for yeto.observation (non-fatal).';
    END;
  END IF;
END$$;

-- Provenance: link each observation to artifacts and transformations
CREATE TABLE IF NOT EXISTS yeto.observation_provenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES yeto.observation(id) ON DELETE CASCADE,
  artifact_id uuid REFERENCES yeto.artifact(id) ON DELETE SET NULL,
  transformation_id uuid REFERENCES yeto.transformation(id) ON DELETE SET NULL,
  citation_label text,                             -- human-readable citation label
  citation_locator text,                           -- page/section/table/cell
  evidence_quote text,                             -- short excerpt (<=25 words recommended)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_obsprov_obs ON yeto.observation_provenance(observation_id);
CREATE INDEX IF NOT EXISTS idx_obsprov_artifact ON yeto.observation_provenance(artifact_id);

-- -----------------------------
-- Documents & RAG chunks
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.document (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES yeto.source(id) ON DELETE SET NULL,
  src_id text,
  title text NOT NULL,
  title_ar text,
  doc_type text NOT NULL CHECK (doc_type IN ('REPORT','BRIEF','PAPER','BLOG','DATASET_DOC','LEGAL','OTHER')),
  published_at date,
  author text,
  url text,
  storage_uri text,
  language yeto_lang NOT NULL DEFAULT 'en',
  summary_en text,
  summary_ar text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_published ON yeto.document(published_at);
CREATE INDEX IF NOT EXISTS idx_document_title_trgm ON yeto.document USING gin (title gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_document_updated_at ON yeto.document;
CREATE TRIGGER trg_document_updated_at
BEFORE UPDATE ON yeto.document
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- Create document_chunk table with embedding column depending on pgvector availability
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='yeto' AND table_name='document_chunk') THEN
    IF EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
      EXECUTE $$
      CREATE TABLE yeto.document_chunk (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id uuid NOT NULL REFERENCES yeto.document(id) ON DELETE CASCADE,
        chunk_index integer NOT NULL,
        language yeto_lang NOT NULL DEFAULT 'en',
        content_text text NOT NULL,
        embedding vector(1536),
        citation_label text,
        citation_locator text,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(document_id, chunk_index)
      );
      $$;
    ELSE
      EXECUTE $$
      CREATE TABLE yeto.document_chunk (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id uuid NOT NULL REFERENCES yeto.document(id) ON DELETE CASCADE,
        chunk_index integer NOT NULL,
        language yeto_lang NOT NULL DEFAULT 'en',
        content_text text NOT NULL,
        embedding float8[],
        citation_label text,
        citation_locator text,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(document_id, chunk_index)
      );
      $$;
    END IF;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_docchunk_doc ON yeto.document_chunk(document_id);
CREATE INDEX IF NOT EXISTS idx_docchunk_lang ON yeto.document_chunk(language);

-- -----------------------------
-- Timeline events (must be cited)
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ar text,
  event_date date NOT NULL,
  event_type text NOT NULL,
  description_en text,
  description_ar text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  confidence_grade text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_date ON yeto.event(event_date);
CREATE INDEX IF NOT EXISTS idx_event_title_trgm ON yeto.event USING gin (title_en gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_event_updated_at ON yeto.event;
CREATE TRIGGER trg_event_updated_at
BEFORE UPDATE ON yeto.event
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.event_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES yeto.event(id) ON DELETE CASCADE,
  artifact_id uuid REFERENCES yeto.artifact(id) ON DELETE SET NULL,
  document_id uuid REFERENCES yeto.document(id) ON DELETE SET NULL,
  citation_label text,
  citation_locator text,
  evidence_quote text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_evidence_event ON yeto.event_evidence(event_id);

-- -----------------------------
-- Glossary & Naming registry (bilingual canonical terms)
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.naming_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_key text NOT NULL UNIQUE,
  term_en text NOT NULL,
  term_ar text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_naming_registry_updated_at ON yeto.naming_registry;
CREATE TRIGGER trg_naming_registry_updated_at
BEFORE UPDATE ON yeto.naming_registry
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.glossary_term (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_key text NOT NULL UNIQUE,
  term_en text NOT NULL,
  term_ar text NOT NULL,
  definition_en text,
  definition_ar text,
  context_en text,
  context_ar text,
  related_indicator_codes citext[],
  tags text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_glossary_term_updated_at ON yeto.glossary_term;
CREATE TRIGGER trg_glossary_term_updated_at
BEFORE UPDATE ON yeto.glossary_term
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Compliance & sanctions
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.entity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name text NOT NULL,
  entity_name_ar text,
  entity_type text NOT NULL CHECK (entity_type IN ('BANK','MFI','MONEY_EXCHANGER','COMPANY','INDIVIDUAL','VESSEL','OTHER')),
  jurisdiction text,
  regime yeto_regime NOT NULL DEFAULT 'UNKNOWN',
  identifiers jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entity_name_trgm ON yeto.entity USING gin (entity_name gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_entity_updated_at ON yeto.entity;
CREATE TRIGGER trg_entity_updated_at
BEFORE UPDATE ON yeto.entity
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.sanction_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_name text NOT NULL,
  authority text NOT NULL,
  source_id uuid REFERENCES yeto.source(id) ON DELETE SET NULL,
  src_id text,
  url text,
  update_frequency text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_name, authority)
);

DROP TRIGGER IF EXISTS trg_sanction_list_updated_at ON yeto.sanction_list;
CREATE TRIGGER trg_sanction_list_updated_at
BEFORE UPDATE ON yeto.sanction_list
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.sanction_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sanction_list_id uuid NOT NULL REFERENCES yeto.sanction_list(id) ON DELETE CASCADE,
  external_id text,
  listed_name text NOT NULL,
  listed_name_ar text,
  entity_type text,
  program text,
  status text NOT NULL CHECK (status IN ('ACTIVE','LIFTED','UNDER_REVIEW','UNKNOWN')),
  listed_on date,
  lifted_on date,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sanction_entry_name_trgm ON yeto.sanction_entry USING gin (listed_name gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_sanction_entry_updated_at ON yeto.sanction_entry;
CREATE TRIGGER trg_sanction_entry_updated_at
BEFORE UPDATE ON yeto.sanction_entry
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.entity_sanction_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES yeto.entity(id) ON DELETE CASCADE,
  sanction_entry_id uuid NOT NULL REFERENCES yeto.sanction_entry(id) ON DELETE CASCADE,
  match_confidence numeric(5,2),
  match_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entity_id, sanction_entry_id)
);

-- -----------------------------
-- QA checks
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.qa_check (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  severity text NOT NULL CHECK (severity IN ('INFO','WARN','BLOCKER')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yeto.qa_result (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_run_id uuid NOT NULL REFERENCES yeto.ingestion_run(id) ON DELETE CASCADE,
  check_id uuid NOT NULL REFERENCES yeto.qa_check(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('PASS','FAIL','SKIP')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ingestion_run_id, check_id)
);

CREATE INDEX IF NOT EXISTS idx_qa_result_run ON yeto.qa_result(ingestion_run_id);

-- -----------------------------
-- GAP tickets & correction tickets
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.gap_ticket (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  module text,
  src_id text,
  severity text NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text NOT NULL CHECK (status IN ('OPEN','IN_PROGRESS','BLOCKED','DONE','WONTFIX')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_gap_ticket_updated_at ON yeto.gap_ticket;
CREATE TRIGGER trg_gap_ticket_updated_at
BEFORE UPDATE ON yeto.gap_ticket
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.correction_ticket (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  reported_by text,
  related_observation_id uuid REFERENCES yeto.observation(id) ON DELETE SET NULL,
  related_document_id uuid REFERENCES yeto.document(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('OPEN','TRIAGED','FIXED','REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_correction_ticket_updated_at ON yeto.correction_ticket;
CREATE TRIGGER trg_correction_ticket_updated_at
BEFORE UPDATE ON yeto.correction_ticket
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Users, roles, subscriptions (minimal; use IdP for auth)
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject text NOT NULL UNIQUE,               -- sub from IdP
  email citext,
  display_name text,
  preferred_lang yeto_lang NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_app_user_updated_at ON yeto.app_user;
CREATE TRIGGER trg_app_user_updated_at
BEFORE UPDATE ON yeto.app_user
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL UNIQUE,
  description text
);

CREATE TABLE IF NOT EXISTS yeto.user_role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES yeto.app_user(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES yeto.role(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS yeto.subscription_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_ar text,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yeto.subscription (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES yeto.app_user(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES yeto.subscription_plan(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('ACTIVE','PAST_DUE','CANCELLED','TRIAL','EXPIRED')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

DROP TRIGGER IF EXISTS trg_subscription_updated_at ON yeto.subscription;
CREATE TRIGGER trg_subscription_updated_at
BEFORE UPDATE ON yeto.subscription
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Saved views, alerts, reports
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.saved_view (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES yeto.app_user(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  view_spec jsonb NOT NULL,                        -- serialized dashboard config
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_saved_view_updated_at ON yeto.saved_view;
CREATE TRIGGER trg_saved_view_updated_at
BEFORE UPDATE ON yeto.saved_view
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.alert_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES yeto.app_user(id) ON DELETE CASCADE,
  name text NOT NULL,
  rule_spec jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_alert_rule_updated_at ON yeto.alert_rule;
CREATE TRIGGER trg_alert_rule_updated_at
BEFORE UPDATE ON yeto.alert_rule
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.report (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES yeto.app_user(id) ON DELETE SET NULL,
  title text NOT NULL,
  language yeto_lang NOT NULL DEFAULT 'en',
  report_spec jsonb NOT NULL,
  generated_uri text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_report_updated_at ON yeto.report;
CREATE TRIGGER trg_report_updated_at
BEFORE UPDATE ON yeto.report
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

-- -----------------------------
-- Governance: Agent runs & approvals
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.agent_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  model_id text,
  input_hash text,
  output_hash text,
  status text NOT NULL CHECK (status IN ('RUNNING','SUCCEEDED','FAILED')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  logs jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS yeto.content_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type yeto_content_type NOT NULL,
  language yeto_lang NOT NULL,
  title text NOT NULL,
  body_md text NOT NULL,
  evidence_set_hash text,
  status text NOT NULL CHECK (status IN ('DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED')),
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_content_item_updated_at ON yeto.content_item;
CREATE TRIGGER trg_content_item_updated_at
BEFORE UPDATE ON yeto.content_item
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.approval_workflow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES yeto.content_item(id) ON DELETE CASCADE,
  current_stage yeto_approval_stage NOT NULL DEFAULT 'ALPHA_INGEST',
  status yeto_approval_status NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_item_id)
);

DROP TRIGGER IF EXISTS trg_approval_workflow_updated_at ON yeto.approval_workflow;
CREATE TRIGGER trg_approval_workflow_updated_at
BEFORE UPDATE ON yeto.approval_workflow
FOR EACH ROW EXECUTE FUNCTION yeto.set_updated_at();

CREATE TABLE IF NOT EXISTS yeto.approval_step (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_workflow_id uuid NOT NULL REFERENCES yeto.approval_workflow(id) ON DELETE CASCADE,
  stage yeto_approval_stage NOT NULL,
  status yeto_approval_status NOT NULL DEFAULT 'PENDING',
  agent_name text,
  agent_run_id uuid REFERENCES yeto.agent_run(id) ON DELETE SET NULL,
  findings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  UNIQUE(approval_workflow_id, stage)
);

-- -----------------------------
-- Audit log (application events)
-- -----------------------------
CREATE TABLE IF NOT EXISTS yeto.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;


=== END FILE: db/schema.sql ===



=== BEGIN FILE: db/seed.sql ===

-- YETO Seed Data (Jan 2026)
-- Run with:
--   psql "$DATABASE_URL" -f db/seed.sql

\set ON_ERROR_STOP on

BEGIN;

SET search_path = yeto, public;

-- Base geography
INSERT INTO yeto.geo (geo_type, code, name_en, name_ar)
VALUES ('COUNTRY','YEM','Yemen','اليمن')
ON CONFLICT (geo_type, code) DO NOTHING;

-- Roles (RBAC)
INSERT INTO yeto.role (role_key, description) VALUES
  ('public', 'Unauthenticated public visitor (read-only, heavily rate-limited).'),
  ('registered', 'Registered user (basic access).'),
  ('pro', 'Pro subscriber (advanced analytics, exports, API).'),
  ('enterprise', 'Institutional client (team features, bulk exports, advanced API).'),
  ('partner_contributor', 'Verified partner contributor (can submit sources/evidence).'),
  ('editor', 'Editorial reviewer (can edit/publish content).'),
  ('data_steward', 'Data steward (can manage registry, ingestion, QA).'),
  ('compliance_officer', 'Compliance analyst (sanctions & compliance module).'),
  ('admin', 'System administrator.'),
  ('owner', 'Owner override (OWNER_REVIEW_MODE).')
ON CONFLICT (role_key) DO NOTHING;

-- Subscription plans (feature flags are enforced both in backend + UI).
-- IMPORTANT: UI must never show fake limits; it must query these settings.
INSERT INTO yeto.subscription_plan (plan_key, name_en, name_ar, features)
VALUES
  ('public', 'Public', 'عام',
    '{"dashboards":true,"research":true,"downloads":{"csv":false,"xlsx":false,"pdf":false},"api":{"enabled":false},"alerts":{"enabled":false},"workspace":false}'::jsonb),
  ('registered', 'Registered', 'مسجل',
    '{"dashboards":true,"research":true,"downloads":{"csv":true,"xlsx":false,"pdf":false},"api":{"enabled":false},"alerts":{"enabled":true,"max":5},"workspace":true}'::jsonb),
  ('pro', 'Pro', 'احترافي',
    '{"dashboards":true,"research":true,"downloads":{"csv":true,"xlsx":true,"pdf":true,"png":true,"svg":true,"json":true},"api":{"enabled":true,"daily_limit":5000},"alerts":{"enabled":true,"max":50},"workspace":true,"scenario_sim":true,"assistant":true}'::jsonb),
  ('enterprise', 'Enterprise', 'مؤسسي',
    '{"dashboards":true,"research":true,"downloads":{"csv":true,"xlsx":true,"pdf":true,"png":true,"svg":true,"json":true},"api":{"enabled":true,"daily_limit":100000},"alerts":{"enabled":true,"max":500},"workspace":true,"scenario_sim":true,"assistant":true,"team":true,"sso":true,"scheduled_exports":true}'::jsonb)
ON CONFLICT (plan_key) DO NOTHING;

COMMIT;

-- Load Source Registry from CSV file.
-- Place the CSV at: db/seeds/sources_seed_225.csv (in the repo).
-- Then run:
--   psql "$DATABASE_URL" -f db/seed.sql
-- from the repo root.

\copy yeto.source (src_id, src_numeric_id, name_en, category, tier, institution, url, url_raw, access_method, update_frequency, license, reliability_score, geographic_coverage, typical_lag_days, auth, data_fields, ingestion_method, notes, tags, origin)
FROM 'db/seeds/sources_seed_225.csv'
WITH (FORMAT csv, HEADER true, QUOTE '"', ESCAPE '"');

-- Post-load: create GAP tickets automatically for any sources with critical NULLs
-- (category, url, access_method) so UI can show "Data Not Available" with Ticket ID.
INSERT INTO yeto.gap_ticket (gap_type, title, description, severity, status, related_source_id, related_module)
SELECT
  'REGISTRY_META' AS gap_type,
  'Missing mandatory metadata for source ' || s.src_id AS title,
  'One or more mandatory fields are NULL: '
    || CASE WHEN s.category IS NULL OR s.category='' THEN 'category; ' ELSE '' END
    || CASE WHEN s.url IS NULL OR s.url='' THEN 'url; ' ELSE '' END
    || CASE WHEN s.access_method IS NULL THEN 'access_method; ' ELSE '' END
    || 'Please complete registry metadata and re-run lint.' AS description,
  CASE WHEN s.tier='T1' THEN 'HIGH' ELSE 'MEDIUM' END AS severity,
  'OPEN' AS status,
  s.id AS related_source_id,
  'SOURCE_REGISTRY' AS related_module
FROM yeto.source s
WHERE (s.category IS NULL OR s.category='')
   OR (s.url IS NULL OR s.url='')
   OR (s.access_method IS NULL)
ON CONFLICT DO NOTHING;


=== END FILE: db/seed.sql ===



=== BEGIN FILE: db/seeds/sources_seed_225.csv ===

src_id,src_numeric_id,name_en,category,tier,institution,url,url_raw,access_method,update_frequency,license,reliability_score,coverage,typical_lag,auth,data_fields,ingestion_method,yeto_usage,yeto_module,granularity_caveats,notes,origin
SRC-001,1,World Bank Macro PovcalNet,Poverty & Distribution,Global,,https://api.worldbank.org/v2/country/YEM/indicator/SI.POV.DDAY?format=json,[PovcalNet API](https://api.worldbank.org/v2/country/YEM/indicator/SI.POV.DDAY?format=json),,Annual,,,,,,,,,,,"Provides poverty headcount ratios (US$1.90, US$3.20, US$5.50 lines) and income distribution data.  Tag as “World Bank – PovcalNet”.",extended
SRC-002,2,World Bank International Debt Statistics,Debt,Global,,https://api.worldbank.org/v2/country/YEM/indicator/DT.TDS.DECT.CD?format=json,[World Bank IDS API](https://api.worldbank.org/v2/country/YEM/indicator/DT.TDS.DECT.CD?format=json),,Annual,,,,,,,,,,,External debt stocks and debt service flows.,extended
SRC-003,3,World Bank Global Economic Monitor (GEM),Macro/trade,Global,,https://worldbank.org/gem-api,[GEM API](https://worldbank.org/gem-api) (*requires key*),,Monthly,,,,,,,,,,,"Commodities prices, remittances flows, and macro indicators used in GEM; part of WBG but requires registration.",extended
SRC-004,4,IMF World Economic Outlook (WEO),Forecasts,Global,,https://www.imf.org/en/Publications/WEO,[IMF WEO API](https://www.imf.org/en/Publications/WEO) (download via SDMX),,"Biannual (Apr, Oct)",,,,,,,,,,,"Provides macro forecasts for GDP growth, inflation, fiscal balance; also baseline and scenario projections.",extended
SRC-005,5,IMF Fiscal Monitor,Fiscal,Global,,https://www.imf.org/en/Publications/FM,[Fiscal Monitor PDF](https://www.imf.org/en/Publications/FM),,Biannual,,,,,,,,,,,Contextual narrative on fiscal developments; includes tables of expenditure and revenue for some countries.  Ingest as documents.,extended
SRC-006,6,Arab Monetary Fund (AMF),Macro & Monetary,Regional (MENA),,https://amf.org.ae,[AMF Economic Data](https://amf.org.ae),,Quarterly/Annual,,,,,,,,,,,Aggregated macro statistics for Arab countries; may provide monetary aggregates and inflation proxies.  *Check licensing.*,extended
SRC-007,7,UN ESCWA (Arab Countries Macro Data),Macro/Socio-economic,Regional,,https://data.unescwa.org/,[ESCWA Data Portal](https://data.unescwa.org/),,Annual,,,,,,,,,,,"Socio-economic indicators for MENA; includes GDP, inflation, unemployment, energy.  API or bulk download available; license open with attribution.",extended
SRC-008,8,Trading Economics,Macro & Market,Global,,https://api.tradingeconomics.com/yemen/indicators,[TradingEconomics API](https://api.tradingeconomics.com/yemen/indicators),,Daily/Weekly,,,,,,,,,,,"Aggregates official and market data (CPI, FX, interest rates).  Free tier requires registration; verify data provenance.  *Check licensing.*",extended
SRC-009,9,Yemen Central Statistical Office (CSO) Yearbooks,Macro & Demographics,National,,https://cso-yemen.org,[Archived PDFs](https://cso-yemen.org),,Pre‑2014 annual,,,,,,,,,,,"Official statistical yearbooks covering GDP by sector, CPI, population, education, health (up to 2014).  Ingest scanned PDFs; extract tables via OCR.  Coverage ends before conflict.",extended
SRC-010,10,UN Population Division World Population Prospects,Demographics,Global,,https://population.un.org/dataportal/about/dataapi,[UN WPP API](https://population.un.org/dataportal/about/dataapi),,Annual,,,,,,,,,,,"Standard demographic projections; includes fertility, mortality, migration.  Use for cross‑checking CSO and UNFPA projections.",extended
SRC-011,11,UN Human Development Reports,HDI and multi-dimensional indices,Global,,https://hdr.undp.org/data,[HDR Data](https://hdr.undp.org/data),,Annual,,,,,,,,,,,"Includes HDI, GII, and Multidimensional Poverty Index (MPI) for Yemen.  Ingest for context.",extended
SRC-012,12,World Bank Doing Business (archived),Business environment,Global,,https://openknowledge.worldbank.org/handle/10986/34744,[WB Doing Business data](https://openknowledge.worldbank.org/handle/10986/34744),,Annual (discontinued 2021),,,,,,,,,,,"Ease-of-doing-business rankings, cost of starting a business, etc.  Useful for private sector context.",extended
SRC-013,13,World Bank Enterprise Surveys 2010 Yemen,Enterprise survey,Global,,https://enterprise-surveys.org/en/data/exploreeconomies/2010/yemen,[Enterprise Surveys Data](https://enterprise-surveys.org/en/data/exploreeconomies/2010/yemen),,One‑off (2010),,,,,,,,,,,"Survey microdata on firm characteristics, performance, business environment; requires registration.",extended
SRC-014,14,UN Global SDG Indicators Database,SDG indicators,Global,,https://unstats.un.org/SDGAPI/v1,[UN SDG API](https://unstats.un.org/SDGAPI/v1),,Annual,,,,,,,,,,,"Includes SDG indicators relevant to Yemen (poverty, health, education).",extended
SRC-015,15,University of Sheffield Night‑Time Lights Arabia,Proxy for economic activity,Regional,,https://eogdata.mines.edu/products/ngsNightLight,[Night Lights Data via EOG](https://eogdata.mines.edu/products/ngsNightLight),,Monthly,,,,,,,,,,,Provides VIIRS night‑time lights composites aggregated by country or custom shape; used as economic proxy.  *Open data.*,extended
SRC-016,16,World Food Programme VAM Commodity Price API,Food prices,Global,,https://api.wfp.org/v1/prices,[WFP VAM API](https://api.wfp.org/v1/prices) (*where supported*),,Monthly,,,,,,,,,,,Provides market price data for food and fuel commodities.  Not all countries have API; check for Yemen.,extended
SRC-017,17,FAO Food Price Monitoring Bulletins,Food prices,Global,,https://www.fao.org/giews/food-prices/tool-publications/en/,[FAO GIEWS](https://www.fao.org/giews/food-prices/tool-publications/en/),,Monthly/Quarterly,,,,,,,,,,,Bulletins summarise staple food price trends across countries; includes Yemen; can complement WFP data.,extended
SRC-018,18,SEMC (Yemen Studies & Economic Media Center) Price Bulletins,Market prices,National NGO,,https://economicmedia.net,[SEMC Reports](https://economicmedia.net),,Monthly,,,,,,,,,,,"SEMC publishes price bulletins for staples (flour, fuel, gas) in Yemen’s main cities.  Integrate via PDF scraping.",extended
SRC-019,19,FEWS NET Monthly Price Bulletins,Food security,Global,,https://fews.net/west-africa/yemen,[FEWS NET Data](https://fews.net/west-africa/yemen),,Monthly,,,,,,,,,,,Famine Early Warning Systems Network provides market price bulletins and integrated food security outlooks; includes Yemen; open data.,extended
SRC-020,20,Integrated Food Security Phase Classification (IPC) Analysis,Food security severity,Global,,https://www.ipcinfo.org,[IPC Info](https://www.ipcinfo.org),,Semi‑annual,,,,,,,,,,,Provides classification of food insecurity phases per governorate; narrative and maps; ingest for context.,extended
SRC-021,21,UNICEF Multiple Indicator Cluster Surveys (MICS) – Yemen,Nutrition & household expenditure,Global,,https://mics.unicef.org,[MICS Data](https://mics.unicef.org),,Occasional (latest pre‑conflict),,,,,,,,,,,"Household surveys capturing nutrition, child health, and some expenditure data.  Yemen’s last MICS in 2006; still useful for baseline.",extended
SRC-022,22,World Health Organization Global Health Observatory,Health prices & medical costs,Global,,https://ghoapi.azureedge.net,[WHO GHO API](https://ghoapi.azureedge.net),,Annual,,,,,,,,,,,"Provides health expenditure per capita, out‑of‑pocket spending, and health system indicators.  Use as proxy for cost of health.",extended
SRC-023,23,Central Bank of Yemen FX Auction Archive (Aden),Official FX auctions,National,,http://cby-ye.com,[CBY Aden site](http://cby-ye.com),,Weekly,,,,,,,,,,,Already in master registry; keep.,extended
SRC-024,24,IMF Direction of Trade Statistics (DOTS),Trade & FX proxies,Global,,https://sdmx.imf.org/,[IMF DOTS API](https://sdmx.imf.org/),,Quarterly,,,,,,,,,,,Provides country‑pair trade flows used to infer FX positions; complement Comtrade.,extended
SRC-025,25,Bank for International Settlements (BIS) Triennial Central Bank Survey,FX turnover,Global,,https://stats.bis.org/statistics,[BIS Statistics](https://stats.bis.org/statistics),,Every 3 years,,,,,,,,,,,"Provides data on global currency trading, including USD/YER turnover if reported; low coverage; useful for context.",extended
SRC-026,26,International Finance Corporation (IFC) Investments,Private finance,Global,,https://disclosures.ifc.org,[IFC Projects Portal](https://disclosures.ifc.org),,Continuous,,,,,,,,,,,"Shows IFC investments and advisory services in Yemen; extract investment amounts, dates, sectors.",extended
SRC-027,27,Arab Trade Financing Program (ATFP),Trade finance,Regional,,https://www.atfp.org,[ATFP Annual reports](https://www.atfp.org),,Annual,,,,,,,,,,,Contains statistics on trade finance extended to Yemeni banks; good for understanding import finance availability.,extended
SRC-028,28,World Bank Enterprise Finance Gap Database,SME finance,Global,,https://www.worldbank.org/en/programs/credit-info-access/brief/enterprise-finance-gap-database,[Finance Gap Database](https://www.worldbank.org/en/programs/credit-info-access/brief/enterprise-finance-gap-database),,Periodic,,,,,,,,,,,Estimates financing gaps for SMEs; includes Yemen; can supplement microfinance data.,extended
SRC-029,29,FinDev Gateway,Microfinance & financial inclusion,Global,,https://finDevgateway.org,[FinDev Data](https://finDevgateway.org),,Occasional,,,,,,,,,,,Reports and datasets on microfinance; search for Yemen; cross‑reference with YMN.,extended
SRC-030,30,FATF (Financial Action Task Force) Grey List/Mutual Evaluation,AML/CFT,Global,,https://www.fatf-gafi.org,[FATF Documents](https://www.fatf-gafi.org),,Occasional,,,,,,,,,,,Reports on Yemen’s AML/CFT compliance; relevant for banking sector risk; narrative only.,extended
SRC-031,31,MENA Financial Inclusion Dashboard (World Bank / Arab Monetary Fund),Inclusion,Regional,,https://arabfinancialinclusion.info,[MENA FI data](https://arabfinancialinclusion.info),,Annual,,,,,,,,,,,"Provides indicators on access to finance, account penetration, digital payments.",extended
SRC-032,32,Payment Rail Maps (GSMA & UNCDF),Mobile money and payments,Global,,https://www.gsma.com/mobilemoneymetrics/,[GSMA Mobile Money Metrics](https://www.gsma.com/mobilemoneymetrics/),,Annual,,,,,,,,,,,Data on mobile money deployments and transaction volumes; may cover Yemen; cross‑check with mobile operators.,extended
SRC-033,33,Sana’a Center Budget/Banking Analysis Papers,Banking & Public Finance,NGO,,https://sanaacenter.org/publications,[Sana’a Center Publications](https://sanaacenter.org/publications),,Irregular,,,,,,,,,,,"Analytical papers on the banking sector, bank splits, liquidity; ingest as documents.",extended
SRC-034,34,Transparency International Corruption Perceptions Index,Governance,Global,,https://www.transparency.org/en/cpi,[CPI Data](https://www.transparency.org/en/cpi),,Annual,,,,,,,,,,,Global ranking of corruption perceptions; includes Yemen; used to benchmark governance environment.,extended
SRC-035,35,World Bank BOOST Public Finance Database,Public finance,Global,,https://boost.worldbank.org,[BOOST Data](https://boost.worldbank.org),,Annual (varies by country),,,,,,,,,,,Contains government expenditure and revenue data by sector for some countries; check if Yemen pre‑2014 data exists.,extended
SRC-036,36,Open Budget Survey (International Budget Partnership),Budget transparency,Global,,https://internationalbudget.org/open-budget-survey/,[OBS Data](https://internationalbudget.org/open-budget-survey/),,Biannual,,,,,,,,,,,"Scores budget transparency, participation and oversight; Yemen scored 0 in recent years.",extended
SRC-037,37,OECD International Development Statistics (CRS),Aid & budget support,Global,,https://stats.oecd.org,[OECD CRS](https://stats.oecd.org),,Annual,,,,,,,,,,,Donor funding by sector/project; includes aid flows to Yemen not captured in FTS.,extended
SRC-038,38,UN General Assembly Resolutions & Security Council Resolutions,Political & sanctions,Global,,https://undocs.org,[UN Documents](https://undocs.org),,Continuous,,,,,,,,,,,"Provide official sanction mandates, budget authorisations for UN missions; treat as legal documents; link to events.",extended
SRC-039,39,Yemen Port Authority & UNVIM Import Reports,Port throughput,National/UN,,https://www.unvimonitor.org,[UNVIM monthly updates](https://www.unvimonitor.org),,Monthly,,,,,,,,,,,"Data on fuel and food shipments through Hodeidah, Salif and Ras Isa ports; used as trade and supply proxies.",extended
SRC-040,40,International Budget Partnership – Yemen,Civil society,Global,,https://internationalbudget.org,[IBP papers](https://internationalbudget.org),,Occasional,,,,,,,,,,,Reports on Yemen’s budget process and transparency; narrative.,extended
SRC-041,41,Tax Justice Network Financial Secrecy Index,Offshore finance,Global,,https://fsi.taxjustice.net,[FSI Data](https://fsi.taxjustice.net),,Biennial,,,,,,,,,,,Provides ranking of secrecy jurisdictions; Yemen may be included; used for context.,extended
SRC-042,42,United Nations Panel of Experts on Yemen Reports,Sanctions & compliance,Global,,https://www.undocs.org,[UN Panel Reports via UN DOCS](https://www.undocs.org),,Annual,,,,,,,,,,,"Investigates implementation of sanctions, arms embargo violations, illicit finance; includes detailed annexes.  Ingest as documents (sensitive).",extended
SRC-043,43,World Trade Organization (WTO) Tariff Database,Tariffs & trade policy,Global,,https://www.wto.org/english/tratop_e/tariffs_e/tariff_data_e.htm,[WTO Tariff Data](https://www.wto.org/english/tratop_e/tariffs_e/tariff_data_e.htm),,Irregular,,,,,,,,,,,Contains applied and bound tariffs; Yemen not WTO member but data may exist via Gulf Cooperation Council; treat as context.,extended
SRC-044,44,UN Liner Shipping Connectivity Index (LSCI),Trade infrastructure,Global,,https://unctadstat.unctad.org,[UNCTAD LSCI](https://unctadstat.unctad.org),,Annual,,,,,,,,,,,Measures maritime connectivity; Yemen’s score can be used as proxy for trade facilitation and shipping disruptions.,extended
SRC-045,45,UN Vehicle Registration Data (if available),Transport & commerce,Global,,https://unece.org,[UNECE Vehicle Database](https://unece.org),,Annual,,,,,,,,,,,May provide vehicle registrations for Yemen; relevant to transport sector.,extended
SRC-046,46,World Bank Logistics Performance Index (LPI),Trade facilitation,Global,,https://lpi.worldbank.org/,[LPI Data](https://lpi.worldbank.org/),,Biennial,,,,,,,,,,,Ranking of countries’ logistics performance; Yemen historically scored low; use as context.,extended
SRC-047,47,Economic Research Forum (ERF) Trade Papers,Research,Regional,,https://erf.org.eg/publications,[ERF Publications](https://erf.org.eg/publications),,Occasional,,,,,,,,,,,Scholarly papers on trade and commerce in the Middle East; some on Yemen; ingest for narrative context.,extended
SRC-048,48,ICCIA (Islamic Chamber of Commerce & Industry),Private sector trade,Regional,,https://iccia.com,[ICCIA reports](https://iccia.com),,Annual,,,,,,,,,,,Reports on intra‑OIC trade; may include Yemen’s trade ties with Islamic countries.,extended
SRC-049,49,US Energy Information Administration (EIA) International Data,Energy,Global,,https://www.eia.gov/international/data/,[EIA International Data](https://www.eia.gov/international/data/),,Annual,,,,,,,,,,,"Provides country energy statistics: oil production/consumption, exports, CO₂ emissions; limited for Yemen but useful for global context.",extended
SRC-050,50,BP Statistical Review of World Energy,Energy,Global/Commercial,,https://www.bp.com,[BP Review](https://www.bp.com),,Annual,,,,,,,,,,,Contains global energy production and consumption data; includes Yemen (oil production numbers).  *Check licensing.*,extended
SRC-051,51,OPEC Annual Statistical Bulletin,Oil market,Global/Regional,,https://asb.opec.org,[OPEC ASB](https://asb.opec.org),,Annual,,,,,,,,,,,Provides detailed crude oil production by member countries; Yemen not a member but regionally relevant; can cross‑check supply.,extended
SRC-052,52,ICE Brent Crude Price,Oil price,Global,,https://www.theice.com/products/219/Brent-Crude-Futures,[ICE Futures API](https://www.theice.com/products/219/Brent-Crude-Futures),,Daily,,,,,,,,,,,International benchmark oil price; necessary for scenario modeling; license required for real‑time feed; use public index if available.,extended
SRC-053,53,UN DP Partnership for Renewable Energy in Yemen,Energy & development,Global/UN,,https://www.undp.org/yemen/projects,[UNDP Projects](https://www.undp.org/yemen/projects),,Occasional,,,,,,,,,,,Documents renewable energy projects (solar micro‑grids); includes installation numbers and beneficiaries; parse for impact metrics.,extended
SRC-054,54,University of Maryland Integrated Public Use Microdata Series (IPUMS) – Energy Use,Energy use proxies,Global,,https://international.ipums.org,[IPUMS Microdata](https://international.ipums.org),,Census waves (not recent),,,,,,,,,,,Provides microdata on household energy use from previous censuses; Yemen 2004 census microdata available; useful for baseline energy access.,extended
SRC-055,55,World Bank Jobs Diagnostic for Yemen (2015),Labor & employment,Global,,https://documents.worldbank.org,[WB Jobs Diagnostic](https://documents.worldbank.org),,One‑off,,,,,,,,,,,"Provides labour force statistics, unemployment rates, wages, and structural unemployment analysis; baseline before conflict.",extended
SRC-056,56,UNDP Yemen Economic Resilience & Livelihoods Studies,Jobs & cash transfers,Global/UN,,https://www.undp.org/yemen,[UNDP Yemen site](https://www.undp.org/yemen),,Occasional,,,,,,,,,,,"Reports on cash-for-work programmes, livelihood outcomes; may include small datasets on job creation.",extended
SRC-057,57,ILO Regional Office Studies,Labor rights,Global,,https://www.ilo.org/beirut/,[ILO Publications](https://www.ilo.org/beirut/),,Occasional,,,,,,,,,,,Reports on labour market dynamics in Arab region; may include Yemen; narrative but important context.,extended
SRC-058,58,GSMA Mobile Gender Gap Report,Digital gender gap & labour,Global,,https://www.gsma.com/mobilefordevelopment,[GSMA Reports](https://www.gsma.com/mobilefordevelopment),,Annual,,,,,,,,,,,Contains data on mobile ownership and usage by gender; proxy for access to digital labour markets; may include Yemen via modelling.,extended
SRC-059,59,UNFPA Youth & NEET Studies,Youth unemployment,Global/UN,,https://yemen.unfpa.org,[UNFPA publications](https://yemen.unfpa.org),,Occasional,,,,,,,,,,,"Studies on youth not in employment, education or training (NEET), and demographic dividends.",extended
SRC-060,60,The World Bank Global Wage Database,Wages,Global,,https://data.worldbank.org/indicator/SL.EMP.WORK.ZS,[Wage indicators](https://data.worldbank.org/indicator/SL.EMP.WORK.ZS),,Annual,,,,,,,,,,,Contains wages/earnings but limited for Yemen; still note as potential source.,extended
SRC-061,61,AidData (William & Mary),Aid & projects,Global,,https://aiddata.org/datasets,[AidData Database](https://aiddata.org/datasets),,Annual/Continuous,,,,,,,,,,,Large database of development finance; includes some Yemen projects with geolocation; can augment IATI/FTS; registration required.,extended
SRC-062,62,World Bank Projects & Operations API,Development projects,Global,,https://api.worldbank.org/v2/country/YEM/project?format=json,[WB Projects API](https://api.worldbank.org/v2/country/YEM/project?format=json),,Continuous,,,,,,,,,,,"Already in master registry; includes project titles, funding, status; integrate fully.",extended
SRC-063,63,IFAD (International Fund for Agricultural Development) Projects,Rural development,Global,,https://www.ifad.org/en/web/operations/w/country/yemen,[IFAD Project Database](https://www.ifad.org/en/web/operations/w/country/yemen),,Continuous,,,,,,,,,,,"Lists IFAD-funded projects (e.g., fisheries, irrigation, smallholder support); parse budgets and beneficiaries.",extended
SRC-064,64,Islamic Development Bank (IsDB) Project Data,Development projects,Regional,,https://www.isdb.org/projects,[IsDB Projects](https://www.isdb.org/projects),,Continuous,,,,,,,,,,,Contains approved and active projects in Yemen; extract funding amounts and sectors; licensing open.,extended
SRC-065,65,USAID (US Agency for International Development) Assistance,Development/humanitarian aid,Global,,https://www.usaid.gov/yemen,[USAID Yemen page](https://www.usaid.gov/yemen),,Continuous,,,,,,,,,,,Contains press releases and project summaries; budget info may be limited; complement IATI.,extended
SRC-066,66,EU ECHO Humanitarian Aid,Humanitarian aid,Global/EU,,https://civil-protection-humanitarian-aid.ec.europa.eu,[ECHO Yemen page](https://civil-protection-humanitarian-aid.ec.europa.eu),,Continuous,,,,,,,,,,,Provides funding allocations by sector; cross‑check with FTS; ingest as documents.,extended
SRC-067,67,King Salman Humanitarian Aid and Relief Centre (KSrelief) Project Database,Humanitarian/development,Regional,,https://www.ksrelief.org,[KSrelief Projects](https://www.ksrelief.org),,Continuous,,,,,,,,,,,Lists aid projects financed by Saudi Arabia; includes budgets and sectors; incorporate for donor profiles.,extended
SRC-068,68,Emirates Red Crescent & Other UAE Entities,Humanitarian/development,Regional,,https://www.emiratesrc.ae,[ERC site](https://www.emiratesrc.ae),,Continuous,,,,,,,,,,,Provides information on aid projects in Yemen; may not be comprehensive; glean from Arabic press and FTS cross‑references.,extended
SRC-069,69,Qatar Charity & Qatar Development Fund,Aid,Regional,,https://www.qcharity.org,[Qatar Charity](https://www.qcharity.org),,Continuous,,,,,,,,,,,Aid programmes in Yemen; parse available information; treat with caution.,extended
SRC-070,70,China International Development Cooperation Agency (CIDCA),Aid & infrastructure,Global,,http://en.cidca.gov.cn,[CIDCA press releases](http://en.cidca.gov.cn),,Irregular,,,,,,,,,,,China-financed development projects; may involve ports/energy; gather announcements.,extended
SRC-071,71,KfW & GIZ Yemen programmes,Aid & technical cooperation,Regional,,https://www.giz.de/en/worldwide/38340.html,[GIZ Projects Database](https://www.giz.de/en/worldwide/38340.html),,Continuous,,,,,,,,,,,Lists German development and technical assistance projects in Yemen.,extended
SRC-072,72,Japan International Cooperation Agency (JICA) Yemen,Aid,Global,,https://www.jica.go.jp/english,[JICA Projects](https://www.jica.go.jp/english),,Occasional,,,,,,,,,,,"Contains small projects (health, water); parse details.",extended
SRC-073,73,World Food Programme Project Pipeline (WFP OPS),Food aid,Global,,https://ops.wfp.org,[WFP OPS Portal](https://ops.wfp.org),,Continuous,,,,,,,,,,,"Detailed dataset of WFP’s operations, budgets, beneficiaries, and outputs; API available; cross‑link with Aid Tracker.",extended
SRC-074,74,OCHA 3W (“Who Does What Where”) Datasets,Projects & coverage,Global,,https://data.humdata.org,[HDX 3W Yemen](https://data.humdata.org),,Quarterly,,,,,,,,,,,"Lists humanitarian projects by organisation, cluster, geography; includes output metrics; integrate into geospatial viewer.",extended
SRC-075,75,FAO AQUASTAT,Water resources,Global,,https://www.fao.org/aquastat/en,[AQUASTAT database](https://www.fao.org/aquastat/en),,Annual,,,,,,,,,,,"Provides data on water withdrawal, irrigation, and renewable water resources; may have Yemen entries; use for rural development analysis.",extended
SRC-076,76,FSIS (Food Security Information System) Bulletins,Food security,Global/UN,,https://www.fsinplatform.org,[FSIS Yemen](https://www.fsinplatform.org),,Monthly/Quarterly,,,,,,,,,,,"Joint analysis by FAO/WFP/FSAC; includes food basket cost, market integration, and IPC updates.",extended
SRC-077,77,Yemen Desert Locust Control Programme,Agricultural pests,Regional,,https://www.fao.org/ag/locusts,[FAO Locust Watch](https://www.fao.org/ag/locusts),,Monthly,,,,,,,,,,,Reports on desert locust infestations and control operations; relevant for crop yields.,extended
SRC-078,78,International Fertilizer Association (IFA),Fertiliser consumption,Global,,https://www.fertilizer.org,[IFA statistics](https://www.fertilizer.org),,Annual,,,,,,,,,,,Data on fertiliser use; though Yemen-specific data may be limited; can use regional proxies.,extended
SRC-079,79,Agricultural Market Information System (AMIS),Global food market,Global,,https://app.amis-outlook.org,[AMIS](https://app.amis-outlook.org),,Monthly,,,,,,,,,,,Provides global cereals supply/demand and price outlook; used for context on import costs.,extended
SRC-080,80,U.S. Department of Agriculture (USDA) PSD Database,Commodity balances,Global,,https://apps.fas.usda.gov/psdonline,[PSD Online](https://apps.fas.usda.gov/psdonline),,Monthly,,,,,,,,,,,"Commodity production, consumption and trade balances by country; includes Yemen for selected crops; check coverage.",extended
SRC-081,81,UNICEF Yemen Education Cluster Reports,Education,Global/UN,,https://educationcluster.net/yemen,[Yemen Education Cluster](https://educationcluster.net/yemen),,Quarterly,,,,,,,,,,,"Reports on school availability, enrolment, gender parity, infrastructure damage; includes small datasets.",extended
SRC-082,82,"WHO/UNICEF Joint Monitoring Programme (JMP) for Water Supply, Sanitation and Hygiene",WASH,Global,,https://washdata.org,[JMP Data](https://washdata.org),,Annual/Biennial,,,,,,,,,,,"Provides estimates of access to drinking water, sanitation, hygiene services; includes Yemen; may rely on pre‑conflict surveys; still used as baseline.",extended
SRC-083,83,UN Women Gender Equality Measurements,Gender & development,Global,,https://data.unwomen.org,[UN Women Data Hub](https://data.unwomen.org),,Annual,,,,,,,,,,,"Includes indicators on gender equality, women’s participation; limited for Yemen but informative.",extended
SRC-084,84,Yemen Humanitarian Needs Overview (HNO),Needs & severity,Global/UN,,https://reliefweb.int,[OCHA HNO](https://reliefweb.int),,Annual,,,,,,,,,,,Summarises people in need by sector and governorate; includes severity scores; narrative and some numeric tables; extract into data points.,extended
SRC-085,85,The World Bank High Frequency Phone Surveys (Yemen),Social & economic impact,Global,,https://microdata.worldbank.org,[COVID‑19 HFPS](https://microdata.worldbank.org),,Occasional (2020–2022),,,,,,,,,,,"Conducted to measure COVID‑19 impact on households; includes employment, income, food security; microdata available upon request.",extended
SRC-086,86,Gallup World Poll (Yemen),Well‑being & perceptions,Global,,https://www.gallup.com/analytics,[Gallup Data](https://www.gallup.com/analytics),,Annual,,,,,,,,,,,"Surveys measuring well‑being, perceptions of government, access to services; may include Yemen; subscription required.",extended
SRC-087,87,"GDELT Project (Global Database of Events, Language and Tone)",Conflict & events,Global,,https://www.gdeltproject.org,[GDELT 2 Dataset via Google BigQuery](https://www.gdeltproject.org),,Daily,,,,,,,,,,,Provides automatically extracted events and tone from global media; can be filtered for Yemen; used as fallback if ACLED unavailable; treat as media‑derived and low confidence.,extended
SRC-088,88,Global Terrorism Database (GTD),Terrorism events,Global,,https://www.start.umd.edu/gtd/,[GTD](https://www.start.umd.edu/gtd/),,Annual release,,,,,,,,,,,Contains incidents of terrorism worldwide; includes events in Yemen; may help contextualise conflict intensity.,extended
SRC-089,89,Stockholm International Peace Research Institute (SIPRI) Arms Transfers Database,Arms trade & embargo violations,Global,,https://armstrade.sipri.org,[SIPRI](https://armstrade.sipri.org),,Annual,,,,,,,,,,,"Contains data on transfers of major weapons systems, including arms flows to parties in Yemen; informs sanctions/compliance modules.",extended
SRC-090,90,Armed Conflict Survey (IISS),Armed conflict analysis,Global,,https://www.iiss.org,[IISS Publications](https://www.iiss.org),,Annual,,,,,,,,,,,Provides analysis of conflict dynamics; includes Yemen; subscription required; treat as narrative.,extended
SRC-091,91,International Crisis Group (ICG) Reports,Conflict & political economy,Global NGO,,https://www.crisisgroup.org,[ICG Yemen reports](https://www.crisisgroup.org),,Occasional,,,,,,,,,,,"In-depth analyses of conflict dynamics, peace initiatives, economic impacts; narrative; ingest as documents.",extended
SRC-092,92,World Peace Foundation “Political Economy of War” Dataset,War economy,Global,,https://sites.tufts.edu/wpf/,[World Peace Foundation](https://sites.tufts.edu/wpf/),,Occasional,,,,,,,,,,,Provides data and case studies on war economies; may include Yemen; useful for context.,extended
SRC-093,93,Conflict Research Programme (LSE),Political economy,Academia,,https://blogs.lse.ac.uk/crp/,[CRP Publications](https://blogs.lse.ac.uk/crp/),,Occasional,,,,,,,,,,,"Research papers on rent-seeking, wartime economies; includes Yemen case studies; narrative.",extended
SRC-094,94,OpenStreetMap (OSM) Yemen Infrastructure Layers,Infrastructure mapping,Global/Open,,https://download.geofabrik.de/asia/yemen.html,[OSM extracts via Geofabrik](https://download.geofabrik.de/asia/yemen.html),,Continuous,,,,,,,,,,,"Provide shapefiles of roads, bridges, schools, health facilities; used for mapping infrastructure damage and coverage; license: ODbL (open).",extended
SRC-095,95,Yemen Infrastructure Damage Database (UNDAC/REACH),Damage assessment,UN/NGO,,https://www.reach-initiative.org,[REACH Initiative Data](https://www.reach-initiative.org),,Irregular,,,,,,,,,,,"Contains geolocated points of infrastructure damage (bridges, hospitals, schools) collected via satellite and field surveys.  Ingest as geospatial layer.",extended
SRC-096,96,UNOPS Projects & Infrastructure Registry,Infrastructure projects,UN,,https://data.unops.org,[UNOPS Project Database](https://data.unops.org),,Continuous,,,,,,,,,,,"Lists UNOPS projects (roads, bridges, water systems) with budgets and completion status; vital for infrastructure module.",extended
SRC-097,97,World Bank Infrastructure Projects,Infrastructure,Global,,https://api.worldbank.org/v2/country/YEM/project,[WB Projects API](https://api.worldbank.org/v2/country/YEM/project),,Continuous,,,,,,,,,,,Already included; emphasise infrastructure subsector tags.,extended
SRC-098,98,"Humanitarian Logistics Cluster (Speed Restriction, Road Condition Reports)",Road access,UN/NGO,,https://logcluster.org/ops/yem10a,[Logistics Cluster Yemen](https://logcluster.org/ops/yem10a),,Continuous,,,,,,,,,,,"Updates on road closures, damaged bridges, and alternate routes; ingest into timeline and map overlays.",extended
SRC-099,99,UNCTAD World Investment Report,FDI,Global,,https://unctad.org/topic/investment/world-investment-report,[WIR](https://unctad.org/topic/investment/world-investment-report),,Annual,,,,,,,,,,,Provides trends and statistics on foreign direct investment flows; includes regional context for Yemen; supplement UNCTADstat.,extended
SRC-100,100,Yemen General Investment Authority (YGIA),Investment climate,National,,https://www.ygiahq.com,[YGIA publications](https://www.ygiahq.com),,Irregular,,,,,,,,,,,Provides investment promotion materials and data on licensed investment projects; seldom updated; treat with caution.,extended
SRC-101,101,International Finance Corporation (IFC) Country Private Sector Diagnostic (CPSD),Private sector analysis,Global,,https://www.ifc.org,[IFC CPSDs](https://www.ifc.org),,Occasional,,,,,,,,,,,Analytical documents assessing constraints and opportunities in private sector; includes Yemen; narrative.,extended
SRC-102,102,ACAPS Yemen Analysis Hub (YETI),Research/early warning,NGO,,https://www.acaps.org/country/yemen,[ACAPS YETI](https://www.acaps.org/country/yemen),,Continuous,,,,,,,,,,,"Provides scenario analyses, risk bulletins and thematic briefs; narrative with contextual data; high credibility.",extended
SRC-103,103,Sana’a Center for Strategic Studies,Research & commentary,National/International,,https://sanaacenter.org,[Sana’a Center](https://sanaacenter.org),,Continuous,,,,,,,,,,,"Produces policy papers, economic briefs and weekly updates; narrative; widely used by analysts.",extended
SRC-104,104,Rethinking Yemen’s Economy Initiative (RYE),Research,NGO,,https://devpolicy.org,[RYE Publications](https://devpolicy.org),,Occasional,,,,,,,,,,,"Joint initiative producing policy briefs on banking, fuel subsidies, private sector; narrative.",extended
SRC-105,105,World Bank Yemen Economic Monitor,Research,Global,,https://www.worldbank.org/en/country/yemen/brief/yemen-economic-monitor,[WB Yemen Monitor](https://www.worldbank.org/en/country/yemen/brief/yemen-economic-monitor),,Semi‑annual,,,,,,,,,,,Provides narrative and data on macroeconomic developments; official WBG perspective.,extended
SRC-106,106,Chatham House Middle East & North Africa programme,Research,Think tank,,https://www.chathamhouse.org,[Chatham House Yemen Publications](https://www.chathamhouse.org),,Occasional,,,,,,,,,,,"Provides analysis on political economy, conflict drivers, humanitarian issues; narrative.",extended
SRC-107,107,Oxford Institute for Energy Studies,Energy research,Think tank,,https://www.oxfordenergy.org,[OIES Publications](https://www.oxfordenergy.org),,Occasional,,,,,,,,,,,Papers on oil and gas markets; may include Yemen; narrative.,extended
SRC-108,108,Atlantic Council’s Resilience Centre,MENA research,Think tank,,https://www.atlanticcouncil.org,[Atlantic Council reports](https://www.atlanticcouncil.org),,Occasional,,,,,,,,,,,"Papers on Yemen’s economy, governance, and geopolitical context.",extended
SRC-109,109,Carnegie Middle East Center,Political economy,Think tank,,https://carnegie-mec.org,[Carnegie MENA](https://carnegie-mec.org),,Occasional,,,,,,,,,,,Analytical articles; narrative.,extended
SRC-110,110,"World Bank’s Fragility, Conflict & Violence (FCV) Newsletter",News & analyses,Global,,https://www.worldbank.org/en/topic/fragilityconflictviolence,[FCV Newsletter](https://www.worldbank.org/en/topic/fragilityconflictviolence),,Quarterly,,,,,,,,,,,Updates on FCV research; includes Yemen case studies; narrative.,extended
SRC-111,111,Reuters Yemen Economic News,Media,Global,,https://www.reuters.com/world/middle-east/,[Reuters Middle East business news](https://www.reuters.com/world/middle-east/),,Daily,,,,,,,,,,,"For narrative updates on oil exports, currency, port operations; treat as information; cross‑verify.",extended
SRC-112,112,Al Jazeera Economy & Business (Yemen),Media,Regional,,https://www.aljazeera.com/economy,[Al Jazeera Business](https://www.aljazeera.com/economy),,Daily,,,,,,,,,,,Provides Arabic‑language news on Yemen’s economy; cross‑check.,extended
SRC-113,113,Bloomberg Middle East,Media,Global,,https://www.bloomberg.com/middle-east,[Bloomberg ME](https://www.bloomberg.com/middle-east),,Daily,,,,,,,,,,,Contains financial news and commentary; subscription for full access; treat as narrative.,extended
SRC-114,114,Asharq Al‑Awsat & The National (UAE),Media,Regional,,https://aawsat.com,[Asharq Economy](https://aawsat.com),,Daily,,,,,,,,,,,Coverage on Yemen’s business and economy; narrative; cross‑verify.,extended
SRC-115,115,Saba News Agency (Aden & Sana’a),Media,National,,https://www.sabanew.net,"[Saba News](https://www.sabanew.net), [Saba (Sana’a)]",,Daily,,,,,,,,,,,"Official news from both governments; use for announcements of policies, fuel price changes, etc.; treat with caution.",extended
SRC-116,116,Middle East Eye & Yemen Press,Media,Regional,,https://www.middleeasteye.net,[Middle East Eye](https://www.middleeasteye.net),,Daily,,,,,,,,,,,Provides investigative reports and commentary; narrative; cross‑check.,extended
SRC-117,117,NASA MODIS Vegetation Indices (NDVI/EVI),Vegetation & climate,Global,,https://lpdaac.usgs.gov,[MODIS API](https://lpdaac.usgs.gov),,16‑day composites,,,,,,,,,,,Provide NDVI/EVI values; used to track agricultural productivity and drought; aggregated to governorate level; open data.,extended
SRC-118,118,CAMS (Copernicus Atmosphere Monitoring Service) Air Quality and Dust Forecasts,Environment & health,Global,,https://ads.atmosphere.copernicus.eu,[CAMS Data Store](https://ads.atmosphere.copernicus.eu),,Daily,,,,,,,,,,,"Provides dust storm forecasts and air quality metrics (PM10, PM2.5) which can impact livelihoods and health; integrate if relevant.",extended
SRC-119,119,GHSL Global Human Settlement Layer,Urbanisation & built environment,Global,,https://ghsl.jrc.ec.europa.eu,[GHSL](https://ghsl.jrc.ec.europa.eu),,"Periodic (1975, 1990, 2000, 2015)",,,,,,,,,,,Provides raster data on built‑up areas and population density; allows urban/rural comparisons.,extended
SRC-120,120,SMAP (Soil Moisture Active Passive) Satellite Data,Water & agriculture,Global,,https://smap.jpl.nasa.gov,[NASA SMAP](https://smap.jpl.nasa.gov),,Weekly,,,,,,,,,,,Measures soil moisture; can signal drought conditions; aggregated to region; open data.,extended
SRC-121,121,NOAA Integrated Surface Database (ISD),Weather & climate,Global,,https://www.ncei.noaa.gov/products/land-based-station/integrated-surface-database,[NOAA ISD](https://www.ncei.noaa.gov/products/land-based-station/integrated-surface-database),,Hourly/daily,,,,,,,,,,,"Provides weather observations (temperature, precipitation) from local stations; Yemen coverage may be limited; use for climate context.",extended
SRC-122,122,Rainfall Estimation from Satellite (ARC2/TRMM/GPM),Rainfall,Global,,https://www.chc.ucsb.edu/data,[CHIRPS/ARC2/GPM datasets](https://www.chc.ucsb.edu/data),,Daily,,,,,,,,,,,Provide rainfall estimates which affect crop production and flooding; open data.,extended
SRC-123,123,World Bank Global Solar Atlas,Renewable energy potential,Global,,https://globalsolaratlas.info,[Global Solar Atlas](https://globalsolaratlas.info),,Static (periodic updates),,,,,,,,,,,Provides solar irradiation data; used for renewable energy investment planning; open data.,extended
SRC-124,124,Oxford Economics Yemen Macro,Macro Forecasts,Commercial,,,Subscription,,Quarterly,,,,,,,,,,,"Offers proprietary forecasts for Yemen’s GDP, inflation, exchange rate, etc.  *Needs Key/License* – store metadata only.",extended
SRC-125,125,Bloomberg Terminal,Exchange Rate & Market News,Commercial,,,Terminal,,Real-time,,,,,,,,,,,Provides parallel market exchange rates and financial news; cannot be scraped.  Use only if license allows; otherwise mark as unavailable.,extended
SRC-126,126,Yemen Central Statistical Office Population Projections,Demographics,National,,,CSO reports (access via CSO or UNFPA),,Occasional (2014–2017),,,,,,,,,,,Provides national and governorate population estimates; used by UN agencies.  Tag regime accordingly.,extended
SRC-127,127,Yemen Ministry of Industry & Trade,Market prices & inflation,National,,,Press releases and bulletins,,Ad hoc,,,,,,,,,,,May release official commodity price lists or inflation updates; scarce due to conflict.  Ingest if available.,extended
SRC-128,128,Yemen Petroleum Company (YPC) Official Fuel Prices,Fuel prices,National,,,Social media or official bulletins,,Irregular,,,,,,,,,,,Official pump prices in Sana’a (DFA) published on YPC’s channels; must track via scraping or partner submissions.,extended
SRC-129,129,Government of Yemen (Aden) Fuel Price Announcements,Fuel prices,National,,,Press releases and local media,,Irregular,,,,,,,,,,,Announced by Ministry of Oil or other agencies; used to set official prices in IRG-controlled areas.,extended
SRC-130,130,Abdul Wahab Shukri FX Market Bulletin,Parallel FX rates,National,,,Telegram/WhatsApp groups (monitored by partners),,Daily,,,,,,,,,,,Informal bulletins by major money exchangers quoting market rates; may become part of partner feed; treat as anecdotal and store with low confidence.,extended
SRC-131,131,Al Kuraimi Exchange Rate Feed,Parallel FX rates,National,,,[Al Kuraimi Bank website/social media],,Daily,,,,,,,,,,,Some Yemeni banks publish daily exchange rates (buy/sell).  Scrape or partner feed; assign regime tag.,extended
SRC-132,132,Saraf Online App,Market FX rates,National,,,Mobile app (crowd‑sourced),,Daily,,,,,,,,,,,An app used by Yemeni traders posting parallel market rates; data may be accessible via API or manual capture; mark as low confidence.,extended
SRC-133,133,Central Bank of Yemen Sana’a Official Rate,Official FX rate,National,,,Press releases and bulletins,,Irregular,,,,,,,,,,,Official rate in DFA; glean from Ministry of Finance bulletins or speeches.,extended
SRC-134,134,UN Commodity Trade Statistics (UNSD) for Mirror Trade,Mirror trade & FX proxies,Global,,,Comtrade API (as above),,Annual,,,,,,,,,,,Import/export of arms category; can be used to detect arms shipments (if any recorded).,extended
SRC-135,135,Association of Yemeni Banks (AYB),Banking sector info,National,,,"Official statements, annual reports (if any)",,Ad hoc,,,,,,,,,,,"Provide lists of licensed banks, branch openings, sector concerns; documentation may be found via local press; ingest into stakeholder profiles.",extended
SRC-136,136,Yemen Microfinance Network (YMN) Quarterly Bulletin,Microfinance,National,,,Partner data (CSV/PDF),,Quarterly/Annual,,,,,,,,,,,"Statistics on active borrowers, portfolio outstanding, portfolio at risk, by MFI; if partners share dataset; treat as sensitive; tag regime.",extended
SRC-137,137,Al Kuraimi Islamic Bank Annual Reports,Banking,National (private),,,Company website,,Annual,,,,,,,,,,,"Provide financial statements (assets, deposits, profit) and branch network; parse for insights; may contain credit risk indicators.",extended
SRC-138,138,Yemen Corporate Balance Sheets (Top Enterprises),Private sector,National,,,Yemen Company Registry (leaked),,Unknown,,,,,,,,,,,"If accessible via partners; includes financial data of major companies (oil, telecoms, manufacturing); sensitive; store metadata with caution.",extended
SRC-139,139,Money Changers (Licensed and Unlicensed) Registry,Exchangers,National,,,Ministry of Industry & Trade or CBY lists,,Occasional,,,,,,,,,,,Lists of authorised money exchangers; glean from circulars and partner organisations; necessary for stakeholder pages.,extended
SRC-140,140,G7/G20 Aid Support Announcers,Aid commitments,Global,,,Press releases and communiqués,,Ad hoc,,,,,,,,,,,"Government and multilateral pledges for Yemen; capture announcements (e.g. Saudi Arabia, UAE, USA).",extended
SRC-141,141,Yemen Petroleum Company Fuel Subsidy Statements,Subsidy policy,National,,,Social media/news,,Irregular,,,,,,,,,,,Announcements on subsidy adjustments; feed into subsidy tracker.,extended
SRC-142,142,Yemen Customs Authority (if available),Customs revenues,National,,,Press releases or leaked budgets,,Irregular,,,,,,,,,,,May contain customs collection figures; scarce; treat as low confidence.,extended
SRC-143,143,Yemen Legislation Portal (Aden & Sana’a),Laws & decrees,National,,,"Official gazettes, news sources",,Ad hoc,,,,,,,,,,,"Collects public finance laws, budgets, tax decrees; vital for legal library.",extended
SRC-144,144,Port of Aden & Port of Mukalla Throughput Reports,Port volumes,National,,,Port authorities or news releases,,Monthly/Quarterly,,,,,,,,,,,Data on container and cargo volumes handled by southern ports; glean from port authority websites or local media.,extended
SRC-145,145,Dubai Ports World (DP World) Trade Reports,Transhipment & logistics,Commercial/Regional,,,Company annual reports,,Annual,,,,,,,,,,,DP World manages Aden port; reports may contain Yemen trade throughput; treat as secondary.,extended
SRC-146,146,Yemen Import & Export Licensing Data,Trade regulation,National,,,"Ministry of Industry & Trade, press releases",,Ad hoc,,,,,,,,,,,Document lists of authorised importers/exporters; may help track commodity flows; scarce.,extended
SRC-147,147,SAECA (Yemen Supreme Authority for Economic & Corporate Affairs),Government trade oversight,National,,,Not active (possible),,Unknown,,,,,,,,,,,"If revived, may publish commercial regulations; currently dormant.  Placeholder for future.",extended
SRC-148,148,Yemen Customs Tariff Schedule,Trade policy,National,,,Government gazette,,Ad hoc,,,,,,,,,,,Contains lists of applied tariffs by HS code; needed for trade policy analysis; may be outdated.,extended
SRC-149,149,Yemen Ministry of Oil & Minerals / Safer Exploration & Production Company,Oil & gas production,National,,,Press releases and statements,,Ad hoc,,,,,,,,,,,"Data on oil output, refinery operations, revenue sharing between Aden and Sana’a; highly politicised; glean via news.",extended
SRC-150,150,Yemen Diesel & LPG Demand Reports (if any),Fuel consumption,National,,,Logistics cluster or Ministry of Oil,,Occasional,,,,,,,,,,,Provide estimates of fuel demand; cross‑check with WFP fuel price bulletins.,extended
SRC-151,151,Yemen Gas Company (YGC) Circulars,Gas supply,National,,,Official circulars/social media,,Irregular,,,,,,,,,,,Announces LPG cylinder prices and distribution schedules; important for cost of living analysis.,extended
SRC-152,152,Yemen Ministry of Social Affairs and Labour (MoSAL),Employment policies,National,,,Circulars and speeches,,Ad hoc,,,,,,,,,,,"May provide information on minimum wage, labour regulations; seldom published; glean via local media.",extended
SRC-153,153,"Private sector surveys (e.g., Tadhamon Bank SME survey)",Employment in SMEs,National,,,SME programmes,,Ad hoc,,,,,,,,,,,"Surveys of SMEs on workforce, wages, skills; often part of project evaluations; need partner access.",extended
SRC-154,154,FAO FAOSTAT Agricultural Commodities,Agriculture,Global,,,Already included; emphasise cereals & livestock series,,Annual,,,,,,,,,,,Pre‑2013 official data; update for proxies if available.,extended
SRC-155,155,Yemen Ministry of Agriculture & Irrigation,Agricultural production,National,,,Reports (pre‑2014) and bulletins,,Irregular,,,,,,,,,,,"Provide production volumes by crop, area cultivated; mostly outdated; treat as historical baseline.",extended
SRC-156,156,Crops and Livestock Integrated Survey (if revived),Agriculture & livelihoods,National,,,Household survey via CSO or FAO,,Occasional,,,,,,,,,,,Last survey pre‑2014; should be added if new rounds conducted post‑conflict; treat as potential.,extended
SRC-157,157,UNHCR Population Statistics,Displacement & refugees,Global,,,Already included; emphasise cross‑border flows,,Annual,,,,,,,,,,,Provide number of Yemeni refugees abroad and refugees in Yemen.,extended
SRC-158,158,International Organization for Migration (IOM) Displacement Tracking Matrix (DTM),IDP & returnees,Global,,,Already included; emphasise subnational details,,Quarterly/Occasional,,,,,,,,,,,"Provide counts of internally displaced persons, returnees, and migrant arrivals by governorate.",extended
SRC-159,159,Janes Terrorism & Insurgency Centre (JTIC),Conflict & security,Commercial,,,Subscription,,Daily,,,,,,,,,,,Detailed dataset on insurgent and terrorist attacks; expensive; mark as *Needs Key*.,extended
SRC-160,160,United Nations Commodity Trade Statistics (Comtrade) for Arms (HS 9304),Arms trade via trade data,Global,,,Comtrade API (as above),,Annual,,,,,,,,,,,Import/export of arms category; can be used to detect arms shipments (if any recorded).,extended
SRC-161,161,UN Security Council Sanctions List,Sanctions,Global,,,Already included.,,Real‑time,,,,,,,,,,,Provide names of individuals/entities under sanctions; see master registry.,extended
SRC-162,162,U.S. OFAC Specially Designated Nationals List,Sanctions,Global,,,Already included.,,Real‑time,,,,,,,,,,,Provide names of Yemeni entities under US sanctions.,extended
SRC-163,163,EU and UK Sanctions Lists,Sanctions,Global,,,Already included.,,Real‑time,,,,,,,,,,,Provide names under EU/UK sanctions regimes.,extended
SRC-164,164,Yemen Ministry of Interior & Ministry of Defence (Aden & Sana’a),Conflict reports,National,,,Official statements and press releases,,Ad hoc,,,,,,,,,,,Provide casualty reports and conflict updates; seldom reliable; treat as narrative.,extended
SRC-165,165,Yemen Data Project (airstrike database),Conflict events,NGO,,,Already included; emphasise monthly series,,Monthly,,,,,,,,,,,Provide counts of airstrikes and civilian casualties; high credibility.,extended
SRC-166,166,"Yemen Telecom Companies Data (Yemen Mobile, Sabafon, MTN, Y-Telecom)",Connectivity,National,,,Company websites & regulator statements,,Occasional,,,,,,,,,,,"Provide information on subscriber numbers, network coverage, restoration of services; glean via press releases.",extended
SRC-167,167,Power grid restoration announcements,Energy infrastructure,National,,,Press releases (Ministry of Electricity),,Ad hoc,,,,,,,,,,,"Provide updates on electricity supply, power plant repairs, load shedding; glean from local news; treat as narrative.",extended
SRC-168,168,Arab Businessmen Councils,Cross‑border investment,Regional,,,Reports (various),,Occasional,,,,,,,,,,,Provide updates on cross‑border investments by Gulf and Yemeni expatriates; glean from media or business associations.,extended
SRC-169,169,Yemen Export Promotion Centre (if revived),Export promotion,National,,,Official documents,,Unknown,,,,,,,,,,,"Could provide data on non‑oil exports, SME exporters; currently inactive; placeholder.",extended
SRC-170,170,International Crisis Group,Research,NGO,,,Already included; emphasise conflict economy,,Occasional,,,,,,,,,,,See above.,extended
SRC-171,171,Economic Intelligence Unit (EIU),Country analysis,Commercial,,,Subscription,,Monthly,,,,,,,,,,,"Reports on Yemen’s economy, politics, forecast; subscription required; store metadata only; *Needs Key*.",extended
SRC-172,172,World Bank Open Data – Indicators API,Macroeconomic (incl. governance proxies),Global,World Bank,https://api.worldbank.org/v2/country/YEM/indicator/{indicator_code}?format=json,https://api.worldbank.org/v2/country/YEM/indicator/{indicator_code}?format=json (and SDMX API),"Direct API (open, no key required); JSON or XML responses",Monthly for many series (WDI quarterly/annually per indicator release); continuous as data published,Open Data – CC BY 4.0; free to use with attribution,A,"≈16,000 time-series indicators covering GDP, inflation (CPI), exchange rate, trade, poverty, population, governance indexes, etc.; Yemen data from 2010–present (earlier for historical context)",Low to moderate – data appears soon after source release,None,"Country, Indicator Code/Name, Year/Period, Value, metadata (source note, units)",API connector; paginate results; daily/weekly checks; retries on failure; Data Gap Ticket if unresolved,"Core macro database for dashboards (GDP, prices, finance); baseline for Scenario Simulator, FX Dashboard, Aid Tracker; glossary definitions; regional peer comparisons","Macro Trends, Governance, Scenario Simulator, Data Explorer API, Methodology",National-level aggregates; annual/quarterly/monthly series; no subnational data; gaps during conflict years or modelled estimates; alternative sources used when missing; gaps flagged as “Not available”,,master
SRC-173,173,"IMF Data (SDMX/IFS, Article IV)",Macroeconomic & Financial,Global,International Monetary Fund,https://sdmx.imf.org/rest/data/,"https://sdmx.imf.org/rest/data/ (IFS, DOTS, GFS) and PDFs for Article IV reports",API for structured data (SDMX/XML/JSON – some datasets require registration); PDFs for Article IV and country reports,Quarterly for most IMF datasets (some monthly series); Article IV reports annually or biennially,Open data (IMF open data initiative); attribution required; some datasets require registration,A–,"Monetary and financial indicators: money supply, inflation, official exchange rates, banking aggregates, balance of payments, government finance, trade; 2010–present (historical data available); Article IV reports provide qualitative assessments and tables",Moderate – quarterly data appear after a few months; Article IV reports several months after mission; gaps due to conflict,Some SDMX datasets require free account/API key; summary data accessible without auth,"Varies by dataset – e.g. country, indicator code, time period, value; Article IV PDFs contain tables and narrative","API connector for SDMX with frequency handling and versioning; Document ingestion for PDFs (extract tables, store metadata); retries and Data Gap Ticket on failure","Complement World Bank macro data (monetary & external sector); FX Dashboard (official rates, reserves), Public Finance module (fiscal projections), Scenario Simulator (baseline forecasts), Research Hub (Article IV commentary)","Macro Trends, Financial Sector, Public Finance, Scenario Simulator, Document Library, Glossary",National-level annual/quarterly data; no governorate detail; large gaps post‑2015; IMF staff estimates fill gaps (lower confidence); “Not available – see proxy” when not reported,,master
SRC-174,174,UN Comtrade (Trade Statistics),Trade & External,Global,UN Statistics Division,https://comtrade.un.org/api/get?max=50000&type=C&freq=A&px=HS&cc=ALL&r=887&pxTime=2010-2025,https://comtrade.un.org/api/get?max=50000&type=C&freq=A&px=HS&cc=ALL&r=887&pxTime=2010-2025,Direct API (JSON or CSV); free for moderate use; registration needed for heavy use; bulk downloads available,Monthly/annual – updated as countries report (mirror data for Yemen due to limited reporting),Open for non-commercial use with attribution; rate limits apply,B+,Merchandise trade by commodity (HS codes) and partner country; annual coverage 2010–present; some monthly trade data pre‑2015; mirror data used because Yemen rarely reports,High – annual totals appear 6–12 months after year‑end; monthly data lags a few months,No API key for moderate use; heavy usage requires account,"Trade flow (import/export), year/month, reporter, partner, commodity code & description, value (USD), quantity, etc.",API connector retrieves annual trade data in batches (by year or chapter); store detailed series; fallback to UNCTADstat or offline CSV if API unavailable; retries and Data Gap Ticket when missing,"Feeds Trade Dashboard (import/export trends, top commodities, trade balance); Scenario Simulator (external sector shocks); Aid Tracker (aid vs trade context); Stakeholder Pages (trade ties)","Trade & Commerce, Macro Trends (trade % GDP), Regional Comparison",National totals by commodity/partner; no subnational data; gaps filled with mirror data; undercounts informal trade; missing data flagged; fallback offline if needed,,master
SRC-175,175,ILOSTAT (Labor & Employment),Socio-economic (Labor),Global,International Labour Organization,https://api.ilo.org/data/export/JSON?country=YEM,https://api.ilo.org/data/export/JSON?country=YEM (API),REST API (JSON/CSV) with API key; bulk downloads available,Annual; some modeled estimates more frequent,Open data with attribution; API token required,B,"Employment/unemployment rates, labor force participation, youth NEET, wages, etc.; data up to 2014; modelled updates for later years",High – data often a couple years old,API token needed,"Indicator code, sex/age disaggregation, year, value, unit",API connector scheduled to fetch latest data; fallback to CSV; Data Gap Ticket if missing; modelled data flagged,"Feeds Social Indicators – unemployment trends, labor force size; informs Scenario Simulator and Stakeholder pages","Macro/Social Trends, Research Hub, Glossary","National, annual; no subnational labor data; post-2015 data are estimates with lower confidence; YETO notes discrepancies between sources",,master
SRC-176,176,UNOCHA Financial Tracking Service (FTS),Humanitarian Aid Flows,Global,UN OCHA,https://api.hpc.tools/v2/public/fts/flow?countryISO=YEM,https://api.hpc.tools/v2/public/fts/flow?countryISO=YEM,"REST API (JSON) – no key needed; filter by country, year, appeal",Daily – continuous updates,Open data; usage per OCHA terms; attribution required,A,"All humanitarian funding to Yemen (donor, recipient, sector, plan, amount, status) from 2010–present; includes HRP vs outside-plan funding and totals",Low – new contributions appear within days,None,"Donor, recipient, plan, cluster/sector, amount (USD), funding status, dates, FTS ID; aggregates",API connector scheduled daily; aggregates data; links flows to HRP documents; retries and Data Gap Ticket on failure; manual CSV fallback,"Powers Aid Tracker – total funding, donor rankings, sector allocations, funding gaps; Stakeholder pages; scenario modeling; research grounding for AI","Aid Funding Dashboard, Donor Profiles, Cluster/Sector Pages, Crisis Timeline, AI Assistant",Country-level flows; subnational earmarking not well captured; double-counting possible; cross-checked with IATI; duplicates flagged,,master
SRC-177,177,IATI (International Aid Transparency Initiative),Development & Humanitarian Projects,Global,IATI (multi-publisher),https://dev.iatistandard.org/datastore/activity/select?country_code=YE,https://dev.iatistandard.org/datastore/activity/select?country_code=YE,REST API and bulk CSV exports; no auth,Continuous – organizations publish updates on their schedule; datastore updates daily or weekly,Open data (CC BY); publishers may have additional terms; attribution required,B,"Development and humanitarian projects/activities: titles, descriptions, budgets, expenditures, locations, sectors, participating orgs; 2010–present",Varies – depends on publisher (real-time to annual),None,"Activity ID, reporting organization, title, description, start/end dates, sector codes, participating partners, financial transactions (commitments/disbursements), location info, outcomes",API/ETL hybrid – weekly ingestion via datastore API; uses filters and bulk downloads; data stored relationally; missing fields flagged; attempts to enrich from docs; gap tickets for under-reporting,Complements FTS – provides project-level detail; populates Aid Project Explorer and Stakeholder pages; used in Aid Tracker to show outputs and link to outcomes; research hub; scenario modeling,"Aid Projects Dashboard, Stakeholder Profiles, Geospatial Viewer, AI Assistant",Project-level; some geocodes; many entries only country-level; not all donors publish; under-coverage flagged; FTS or donor reports used to fill gaps,,master
SRC-178,178,ReliefWeb API (Reports),Humanitarian Information (Media/Reports),Global (Yemen filter),UN OCHA – ReliefWeb,https://api.reliefweb.int/v1/reports?appname=YETO&query[value,https://api.reliefweb.int/v1/reports?appname=YETO&query[value]=Yemen,REST API – no key (app name parameter for usage tracking),Continuous – daily updates,Open access to metadata; content may have separate copyrights; respect original source rights; do not republish full content without permission,A,"All humanitarian situation reports, press releases, analyses, maps, infographics related to Yemen; includes UN agency updates, NGO reports, crisis analyses; fully archived 2010–present",Minimal – items appear as soon as published and indexed,None,"Report title, publication date, source organization, country tags, themes, summary, URL to full report, full text or PDF link",API connector runs daily to fetch new reports; stores metadata and full text/excerpt; content indexed for search; tags captured; manual processing for large/scanned PDFs,"Populates Research Hub library; provides evidence and context; used by AI assistant for citations; feeds Timeline module; includes WFP bulletins, UN updates, ACAPS reports","Research Hub Library, Interactive Timeline, AI Chat, Glossary, Stakeholder Pages",Narrative info; some subnational details in text; PDF/scan may require OCR; flagged for manual processing if extraction fails,,master
SRC-179,179,Population & Displacement (UNHCR/IOM),Humanitarian – Population/Movement,Global,UNHCR & IOM,https://api.unhcr.org/population/v1/,UNHCR: https://api.unhcr.org/population/v1/ ; IOM DTM reports via HDX,"UNHCR API (open, no auth) for refugee/IDP counts; IOM DTM datasets via reports/CSV (manual)",UNHCR annual; IOM DTM quarterly or as needed,Public/open data; use with attribution,B+,"UNHCR: annual counts of refugees/IDPs by origin/asylum; IOM: number of IDPs, returnees, migrants by region; covers 2010–present; subnational details via IOM",UNHCR annual (yearly); IOM quarterly,None for UNHCR; manual for IOM,"UNHCR: population type, country of origin/asylum, year, value; IOM: IDP/returnee/migrant counts by region",API ingestion from UNHCR for refugee data; manual ETL for IOM DTM spreadsheets; Data Gap Ticket if new events occur or updates missing,"Feeds Humanitarian Overview (displacement stats); IDP trends; maps; stakeholder pages (UNHCR, IOM)","Humanitarian Dashboard, IDP trends chart, Maps, Stakeholder Pages",UNHCR national; IOM subnational; data collection challenging in conflict zones; figures are estimates; IDP counts vary across sources and may require cross-checking,,master
SRC-180,180,ACLED (Armed Conflict Location & Event Data),Conflict Events,Global NGO,ACLED,https://api.acleddata.com/acled/read?country=Yemen&year=2023,https://api.acleddata.com/acled/read?country=Yemen&year=2023 (requires API key),REST API with token or bulk CSV downloads (license required),Weekly,ACLED data © ACLED; non-commercial use with attribution; license required; show disclaimer,A–,"Detailed conflict events: battles, airstrikes, explosions, protests, strategic developments; dates & locations; covers 2015–present (some data 2011–2014); weekly updates",Low – events added within 1–2 weeks,API key required; free for researchers,"Event ID, date, admin1/admin2 coordinates, event type, actors, fatalities, source info","Conditional API connector – automated weekly pulls if licensed; data stored as sensitive; filtered/aggregated for display; fallback to other sources (e.g. UCDP, GDELT) if license unavailable; Data Gap Ticket if no access",Feeds Conflict Timeline; allows correlation with economic indicators; informs AI Assistant; maps and heatmaps; stakeholder pages for security actors; sanctions/compliance,"Interactive Timeline, Maps, AI evidence, Conflict overview, Sanctions/Compliance",Highly granular (village-level events); fatalities are estimates; ACLED not official casualty count; sensitive data; display as overlay optional; fallback to UCDP or GDELT if ACLED not available,,master
SRC-181,181,UCDP (Uppsala Conflict Data Program),Conflict Casualties,Global Academia,Uppsala University,https://ucdpapi.pcr.uu.se/api/gedevents/22.1?Country=YR,https://ucdpapi.pcr.uu.se/api/gedevents/22.1?Country=YR,Open API and downloadable datasets (annual),Annual version releases (data up to previous year),Free for research with attribution,B+,"Battle-related deaths, one-sided violence aggregated by conflict and year; Yemen civil war data 2010–present (with one-year lag)",High – annual release covers up to previous year,None,"Year, actor1, actor2, deaths, location (GED events), conflict type",API connector fetches annual entries; loads into time-series; stores version number; cross-check with ACLED; Data Gap Ticket if missing updates,Provides macro view of conflict fatalities; feeds dashboards; scenario modeling; AI Assistant reference; cross-check with ACLED,"Conflict Overview, Timeline, Research Hub",Annual national-level aggregates; slower updates; undercounts recent events; complementary to ACLED; flagged accordingly,,master
SRC-182,182,"Sanctions & Compliance Lists (UN, OFAC, EU/UK)",Sanctions/AML,Global,"United Nations, OFAC (US Treasury), EU, UK (HM Treasury)",https://scsanctions.un.org/resources/xml/en/consolidated.xml,UN: https://scsanctions.un.org/resources/xml/en/consolidated.xml ; OFAC: CSV/XML on treas.gov ; EU & UK: PDF/CSV from respective sites,Downloadable XML/CSV/PDF; automated parsing,Ad‑hoc (whenever designations change); OFAC daily; EU/UK as needed,Public domain (legal notices); informational use only (not legal advice),A,"Lists of sanctioned individuals/entities related to Yemen (asset freeze, travel ban, terrorism sanctions, etc.) and global listings; includes local compliance lists if available",None – updates available as soon as lists change,None,"Name, alias, designation, DOB/nationality, sanction type, reason, sanctions program (e.g. 2140), dates",Automated import of CSV/XML; schedule daily for OFAC and weekly for UN/EU/UK; parse entries; filter those linked to Yemen; track updates (added/removed); update compliance database; manual fix if format changes,Sanctions & Compliance overview module – shows sanctioned entities; Stakeholder pages display warnings; AI compliance Q&A; timeline of sanctions events; compliance risk scoring,"Sanctions Dashboard, Stakeholder profiles, AI Compliance Q&A, Timeline",Lists are global (no subnational); not legal advice; show disclaimer; must update promptly; maintain reliability; note duplicates across lists,,master
SRC-183,183,UNCTADstat (Trade & Development),Trade & Development,Global,UNCTAD,,"UNCTADstat bulk download (no open API) – e.g. FDI inflows, external debt, current account",Manual/semi-automated CSV/Excel download; registration may be required for bulk files,Annual,Free for use with attribution (public),B,"FDI flows, balance of payments details, commodity price indices and development indicators; Yemen data 2010–present",Moderate to high (6+ months after year‑end),Free login may be required,"Depends on dataset (year, value, indicator)","Custom ETL – periodic checks for new files, download CSVs, load into structured tables; validation on year‑over‑year consistency; Data Gap Ticket if updates missing","External sector enrichment – FDI trends, debt statistics; complement trade data","Macro Trends (external debt, FDI), Investment Dashboard, Research Hub","National, annual; gaps due to conflict; proxies used if missing; flagged with lower confidence",,master
SRC-184,184,FAO – FAOSTAT & Food Security,Agriculture/Food,Global,FAO,,FAOSTAT portal (bulk downloads); FAO Food Price Index; food security cluster bulletins,Bulk download (CSV/Excel) – no API; bulletins (PDF) for food price monitoring,Annual for production indices; periodic (monthly/quarterly) for price monitoring,Open data (CC BY 4.0),B,"Crop production volumes, livestock counts, food supply per capita (up to 2013) and patchy thereafter; food price monitoring via WFP",High for production (published 1+ year later); moderate for price data,None for FAOSTAT,"Varies by dataset (year, item, value, unit)",Custom ETL – ingest historical series from FAOSTAT; parse PDF bulletins for food price monitoring; cross-validate with WFP; Data Gap alerts if bulletins are late,"Agricultural context – agriculture % of GDP, cereal production trends; food price data used for humanitarians and inflation proxy","Macro Trends (agriculture), Markets & Prices, Aid & Food Security, Research Hub",National totals; no governorate-level production data; significant data gaps post‑2015; proxies used and missing values flagged,,master
SRC-185,185,UNDP/UNICEF/WFP/OCHA Public Data & Reports,Development & Humanitarian Analysis,Global/UN,"UNDP, UNICEF, WFP, OCHA (various agencies)",,"Various: UNDP Yemen site, UNICEF Yemen site, WFP VAM DataViz, OCHA HDX datasets",Documents (PDFs) and small datasets; some via HDX; manual or semi-automated ingestion,"Occasional – e.g. UNDP bulletins quarterly, UNICEF updates annually, WFP VAM price bulletins monthly, OCHA HNO/HRP annually",Public domain or CC BY (varies by agency); data on HDX open,A–,"Qualitative & quantitative insights: poverty, human development, recovery analyses; WFP price data; UNDP socio-economic updates; UNICEF child indicators; OCHA HNO people in need by governorate; etc. 2010–present",Reports often 1–2 times per year; data may be a few months old,None,"Various – summary tables (e.g. poverty rates, number of out‑of‑school children) and narrative analysis",Document ingestion with parsing; YETO captures key data points and stores metadata; manual entry if automated parsing fails; Data Gap if expected reports are overdue,"Enriches Evidence Base; feeds Scenario Simulator assumptions; informs dashboards (e.g. needs and aid coverage, malnutrition rates); used in Glossary; Research Hub and AI assistant","Humanitarian Overview, Poverty & Social Indicators, Research Hub, AI Assistant",Some reports include subnational data (needs by governorate); captured by YETO; data may be modelled or inconsistent; flagged with confidence rating and methodology notes,,master
SRC-186,186,WFP Yemen Market & Price Monitoring,Market Prices & Food Security,Global (Yemen),World Food Programme (VAM),,WFP VAM DataViz platform and HDX (e.g. monthly bulletins like “Yemen Market and Trade Bulletin Oct 2025”),PDF bulletins and CSV/Excel datasets; WFP price API if available; manual ingestion,Monthly bulletins (4–6 week lag); possibly bi‑weekly raw price data,Open; WFP data is public with attribution,A,"Retail prices of staple foods and fuel (petrol, diesel, gas) across various markets; exchange rates (market vs official); supply indicators (days of import cover); narrative analysis",4–6 weeks – bulletins published after month end; raw data available sooner via partners,None,"Commodity, market/city, unit, price (YER), date; cost of minimum food basket; fuel prices; exchange rates",Custom parser to extract tables from monthly PDFs; ingest any available CSV from HDX; manual QA; WFP global price API if available; Data Gap alert if bulletin is late,"Feeds Markets Dashboard (price trends, regional splits), Fuel Price Dashboard, FX Dashboard (market rates), Scenario Simulator (impact of shocks), AI assistant (inflation and purchasing power)","FX & Inflation Monitor, Food Security panel, Humanitarian Planning, Timeline",Subnational – data by region/market; YETO labels regime control (GoY vs DFA); no official CPI post‑2015; WFP price-based inflation is proxy; volatile; missing areas noted,,master
SRC-187,187,Fuel Price Bulletins & Partner Feeds,Market Prices,National/Partner,"Yemeni fuel companies, humanitarian clusters, partners",,"Varies – YPC announcements, Food Security Cluster Fuel Watch, partner data contributions","Manual ingestion – PDF bulletins, social media announcements, partner-provided files",Ad‑hoc (whenever price changes); clusters track monthly,Public domain or partner data; provenance maintained,B,"Official pump prices for petrol, diesel, cooking gas in government-controlled and DFA areas; black‑market prices if monitored; 2010–2014 official data; 2015–present assembled from news/clusters",N/A – updates as changes occur; YETO records time of last change,None,"Region (GoY vs DFA), city, fuel type, price (YER per litre/cylinder), effective date",Custom pipeline; maintain dataset of fuel prices; ingest updates from WFP/clusters; use media monitoring; store multiple prices (official vs unofficial) with provenance; manual updates when automated data is sparse; Data Gap Ticket on conflicting or missing data,Supports inflation/cost of living analysis; macro dashboards; Fuel Subsidy Tracker; scenario modelling; stakeholder pages; sanctions/compliance (if tracking fuel import violations),"Markets & Prices, Fuel Subsidy Tracker (if implemented), Timeline, AI Assistant",Regional (north vs south and city‑level); official price may not reflect availability; multiple prices recorded (official and market); context noted; manual updates recommended when data scarce,,master
SRC-188,188,Yemen Data Project (Airstrikes),Conflict – Air War,NGO,Yemen Data Project,,Reports and requests (no open API),Manual ingestion from monthly reports and media releases,Monthly; annual summary,Attribution required; data for advocacy; not for commercial use,A,"Counts of air strikes, targeted locations, civilian casualty estimates since March 2015",Low – monthly data available within next month,None for summary info; full dataset may require contact,"Month, number of air strikes, location targeted, civilian casualties (if available)",Manual parsing of reports and bulletins; store monthly counts; integrate into conflict timeline; Data Gap Ticket if missing reports,Enhances Conflict Timeline (air war intensity); AI Assistant; Sanctions/Compliance (air strike patterns relevant to arms embargo); scenario modeling,"Conflict Timeline, AI evidence, Sanctions/Compliance, Research Hub",Monthly by broad region; covers only airstrikes; complementary to ACLED; flagged as specific context,,master
SRC-189,189,Central Bank of Yemen – Aden & Sana’a,Monetary & Financial Sector,National,Central Bank of Yemen (CBY) – Aden (Government) & Sana’a (De facto),,Official websites (e.g. cby-aden.com); Sana’a releases via Ministry of Planning or news,"Manual ingestion – scrape CBY Aden auction data, bulletins; glean Sana’a data from reports/leaks/news; partner feeds",Aden: weekly FX auction results; monthly/quarterly bulletins; annual financial statements. Sana’a: irregular data via budget docs or news; circulars occasionally,Government public data (no formal license),B–,"Exchange rates (official peg/auction rates in Aden; official rate in Sana’a; parallel market rates); monetary indicators (money supply, inflation if any, deposits, loans); banking sector (licensed banks, compliance); 2010–2014 unified; post‑2015 split data by regime",Variable – auctions weekly; other stats months or absent,None (public reports); internal data may require partnerships,"Auction: date, amount sold, cut-off rate, weighted rate; FX rates; monetary aggregates; list of licensed banks; circulars and policy decisions",Custom ETL and document parsing – scheduled scraping of CBY Aden auction results; parse bulletins and financial statements; tag data by regime (Aden vs Sana’a); store parallel series; Data Gap for missing series; proxies used (e.g. WFP prices for inflation),"FX Dashboard (official vs parallel rates); Monetary module (money supply, inflation, banking sector); Public Finance context; Stakeholder Pages (CBY profile); timeline for monetary policy events","FX & Monetary, Banking Sector, Public Finance, Timeline, AI Assistant",National; effectively two monetary jurisdictions; YETO displays dual values; data quality low; proxies used; missing data flagged; contradictory series shown side-by-side,,master
SRC-190,190,Yemen Ministry of Finance / Ministry of Planning / CSO,Public Finance & Economic Planning,National,Government ministries (GoY and DFA),,"Official documents (budgets, fiscal statements) via government portals or leaked PDFs","Manual document ingestion (PDFs, Excel); partner-provided copies; speech extracts","GoY budgets irregular (e.g. 2019, 2021); execution reports rarely; Sana’a budgets undisclosed; MoPIC plans occasional; CSO yearbooks up to 2014 and limited later estimates",Government data; public domain,C+,"Government budgets (revenues, expenditures, deficit financing), public debt (domestic and external), donor funding, macro assumptions (oil production, exchange rate); MoPIC development plans; CSO data (GDP, population, CPI) up to 2014; partial estimates 2015–2017; dual budgets post‑2015",Annual if published; many years missing,None,"Budget lines by sector/ministry; revenue by type (oil, tax, grants); deficit & financing; population and CPI series; macro assumptions; development plan indicators",Document parsing and ETL – extract tables from PDFs; store data by regime and year; flag missing years; glean partial data from speeches and IMF reports; integrate CSO historical data; Data Gap Ticket when reports unavailable; proxies used,"Public Finance module – budget trends, revenues, expenditures, debt; Debt Tracker; scenario modelling (fiscal policy changes); Stakeholder pages for MoF/MoPIC; Research library","Public Finance Dashboard, Debt Tracker, Economic Plans, Research library, Stakeholder Pages",National; breakdown by sector if available; no unified budget after 2015; data politicized; off‑budget items (e.g. military aid) excluded; data rated low confidence; side‑by‑side comparison of GoY vs DFA budgets,,master
SRC-191,191,Social Fund for Development (SFD),Development Projects (National),National,Social Fund for Development (Yemen),,"SFD website (annual reports, project catalogs); some data via IATI",Document ingestion; partner data sharing via CSV/excel; IATI feed if available,Annual reports; continuous updates in internal MIS (not public),Public reports open; detailed data via partnership/MoU,A–,"Projects across Yemen (community development, cash-for-work, education, water, etc.); number of projects, beneficiaries, funding by donor; microfinance support data; 2010–present",Annual summary available few months after year‑end; detailed updates require access,None for summary; partnership needed for raw data,"Project ID, location (district), sector, budget, donor source, status, outputs (e.g. classrooms built), outcome indicators, microfinance portfolios","Document ingestion & custom feed – parse annual reports for aggregates; if partnership, ingest CSV; link with IATI (activities listing SFD as implementer); Data Gap if no data available",Showcases community-level impact; Aid Tracker highlights SFD activities; Stakeholder page describes SFD role; contributes to Poverty & Resilience module; microfinance data used in Financial Sector analysis,"Aid Projects, Poverty & Resilience, Stakeholder Profile, Private Sector (microfinance data)",Subnational – data by district/village; funding sources must be merged to avoid double counting; security conditions may stall projects; missing details flagged,,master
SRC-192,192,Yemen Microfinance Network (YMN),Financial Inclusion,National NGO,Yemen Microfinance Network,,"YMN publications (quarterly bulletins, conference papers)",PDF reports; partner data sharing (no API),Quarterly/Annual,Shared within development community; open if obtained,B,"Microfinance sector indicators: number of active borrowers, total loan portfolio, number of MFIs and branches, portfolio at risk, savings accounts; includes Microfinance Bank stats; 2010–present (disrupted by conflict)",Unknown – likely annual consolidation,Partner contact may be needed for data,"MFI name, active clients, outstanding loans, portfolio quality, geographic coverage, savings accounts; microfinance bank metrics",Manual/partner ETL – import baseline dataset (e.g. banks_microfinance_money_exchangers.xlsx); request quarterly data from network; search for publications; use SFD data for microfinance; Data Gap when updates missing,Feeds Financial Sector module – microfinance outreach and resilience; Stakeholder pages for MFIs; AI Assistant uses microfinance stats; scenario modelling for financial inclusion,"Finance Dashboard, Maps (branch coverage), Research Hub",National; governorate-level if provided; conflict impacts MFIs; data may be outdated; flagged with caveats; north vs south splits after 2015,,master
SRC-193,193,Association of Yemeni Banks,Banking Sector,National NGO,Association of Yemeni Banks (AYB),,N/A – statements or annual meeting documents,Manual – outreach and available documents,Ad hoc,N/A,C,"Possible aggregated insights: number of banks, sector issues; qualitative information",N/A,N/A,N/A (qualitative; uses other sources for quantitative figures),Maintain stakeholder profile; rely on other sources for quantitative data; document statements,Stakeholder page for AYB; potential channel for data requests; context for banking sector,"Stakeholder Map, Compliance",Not a data source; used for qualitative context and stakeholder engagement,,master
SRC-194,194,Private Sector & Chambers of Commerce,Private Sector Data,National,Federation of Yemeni Chambers of Commerce & Industry; business associations,,Surveys and reports (no central source),Surveys/reports from chambers; customs data via chamber if shared,Ad hoc,N/A; survey-based data,C,"Potential information on number of businesses, impact of war on businesses, import/export hurdles, price surveys; data anecdotal/survey-based",N/A,N/A,Varies (survey results),Treat as stakeholder; engage to obtain surveys; manually ingest if available,"Enrich Private Sector module (business sentiment, logistics challenges); scenario assumptions for private investment; Research hub","Private Sector Module, Scenario Simulator, Research Hub","Data is anecdotal, not systematic; Data Gap likely; flagged as such",,master
SRC-195,195,Remote Sensing (Night Lights – VIIRS),Proxy Indicators,Global,NASA/NOAA,,NOAA/NASA Nighttime Lights data (monthly composites via Earth Observation portals),Bulk file download (GeoTIFF); processing to extract indices; possible use of Google Earth Engine,Monthly,Open (US government data),B,Average nighttime radiance at 0.5 km resolution; aggregated to national or governorate level; covers 2012–present (earlier via DMSP),~1 month after end of month,None,"Month, radiance index (by region if processed)","Data pipeline – fetch monthly raster, compute summary metrics (e.g. total luminosity by governorate); filter anomalies; store time series; Data Gap if retrieval fails",Economic activity proxy on macro dashboard; scenario modeling (recovery scenarios); interactive maps; timeline overlays,"Macro Trends, Energy & Infrastructure, Interactive Maps, Timeline",Granularity ~0.5 km aggregated; proxies require interpretation; anomalies from fires or flaring; not direct GDP measure; flagged as experimental indicator,,master
SRC-196,196,ACAPS Yemen Analysis (YETI),Research/Think‑Tank,International NGO,ACAPS,,ACAPS YETI publications (PDFs or dashboards),Document access – PDF reports (no API),Periodic (scenarios/analyses as published),Public reports; usage with attribution; content may be under CC BY,B,Analytical products on Yemen’s economy and humanitarian situation; scenarios and risk analysis; not numerical data but narrative context,N/A – publishes as events require,None,"Narrative content, scenario assumptions, risk factors",Document ingestion; store reports in Research Hub; no structured data extraction except manual summarization,Provides qualitative context in Research Hub; informs Scenario Simulator; AI assistant uses narrative insights,"Scenario Simulator (pre‑modelled scenarios), Research Hub, AI Assistant",Narrative analysis; not structured data; used for context not metrics,,master
SRC-197,197,Rethinking Yemen’s Economy (RYE),Research/Think‑Tank,International collaboration,Sana’a Center & Partners,,Policy briefs and papers (PDF),Document access (no API),Periodic,Public reports; usage with attribution,B,"Deep dive reports on fuel subsidies, central bank, private sector and other topics; narrative analysis; may include bespoke data or surveys",N/A – as published,None,"Narrative analysis, data tables (if included)",Document ingestion; store in Research Hub; manual extraction of bespoke data,Enriches Glossary (definitions with Yemen context); informs Research Library; supports AI assistant responses; Stakeholder pages may link relevant briefs,"Research Hub, Glossary, Stakeholder Pages, AI Assistant",Narrative analysis; not systematic data; used for context and definitions,,master
SRC-198,198,Prospects,,,,https://population.un.org/datap,https://population.un.org/datap,,,,,,,,,,,,,,inclusive_pdf
SRC-199,199,Database,,,,https://unstats.un.org/SDGAPI/v,https://unstats.un.org/SDGAPI/v,,,,,,,,,,,,,,inclusive_pdf
SRC-200,200,https://finDevgateway.org FATF (Financial Action Task Force) Grey List/Mutual Evaluation,,,,https://www.fatf-,https://www.fatf-,,,,,,,,,,,,,,inclusive_pdf
SRC-201,201,Partnership – Yemen,,,,https://internationalbudget.,https://internationalbudget.,,,,,,,,,,,,,,inclusive_pdf
SRC-202,202,International Data,,,,https://www.eia.gov/internationa,https://www.eia.gov/internationa,,,,,,,,,,,,,,inclusive_pdf
SRC-203,203,World Economic Outlook (WEO),,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-204,204,Fiscal Monitor,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-205,205,2 Population Projections,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-206,206,(archived),,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-207,207,Yemen,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-208,208,Night‐Time Lights Arabia,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-209,209,Market Bulletin,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-210,210,Rate Feed,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-211,211,Reports,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-212,212,(Top Enterprises),,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-213,213,Investments,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-214,214,Program (ATFP),,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-215,215,Finance Gap Database,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-216,216,https://www.gsma.com/mobilemoneymetrics/ Money Changers (Licensed and Unlicensed) Registry,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-217,217,Announcers,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-218,218,Authority (if available),,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-219,219,"Mukalla Throughput 
Licensing Data Reports",,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-220,220,Reports SRC-069 | Trade regulation | National,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-221,221,Papers,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-222,222,Economic & Corporate Affairs),,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-223,223,Company,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-224,224,,,,,,,,,,,,,,,,,,,,inclusive_pdf
SRC-225,225,"yeto.causewaygrp.com,",,,,"https://yeto.causewaygrp.com,","https://yeto.causewaygrp.com,",,,,,,,,,,,,,,url_extract


=== END FILE: db/seeds/sources_seed_225.csv ===



APPENDIX A — CANONICAL MASTER BUILD PROMPT (VERBATIM)

AI IMPLEMENTER — READ FIRST (ANTI‑OMISSION EXECUTION PROTOCOL)

You are an autonomous AI engineering system responsible for delivering a production‑grade, bilingual (Arabic/English) Yemen Economic Transparency Observatory (YETO) platform end‑to‑end: planning → design → implementation → testing → documentation → GitHub → AWS production deployment → monitoring → ongoing data refresh automation.

This prompt is intentionally exhaustive. Your #1 failure mode is “missing one requirement.” Prevent that with a formal coverage workflow:

A) Create a Requirements Traceability Matrix (RTM)
   1) Parse this entire prompt (including any appendices and attachments).
   2) Extract every requirement statement containing: MUST, MUST NOT, REQUIRED, SHALL, SHOULD, “no follow‑ups”, “zero→live”, “deliverables”, “privacy/security”, “UI must match”, etc.
   3) Create: docs/RTM.csv (or docs/RTM.xlsx) with columns:
      - RTM_ID (e.g., RTM‑0001)
      - Source (section + exact quote)
      - Requirement (rewritten as a testable statement)
      - Priority (P0/P1/P2)
      - Acceptance Test (how you will prove it works)
      - Implementation Artifact (file path / URL / screenshot name)
      - Status (Planned/In‑Progress/Done)
      - Notes/Risks/Assumptions
   4) Nothing can be considered “done” until RTM status is “Done” AND the acceptance test evidence exists.

B) Create an Execution Plan with checkpoints
   - docs/EXECUTION_PLAN.md with phases, checkpoints, and explicit “Definition of Done” (DoD) per phase.
   - After each checkpoint: commit to Git, tag the commit, and export a backup zip snapshot (see “Backups” below).

C) Backups & crash‑recovery (non‑negotiable)
   - Every checkpoint must produce:
     1) a Git commit + tag (e.g., v0.1-foundation)
     2) a zip snapshot saved to /backups/ with the tag name
     3) an updated docs/TODO.md and docs/ASSUMPTIONS.md
   - If your environment crashes or you lose context, you MUST recover from these artifacts and continue; do not restart from scratch.

D) If something is blocked (credentials, DNS, licenses)
   - You MUST still implement the full scaffolding and a zero‑credential “demo mode” with seeded data so the platform runs locally and in staging.
   - In docs/BLOCKERS.md, list the exact missing credential / decision, the minimal user action needed, and the safe fallback you implemented.
   - Do not stop or ask follow‑up questions; proceed with safe defaults and document them.

E) Final Self‑Audit deliverable
   - Produce docs/FINAL_AUDIT_REPORT.md:
     - Summary of what’s live (URLs), what’s demo-only, what’s gated behind credentials
     - RTM completion statistics
     - Evidence links (screenshots, logs, command outputs)
     - Security checklist results
     - Performance checklist results

F) Output orientation so the user never gets confused
   - Root files MUST include:
     - START_HERE.md (what this is + how to run + how to deploy)
     - README.md (developer quickstart)
     - docs/ADMIN_MANUAL.md (admin operations)
     - docs/SUBSCRIBER_GUIDE.md (subscriber features)
     - docs/DATA_SOURCES_CATALOG.md (sources + licenses + cadence + fields)
     - docs/API_REFERENCE.md (internal/external API)
     - docs/DATA_DICTIONARY.md (schema)
     - docs/SECURITY.md (threat model + controls)
     - docs/RUNBOOK.md (ops + incident response)
     - docs/RTM.csv (or .xlsx)
     - docs/FINAL_AUDIT_REPORT.md

G) Non‑branding rule
   - Never mention any specific AI tool/vendor name in UI copy, documentation, or commit messages. Refer only to “AI”, “automation”, “agent”, “assistant”, or “model”.

H) Attachment intake rule (treat provided files as first‑class requirements)
   If the user provides attachments (SQL dumps, Excel files, PDFs, images, logos, etc.), you MUST:
   1) Create docs/ATTACHMENTS_INDEX.md listing each file, type, purpose, and how it is used.
   2) Store assets in-repo under a clear structure:
      - /data/raw/ (original datasets, read-only)
      - /data/processed/ (normalized exports, parquet/csv)
      - /public/brand/ (logos, icons)
      - /public/mockups/ (UI references, read-only)
      - /assets/mockups/external/ (downloaded from shared links such as iCloud; read-only)
      - /docs/references/ (PDFs, converted markdown summaries)
   - If the operator provides **mockups via web links** (e.g., iCloud shared photo/album links) rather than uploading files:
     1) Attempt to download/export the images and archive them in `/assets/mockups/external/`.
     2) If your environment cannot access the links, proceed using the mockups you do have, and create **one** TODO requesting the operator to export the album as a ZIP (do not ask multiple follow-ups).
   3) For database dumps (example filenames you may receive):
      - centralbank_reporting.sql
      - expanded_financial_dataset.sql (and variants)
      - banks_microfinance_money_exchangers.sql
      - YEC_dataset_full.sql
      Implement scripts to import them into Postgres, validate schema, and register them in the platform’s dataset registry.
   4) For Excel datasets: ingest via ETL into the same canonical schema, keep the original file intact, and track provenance.
   5) For PDFs: ingest into the Research Library (metadata + searchable text index) and make them downloadable with citations.
   6) For UI mockup images: treat them as UI contracts (see Appendix). Create a UI parity checklist and implement accordingly.
   7) For brand assets: extract/define the design tokens and implement them in the design system.

I) UI parity rule (mockups are the contract)
   - The attached UI mockups are part of the requirements. Build the UI to match them closely (layout, spacing, component behavior, bilingual toggle, filter chips, cards, exports, etc.).
   - Where mockups conflict with written requirements, follow this order:
     1) Security/Privacy requirements
     2) Data provenance & integrity requirements
     3) Written functional requirements
     4) Mockup layout/styling requirements (as long as #1–#3 remain satisfied)

Proceed now to the canonical build prompt below, then apply the “Mockup Alignment & Extra Requirements” appendix after it.


====================
BEGIN CANONICAL MASTER BUILD PROMPT (DO NOT EDIT)
====================

TITLE
AI — MASTER BUILD PROMPT (STANDALONE, ZERO→LIVE, NO FOLLOW‑UPS)
Project: YETO — Yemen Economic Transparency Observatory
Intelligence layer: YECO Evidence Engine (“One Brain”)

YOU MUST NOT ASK THE USER ANY QUESTIONS
- Execute from zero to production using reasonable defaults.
- When ambiguity exists, choose the safest, most standard default, document it in /docs/DECISIONS.md, and proceed.

DOMAIN & CONTACT (HARD REQUIREMENTS)
- Production domain: https://yeto.causewaygrp.com
- Public contact email (ONLY contact info shown on site, footer, and contact widgets): yeto@causewaygrp.com
- DO NOT show any physical address anywhere (no city names, no “Sana’a”, no office address, no maps, no location cards).
- Social icons may exist (placeholders allowed) but must not reveal addresses.
- Hosting: AWS (paid subscription; assume sufficient budget and capacity).
- Everything must be built from zero: GitHub repository, AWS infrastructure, backend, frontend, databases, ingestion pipelines, ML/AI services, admin portals, partner portals, subscriptions, security, documentation, testing, and final deployment.

PRIMARY OBJECTIVE (NON‑NEGOTIABLE)
Build and deploy a bilingual (Arabic‑first + English) verifiable economic intelligence platform for Yemen from 2010→present that:
1) Ingests and continuously updates data, documents, and events from credible sources.
2) Stores everything with provenance, licensing metadata, versioning/vintages, and confidence scoring.
3) Produces decision‑grade analysis WITHOUT hallucinating.
4) Provides role‑based dashboards, downloads, an API, automated publications, and advanced premium features.
5) Includes a public site + authenticated user features + partner contributor portals + admin operations console.
6) Ships as a complete working product with populated evidence-backed content and scheduled future updates.

──────────────────────────────────────────────────────────────────────────────
SECTION 1 — ABSOLUTE RULES (HARD GATES: MUST BE ENFORCED IN CODE + UI + AI)
──────────────────────────────────────────────────────────────────────────────

R0 — NO HALLUCINATION / NO FABRICATION
- Never invent numbers, facts, citations, documents, images, institutions, timelines, or attributions.
- If data is missing: display “Not available yet” and create a Data Gap Ticket that specifies:
  {missing item, why it matters, best candidate sources, acquisition method, cadence, priority}.
- All AI outputs must be grounded in the platform evidence store, or explicitly labeled as:
  (a) Fact (b) Interpretation (c) Hypothesis (d) Forecast (e) Recommendation.

R1 — EVERY NUMBER HAS A HOME
Every statistic/chart/KPI/map/claim must display and store:
- Source publisher + exact dataset/document name
- URL / persistent identifier
- Publication date + retrieval date
- License/terms (or “unknown — manual review required”)
- Geographic scope (national / governorate / district / route / north–south regime tag)
- Time coverage (start/end)
- Definitions, units, base year (CPI base year; nominal vs real; YER/USD; etc.)
- Confidence rating A–D with explanation
- Transformation log (formulas applied, normalization, rebasing, deflation)

R2 — TRIANGULATION FOR HIGH‑STAKES OUTPUTS
For policy-sensitive indicators (FX, inflation, reserves proxies, fiscal flows, aid flows, conflict-economy claims):
- Attempt ≥2 independent sources where possible.
- If conflicting: DO NOT average. Show both values; explain discrepancies; enable “disagreement mode” view.

R3 — VERSIONING (“WHAT WAS KNOWN WHEN”)
- Preserve dataset/doc vintages and time-series revisions.
- Any update must create a new version entry with changelog (what changed, why, source).

R4 — DO NO HARM
- Never publish PII.
- Never provide guidance that enables violence, targeting, sanctions evasion, or market manipulation.
- For panic-sensitive topics (currency shocks, bank runs): communicate responsibly, show uncertainty, avoid sensational framing.

R5 — ARABIC-FIRST + ACCESSIBILITY
- Arabic UI must be first-class: RTL layout, Arabic typography, Arabic-first navigation.
- English must be full parity.
- Maintain a controlled bilingual glossary to prevent translation drift.
- Must meet accessibility baseline (WCAG 2.1 AA where feasible): contrast, keyboard nav, screen reader labels.

R6 — LICENSING & PAYWALL POLICY (MANDATORY)
- Respect robots.txt and source terms.
- Never scrape paywalled or license-restricted content.
  - Store metadata only: {title, publisher, abstract/snippet if permitted, link, language, date}.
  - Mark “restricted” and create a Data Gap Ticket with legal acquisition options.
- For restricted datasets (e.g., some conflict datasets): store only what licensing permits (often aggregates), or disable connector.

R7 — TESTS BEFORE PUSH + PROTECTED MAIN
- Every milestone must pass automated tests before merge/push to main.
- CI (GitHub Actions) is mandatory. No “works locally” exceptions.
- Main branch must be protected (PR required, checks required).

R8 — SINGLE SOURCE OF TRUTH
- UI, analytics, exports, and AI must use platform evidence store only.
- Outputs must be reproducible from stored evidence + logged transformations.

R9 — CORRECTIONS POLICY (PUBLIC TRUST FEATURE)
- Add “Report an Issue” on every chart/report.
- Implement correction workflow: acknowledge → investigate → correct → publish correction note.
- Never silently change published values; keep older vintages accessible with timestamps.

R10 — SPLIT‑SYSTEM ENFORCEMENT (YEMEN REALITY)
Every relevant series/event/document must carry:
- regime_tag: {Aden/IRG, Sana’a/de facto, mixed, unknown}
- note_regime_tag (where relevant): {new notes, old notes, not applicable, unknown}
- fx_market_type_tag (FX): {official, parallel, transfer, cash, other/unknown}
UI must never merge across regime tags unless user explicitly enables “Compare regimes” mode with warning.

R11 — EVIDENCE PACK FOR HIGH‑STAKES OUTPUTS
If a user request affects policy, markets, money flows, or public trust, output an Evidence Pack:
- 5–15 most relevant sources
- what each source contributes
- contradictions
- confidence rating
- “what would change this conclusion”

R12 — RESUMABILITY & CRASH‑SAFETY (BUILD RELIABILITY)
- You must implement a resumable build workflow with checkpoints and backups (details in Section 3).
- If your execution environment crashes, you must be able to resume from the latest checkpoint without losing progress.

──────────────────────────────────────────────────────────────────────────────
SECTION 2 — OPERATING MODEL (YOU ARE A FULL EXPERT TEAM; PRODUCE ARTIFACTS)
──────────────────────────────────────────────────────────────────────────────

Simulate and fulfill ALL roles below. Each role must produce tangible outputs (code, docs, tests, configs):

1) Program Director / Product Owner (sequencing, acceptance criteria, risk register)
2) Yemen Macroeconomist (indicator definitions, mechanism narratives, scenario realism)
3) Monetary & FX Specialist (split-system FX logic, dual rates, banking constraints)
4) Public Finance & Governance Specialist (budgets, revenues, salaries, procurement)
5) Humanitarian Economist (cash programming, market functionality, food security economics)
6) Conflict Political‑Economy Analyst (war economy channels, fragmentation, incentives; evidence-only)
7) Data Engineer (ETL, connectors, provenance ledger, QA gates, idempotency)
8) Data Scientist / ML Engineer (nowcasting/forecasting, anomaly detection, evaluation, drift monitoring)
9) Full‑Stack Engineer (APIs, frontend, exports, search, RAG endpoints)
10) UX/UI Designer (design system, components, page layouts, RTL)
11) Security / DevSecOps Engineer (AWS architecture, IAM, encryption, WAF, audit logs)
12) QA Engineer (test plan, integration/regression, data validation)
13) Technical Writer (docs, methodology, runbooks, manuals)
14) Partner & Contributor Workflow Manager (submission workflows, moderation, verification gates)

MANDATE FOR EXECUTION
- Create a GitHub monorepo from minute one; push early and often (checkpoint-based).
- Implement CI/CD and final production deployment to AWS for yeto.causewaygrp.com.
- Populate the platform with real, backfilled evidence for 2010→present to the maximum possible from open/accessible sources, clearly marking gaps.

──────────────────────────────────────────────────────────────────────────────
SECTION 3 — BUILD RESILIENCE: CHECKPOINTS, BACKUPS, AND CRASH RECOVERY (MANDATORY)
──────────────────────────────────────────────────────────────────────────────

You must assume build agents can crash, disconnect, or hit transient errors. Prevent loss of work.

3.1 Checkpoint Protocol (GitHub + Docs)
- Create /STATUS.md and update it at the end of every major step with:
  {current phase, completed tasks, pending tasks, risks, next commands}.
- Create /docs/DECISIONS.md: log defaults chosen and rationale.
- Create /docs/ARCHITECTURE.md: evolving diagrams and service map.
- Create /docs/CHANGELOG.md: weekly changes and dataset revisions.

3.2 Git Checkpoints
- Use feature branches per phase; merge via PR into main.
- Tag releases per milestone: v0.1-arch, v0.2-coreapi, v0.3-ingestion, etc.
- Ensure repository always builds from scratch via documented scripts.

3.3 Infrastructure & Data Backups During Development
Before final production deployment, still implement backups:
- Enable S3 versioning on all buckets.
- Enable automated RDS snapshots (even in staging).
- For OpenSearch: scheduled snapshots to S3.
- For Secrets: store in Secrets Manager; export a redacted inventory (not secrets) to /docs/SECRETS_INVENTORY.md.

3.4 Pipeline Idempotency & Retry Safety
- All ingestion jobs must be idempotent:
  - same run input must not duplicate outputs
  - use content hashes and unique constraints
- Implement retry with exponential backoff.
- Store job run state in a durable store (DB table ingestion_runs + S3 raw objects).
- If a job fails mid-way, rerun should safely resume or restart.

3.5 Crash Recovery Playbook
- Create /docs/RECOVERY_RUNBOOK.md including:
  - how to re-run infra provisioning
  - how to restart pipelines
  - how to restore DB snapshot
  - how to rebuild search index
  - how to rehydrate vector index
  - how to verify integrity via automated smoke tests

3.6 Continuous Integrity Validation
- Nightly integrity checks:
  - DB constraints
  - orphaned documents
  - broken source links
  - missing provenance metadata
  - regression in coverage scorecard
- Failures create admin tickets automatically.

──────────────────────────────────────────────────────────────────────────────
SECTION 4 — PLATFORM ARCHITECTURE (LAYERED, EVIDENCE-FIRST)
──────────────────────────────────────────────────────────────────────────────

Build four layers:

1) Data Layer
- Time series, geospatial datasets, events, projects, funding flows, documents, images.

2) Provenance & Trust Layer
- Provenance ledger, licensing, confidence scoring, contradiction detection, vintages, correction logs.

3) Reasoning & ML Layer
- Change detection, anomaly detection, nowcasting/forecasting, scenario simulator, evidence-grounded narrative generation.

4) Delivery Layer
- Role-based dashboards, alerts, reports, exports, API access, bilingual UX, admin/partner portals.

TECH STACK (DEFAULT — IMPROVE ONLY IF YOU DOCUMENT WHY)
Frontend:
- Next.js (TypeScript), Tailwind CSS, SSR for SEO
- i18n: Arabic RTL + English LTR
- Charts: ECharts or Plotly
- Maps: Leaflet + OSM tiles (no physical address display)

Backend:
- Python FastAPI (REST)
- Background tasks: Celery + Redis OR AWS Step Functions + EventBridge schedules (choose and document)
- Report generation: server-side PDF generation

Data:
- PostgreSQL (RDS) + PostGIS + pgvector
- S3 for documents and raw/normalized data
Search:
- OpenSearch recommended (or Postgres full-text as minimal)
Auth:
- AWS Cognito (JWT)
Infra:
- Terraform or AWS CDK (choose one; document)
CI/CD:
- GitHub Actions + ECR + ECS Fargate (or equivalent AWS-native stack)

──────────────────────────────────────────────────────────────────────────────
SECTION 5 — TARGET USERS, ROLES, AND POWER-REALISTIC OUTPUTS
──────────────────────────────────────────────────────────────────────────────

User categories (role-based dashboards + permissions):
A) Policymakers & Technical Officials (de jure + de facto)
B) Central Bank Leadership & Financial Regulators
C) Banks, MFIs, Money Exchangers, Payment Providers
D) Donors & Implementers
E) IFIs / EU stabilization & accountability units
F) UN agencies & humanitarian clusters
G) Think tanks, journalists, researchers, universities/students
H) Private sector (importers, producers, SMEs, chambers, **major Yemeni corporate groups** — e.g., Hayel Saeed Anam & Co./HSA Group and other top conglomerates; verify official naming and keep content strictly evidence‑based)
I) Citizens (Arabic-first)
J) Premium institutional subscribers (teams)

**Mandatory UX / user‑journey deliverable (to avoid omissions):**
- Create `/docs/ux/USER_JOURNEYS.md` with **one journey map per segment (A–J)** covering: entry point(s), primary goals, key pages/screens, decision points, outputs (chart/report/download), subscription gates, and “done” criteria.
- Implement navigation + CTAs so each journey works end‑to‑end with **no dead ends** and no hidden pages.
- Add automated E2E tests (Playwright/Cypress) for the **golden paths** below and run them in CI:
  1) Public visitor → Dashboard → apply filters → export chart (PNG + CSV) → open dataset card → view sources/citations.
  2) Policymaker/regulator → Policy Brief → Scenario Simulator → generate a cabinet note → export PDF (EN + AR).
  3) Donor/UN economist → Aid/FTS tracker → gap analysis → download cleaned dataset → subscribe to alerts/newsletter.
  4) Private‑sector user (e.g., CFO/importer / major conglomerate analyst) → FX/Import Costs → Port status → shock scenario → generate risk note.
  5) Researcher → Research Hub → open paper → replicate a figure using Dataset Builder → export citation + data.
  6) Admin/Data Steward → upload dataset → QA/validation → publish → trigger “Latest Updates” item + email digest.


Stakeholder Registry (MANDATORY)
- Create a stakeholder registry module:
  Fields: {stakeholder_name, category, regime_tag, what they control, incentives, constraints, typical decision horizon,
  indicators they watch, thresholds that move decisions, preferred outputs, contact channel (org only, no PII)}.
- Use this registry to tailor dashboards and brief templates.

──────────────────────────────────────────────────────────────────────────────
SECTION 6 — UX/UI DESIGN SYSTEM (MATCH PROVIDED DESIGN DIRECTION)
──────────────────────────────────────────────────────────────────────────────

Visual language:
- Navy / Green / Gold
- Clean cards, strong hierarchy, contextual Yemen imagery
- Arabic-first RTL + English LTR

Design tokens:
- Navy: #103050
- Dark Navy: #0B1F33
- Green: #107040
- Gold: #C0A030
- Light background: #F6F8FB
- Card: #FFFFFF
- Border: #E6EAF0

Typography:
- English: Inter (or IBM Plex Sans)
- Arabic: Cairo or Noto Kufi Arabic

Images (MANDATORY)
- Use only high-resolution images with compatible licenses.
- Store attribution for every image:
  {title, creator, source URL, license, retrieval date, usage location}.
- Provide UI toggle/footnote “Image credit” where used.
- Never display physical addresses or location pins.

Footer (HARD)
- Contains ONLY: email yeto@causewaygrp.com as contact info.
- No physical address, no maps.

──────────────────────────────────────────────────────────────────────────────
SECTION 7 — INFORMATION ARCHITECTURE (FULL SITE MAP)
──────────────────────────────────────────────────────────────────────────────

PUBLIC
1) Home
2) Dashboard (overview, choose sector/indicator)
3) Data & Analytics
   - Data Repository (search + filters + previews)
   - Advanced Filters
   - Comparative Analysis (Yemen vs peers)
   - Downloads + API Docs (public subset)
4) Research
   - Research & Reports library
   - Report detail pages (source packs)
   - Latest Updates feed (auto-ingested)
5) Sectors (each has overview + KPIs + charts + related research + institutions + downloads)
   - Macroeconomy & Growth
   - Prices & Cost of Living
   - Currency & Exchange Rates
   - Banking & Finance
   - Public Finance & Governance
   - Trade & Commerce
   - Energy & Fuel
   - Labor Market & Wages
   - Poverty & Human Development
   - Food Security & Markets
   - Aid Flows & Accountability
   - Conflict Economy & Political Economy
   - Infrastructure & Services
   - Agriculture & Rural Development
   - Investment & Private Sector
6) Timeline (2010→present; filter by actor/location/theme; link to indicators)
7) Glossary (bilingual; Yemen-specific examples)
8) Methodology (data, QA, confidence, versioning, ethics)
9) Transparency & Accountability (governance, correction policy, changelog)
10) Contact (form + email only)
11) Legal (Privacy, Terms, Data License & Reuse, Accessibility)

AUTHENTICATED USERS
- User profile
- Saved dashboards/searches
- Alerts subscriptions
- Custom Report Builder (wizard)
- API keys (tiered)
- Workspaces (premium)

PARTNER / CONTRIBUTOR PORTALS
- Organization profile
- Secure data submission (CSV/XLSX/API)
- Validation feedback
- Publishing workflow (draft → review → publish)
- Visibility controls (public vs restricted)
- Audit trail

ADMIN PORTAL (SUPER ADMIN)
- Source registry management
- Source review queue
- Ingestion monitor (jobs, failures, retries)
- Dataset QA dashboard (outliers, missing coverage, contradictions)
- Knowledge graph browser
- Model monitoring (backtests, drift)
- Content management (glossary, translations)
- Security logs & audit logs
- Release management (what changed)

──────────────────────────────────────────────────────────────────────────────
SECTION 8 — DATA SCOPE (2010→PRESENT, CONTINUOUS, SPLIT‑SYSTEM)
──────────────────────────────────────────────────────────────────────────────

You must build an indicator catalog with definitions and units. Minimum families:

1) Macro & Real Economy
- GDP nominal/real, GNI, GDP per capita, sector proxies (nightlights, ports, fuel imports)
- Growth, investment proxies, consumption proxies

2) Prices & Cost of Living
- CPI where available; food baskets; fuel; rent proxies
- Market-level monitoring (WFP, partners)
- Spatial differences (governorate/city)

3) Monetary & Financial System (Split-system by design)
- FX: official + parallel + transfer; north vs south; spreads; volatility
- Banking indicators where available; liquidity proxies
- Payments rails proxies

4) Public Finance & Governance
- Revenues (customs, taxes, oil/gas where evidence exists)
- Expenditures; salary payments; arrears; debt where documented
- Procurement/contracting transparency where data exists
- Policy measures and circulars timeline

5) Trade & External Sector
- Imports/exports; composition; trade balance
- Port/route constraints; fuel import volumes where available
- Remittances proxies

6) Humanitarian & Social Outcomes
- Food security; IPC where available; malnutrition proxies
- Service delivery constraints; displacement linkages

7) Aid, Projects, Accountability
- Donor funding flows (commitments vs disbursements vs expenditures when possible)
- Project registry (implementers, locations, budgets, outputs, evaluations)

8) Conflict & Political Economy Linkages
- Conflict events; access constraints; governance fragmentation
- War economy dynamics (documented only; warnings; no enabling harm)

Granularity requirement:
- Support daily/weekly/monthly/quarterly/annual series.
- UI must allow navigation by day/month/year where data exists; where not, show limitations.

──────────────────────────────────────────────────────────────────────────────
SECTION 9 — TRUST ENGINE: PROVENANCE, CONFIDENCE, CONTRADICTIONS, VINTAGES
──────────────────────────────────────────────────────────────────────────────

A) Provenance Ledger (mandatory for each dataset/doc/transformation)
Store:
- publisher, collection method, access path, license/terms, retrieval time
- extraction method, transformations, QA results, limitations, update cadence

B) Confidence Rating A–D (per series and per claim)
A = audited/official & consistent
B = credible but partial/lagged
C = proxy/modelled/uncertain
D = disputed/low reliability (display with warnings)

C) Contradiction Detector
- Detect conflicting values for same indicator/time/geo.
- Store both; explain differences; never average.

D) Vintages & Revision History
- Preserve older series versions.
- Provide diff viewer and revision notes.

E) Corrections Workflow
- Issue reports create admin tickets.
- Corrections generate public correction notes.

──────────────────────────────────────────────────────────────────────────────
SECTION 10 — SOURCE REGISTRY + DISCOVERY (DYNAMIC “LEAVE NO ONE OUT”)
──────────────────────────────────────────────────────────────────────────────

You must build:
1) Source Registry (DB table + admin UI) seeded with major credible sources.
2) Source Discovery Engine that continuously finds new credible sources and adds them to review queue.
3) Per-source configuration: method, cadence, credentials, licensing constraints, tags.

Core structured data connectors (2010→present where available):
- World Bank (Indicators, Documents & Reports, Projects)
- IMF (SDMX central; WEO; IFS where accessible; country reports metadata)
- UN Comtrade; UNCTADstat; UNSD where accessible
- ILOSTAT; FAOSTAT; WHO/UNICEF datasets where relevant
- OCHA HPC Tools / FTS
- HDX HAPI + HDX datasets
- IATI (aid activities, transactions, docs)
- ReliefWeb API (report discovery)
- UNHCR population/stats; IOM DTM
- UCDP (versioned REST) and ACLED (only if licensed/keys available)
- Remote sensing proxies: VIIRS nightlights; admin boundaries from HDX COD; Copernicus where permitted

Yemen institutional sources (label by authority/regime; ingest where published and allowed):
- CBY Aden publications/circulars (if publicly available)
- Sana’a monetary authority publications (label as de facto source)
- MoF, MoPIC, CSO where published
- Customs/tax authorities publications where available
- Port authorities announcements/updates where available
- SFD reports/evaluations (public)
- Yemen Microfinance Network publications (public)
- Association of Yemeni Banks publications (public)

UN/humanitarian product ingestion:
- OCHA (HRP, sitreps), WFP market monitors, FAO, UNICEF, UNDP, IOM, UNHCR, WHO, UNFPA, UN Women, UNESCO, ILO, UNOPS, UN‑Habitat, UNEP, UNIDO (where relevant)

Donor/implementer coverage:
- Use FTS + IATI discovery to track ALL donors/implementers dynamically.
- Auto-create donor profile pages and implementer pages (funding, projects, docs, evaluations).

Think tanks / academia:
- Discover via OpenAlex + Crossref + Semantic Scholar + SSRN/RePEc/IDEAS/DOAJ.
- Build institution pages automatically.
- Seed list includes (and expands beyond):
  Sana’a Center for Strategic Studies; Rethinking Yemen’s Economy; DeepRoot; CARPO; ACAPS; AGSIW; Arab Monetary Fund; ESCWA;
  Chatham House; International Crisis Group; ODI; Brookings; Carnegie; CSIS; RAND; IISS; Atlantic Council; Clingendael; SIPRI; SWP; USIP.

Media ingestion:
- Only for event detection, never sole source for numbers; label clearly.

Weekly automated discovery jobs (run via EventBridge):
1) OpenAlex queries (Yemen economy, currency, inflation, banking, public finance, war economy, humanitarian cash)
2) ReliefWeb rolling queries by country/theme
3) HDX Yemen dataset discovery
4) IATI recipient country Yemen discovery
5) FTS Yemen discovery
6) RSS polling for known publishers
7) Allowed domain crawling for “Yemen” pages (only when permitted by terms)

All discoveries enter Admin “Source Review Queue” with:
- credibility score proposal
- licensing notes
- recommended cadence
After approval, sources become scheduled connectors automatically.

──────────────────────────────────────────────────────────────────────────────
SECTION 11 — MULTILINGUAL INGESTION + TRANSLATION ENGINE (MANDATORY)
──────────────────────────────────────────────────────────────────────────────

For every document:
- Store original file (if permitted), extracted original text, detected language, and encoding.
- Store Arabic translation and English translation.
- Store translation metadata:
  {source_language, translation_model/version, translation_date, confidence_score, glossary_adherence_score}.
- Never overwrite original language text.
- UI must show: Original | العربية | English toggle and always display source language.

Controlled Glossary:
- Maintain bilingual glossary with term IDs and context notes (economic + Yemen-specific).
- Translation engine must enforce glossary (preferred terms) and flag deviations.

Translation QA:
- Sample-based evaluation per source: every Nth doc (default N=20) run:
  - terminology consistency checks
  - numeric integrity checks (numbers not altered)
  - named entity consistency checks (institutions/locations)
- If confidence low: label translated text as “Machine translated — review needed.”

──────────────────────────────────────────────────────────────────────────────
SECTION 12 — DATA MODEL (POSTGRES + S3 + SEARCH) + KNOWLEDGE GRAPH
──────────────────────────────────────────────────────────────────────────────

Implement PostgreSQL (RDS) + S3 + OpenSearch (or pgvector + full-text if necessary).
Core tables (minimum):
- sources (registry, type, credibility, cadence, licensing)
- documents (metadata, tags, language, urls, file pointers, license, extraction status, translation pointers)
- series (indicator defs, units, base year, geo level, frequency, source_id, confidence, regime tags)
- observations (series_id, date, geo_id, value, vintage_id, method, notes, regime tags)
- geographies (admin boundaries; geometry PostGIS)
- entities (institutions, donors, implementers, banks, MFIs, exchangers, ministries, companies)
- projects (IATI/FTS/WB/UN; budgets, locations, transactions, docs, evaluations)
- events (policy events, donor events, conflict-economy events; link to docs/sources)
- provenance_ledger (ingestion runs, hashes, transformations, QA outcomes)
- contradictions (conflicting observations; explanation fields)
- gap_tickets (missing coverage; priority; recommended sources)
- alerts (rules, triggers, evidence packs, severity, status)
- models (registry, versions, backtests, parameters, citations)
- glossary_terms (bilingual)
- users (roles, org linkage, subscription tier)
- org_submissions (partner uploads + validation + approval workflow)
- publications (auto-produced briefs/reports with evidence packs)
- audit_logs (security/admin actions)

Knowledge Graph layer:
- Build a graph-like relationship model (within DB + vector index):
  indicators ↔ documents ↔ entities ↔ projects ↔ locations ↔ events ↔ policies
- Provide a Knowledge Graph browser in Admin.
- Use it to power “Related Research”, “Key Institutions”, “Connected Events”, and AI retrieval.

──────────────────────────────────────────────────────────────────────────────
SECTION 13 — INGESTION & QA PIPELINES (IDEMPOTENT, EXPLAINABLE)
──────────────────────────────────────────────────────────────────────────────

Document pipeline:
- Fetch metadata; fetch content when licensed.
- Extract text and tables where allowed; create citation anchors (page/section/snippet).
- De-dup (hash + similarity).
- Auto-tag by sector/geo/time/entities.
- Create embeddings for semantic search.
- Translate and store bilingual versions with metadata.

Data pipeline:
- Raw landing zone: S3/raw/{source}/{date}
- Normalized zone: S3/normalized/{source}/{dataset}/{version}
- Load into DB with QA gating:
  - schema validation
  - unit normalization
  - outlier detection (rules + statistical)
  - continuity checks
  - geo/regime tag checks
  - duplicate checks
  - contradiction checks
- Publish step:
  - create new vintage
  - update changelog
  - refresh derived indicators
  - refresh indexes
  - trigger alert evaluation
  - update coverage scorecard

──────────────────────────────────────────────────────────────────────────────
SECTION 14 — DERIVED INDICATORS, MODELS, AND ML (MAX CAPACITY, EXPLAINABLE)
──────────────────────────────────────────────────────────────────────────────

Derived metrics (document formulas; store in model registry):
- YoY change: yoy = (x_t / x_{t-12} - 1)*100 (monthly) or (x_t / x_{t-1} - 1)*100 (annual)
- MoM change: mom = (x_t / x_{t-1} - 1)*100 (monthly)
- FX spread: spread = (market_rate - official_rate) / official_rate * 100
- Dual-rate divergence: divergence = abs(north_market - south_market) / min(north_market, south_market) * 100
- Volatility: rolling std(log returns) over 30/60/90d windows
- Real values (if CPI exists): real = nominal / (CPI/100) with cited base year normalization
- Transfer value adequacy: cash transfer vs basket cost; ratio and gap
- Composite stress index: weighted z-scores (weights documented, adjustable)

Anomaly detection & early warning (hybrid):
- Rule-based triggers (thresholds)
- Statistical anomalies (rolling z-score)
- Optional ML (Isolation Forest / Prophet / SARIMAX) with model cards and backtests
Alerts must include:
- trigger logic
- evidence pack
- confidence
- plausible drivers (ranked, evidence-linked)
- historical analogs
- what to watch next
- options menu

Forecasting & nowcasting:
- Use transparent baseline models first (SARIMAX/ETS) and only add more complex ML when evidence and evaluation justify.
- Backtest each model; store errors and drift.
- Display forecast bands and assumptions; never present as certain.

Model governance (MLOps):
- Model registry + versioning
- Model cards (purpose, inputs, assumptions, performance, failure modes)
- Drift monitoring: detect when model error increases; auto-downgrade confidence and notify admin
- Reproducibility: log training data IDs + transforms + code version + parameters

Scenario simulator:
- Implement semi-structural “transmission model” with explicit assumptions.
- Calibrate elasticities from evidence store; if missing, label as assumed and reduce confidence.
- Provide sensitivity analysis and scenario comparison exports.

Performance & “max capacity while live”:
- Use caching for popular queries (Redis).
- Precompute common aggregates daily (materialized views).
- Async processing for heavy tasks (PDF, embeddings, translation).
- Rate-limit AI endpoints; queue long jobs; provide user job status.

──────────────────────────────────────────────────────────────────────────────
SECTION 15 — AI “ONE BRAIN” (RAG ONLY, AGENT ROUTING, PAGE‑AWARE)
──────────────────────────────────────────────────────────────────────────────

AI must only answer using evidence store (RAG). No external uncited facts.
Default output structure:
1) Answer (1 paragraph)
2) Key takeaways (3–7 bullets)
3) Evidence (data points + citations)
4) What changed
5) Why it matters
6) Drivers (ranked hypotheses, evidence-linked)
7) Options (2–5 actions, tradeoffs, prerequisites, who must act)
8) Uncertainty & limitations
9) Next questions

High-stakes outputs require Evidence Pack.

“Show me how you know this” everywhere:
- sources (doc IDs, series IDs)
- snippets/anchors where allowed
- transformations and formulas
- model versions and backtest error (if model used)
- what would change conclusion

Agent routing (by page + user role + subscription tier):
- Citizen Explainer (Arabic-first, plain language)
- Policymaker Brief Writer
- Donor Accountability Analyst
- Bank Compliance Analyst
- Research Librarian (evidence packs)
- Data Steward (provenance QA)
- Translation Agent (glossary-enforced)
- Scenario Modeler

All agents share the same hard rules and evidence store.

──────────────────────────────────────────────────────────────────────────────
SECTION 16 — AUTO‑PUBLICATION ENGINE (DAILY/WEEKLY/MONTHLY/QUARTERLY/ANNUAL)
──────────────────────────────────────────────────────────────────────────────

The platform must automatically produce bilingual publications:
A) Daily Brief (internal + premium)
- FX, inflation proxies, fuel, alerts summary, key events with citations
B) Weekly Market & Economy Update (public + premium extension)
C) Monthly Economic Monitor (public PDF + premium extended PDF)
D) Quarterly Yemen Economic Outlook (premium)
E) Annual State of Yemen Economy & Transparency Report (public summary + premium full)

Each publication must include:
- Executive summary (5 lines max) + expandable detail
- Charts and tables with citations + retrieval dates
- Disagreement sections where contradictions exist
- Evidence Pack appendix
- “Data gaps” section
- Version and changelog entry

Distribution rules:
- Public outputs appear in Research Library and public feed.
- Premium outputs appear in subscriber vault and are emailed to opted-in users.
- Sensitive outputs (panic-sensitive): require admin review if confidence below threshold.

Publishing workflow:
- Default auto-publish if confidence threshold met.
- Otherwise queue for admin review.

──────────────────────────────────────────────────────────────────────────────
SECTION 17 — CONTRIBUTOR PORTAL + VERIFICATION (BANKS/MFIs/NGOs/MINISTRIES)
──────────────────────────────────────────────────────────────────────────────

Contributor roles: Bank/MFI/Exchanger/Ministry/Port/Donor/NGO/Research Center
Submission types: CSV/XLSX/API/manual form
For every submission:
- Validate schema, units, time coverage, and metadata.
- Require organization attestation + uploader identity (org-level).
- Assign provisional confidence (default C).
- Route to review:
  - auto-approve only if corroborated or consistent with historical pattern and no contradictions.
- Visibility defaults:
  - public: aggregated metrics only unless approved
  - restricted: institution-specific visible to that institution + admins
- Full audit trail for every change.

──────────────────────────────────────────────────────────────────────────────
SECTION 18 — SUBSCRIPTIONS & ACCESS CONTROL (PUBLIC + PAID)
──────────────────────────────────────────────────────────────────────────────

Tiers:
Public (free):
- browse dashboards, research, limited downloads, glossary, methodology, timeline, limited API
Registered (free):
- saved dashboards, basic alerts, basic exports
Pro (paid):
- full downloads, advanced comparisons, more exports, advanced alerts, personal workspace
Institutional (paid):
- team workspace, bulk API, scheduled reports, private datasets, partner integration
Partner/Contributor:
- submission portal + restricted dashboards
Admin/Super Admin:
- full control

Payments:
- Integrate Stripe with webhooks.
- If payment integration is too heavy for v1, implement “manual invoicing mode” while keeping architecture ready.

Premium differentiation (must be truly beyond):
- custom alert thresholds + webhooks
- saved scenario packs + sensitivity exports
- private brief generator (stakeholder-specific)
- bulk API + scheduled data exports (Parquet/CSV)
- team workspaces + shared citation libraries
- premium publication series (Quarterly Outlook; full annual)

──────────────────────────────────────────────────────────────────────────────
SECTION 19 — PAGE‑BY‑PAGE FUNCTIONAL REQUIREMENTS (DYNAMIC, EVIDENCE‑BASED)
──────────────────────────────────────────────────────────────────────────────

HOME
- hero image + overlay (licensed)
- bilingual headline + CTAs
- KPI cards: real values or “—” (never fake)
- sector tiles
- latest updates feed
- previews: AI assistant + scenario simulator
- footer: email only

DASHBOARD
- sector sidebar with icons
- indicator selector, time range, geo/regime filters
- metadata panel with source pack
- export (CSV/XLSX/PDF/PNG/SVG/JSON) with citations and retrieval date
- “add to report”

SECTOR PAGES
- hero banner
- KPI strip
- main chart (2010→present) + filters
- compositions and maps where evidence exists
- related research and institutions
- downloads

RESEARCH & REPORTS
- filters/search
- report pages: metadata, citations, downloads, related datasets, evidence pack

DATA REPOSITORY
- search + filters (category/time/geo/type/quality)
- dataset cards with badges Verified/Provisional/Estimated
- preview + download + API endpoint display

TIMELINE
- events categorized and filterable
- clicking shows citations and linked indicators (before/after comparison)

GLOSSARY
- bilingual terms, Yemen-specific usage, related indicators, references

METHODOLOGY / TRANSPARENCY
- provenance rules, QA, confidence, contradiction handling, corrections policy
- changelog page

CONTACT
- form → SES to yeto@causewaygrp.com
- no address anywhere

ADMIN PORTAL
- source registry + review queue
- ingestion monitor
- QA dashboards
- model monitoring + drift
- user/subscription management
- security/audit logs
- publication approvals
- coverage scorecard and gap tickets

──────────────────────────────────────────────────────────────────────────────
SECTION 20 — COMPLETENESS SCORECARD + GAP ENGINE (DEPLOYMENT GATE)
──────────────────────────────────────────────────────────────────────────────

Implement Coverage Scorecard computed nightly:
- coverage by year (2010→present) x indicator family x geo (where applicable)
- coverage by source family and document type
Each missing cell must auto-generate a Data Gap Ticket with:
{what’s missing, why it matters, best sources, cadence, priority}.
Deployment gate:
- Do not deploy to production unless:
  - core families reach ≥70% coverage OR all missing areas are explicitly documented as gaps with visible rationale, and
  - no fake stats appear in UI (automated check), and
  - critical pages load with real content or explicit “not available yet” states.

──────────────────────────────────────────────────────────────────────────────
SECTION 21 — SECURITY, PRIVACY, AND COMPLIANCE (AWS BEST PRACTICE)
──────────────────────────────────────────────────────────────────────────────

- Cognito auth + JWT
- API behind ALB/API Gateway + WAF
- Secrets Manager for secrets; no secrets in Git
- KMS encryption for S3 and RDS
- Least privilege IAM, separate roles for ingestion/API/admin
- CloudWatch logs + app audit logs
- Rate limiting + throttling
- Backups: automated RDS snapshots; S3 versioning; OpenSearch snapshots
- Dependency scanning (Dependabot) + container scanning
- Incident response runbook in /docs

──────────────────────────────────────────────────────────────────────────────
SECTION 22 — DEV WORKFLOW (GITHUB, CI/CD, TESTING, RELEASES)
──────────────────────────────────────────────────────────────────────────────

Repo structure:
- /apps/web (Next.js)
- /apps/api (FastAPI)
- /pipelines
- /infra
- /docs

CI (GitHub Actions):
- lint + typecheck
- unit tests
- integration tests
- security scans
- build/push images to ECR
- infra validation

Branch policy:
- main protected
- PR required
- checks required

Testing:
- unit tests for transforms + derived indicators
- integration tests for API endpoints
- E2E smoke tests for key flows (dashboard, search, export)
- nightly data QA tests
- nightly coverage scorecard computation

──────────────────────────────────────────────────────────────────────────────
SECTION 23 — DEPLOYMENT (FINAL ONLY, AFTER ALL IS COMPLETE)
──────────────────────────────────────────────────────────────────────────────

- Route53 + ACM certificates
- Web delivered via CloudFront (SSR compatible)
- API on ECS Fargate (or Lambda where appropriate)
- Scheduled ingestion and publication via EventBridge + Step Functions
- Run initial backfill 2010→present
- Verify dashboards show real evidence-backed content
- Final deploy to https://yeto.causewaygrp.com

──────────────────────────────────────────────────────────────────────────────
SECTION 24 — DOCUMENTATION GENERATOR (MANDATORY, VERSIONED, BILINGUAL)
──────────────────────────────────────────────────────────────────────────────

Generate and maintain (bilingual) docs, published on site + stored in /docs and downloadable PDF:
1) Administrator Manual
2) Data Governance Manual
3) API Manual (examples, SDK snippets, rate limits)
4) Contributor Manual (submission templates and verification)
5) Subscriber Manual (tiers, features, alerts setup, workspaces)
6) Model Cards Library (per model)
7) Recovery Runbook (backup/restore, incident response)

Docs must auto-update when system changes, and be versioned in Git.

──────────────────────────────────────────────────────────────────────────────
SECTION 25 — INITIAL BACKFILL REQUIREMENT (MUST DO BEFORE GO‑LIVE)
──────────────────────────────────────────────────────────────────────────────

Run backfill ingestion for 2010→present for connected sources:
- indicator catalog with definitions
- core macro series (World Bank/IMF where accessible)
- trade series (UN Comtrade where accessible)
- humanitarian funding (FTS)
- aid activities (IATI)
- document library (ReliefWeb + WB documents + key UN and think tank sources)
- conflict events (UCDP; ACLED only if licensed)

Where gaps remain:
- create Data Gap Tickets and show “not available yet” in UI (no fabrication).

──────────────────────────────────────────────────────────────────────────────
SECTION 26 — DELIVERABLES (WHAT YOU MUST HAND OVER)
──────────────────────────────────────────────────────────────────────────────

1) GitHub repo URL (monorepo) containing:
   - web app, API, pipelines, infra-as-code, docs, tests
2) Production deployment at https://yeto.causewaygrp.com
3) Admin credentials delivered securely (never printed in logs)
4) Documentation suite (all manuals above)
5) Demonstrable working features:
   - bilingual UI
   - dashboards + repository + research library + timeline + glossary
   - AI assistant (RAG) with evidence packs
   - report builder exports
   - admin/partner portals
   - subscriptions framework
   - scheduled updates + auto-publication jobs
   - coverage scorecard + gap tickets

──────────────────────────────────────────────────────────────────────────────
SECTION 27 — QUALITY BAR / FINAL SELF‑AUDIT (MUST PASS BEFORE GO‑LIVE)
──────────────────────────────────────────────────────────────────────────────

- No fake stats visible anywhere.
- Every displayed number has a source pack with provenance.
- Contradictions are shown, not hidden.
- Arabic UX is correct RTL and readable.
- Exports embed citations + retrieval dates.
- Ingestion jobs are idempotent and resilient; retries work.
- Backups configured (RDS, S3 versioning, OpenSearch snapshots).
- IAM least privilege, encryption on, WAF on, audit logs on.
- CI green on main.
- Pages match design system (navy/green/gold + clean cards + hero imagery).
- Footer/contact shows ONLY yeto@causewaygrp.com (no address).
- Site performance acceptable (caching, lazy loads, optimized images).
- Documentation complete and versioned.

EXECUTION SEQUENCE (DO NOT DEVIATE)
Phase 1 — Repo + Architecture + Design System + Checkpoint/Recovery scaffolding
Phase 2 — Core DB schema + API skeleton + Auth (Cognito)
Phase 3 — Source Registry + review queue + ingestion framework + QA + provenance ledger
Phase 4 — Connectors + backfill (2010→present) + indexing + translation engine
Phase 5 — Core UI pages (Home, Dashboard, Data Repository, Research, Sector templates)
Phase 6 — Timeline + Glossary + Methodology + Transparency pages + corrections workflow
Phase 7 — AI assistant (RAG), agent routing, evidence packs, “show me how you know this”
Phase 8 — Custom report builder + export pipeline + auto-publication engine templates
Phase 9 — Partner portal + admin portal + subscriptions + premium workspaces
Phase 10 — Security hardening + full test pass + coverage gate + final production deployment

STOP CONDITION
You are done only when the site is live at https://yeto.causewaygrp.com, populated with real evidence-backed content, continuously updating, producing scheduled publications, resilient to failures via backups and checkpoints, and administratively manageable without user intervention.

====================
END CANONICAL MASTER BUILD PROMPT
====================

APPENDIX — MOCKUP ALIGNMENT & EXTRA REQUIREMENTS (MUST APPLY)

1) Mockup-driven UI implementation (high fidelity)
   You will receive multiple UI reference images (mockups). Use them as visual specifications and implement the following pages and components to match:

   A. Homepage / Landing (YETO)
      - Hero banner with Yemen contextual imagery + headline (Arabic + English versions)
      - Primary CTAs: “Explore Dashboard / استكشف لوحة البيانات” and “View Latest Research / اطلع على الأبحاث”
      - 4 KPI cards (GDP Growth, Inflation Rate, Foreign Reserves, Labor Force) with sparkline mini‑trends
      - “Contextual Imagery” cards linking to: Trade & Commerce, Local Economy (Markets), Rural Development
      - “Latest Updates” 3‑card feed with source badges (World Bank / IMF / Observatory), date/time, “Read more →”
      - “Interactive Features Showcase” section highlighting:
        - Economic Intelligence Assistant
        - Scenario Simulator
      - Footer: MUST follow base prompt rule (email only)

   B. Economic Dashboard (Interactive chart + filter chips)
      - Filter chips row (Time range, Indicator, Frequency, Quality) + “Clear All Filters”
      - Main chart with annotated events (e.g., 2015 conflict escalation, COVID‑19, etc.)
      - Right side “Chart Controls” panel: chart type toggles (Line/Bar/Area), Export dropdown (PNG/SVG/CSV/Excel), Share, “Add to Report”
      - Below chart: data table (Year/Value/Change/Notes) with pagination
      - Must support export of chart + data, and “Add to Report” pushes visualization into the report builder.

   C. Economic Intelligence Assistant (Chat UI)
      - Two-column layout: chat conversation (left) and “Suggested Questions” (right)
      - Messages must include bullet‑point explanations + embedded chart + citations to specific datasets/sources in the platform
      - Top right controls: “Export Conversation”, “Share Analysis”
      - Must support:
        - citation rendering (clickable to evidence)
        - “Add to Report” from chat-generated charts/tables
        - bilingual (Arabic/English) interaction; RTL for Arabic

   D. Report Builder Wizard (“Generate Custom Report”)
      - 4-step wizard: (1) Select Data → (2) Choose Visualizations → (3) Customize Layout → (4) Export
      - Visualization tiles: Line, Bar, Stacked Area, Scatter, Table, Heatmap, Infographic, Timeline
      - Right panel “Report Settings”: title, author, date range, logo upload, color scheme, language toggle
      - Outputs: PDF + Word + PowerPoint + Excel + images (PNG/SVG)
      - Must allow users to rearrange sections, add narrative blocks, and include source citations automatically.

   E. Data & Analytics Repository (Dataset catalogue)
      - Global search bar with autocomplete
      - Left filter panel: category, time period, geographic scope, data type, quality level
      - Dataset cards: title, description, verification badge, “Updated Today/Yesterday”, downloads count, preview, favorite
      - Sorting options: relevance/newest/oldest/most downloaded/alphabetical
      - Must support dataset versioning, schema display, and API endpoint display.

   F. Comparative Economic Analysis (Peer comparison)
      - Comparison selector (regional peers; checkboxes)
      - Multi‑section page with: GDP comparison bar chart, inflation over time, unemployment comparison, trade balance stacked chart
      - “Key Insights” panel (auto‑generated narrative + citations)
      - Export comparison button.

   G. Sector Pages (e.g., Trade & Commerce Analysis)
      - KPI cards (exports, imports, trade balance)
      - Main chart of trends + secondary visuals (composition donut, category bars)
      - Port operations map (interactive) with annotations (Aden/Hodeidah/Mukalla)
      - Side panel: trade agreements, sanctions impact analysis, downloadable dataset button

   H. Methodology Page
      - Three “pillars” cards: Data Collection, Quality Assurance, Transparency
      - Expandable sections: data sources and collection; quality standards; uncertainty/limitations; update frequency
      - Data quality indicators widget (coverage/timeliness/accuracy)
      - Certification badges (visual only unless verifiable)
      - “Contact Data Team” CTA.

   I. Economic Glossary
      - Search + alphabetical filter + category filter
      - Term list → detailed term view:
        - definition, Yemen‑specific context, related indicators, related terms tags
        - embedded charts (e.g., exchange rate dynamics)
        - references/further reading list with citations

   J. Interactive Timeline (2014–2024+)
      - Vertical timeline with event cards and icons
      - Events must link to datasets and charts (click event → see indicator changes around event)
      - Must support “counterfactual toggle”: users can disable (“neutralize”) selected verified events to run scenario simulation.

   K. “Latest Updates” page (News/updates feed)
      - Card layout with image, source icon, title, excerpt, date/time, “Read more”
      - Must have ingestion pipeline for official sources + internal analysis posts.

2) UX micro-interactions & navigation (from mockups + usability)
   - Sticky top nav with bilingual toggle EN/AR and search icon
   - “Quick jumps” sticky sub‑navigation on long pages (Methodology, Sector pages, About, Glossary)
   - A moving “Insights Ticker” bar (optional but recommended) showing: FX, fuel price, CPI, funding %, key alerts — with pause on hover and accessibility compliance.
   - Smooth transitions, skeleton loaders, and empty states consistent with mockup style.

3) Brand system (derive from logo + mockups)
   - Implement design tokens and a style guide:
     - Primary: Navy + Green
     - Accent: Gold
     - Neutral: Whites/Greys
   - Typography:
     - English: Inter (or similar)
     - Arabic: Cairo / Tajawal (or similar), full RTL support
   - Icon style consistent with mockups (simple line icons; avoid clutter).
   - Include brand assets in /public/brand/ with optimized formats and documentation.

4) Stakeholder & outreach artifacts (deliverables in-repo, not in UI)
   Create a /docs/outreach/ folder with:
   - One‑pager (donor‑ready) describing YETO value proposition and differentiation
   - Technical one‑pager (architecture + APIs + data governance)
   - 5‑year funding & staffing budget workbook (Excel) with:
     - roles (FT/PT), grades, rates, overheads, hosting, ops, M&E, security audits
     - scenario: lean / standard / scale
   - Stakeholder engagement matrix (Excel + PDF export) including:
     - EU, World Bank, IMF, UN agencies (WFP VAM, OCHA, UNDP, UNICEF), RC/HC office, etc.
     - SFD (Social Fund for Development), local banks, telecoms, ports, chambers of commerce, **major Yemeni conglomerates** (e.g., Hayel Saeed Anam & Co./HSA Group; verify), shipping/logistics, fintechs
     - sanctions stakeholders (UNSC panels, OFAC, EU sanctions, UK sanctions) and compliance actors
   - Email templates (customized variants) for each stakeholder category:
     - 1) advisory call, 2) data-sharing MoU, 3) funding ask, 4) board/advisory membership, 5) technical integration
   IMPORTANT: Any named individuals must be verified from authoritative sources; if not verifiable, use role-based placeholders (e.g., “IMF Yemen Mission Chief (name TBD)”) and list verification sources.

5) Sanctions & compliance data integration
   - Add connectors and parsers for:
     - UN Security Council sanctions lists (where applicable)
     - US OFAC SDN list
     - EU consolidated sanctions list
     - UK sanctions list (OFSI)
   - Provide a compliance page explaining methodology and limitations (no legal advice disclaimers).
   - In the “sanctions impact” analysis components, ensure content is descriptive/analytical only, never instructional for evasion.

6) GitHub & AWS deployment hardening (extra)
   - In addition to base prompt deployment requirements:
     - Enable SAST/Dependency scanning in CI
     - Add IaC security scanning (Terraform linting)
     - Add secret scanning + pre-commit hooks
     - Add WAF (if feasible) and strict security headers
     - Add automated database backups + point-in-time recovery plan documentation
     - Add disaster recovery runbook (RTO/RPO targets).

7) “Do not confuse the user” orientation
   - Provide an “Operator Dashboard” page in admin:
     - ingestion health, freshness, pipeline failures, backlog, last successful run
     - data coverage heatmap by governorate + indicator
   - Provide a “Where does this number come from?” tooltip for every KPI and chart, linking to the evidence pack.

End of Appendix.


APPENDIX B — MUST PROMPT ADDITION JAN 2026 (VERBATIM)

This is to  add-on: an Autonomous Editorial + Multi-Agent Approval Engine that makes the platform self-running, self-checking, and produces non-repetitive, period-specific reports with AI-only approvals by default, while giving the Admin the final switch to require human approval later.

Beiw prompt (it’s designed to slot into the “no follow-ups / choose safest defaults / document decisions” style you already use). It also forces “thematic” production and makes the Admin dashboard the command center for automation. This is consistent with your master prompt constraints (no hallucination, provenance, Arabic-first, crash-safe, etc.).    

⸻

: “Autonomous Editorial + AI Approval Engine” (Append to the Master Prompt)

SECTION X — AUTONOMOUS EDITORIAL & MULTI-AGENT APPROVAL ENGINE (AI-ONLY BY DEFAULT)
(THIS IS A HARD REQUIREMENT. IMPLEMENT IT, TEST IT, DOCUMENT IT, AND EXPOSE FULL CONTROL IN ADMIN UI.)

X0) Core mandate
- For now, ALL content approvals are performed by AI-only (multi-layer), with admin-configurable policies.
- Admin must be able to change any automation/approval rule later from an “Automation & Governance” dashboard:
  - switch AI-only → human-in-the-loop → hybrid (per content type)
  - change thresholds, confidence requirements, and escalation rules
  - enable/disable auto-publication for each output stream

X1) Output streams (must be fully automated + scheduled + evidence-based)
Build a LIVE REPORTING ENGINE with these automated streams (all bilingual AR/EN):
A) Daily brief (internal/premium): FX + inflation proxies + basket + fuel + funding + alerts (evidence pack attached).
B) Weekly situation update (public + premium extension): markets, funding, policy moves, risk heatmap.
C) Monthly reports (Jan 2014 → 10 Jan 2026): macro + sector modules, “what changed”, event impacts, risks, evidence.
D) Quarterly reports (Q1 2014 → Q4 2025 + Q1 2026 partial): deep dives + confidence shifts + methodology changes.
E) Annual reports (2010 → 2025): full year narrative + dataset release notes + sector deep dives + timeline + actor actions.
F) Ad-hoc custom reports: wizard-based (period + geography + sectors + actors + indicators + scenario overlay).
All reports must be:
- generated from DB (no pasted static charts)
- fully reproducible via report_id + evidence_set_hash + model_version
- exportable PDF + DOCX + data pack (CSV/XLSX/JSON) + evidence pack appendix

X2) “Never identical reports” rule (anti-generic output)
Implement a “Report Uniqueness & Period-Specificity Guard”:
- Each report must derive its narrative from that period’s data deltas, event set, and evidence set.
- Add a similarity detector that compares new report narrative to previous reports (same type) and fails publication if too similar.
- If similarity is high, regenerate with a different outline and emphasis, still using the same evidence store.
- Enforce: title, executive summary, “what changed” and key insights must be unique per period.

X3) Multi-agent AI pipeline (layered, cross-checking, and reversible)
Implement an internal multi-agent pipeline for ANY content that becomes public-facing (reports, news updates, event summaries, AI answers, translations):
AGENT 1 — Drafting Agent
- Produces the initial narrative structure and draft output (AR/EN).
AGENT 2 — Evidence & Citation Agent
- Validates every number and claim has citations to evidence store; compiles the evidence pack.
- If missing evidence: block publication and open a Data Gap Ticket.
AGENT 3 — Consistency & Cross-Source Agent
- Checks contradiction rules; ensures split-system tags are respected; ensures no averaging of conflicting sources.
AGENT 4 — Safety / Do-No-Harm Agent
- Ensures no PII, no violence-enabling content, no sanctions-evasion guidance, no panic framing.
AGENT 5 — Arabic Copy Editor Agent (Arabic-first)
- Fixes Arabic grammar, RTL formatting, terminology consistency with glossary; labels machine-translated text.
AGENT 6 — English Copy Editor Agent
- Fixes English grammar, clarity, and professionalism; ensures neutrality and exact meaning.
AGENT 7 — Standards & Branding Agent
- Enforces report layout, typography, chart style, identity stamps, “source integrity statement”, and page numbering.
AGENT 8 — Final Approval Agent (AI Gatekeeper)
- Approves or returns with structured reasons and required fixes.
- Applies publish policy thresholds (confidence, contradictions handled, evidence complete, uniqueness passed).
All agent outputs MUST be logged to DB (agent_runs table) and linked to:
- content_item_id, report_id (if any), evidence_set_hash, model_version, git_sha, timestamps, pass/fail reasons.

X4) Approval policies (admin-controlled)
Create an Admin “Approval Policy” module with:
- content types: {Event, Update/News, Report, Dataset Metadata, Translation, AI Answer, Model Parameter, Regulation entry}
- per-type policy: {auto-approve threshold, human-review-required boolean, escalation rules}
- thresholds:
  - min evidence coverage (e.g., 100% of claims cited)
  - min confidence grade (A/B/C/D) per indicator family
  - contradiction handling required for high-stakes series
- fallback rules:
  - if blocked, show “Not available yet” and auto-create Data Gap Ticket + Correction Ticket if relevant.

X5) Thematic intelligence engine (continuous “storytelling” without sensationalism)
Implement a “Thematic Story Engine” that runs daily/weekly during quiet hours:
- mines the evidence graph for emerging patterns (e.g., widening FX gap, changes in aid flows, new circulars, new sanctions list updates)
- proposes “themes” and “brief titles” to Admin (draft queue), each with evidence pack and confidence.
- Admin can publish with one click OR keep AI auto-publication enabled.
Themes must support:
- macro (inflation/FX/fiscal/trade)
- humanitarian economy (cash/food/fuel/IPC proxies)
- banking & payments (banks/MFIs/exchangers) — evidence-only
- governance & accountability (procurement, revenues/expenditures) — evidence-only
- sanctions/compliance impacts (informational only, no legal advice)
Use a neutral tone and avoid finger-pointing. Always cite.

X6) Global naming registry (Arabic + English, enforced everywhere)
Create a “Canonical Names Registry”:
- canonical English name, canonical Arabic name
- aliases/transliterations
- type (institution, program, donor, regulation, dataset)
- verification fields (source URLs)
Enforce this registry across:
- UI labels, glossary, research pages, reports, exports, AI responses
If a name is uncertain, choose the safest standard spelling, log it in DECISIONS, and mark “name verification pending” with a citation task.

X7) Live continuity mechanism (no “add Feb 2026 events” text)
Remove any hardcoded/future phrasing about specific months.
Instead:
- implement continuous ingestion and/or admin entry workflows that always extend coverage
- UI must show: “Latest ingested up to: {date}”
- pipeline creates “New Event Candidates” queue from whitelisted sources, with citations, for approval.

X8) Admin visibility and control (must be powerful and explicit)
In Admin Console, add:
1) Automation & Governance dashboard:
   - all policies, thresholds, AI-only vs human, escalation rules
2) Autopilot health:
   - ingestion runs, failures, retries, freshness, coverage scorecard, gap tickets
3) Publication pipeline monitor:
   - report schedules, drafts, approval logs, evidence packs, uniqueness scores
4) AI agent monitoring:
   - model versions, drift checks, evaluation results, regeneration counts
5) Corrections & disputes:
   - issues filed from public pages; investigation logs; correction notes; vintage comparisons

X9) Model selection requirement (internal only; no vendor branding in UI)
- Use the most capable model available for all drafting/translation/analysis steps.
- Do NOT mention model/vendor names in UI copy or public documentation.
- Log model identifiers internally for audit (model_version table).
(This must be consistent with the project’s non-branding rule.)

X10) Testing requirement
Add automated tests verifying:
- pipeline can generate at least one report for each type (daily/weekly/monthly/quarterly/annual + custom)
- exports work (PDF/DOCX/CSV/XLSX/JSON) for both Arabic RTL and English LTR
- every number has provenance metadata available via API
- uniqueness guard prevents near-duplicate narrative publication
- approval policy switches work (AI-only vs human)
- full audit trail exists (agent_runs, content_items, evidence_set_hash)

This add-on is designed to answer everything you just said: thematic, fully automated, admin override, layered AI reviewers, coaching, bilingual naming, unique reports per period, and zero “I need clarification” behavior. It also fits your existing “no hallucination / provenance / licensing / no physical addresses” hard gates.    

⸻

2) Two “send-to-Manus” options to save credits

Option A — One message (best when you want Manus to do a full upgrade run)

Send:
	1.	Your existing Master Prompt (the big one), then
	2.	Immediately send the add-on above.

This is credit-efficient because Manus won’t bounce between interpretations; it has a single governance contract.  

Option B — Step-by-step mini prompts (best when you want strict checkpoints and less credit loss on resets)

Send these in order:

Prompt 1 — Implement Governance + Multi-Agent pipeline + DB tables + Admin controls
(Use X0–X4, X8–X10)

Prompt 2 — Implement Reporting Engine + Uniqueness Guard + Export formats
(Use X1–X2 + export/testing requirements)

Prompt 3 — Implement Thematic Story Engine + Naming Registry + Continuity mechanism
(Use X5–X7)

Each step forces Manus to complete + test + commit before moving. This aligns with your “checkpoint / crash-safe / no credit waste” protocol.  

⸻

3) Make sure Manus also expands the Sources & Stakeholders catalog (already in your files)

Tell Manus to seed connectors + source registry using your structured source table (WB/IMF/OCHA/HDX/IATI/ReliefWeb/UCDP etc.) and mark “needs key” items without stopping.  

⸻


APPENDIX C — MASTER PLAN NOTES (VERBATIM)

Yemen Economic Transparency Observatory – Final Deliverables Plan (2026)

Introduction

This document outlines the final deliverables for the Yemen Economic Transparency Observatory (YETO) platform.  It synthesises the January 2026 master registry, methodological guidance, and expanded source list to produce an actionable implementation plan.  It explains what needs to be delivered (data registry, documentation, AI prompts, dynamic ingestion and monitoring systems) and how it should be built and maintained using YETO’s architecture.  The goal is to create a living platform that provides rigorous, bilingual and transparent economic and humanitarian data for Yemen, making it a reference point for researchers, policymakers and the public.  The plan emphasises completeness, accuracy, continuous updating, compliance with licensing and sanctions restrictions, and dynamic learning through AI agents.

Part 1: Comprehensive Source Registry & Data Integration

Objective: compile a definitive, structured registry of all data sources, documents and event streams necessary to support YETO’s sitemap.  Align each source with the appropriate platform module (e.g., Dashboard, Sector pages, Timeline, Glossary, Research Library) and provide ingestion instructions.  This registry forms the backbone of YETO’s data layer.

1.1 Master Registry Table

Deliver a machine‑readable table (CSV or database table) containing the following columns:
Field	Description
Sector	The sitemap category or thematic page where the data will appear (e.g. Macroeconomy, Banking & Finance, Food Security, Aid Flows).  Use YETO’s sector hierarchy to ensure coverage across all economic and social sectors listed on the site.
Name / Institution	Formal title of the data source or document set (e.g., World Bank PovcalNet, WFP Market Monitor, UNHCR Population Statistics).  Include both the organisation and the dataset/report name.
Category	Type of data: quantitative (numeric time series), narrative (reports, analyses), event (conflict incidents), proxy (remote sensing), compliance (sanctions).
Tier	Scope: Global, Regional, National or Local / Partner.  Also indicate split‑regime tags (IRG vs DFA) where relevant.
URL/Access Method	Direct link or API endpoint for data retrieval.  Include notes on authentication (API keys) and fallback procedures (manual upload) where automation is not possible.
Update Frequency	Expected cadence (e.g., daily, monthly, quarterly, annual, ad hoc).  This informs the scheduler for ingestion tasks.
Licensing / Terms	Specify licence (CC BY, proprietary, needs key).  Note restrictions (e.g., ACLED data cannot be downloaded publicly).
Reliability Score	Assign an initial confidence grade (A–D) based on the January 2026 guidance.  Official audited data = A; partial official data = B; modelled estimates or proxies = C; disputed or unofficial = D.
Coverage	Time period and geographic scope (2010–present by default).  Note gaps or limitations (e.g., national only, missing years, no subnational breakdown).
Auth/Credentials	Required API keys or subscription notes.  Mark as needs_key for subscription sources such as Oxford Economics.
Data Fields	Describe the expected columns or variables (e.g., date, indicator code, value, location).  For narrative sources, list metadata fields (title, author, date, URL).  For event data, list location and actor fields.
Ingestion Method	Indicate whether the data will be ingested via API, bulk download, web scraping, manual upload, or partner portal.  Provide notes on parsing PDF tables, OCR for scanned documents, or remote sensing processing (night‑lights).
YETO Usage & Module Integration	Map each source to YETO modules: Dashboard, Data Repository, Research & Reports, Sector pages, Timeline, Glossary, Transparency page.  Also note derived indicators or composite indices that will use this data.
Granularity & Caveats	Document resolution (national vs governorate vs district) and known caveats (e.g. ACLED fatality counts are estimates; UCDP data is annual).
Status	Active, Pending (awaiting key), or Metadata‑only.  Active sources must have ingestion pipelines built; pending sources remain in the registry but cannot be queried until credentials are obtained.

Action: populate this table with all sources listed in the January 2026 registry (over 100 entries) and any additional credible datasets discovered since then.  Use the extended tables provided in the user files as a starting point.  Each row should be complete and should reference the relevant sector pages that appear on the YETO landing page.

1.2 Data Ingestion & Scheduling
	•	Build ingestion connectors for each source using the methods specified in the registry.  For API‑based sources (World Bank, IMF, IATI, UNHCR, etc.), implement REST or SDMX clients that handle pagination, rate limits and retries.  For file‑based sources (e.g., UNCTADstat CSVs, IMF PDF tables), implement ETL scripts using Python to download, parse and normalise the data.  Use open‑source libraries (e.g., pandas, tabula for PDFs) and annotate each transformation in the provenance ledger.
	•	Integrate YETO’s scheduler to trigger jobs at appropriate frequencies.  Daily sources (FTS flows, ReliefWeb, sanctions) should run every 24 hours; weekly sources (ACLED) should run after the weekly release; monthly sources (WFP Market Monitor) should run ~30 days after the reporting month; quarterly or annual sources should run at the times indicated in the registry.  Stagger jobs to avoid API rate limits.
	•	For split‑regime sources (IRG vs DFA), store data in separate series and tag them accordingly.  Ensure the platform can display both sets side by side rather than mixing them.
	•	Implement checks to detect and log missing updates.  If a source fails to deliver data within 1.5× its expected update frequency, create a Data Gap Ticket describing the missing information, its importance, and potential alternatives.  Display a “Data pending” message on the affected UI components.

1.3 Quality Assurance & Provenance
	•	Enforce the rule that every number has a home: attach metadata (source ID, retrieval timestamp, license, retrieval method) to each observation.  Maintain a provenance ledger that logs extraction method, transformations, validation results and confidence rating for each dataset.
	•	Implement automated validation rules:
	•	Schema validation: confirm that each dataset matches the expected schema (no text in numeric columns, mandatory fields present).
	•	Unit normalisation: convert currencies and units where necessary; document conversions.
	•	Outlier detection: flag values that deviate beyond statistical thresholds.  If flagged, set the dataset status to “Under review” and require manual approval via the admin QA dashboard.
	•	Continuity and coverage checks: ensure expected time periods and geographies are present; flag missing months/years/governorates.
	•	Contradiction detection: identify when two sources provide conflicting figures for the same indicator.  Rather than averaging, mark both and display them with explanatory notes.  For high‑stakes metrics like inflation and exchange rate, ensure at least two independent series are ingested and available for comparison.
	•	Assign initial reliability grades automatically based on the source type and update them after manual review.  Display confidence badges on the user interface so users can gauge data certainty.
	•	Support versioning.  Do not overwrite old data; store new values as separate versions with timestamps.  Provide a diff viewer to compare vintages.

1.4 Bilingual Metadata & Glossary Enforcement
	•	All metadata (source names, descriptions, indicator names) must be stored in both Arabic and English.  Use YETO’s translation engine and controlled glossary to generate consistent translations.  If new terms appear, update the glossary after review and propagate the corrections across the platform.
	•	Provide UI toggles to switch between languages.  Ensure right‑to‑left layout for Arabic and left‑to‑right for English.  Display both languages side by side where space permits (e.g., in chart labels and table headers).

1.5 Data Catalogue & Transparency Pages
	•	Create a Data Catalogue page that lists every dataset in the registry along with its metadata (source, coverage, update date, license, reliability grade, and last update).  Include filters by sector, source type, and reliability grade.
	•	Provide a Provenance Ledger page where advanced users can view the lineage of each dataset, including transformations and version history.
	•	Maintain an ongoing Changelog page recording when sources were added, modified or removed, and summarising any methodological changes.

Part 2: Methodology & Policy Documentation

Objective: document YETO’s data processes, quality assurance, translation policies, and governance rules.  Provide clear instructions for data stewards and end users to understand how the system functions.

2.1 Methodology Manual
	•	Write a detailed methodology manual describing data classification (quantitative, narrative, event), ingestion pipeline architecture, provenance tracking, validation and contradiction handling.  This manual should summarise the long description of YETO’s methodology and data quality assurance provided in the January 2026 prompt.
	•	Include definitions and formulas for all indicators displayed on the platform, such as GDP growth, inflation, exchange rates, humanitarian aid flows and night‑lights indices.  Note the sources used to compute derived indicators.
	•	Provide guidelines on assigning reliability grades (A–D) and on documenting data gaps.
	•	Document the translation workflow and controlled glossary policy.  Explain the machine translation process, human review steps and consistency checks.

2.2 Privacy & Compliance Policies
	•	Write a data privacy policy clarifying that YETO does not collect personal data and that published information is aggregated or based on publicly available sources.  Confirm compliance with Do‑No‑Harm principles (no personally identifiable information or sensitive geolocation where it could endanger individuals).
	•	Provide a sanctions & compliance statement.  The platform must display UN, US, EU and UK sanctions lists relevant to Yemen, but only as factual data and without advising on evasion.  Include necessary legal notices and emphasise that YETO does not provide legal advice.
	•	Document content licensing obligations.  For each source, include a citation style (e.g., CC BY attribution text) to be displayed on data pages.  For proprietary or sensitive sources like ACLED or Janes, document restrictions on redistribution and highlight them in the admin portal.

2.3 Governance & Data Stewardship
	•	Define roles and responsibilities: data stewards, administrators, QA reviewers, translators, and developers.  Specify tasks such as reviewing new sources, handling data gap tickets, approving manual entries, updating the glossary, and overseeing version control.
	•	Establish a review workflow for new or updated sources: sources discovered by the automated discovery engine should populate a review queue in the admin portal.  Data stewards evaluate credibility, confirm coverage, and either approve or reject the source.  Approved sources are then added to the master registry and scheduled for ingestion.
	•	Provide guidelines for the Data Gap Ticket system.  Describe how the system auto‑generates tickets when updates are missing or when user feedback flags an error.  Outline how stewards triage and resolve these tickets.

2.4 Site Map & Content Coverage
	•	Ensure the sitemap covers all thematic portals listed on the YETO landing page: Dashboard, Data Repository, Research & Reports, Economic Sectors (Trade & Commerce, Local Economy, Rural Development, Banking & Finance, Currency & Exchange, Food Security, Energy & Fuel, Aid Flows, Poverty & Development, Labour Market, Infrastructure, Conflict Economy, Public Finance, Investment, Prices & Cost of Living), Timeline, Glossary & Methodology, Data Quality & Transparency, Legal & Policies, Admin / Contributor portals, and any additional sections needed.  The expanded registry must support each of these pages with data sources.
	•	For each page, map the sources and define the key indicators to display.  Example: the Banking & Finance page should combine data from CBY official rates, market rates, IFS money supply, microfinance data, sanctions information and news bulletins.  The Prices & Cost of Living page should aggregate WFP Market Monitor prices, fuel bulletins, exchange rates and CPI proxies.  The Timeline should integrate events from ACLED, UCDP, UN Sanctions, policy announcements and economic shocks.
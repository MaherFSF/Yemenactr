-- YETO Ingestion Schema
-- Tables for storing ingestion jobs, data snapshots, and data gaps

-- Ingestion Jobs Table
CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id VARCHAR(255) PRIMARY KEY,
  source_id VARCHAR(255) NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  status ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  data_points INT DEFAULT 0,
  error_message TEXT NULL,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_source_id (source_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time)
);

-- Data Snapshots Table
CREATE TABLE IF NOT EXISTS data_snapshots (
  id VARCHAR(255) PRIMARY KEY,
  source_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_count INT DEFAULT 0,
  data_hash VARCHAR(64) NOT NULL,
  storage_key VARCHAR(512) NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_source_id (source_id),
  INDEX idx_timestamp (timestamp),
  UNIQUE KEY uk_source_timestamp (source_id, timestamp)
);

-- Data Gaps Table
CREATE TABLE IF NOT EXISTS data_gaps (
  id VARCHAR(255) PRIMARY KEY,
  source_id VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(512) NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  status ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_source_id (source_id),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_date_range (start_date, end_date)
);

-- Ingestion Statistics View
CREATE OR REPLACE VIEW ingestion_stats AS
SELECT
  COUNT(*) as total_jobs,
  SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_jobs,
  SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_jobs,
  SUM(CASE WHEN status = 'RUNNING' THEN 1 ELSE 0 END) as running_jobs,
  SUM(data_points) as total_data_points,
  AVG(TIMESTAMPDIFF(SECOND, start_time, end_time)) as average_latency_seconds,
  MAX(end_time) as last_update
FROM ingestion_jobs
WHERE end_time IS NOT NULL;

-- Data Gap Summary View
CREATE OR REPLACE VIEW data_gap_summary AS
SELECT
  source_id,
  COUNT(*) as total_gaps,
  SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_gaps,
  SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) as high_gaps,
  SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open_gaps,
  MIN(start_date) as earliest_gap,
  MAX(end_date) as latest_gap
FROM data_gaps
GROUP BY source_id;

-- Source Health View
CREATE OR REPLACE VIEW source_health AS
SELECT
  j.source_id,
  j.source_name,
  COUNT(*) as total_runs,
  SUM(CASE WHEN j.status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_runs,
  ROUND(100.0 * SUM(CASE WHEN j.status = 'SUCCESS' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
  MAX(j.end_time) as last_run,
  AVG(j.data_points) as avg_data_points,
  COALESCE(dg.open_gaps, 0) as open_data_gaps
FROM ingestion_jobs j
LEFT JOIN data_gap_summary dg ON j.source_id = dg.source_id
GROUP BY j.source_id, j.source_name;

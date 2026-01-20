-- YETO Webhook Persistence Schema
-- Stores webhook configurations and delivery history

-- Webhook Endpoints Table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id VARCHAR(36) PRIMARY KEY,
  url VARCHAR(2048) NOT NULL UNIQUE,
  name VARCHAR(255),
  description TEXT,
  events JSON NOT NULL DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  headers JSON,
  auth_type VARCHAR(50),
  auth_token VARCHAR(1024),
  retry_max_attempts INT DEFAULT 3,
  retry_backoff_base INT DEFAULT 2,
  timeout_ms INT DEFAULT 10000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  INDEX idx_active (active),
  INDEX idx_created_at (created_at)
);

-- Webhook Deliveries Table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id VARCHAR(36) PRIMARY KEY,
  webhook_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  source_id VARCHAR(255) NOT NULL,
  source_name VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  http_status_code INT,
  response_time_ms INT,
  attempt_number INT DEFAULT 1,
  error_message TEXT,
  payload JSON,
  response_body TEXT,
  next_retry_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webhook_id) REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  INDEX idx_webhook_id (webhook_id),
  INDEX idx_event_type (event_type),
  INDEX idx_source_id (source_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_next_retry_at (next_retry_at)
);

-- Webhook Statistics View
CREATE VIEW IF NOT EXISTS webhook_stats AS
SELECT
  we.id,
  we.url,
  we.name,
  COUNT(DISTINCT wd.id) as total_deliveries,
  SUM(CASE WHEN wd.status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_deliveries,
  SUM(CASE WHEN wd.status = 'FAILED' THEN 1 ELSE 0 END) as failed_deliveries,
  SUM(CASE WHEN wd.status = 'PENDING' THEN 1 ELSE 0 END) as pending_deliveries,
  AVG(wd.response_time_ms) as avg_response_time_ms,
  MAX(wd.created_at) as last_delivery_at,
  ROUND(SUM(CASE WHEN wd.status = 'SUCCESS' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT wd.id), 2) as success_rate
FROM webhook_endpoints we
LEFT JOIN webhook_deliveries wd ON we.id = wd.webhook_id
GROUP BY we.id, we.url, we.name;

-- Webhook Delivery Failures View
CREATE VIEW IF NOT EXISTS webhook_delivery_failures AS
SELECT
  wd.id,
  wd.webhook_id,
  we.url,
  we.name,
  wd.event_type,
  wd.source_id,
  wd.source_name,
  wd.error_message,
  wd.attempt_number,
  wd.http_status_code,
  wd.created_at,
  wd.next_retry_at
FROM webhook_deliveries wd
JOIN webhook_endpoints we ON wd.webhook_id = we.id
WHERE wd.status = 'FAILED'
ORDER BY wd.created_at DESC;

-- Webhook Event Log Table
CREATE TABLE IF NOT EXISTS webhook_event_log (
  id VARCHAR(36) PRIMARY KEY,
  webhook_id VARCHAR(36),
  event_type VARCHAR(50) NOT NULL,
  source_id VARCHAR(255) NOT NULL,
  source_name VARCHAR(255),
  event_data JSON,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_webhook_id (webhook_id),
  INDEX idx_event_type (event_type),
  INDEX idx_source_id (source_id),
  INDEX idx_processed (processed),
  INDEX idx_created_at (created_at)
);

-- Webhook Configuration Audit Table
CREATE TABLE IF NOT EXISTS webhook_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  webhook_id VARCHAR(36),
  action VARCHAR(50) NOT NULL,
  old_value JSON,
  new_value JSON,
  changed_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webhook_id) REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  INDEX idx_webhook_id (webhook_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- Stored Procedure: Retry Failed Webhooks
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS retry_failed_webhooks()
BEGIN
  UPDATE webhook_deliveries
  SET
    status = 'PENDING',
    attempt_number = attempt_number + 1,
    next_retry_at = DATE_ADD(NOW(), INTERVAL POW(2, attempt_number) SECOND)
  WHERE
    status = 'FAILED'
    AND attempt_number < (
      SELECT retry_max_attempts
      FROM webhook_endpoints
      WHERE id = webhook_deliveries.webhook_id
    )
    AND (next_retry_at IS NULL OR next_retry_at <= NOW());
END //
DELIMITER ;

-- Stored Procedure: Cleanup Old Deliveries
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS cleanup_old_webhook_deliveries(IN days_to_keep INT)
BEGIN
  DELETE FROM webhook_deliveries
  WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
END //
DELIMITER ;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_status ON webhook_deliveries(webhook_id, status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_source ON webhook_deliveries(event_type, source_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_status ON webhook_deliveries(created_at, status);

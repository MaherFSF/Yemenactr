-- ============================================================================
-- CANONICAL SOURCE REGISTRY ENFORCEMENT
-- Stops all registry drift by making source_registry THE canonical table
-- ============================================================================

-- Add missing indexes for performance and policy enforcement
CREATE INDEX IF NOT EXISTS `source_registry_status_idx` ON `source_registry` (`status`);
CREATE INDEX IF NOT EXISTS `source_registry_tier_idx` ON `source_registry` (`tier`);
CREATE INDEX IF NOT EXISTS `source_registry_access_type_idx` ON `source_registry` (`accessType`);
CREATE INDEX IF NOT EXISTS `source_registry_update_frequency_idx` ON `source_registry` (`updateFrequency`);
CREATE INDEX IF NOT EXISTS `source_registry_needs_partnership_idx` ON `source_registry` (`needsPartnership`);
CREATE INDEX IF NOT EXISTS `source_registry_connector_type_idx` ON `source_registry` (`connectorType`);
CREATE INDEX IF NOT EXISTS `source_registry_registry_type_idx` ON `source_registry` (`registryType`);

-- Ensure sourceId is unique (should already be, but enforce)
-- Note: Constraint already exists from 0024, this is a safety check
ALTER TABLE `source_registry` 
  ADD CONSTRAINT `source_registry_sourceId_unique_check` UNIQUE (`sourceId`)
  ON DUPLICATE KEY UPDATE sourceId = sourceId;

-- ============================================================================
-- NEW TABLES: source_endpoints (one-to-many by sourceId)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `source_endpoints` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sourceRegistryId` int NOT NULL,
  `endpointType` enum('API','SDMX','RSS','WEB','PDF','CSV','XLSX','FTP','EMAIL','MANUAL','PARTNER','REMOTE_SENSING','WEBHOOK') NOT NULL DEFAULT 'WEB',
  `url` text,
  `authRequired` boolean NOT NULL DEFAULT false,
  `authScheme` enum('API_KEY','BEARER_TOKEN','BASIC_AUTH','OAUTH2','CERTIFICATE','NONE') DEFAULT 'NONE',
  `authNotes` text,
  `rateLimit` int,
  `rateLimitPeriod` enum('SECOND','MINUTE','HOUR','DAY','MONTH') DEFAULT 'DAY',
  `documentation` text,
  `notes` text,
  `isActive` boolean NOT NULL DEFAULT true,
  `lastVerified` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `source_endpoints_id` PRIMARY KEY(`id`),
  CONSTRAINT `source_endpoints_source_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `source_endpoints_source_idx` ON `source_endpoints` (`sourceRegistryId`);
CREATE INDEX IF NOT EXISTS `source_endpoints_type_idx` ON `source_endpoints` (`endpointType`);
CREATE INDEX IF NOT EXISTS `source_endpoints_active_idx` ON `source_endpoints` (`isActive`);

-- ============================================================================
-- NEW TABLES: source_products (one-to-many by sourceId)
-- Products = distinct data offerings from a source (e.g., WB has GDP, CPI, Trade as separate products)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `source_products` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sourceRegistryId` int NOT NULL,
  `productName` varchar(500) NOT NULL,
  `productType` enum('DATA_NUMERIC','DATA_GEOSPATIAL','DOC_PDF','DOC_NARRATIVE','DOC_EXCEL','NEWS_MEDIA','SANCTIONS_LIST','REGISTRY','EVENT_DATA','PRICE_DATA','FORECAST','OTHER') NOT NULL,
  `coverage` text,
  `updateFrequency` enum('REALTIME','DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUAL','IRREGULAR') DEFAULT 'IRREGULAR',
  `keywords` json,
  `sectors` json,
  `dataFormat` varchar(100),
  `historicalStart` int,
  `historicalEnd` int,
  `notes` text,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `source_products_id` PRIMARY KEY(`id`),
  CONSTRAINT `source_products_source_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `source_products_source_idx` ON `source_products` (`sourceRegistryId`);
CREATE INDEX IF NOT EXISTS `source_products_type_idx` ON `source_products` (`productType`);
CREATE INDEX IF NOT EXISTS `source_products_active_idx` ON `source_products` (`isActive`);

-- ============================================================================
-- INGESTION WORK QUEUE (crash-safe execution)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `ingestion_work_queue` (
  `id` int AUTO_INCREMENT NOT NULL,
  `jobType` enum('IMPORT_REGISTRY','INGEST_SOURCE','INGEST_ENDPOINT','INGEST_PRODUCT','BACKFILL','REFRESH') NOT NULL,
  `sourceRegistryId` int,
  `endpointId` int,
  `productId` int,
  `state` enum('PENDING','RUNNING','PAUSED','COMPLETED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `priority` int NOT NULL DEFAULT 50,
  `attemptCount` int NOT NULL DEFAULT 0,
  `maxAttempts` int NOT NULL DEFAULT 3,
  `progressJson` json,
  `lastError` text,
  `lastErrorAt` timestamp,
  `startedAt` timestamp,
  `completedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `ingestion_work_queue_id` PRIMARY KEY(`id`),
  CONSTRAINT `work_queue_source_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE CASCADE,
  CONSTRAINT `work_queue_endpoint_fk` FOREIGN KEY (`endpointId`) REFERENCES `source_endpoints`(`id`) ON DELETE CASCADE,
  CONSTRAINT `work_queue_product_fk` FOREIGN KEY (`productId`) REFERENCES `source_products`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `work_queue_state_idx` ON `ingestion_work_queue` (`state`);
CREATE INDEX IF NOT EXISTS `work_queue_job_type_idx` ON `ingestion_work_queue` (`jobType`);
CREATE INDEX IF NOT EXISTS `work_queue_priority_idx` ON `ingestion_work_queue` (`priority` DESC);
CREATE INDEX IF NOT EXISTS `work_queue_source_idx` ON `ingestion_work_queue` (`sourceRegistryId`);
CREATE INDEX IF NOT EXISTS `work_queue_created_idx` ON `ingestion_work_queue` (`createdAt`);

-- ============================================================================
-- REGISTRY DIFF LOG (track changes between imports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `registry_diff_log` (
  `id` int AUTO_INCREMENT NOT NULL,
  `importRunId` varchar(50),
  `changeType` enum('ADD','EDIT','DELETE','NO_CHANGE') NOT NULL,
  `sourceId` varchar(50) NOT NULL,
  `tableName` varchar(50) NOT NULL,
  `fieldName` varchar(100),
  `oldValue` text,
  `newValue` text,
  `changeMetadata` json,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `registry_diff_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `registry_diff_import_idx` ON `registry_diff_log` (`importRunId`);
CREATE INDEX IF NOT EXISTS `registry_diff_source_idx` ON `registry_diff_log` (`sourceId`);
CREATE INDEX IF NOT EXISTS `registry_diff_type_idx` ON `registry_diff_log` (`changeType`);
CREATE INDEX IF NOT EXISTS `registry_diff_created_idx` ON `registry_diff_log` (`createdAt` DESC);

-- ============================================================================
-- DEPRECATE LEGACY sources TABLE (create read-only view)
-- ============================================================================
-- Create view that maps source_registry to legacy sources table structure
-- This ensures backward compatibility without allowing writes to drift
DROP VIEW IF EXISTS `sources_legacy_view`;
CREATE VIEW `sources_legacy_view` AS
SELECT 
  id,
  publisher,
  webUrl as url,
  license,
  createdAt as retrievalDate,
  notes,
  createdAt,
  updatedAt
FROM source_registry
WHERE status != 'DEPRECATED';

-- ============================================================================
-- REGISTRY VALIDATION CONSTRAINTS
-- ============================================================================
-- Ensure ACTIVE sources have at least one endpoint (unless manual/partner)
-- This will be enforced in application code via PIPE_REGISTRY_LINT

-- ============================================================================
-- COMPLETION VERIFICATION
-- ============================================================================
SELECT 'Canonical registry migration complete' AS status,
       COUNT(*) as source_count
FROM source_registry;

-- ============================================================================
-- DOCUMENT VAULT & BACKFILL PLANNING
-- ============================================================================

-- Document backfill plan (year-by-year capture planning)
CREATE TABLE IF NOT EXISTS `document_backfill_plan` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sourceRegistryId` int NOT NULL,
  `productId` int NOT NULL,
  `year` int NOT NULL,
  `priority` int NOT NULL DEFAULT 50,
  `status` enum('PLANNED','IN_PROGRESS','COMPLETED','FAILED','SKIPPED') NOT NULL DEFAULT 'PLANNED',
  `estimatedDocuments` int NOT NULL DEFAULT 0,
  `actualDocuments` int NOT NULL DEFAULT 0,
  `lastAttemptAt` timestamp,
  `completedAt` timestamp,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `document_backfill_plan_id` PRIMARY KEY(`id`),
  CONSTRAINT `doc_backfill_unique` UNIQUE(`sourceRegistryId`,`productId`,`year`),
  CONSTRAINT `doc_backfill_source_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE CASCADE,
  CONSTRAINT `doc_backfill_product_fk` FOREIGN KEY (`productId`) REFERENCES `source_products`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `doc_backfill_status_idx` ON `document_backfill_plan` (`status`);
CREATE INDEX IF NOT EXISTS `doc_backfill_year_idx` ON `document_backfill_plan` (`year`);
CREATE INDEX IF NOT EXISTS `doc_backfill_priority_idx` ON `document_backfill_plan` (`priority` DESC);

-- Document access log (for S3 signed URLs)
CREATE TABLE IF NOT EXISTS `document_access_log` (
  `id` int AUTO_INCREMENT NOT NULL,
  `documentId` int NOT NULL,
  `userId` int,
  `accessType` varchar(50) NOT NULL DEFAULT 'view',
  `ipAddress` varchar(45),
  `userAgent` text,
  `accessedAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `document_access_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `doc_access_doc_idx` ON `document_access_log` (`documentId`);
CREATE INDEX IF NOT EXISTS `doc_access_user_idx` ON `document_access_log` (`userId`);
CREATE INDEX IF NOT EXISTS `doc_access_date_idx` ON `document_access_log` (`accessedAt`);

-- ============================================================================
-- NUMERIC DATA BACKFILL PLANNING
-- ============================================================================

-- Numeric backfill checkpoints (per source, product, year)
CREATE TABLE IF NOT EXISTS `numeric_backfill_checkpoint` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sourceRegistryId` int NOT NULL,
  `productId` int,
  `indicatorCode` varchar(100) NOT NULL,
  `year` int NOT NULL,
  `regimeTag` enum('aden_irg','sanaa_defacto','mixed','unified','unknown') NOT NULL,
  `status` enum('PLANNED','IN_PROGRESS','COMPLETED','FAILED','SKIPPED') NOT NULL DEFAULT 'PLANNED',
  `observationsIngested` int NOT NULL DEFAULT 0,
  `lastValue` decimal(20,6),
  `lastDate` date,
  `lastAttemptAt` timestamp,
  `completedAt` timestamp,
  `errorMessage` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `numeric_backfill_checkpoint_id` PRIMARY KEY(`id`),
  CONSTRAINT `numeric_backfill_unique` UNIQUE(`sourceRegistryId`,`indicatorCode`,`year`,`regimeTag`),
  CONSTRAINT `numeric_backfill_source_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `numeric_backfill_status_idx` ON `numeric_backfill_checkpoint` (`status`);
CREATE INDEX IF NOT EXISTS `numeric_backfill_year_idx` ON `numeric_backfill_checkpoint` (`year`);
CREATE INDEX IF NOT EXISTS `numeric_backfill_indicator_idx` ON `numeric_backfill_checkpoint` (`indicatorCode`);

-- ============================================================================
-- SECTOR AGENT CONTEXT PACKS (Nightly builds)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `sector_context_packs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sectorCode` varchar(10) NOT NULL,
  `packVersion` varchar(50) NOT NULL,
  `generatedAt` timestamp NOT NULL,
  `validUntil` timestamp NOT NULL,
  `topIndicators` json,
  `recentDocuments` json,
  `activeContradictions` json,
  `openGaps` json,
  `exampleQuestions` json,
  `metadata` json,
  `s3Key` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `sector_context_packs_id` PRIMARY KEY(`id`),
  CONSTRAINT `scp_unique` UNIQUE(`sectorCode`,`packVersion`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `scp_sector_idx` ON `sector_context_packs` (`sectorCode`);
CREATE INDEX IF NOT EXISTS `scp_valid_idx` ON `sector_context_packs` (`validUntil`);
CREATE INDEX IF NOT EXISTS `scp_generated_idx` ON `sector_context_packs` (`generatedAt` DESC);

-- ============================================================================
-- CONTRADICTION REGISTRY (Conflicts between sources)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `contradiction_registry` (
  `id` int AUTO_INCREMENT NOT NULL,
  `contradictionId` varchar(50) NOT NULL,
  `indicatorCode` varchar(100) NOT NULL,
  `regimeTag` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `sourceA_registryId` int NOT NULL,
  `sourceA_value` decimal(20,6) NOT NULL,
  `sourceB_registryId` int NOT NULL,
  `sourceB_value` decimal(20,6) NOT NULL,
  `variance_percent` decimal(10,2) NOT NULL,
  `status` enum('DETECTED','UNDER_REVIEW','EXPLAINED','UNRESOLVED') NOT NULL DEFAULT 'DETECTED',
  `resolution` text,
  `resolvedBy` int,
  `resolvedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `contradiction_registry_id` PRIMARY KEY(`id`),
  CONSTRAINT `contradiction_unique` UNIQUE(`contradictionId`),
  CONSTRAINT `contradiction_sourceA_fk` FOREIGN KEY (`sourceA_registryId`) REFERENCES `source_registry`(`id`),
  CONSTRAINT `contradiction_sourceB_fk` FOREIGN KEY (`sourceB_registryId`) REFERENCES `source_registry`(`id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `contradiction_indicator_idx` ON `contradiction_registry` (`indicatorCode`);
CREATE INDEX IF NOT EXISTS `contradiction_status_idx` ON `contradiction_registry` (`status`);
CREATE INDEX IF NOT EXISTS `contradiction_date_idx` ON `contradiction_registry` (`date`);

-- ============================================================================
-- SOURCE DISCOVERY QUEUE (Candidate sources to add)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `source_discovery_queue` (
  `id` int AUTO_INCREMENT NOT NULL,
  `candidateName` varchar(500) NOT NULL,
  `candidateUrl` text,
  `discoveredVia` varchar(255),
  `suggestedTier` varchar(10),
  `suggestedSectors` json,
  `reasoning` text,
  `status` enum('DISCOVERED','UNDER_REVIEW','APPROVED','REJECTED','ADDED') NOT NULL DEFAULT 'DISCOVERED',
  `reviewedBy` int,
  `reviewedAt` timestamp,
  `reviewNotes` text,
  `createdSourceId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `source_discovery_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `discovery_status_idx` ON `source_discovery_queue` (`status`);
CREATE INDEX IF NOT EXISTS `discovery_created_idx` ON `source_discovery_queue` (`createdAt` DESC);

-- ============================================================================
-- LICENSE & CREDENTIAL RISKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS `license_risk_log` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sourceRegistryId` int NOT NULL,
  `riskType` enum('EXPIRING_KEY','MISSING_KEY','TOS_CHANGE','LICENSE_UNCLEAR','ACCESS_DENIED','RATE_LIMIT') NOT NULL,
  `severity` enum('HIGH','MEDIUM','LOW') NOT NULL,
  `description` text NOT NULL,
  `expiryDate` date,
  `actionRequired` text,
  `assignedTo` int,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','ACCEPTED') NOT NULL DEFAULT 'OPEN',
  `resolvedAt` timestamp,
  `resolvedBy` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `license_risk_log_id` PRIMARY KEY(`id`),
  CONSTRAINT `license_risk_source_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `license_risk_source_idx` ON `license_risk_log` (`sourceRegistryId`);
CREATE INDEX IF NOT EXISTS `license_risk_status_idx` ON `license_risk_log` (`status`);
CREATE INDEX IF NOT EXISTS `license_risk_severity_idx` ON `license_risk_log` (`severity`);

-- ============================================================================
-- AI AUDIT LOGS (For agent responses)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `ai_audit_log` (
  `id` int AUTO_INCREMENT NOT NULL,
  `responseId` varchar(100) NOT NULL,
  `userId` int,
  `agentType` varchar(50) NOT NULL,
  `sectorCode` varchar(10),
  `promptText` text NOT NULL,
  `responseText` text NOT NULL,
  `citationCount` int NOT NULL DEFAULT 0,
  `citationIds` json,
  `evidencePackIds` json,
  `confidenceScore` decimal(5,4),
  `policyChecksPassed` boolean NOT NULL DEFAULT true,
  `policyCheckDetails` json,
  `tokensUsed` int,
  `latencyMs` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_audit_log_id` PRIMARY KEY(`id`),
  CONSTRAINT `ai_audit_response_unique` UNIQUE(`responseId`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ai_audit_user_idx` ON `ai_audit_log` (`userId`);
CREATE INDEX IF NOT EXISTS `ai_audit_agent_idx` ON `ai_audit_log` (`agentType`);
CREATE INDEX IF NOT EXISTS `ai_audit_sector_idx` ON `ai_audit_log` (`sectorCode`);
CREATE INDEX IF NOT EXISTS `ai_audit_created_idx` ON `ai_audit_log` (`createdAt` DESC);

-- ============================================================================
-- ACCESS NEEDED WORKFLOW (Partnership requests)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `partnership_access_requests` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sourceRegistryId` int NOT NULL,
  `requestType` enum('API_KEY','PARTNERSHIP','DATA_SHARING','TECHNICAL_SUPPORT') NOT NULL,
  `priority` enum('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
  `targetContact` varchar(255),
  `targetEmail` varchar(320),
  `status` enum('DRAFT','QUEUED','SENT','PENDING_RESPONSE','APPROVED','DENIED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `draftEmailSubject` text,
  `draftEmailBody` text,
  `sentAt` timestamp,
  `responseReceivedAt` timestamp,
  `responseNotes` text,
  `createdBy` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `partnership_access_requests_id` PRIMARY KEY(`id`),
  CONSTRAINT `par_src_reg_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `par_source_idx` ON `partnership_access_requests` (`sourceRegistryId`);
CREATE INDEX IF NOT EXISTS `par_status_idx` ON `partnership_access_requests` (`status`);
CREATE INDEX IF NOT EXISTS `par_created_idx` ON `partnership_access_requests` (`createdAt` DESC);

-- ============================================================================
-- MODEL REGISTRY (MindsDB / in-DB intelligence)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `model_registry` (
  `id` int AUTO_INCREMENT NOT NULL,
  `modelName` varchar(255) NOT NULL,
  `modelType` enum('ANOMALY_DETECTION','FORECAST','CLASSIFICATION','CLUSTERING','REGRESSION') NOT NULL,
  `targetIndicator` varchar(100),
  `targetSector` varchar(10),
  `status` enum('DEVELOPMENT','TESTING','STAGING','PRODUCTION','DEPRECATED') NOT NULL DEFAULT 'DEVELOPMENT',
  `approvedBy` int,
  `approvedAt` timestamp,
  `trainingDataQuery` text,
  `hyperparameters` json,
  `performanceMetrics` json,
  `governanceNotes` text,
  `createdBy` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `model_registry_id` PRIMARY KEY(`id`),
  CONSTRAINT `model_name_unique` UNIQUE(`modelName`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `model_status_idx` ON `model_registry` (`status`);
CREATE INDEX IF NOT EXISTS `model_type_idx` ON `model_registry` (`modelType`);

CREATE TABLE IF NOT EXISTS `model_runs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `modelId` int NOT NULL,
  `runType` enum('TRAINING','PREDICTION','EVALUATION') NOT NULL,
  `status` enum('PENDING','RUNNING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
  `inputData` json,
  `outputData` json,
  `metrics` json,
  `errorMessage` text,
  `startedAt` timestamp,
  `completedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `model_runs_id` PRIMARY KEY(`id`),
  CONSTRAINT `model_runs_model_fk` FOREIGN KEY (`modelId`) REFERENCES `model_registry`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `model_runs_model_idx` ON `model_runs` (`modelId`);
CREATE INDEX IF NOT EXISTS `model_runs_status_idx` ON `model_runs` (`status`);
CREATE INDEX IF NOT EXISTS `model_runs_created_idx` ON `model_runs` (`createdAt` DESC);

-- ============================================================================
-- EMAIL OUTBOX (For Access Needed workflow)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `email_outbox` (
  `id` int AUTO_INCREMENT NOT NULL,
  `toEmail` varchar(320) NOT NULL,
  `ccEmail` varchar(320),
  `subject` text NOT NULL,
  `body` text NOT NULL,
  `relatedRequestId` int,
  `status` enum('QUEUED','SENDING','SENT','FAILED','CANCELLED') NOT NULL DEFAULT 'QUEUED',
  `attemptCount` int NOT NULL DEFAULT 0,
  `lastAttemptAt` timestamp,
  `sentAt` timestamp,
  `errorMessage` text,
  `createdBy` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `email_outbox_id` PRIMARY KEY(`id`),
  CONSTRAINT `email_outbox_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `email_outbox_status_idx` ON `email_outbox` (`status`);
CREATE INDEX IF NOT EXISTS `email_outbox_created_idx` ON `email_outbox` (`createdAt` DESC);

-- ============================================================================
-- COMPLETION VERIFICATION
-- ============================================================================
SELECT 'Document Vault & Backfill migration complete' AS status;

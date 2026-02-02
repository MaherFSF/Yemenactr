CREATE TABLE `email_outbox` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toEmail` varchar(255) NOT NULL,
	`ccEmails` json,
	`subject` varchar(500) NOT NULL,
	`bodyHtml` text,
	`bodyText` text,
	`relatedType` varchar(50),
	`relatedId` int,
	`status` enum('queued','sending','sent','failed','cancelled') NOT NULL DEFAULT 'queued',
	`sentAt` timestamp,
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_outbox_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gap_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gapId` varchar(50) NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`gapType` enum('missing_data','stale','access_blocked','schema_drift','contradiction','quality_low','coverage_gap','ingestion_failed') NOT NULL,
	`sourceRegistryId` int,
	`relatedSeriesId` int,
	`relatedDocumentId` int,
	`sectorCode` varchar(10),
	`indicatorCode` varchar(100),
	`titleEn` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`descriptionEn` text,
	`descriptionAr` text,
	`status` enum('open','in_progress','resolved','wont_fix','duplicate') NOT NULL DEFAULT 'open',
	`ownerRole` varchar(100),
	`assignedTo` int,
	`recommendedAction` text,
	`resolutionNotes` text,
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`escalationNeeded` boolean NOT NULL DEFAULT false,
	`escalatedAt` timestamp,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gap_tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `gap_tickets_gapId_unique` UNIQUE(`gapId`)
);
--> statement-breakpoint
CREATE TABLE `partnership_access_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` varchar(50) NOT NULL,
	`sourceRegistryId` int NOT NULL,
	`requestType` enum('api_key','data_sharing','partnership','license_clarification') NOT NULL,
	`contactEmail` varchar(255),
	`contactName` varchar(255),
	`organizationName` varchar(255),
	`status` enum('draft','queued','sent','responded','approved','rejected','expired') NOT NULL DEFAULT 'draft',
	`emailSubject` varchar(500),
	`emailBody` text,
	`sentAt` timestamp,
	`responseReceivedAt` timestamp,
	`responseNotes` text,
	`accessGranted` boolean DEFAULT false,
	`accessExpiresAt` timestamp,
	`apiKeyReceived` boolean DEFAULT false,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnership_access_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `partnership_access_requests_requestId_unique` UNIQUE(`requestId`)
);
--> statement-breakpoint
CREATE TABLE `raw_objects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceRegistryId` int,
	`ingestionRunId` int,
	`contentType` varchar(100) NOT NULL,
	`canonicalUrl` text NOT NULL,
	`retrievalTs` timestamp NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`fileSize` int,
	`storageUri` text NOT NULL,
	`licenseSnapshot` text,
	`robotsSnapshot` text,
	`headersSnapshot` json,
	`status` enum('active','superseded','deleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `raw_objects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registry_lint_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` varchar(50) NOT NULL,
	`runAt` timestamp NOT NULL,
	`totalSources` int NOT NULL,
	`passedSources` int NOT NULL,
	`failedSources` int NOT NULL,
	`warningCount` int DEFAULT 0,
	`failures` json,
	`overallStatus` enum('pass','fail','warning') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `registry_lint_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registry_sector_map` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceRegistryId` int NOT NULL,
	`sectorCode` varchar(10) NOT NULL,
	`weight` enum('primary','secondary','tertiary') NOT NULL DEFAULT 'secondary',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registry_sector_map_id` PRIMARY KEY(`id`),
	CONSTRAINT `rsm_unique` UNIQUE(`sourceRegistryId`,`sectorCode`)
);
--> statement-breakpoint
CREATE TABLE `sector_codebook` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(10) NOT NULL,
	`sectorName` varchar(255) NOT NULL,
	`sectorNameAr` varchar(255),
	`definition` text,
	`definitionAr` text,
	`displayOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sector_codebook_id` PRIMARY KEY(`id`),
	CONSTRAINT `sector_codebook_sectorCode_unique` UNIQUE(`sectorCode`)
);
--> statement-breakpoint
ALTER TABLE `email_outbox` ADD CONSTRAINT `email_outbox_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_tickets` ADD CONSTRAINT `gap_tickets_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_tickets` ADD CONSTRAINT `gap_tickets_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gap_tickets` ADD CONSTRAINT `gap_tickets_resolvedBy_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnership_access_requests` ADD CONSTRAINT `partnership_access_requests_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnership_access_requests` ADD CONSTRAINT `partnership_access_requests_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `raw_objects` ADD CONSTRAINT `raw_objects_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `raw_objects` ADD CONSTRAINT `raw_objects_ingestionRunId_ingestion_runs_id_fk` FOREIGN KEY (`ingestionRunId`) REFERENCES `ingestion_runs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `registry_sector_map` ADD CONSTRAINT `registry_sector_map_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `email_status_idx` ON `email_outbox` (`status`);--> statement-breakpoint
CREATE INDEX `email_related_idx` ON `email_outbox` (`relatedType`,`relatedId`);--> statement-breakpoint
CREATE INDEX `gap_id_idx` ON `gap_tickets` (`gapId`);--> statement-breakpoint
CREATE INDEX `gap_severity_idx` ON `gap_tickets` (`severity`);--> statement-breakpoint
CREATE INDEX `gap_type_idx` ON `gap_tickets` (`gapType`);--> statement-breakpoint
CREATE INDEX `gap_status_idx` ON `gap_tickets` (`status`);--> statement-breakpoint
CREATE INDEX `gap_source_idx` ON `gap_tickets` (`sourceRegistryId`);--> statement-breakpoint
CREATE INDEX `gap_sector_idx` ON `gap_tickets` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `par_request_id_idx` ON `partnership_access_requests` (`requestId`);--> statement-breakpoint
CREATE INDEX `par_source_idx` ON `partnership_access_requests` (`sourceRegistryId`);--> statement-breakpoint
CREATE INDEX `par_status_idx` ON `partnership_access_requests` (`status`);--> statement-breakpoint
CREATE INDEX `raw_source_idx` ON `raw_objects` (`sourceRegistryId`);--> statement-breakpoint
CREATE INDEX `raw_sha256_idx` ON `raw_objects` (`sha256`);--> statement-breakpoint
CREATE INDEX `raw_retrieval_idx` ON `raw_objects` (`retrievalTs`);--> statement-breakpoint
CREATE INDEX `lint_run_id_idx` ON `registry_lint_results` (`runId`);--> statement-breakpoint
CREATE INDEX `lint_run_at_idx` ON `registry_lint_results` (`runAt`);--> statement-breakpoint
CREATE INDEX `rsm_source_idx` ON `registry_sector_map` (`sourceRegistryId`);--> statement-breakpoint
CREATE INDEX `rsm_sector_idx` ON `registry_sector_map` (`sectorCode`);
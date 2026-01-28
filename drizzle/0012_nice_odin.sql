CREATE TABLE `backfill_checkpoints` (
	`id` varchar(255) NOT NULL,
	`datasetId` varchar(255) NOT NULL,
	`indicatorCode` varchar(100) NOT NULL,
	`sourceId` int,
	`lastProcessedDate` timestamp NOT NULL,
	`totalDays` int NOT NULL DEFAULT 0,
	`processedDays` int NOT NULL DEFAULT 0,
	`insertedRecords` int NOT NULL DEFAULT 0,
	`skippedRecords` int NOT NULL DEFAULT 0,
	`errorCount` int NOT NULL DEFAULT 0,
	`status` enum('running','paused','completed','failed') NOT NULL DEFAULT 'running',
	`startedAt` timestamp NOT NULL,
	`lastUpdatedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`errors` json DEFAULT ('[]'),
	`metadata` json,
	CONSTRAINT `backfill_checkpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backfill_requests` (
	`id` varchar(255) NOT NULL,
	`sourceId` int NOT NULL,
	`indicatorCodes` json NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed'),
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('pending','approved','running','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`strategy` varchar(100),
	`estimatedDataPoints` int,
	`estimatedDuration` varchar(100),
	`requestedBy` varchar(64) NOT NULL,
	`approvedBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`notes` text,
	CONSTRAINT `backfill_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnership_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`organizationName` varchar(255) NOT NULL,
	`contactEmail` varchar(320),
	`contactName` varchar(255),
	`requestType` enum('data_access','api_key','partnership_mou','bulk_download') NOT NULL,
	`status` enum('draft','sent','in_negotiation','approved','rejected','on_hold') NOT NULL DEFAULT 'draft',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`proposalText` text,
	`responseReceived` boolean NOT NULL DEFAULT false,
	`responseText` text,
	`estimatedTimeline` varchar(100),
	`requestedBy` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`sentAt` timestamp,
	`respondedAt` timestamp,
	`notes` text,
	CONSTRAINT `partnership_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `source_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`credentialType` enum('api_key','oauth_token','basic_auth','certificate') NOT NULL,
	`apiKey` text,
	`encryptedKey` text,
	`username` varchar(255),
	`password` text,
	`oauthAccessToken` text,
	`oauthRefreshToken` text,
	`oauthExpiresAt` timestamp,
	`certificatePath` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastValidatedAt` timestamp,
	`validationStatus` enum('valid','invalid','expired','untested') NOT NULL DEFAULT 'untested',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` varchar(64),
	CONSTRAINT `source_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `backfill_checkpoints` ADD CONSTRAINT `backfill_checkpoints_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `backfill_requests` ADD CONSTRAINT `backfill_requests_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnership_requests` ADD CONSTRAINT `partnership_requests_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_credentials` ADD CONSTRAINT `source_credentials_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `backfill_dataset_idx` ON `backfill_checkpoints` (`datasetId`);--> statement-breakpoint
CREATE INDEX `backfill_indicator_idx` ON `backfill_checkpoints` (`indicatorCode`);--> statement-breakpoint
CREATE INDEX `backfill_status_idx` ON `backfill_checkpoints` (`status`);--> statement-breakpoint
CREATE INDEX `backfill_started_idx` ON `backfill_checkpoints` (`startedAt`);--> statement-breakpoint
CREATE INDEX `backfill_req_source_idx` ON `backfill_requests` (`sourceId`);--> statement-breakpoint
CREATE INDEX `backfill_req_status_idx` ON `backfill_requests` (`status`);--> statement-breakpoint
CREATE INDEX `backfill_req_user_idx` ON `backfill_requests` (`requestedBy`);--> statement-breakpoint
CREATE INDEX `backfill_req_created_idx` ON `backfill_requests` (`createdAt`);--> statement-breakpoint
CREATE INDEX `partnership_req_source_idx` ON `partnership_requests` (`sourceId`);--> statement-breakpoint
CREATE INDEX `partnership_req_status_idx` ON `partnership_requests` (`status`);--> statement-breakpoint
CREATE INDEX `partnership_req_created_idx` ON `partnership_requests` (`createdAt`);--> statement-breakpoint
CREATE INDEX `source_cred_source_idx` ON `source_credentials` (`sourceId`);--> statement-breakpoint
CREATE INDEX `source_cred_active_idx` ON `source_credentials` (`isActive`);
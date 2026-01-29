CREATE TABLE `source_discovery_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`discoveredUrl` text NOT NULL,
	`discoveredName` varchar(500),
	`discoveryMethod` enum('SEARCH_ENGINE','CITATION_CRAWL','PARTNER_SUGGESTION','MANUAL') NOT NULL,
	`searchQuery` varchar(500),
	`language` varchar(10) DEFAULT 'en',
	`proposedTier` enum('T0','T1','T2','T3','T4','UNKNOWN') DEFAULT 'UNKNOWN',
	`proposedSectors` json,
	`proposedPublisher` varchar(255),
	`status` enum('PENDING','APPROVED','REJECTED','DUPLICATE') NOT NULL DEFAULT 'PENDING',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdSourceId` int,
	`discoveredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `source_discovery_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `source_feed_matrix` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceRegistryId` int NOT NULL,
	`targetType` enum('SECTOR','PAGE','MODULE','ENTITY_TYPE') NOT NULL,
	`targetCode` varchar(100) NOT NULL,
	`feedType` enum('PRIMARY','SECONDARY','PROXY','CONTEXT') NOT NULL DEFAULT 'PRIMARY',
	`lastDataDate` timestamp,
	`coverageStart` int,
	`coverageEnd` int,
	`gapYears` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `source_feed_matrix_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `source_registry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` varchar(50) NOT NULL,
	`name` varchar(500) NOT NULL,
	`altName` varchar(500),
	`publisher` varchar(255),
	`apiUrl` text,
	`webUrl` text,
	`accessType` enum('API','SDMX','RSS','WEB','PDF','CSV','XLSX','MANUAL','PARTNER','REMOTE_SENSING') NOT NULL DEFAULT 'WEB',
	`apiKeyRequired` boolean NOT NULL DEFAULT false,
	`apiKeyContact` varchar(255),
	`tier` enum('T0','T1','T2','T3','T4','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
	`status` enum('ACTIVE','PENDING_REVIEW','NEEDS_KEY','INACTIVE','DEPRECATED') NOT NULL DEFAULT 'PENDING_REVIEW',
	`allowedUse` json,
	`updateFrequency` enum('REALTIME','DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUAL','IRREGULAR') NOT NULL DEFAULT 'IRREGULAR',
	`freshnessSla` int,
	`lastFetch` timestamp,
	`nextFetch` timestamp,
	`geographicScope` varchar(100),
	`regimeApplicability` enum('ADEN_IRG','SANAA_DFA','BOTH','MIXED','GLOBAL') DEFAULT 'GLOBAL',
	`historicalStart` int,
	`historicalEnd` int,
	`language` varchar(50) DEFAULT 'en',
	`description` text,
	`license` varchar(500),
	`confidenceRating` varchar(10),
	`latency` varchar(100),
	`needsPartnership` boolean NOT NULL DEFAULT false,
	`partnershipContact` varchar(255),
	`connectorType` varchar(100),
	`connectorOwner` varchar(100) DEFAULT 'Manus',
	`connectorConfig` json,
	`backfillStatus` enum('NOT_STARTED','IN_PROGRESS','COMPLETED','FAILED') DEFAULT 'NOT_STARTED',
	`sectorsFed` json,
	`pagesFed` json,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`isProxy` boolean NOT NULL DEFAULT false,
	`isMedia` boolean NOT NULL DEFAULT false,
	`limitations` text,
	`notes` text,
	`sectorCategory` varchar(100),
	`registryType` enum('master','extended','inclusive_pdf','url_extract') DEFAULT 'master',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	`updatedBy` int,
	CONSTRAINT `source_registry_id` PRIMARY KEY(`id`),
	CONSTRAINT `source_registry_sourceId_unique` UNIQUE(`sourceId`)
);
--> statement-breakpoint
CREATE TABLE `source_tier_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceRegistryId` int NOT NULL,
	`previousTier` enum('T0','T1','T2','T3','T4','UNKNOWN'),
	`newTier` enum('T0','T1','T2','T3','T4','UNKNOWN') NOT NULL,
	`reason` text,
	`changedBy` int,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `source_tier_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `source_year_coverage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceRegistryId` int NOT NULL,
	`year` int NOT NULL,
	`hasData` boolean NOT NULL DEFAULT false,
	`missingReason` enum('CONFLICT','INSTITUTIONAL_SPLIT','SITE_OFFLINE','NOT_PUBLISHED','UNKNOWN'),
	`missingReasonDoc` text,
	`gapTicketId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `source_year_coverage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('PRICE_CHANGE','POLICY_ANNOUNCEMENT','CONFLICT_EVENT','ECONOMIC_INDICATOR','ENTITY_ACTION','OTHER') NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`description` text,
	`descriptionAr` text,
	`sourceRegistryId` int,
	`sourceUrl` text,
	`sourceName` varchar(255),
	`detectedAt` timestamp NOT NULL,
	`extractedData` json,
	`status` enum('PENDING','VERIFIED','REJECTED','NEEDS_MORE_EVIDENCE') NOT NULL DEFAULT 'PENDING',
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`verificationNotes` text,
	`corroboratingSources` json,
	`corroborationScore` int,
	`sectorCode` varchar(50),
	`entityIds` json,
	`createdRecordType` varchar(100),
	`createdRecordId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `source_discovery_queue` ADD CONSTRAINT `source_discovery_queue_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_discovery_queue` ADD CONSTRAINT `source_discovery_queue_createdSourceId_source_registry_id_fk` FOREIGN KEY (`createdSourceId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_feed_matrix` ADD CONSTRAINT `source_feed_matrix_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_registry` ADD CONSTRAINT `source_registry_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_registry` ADD CONSTRAINT `source_registry_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_tier_audit_log` ADD CONSTRAINT `source_tier_audit_log_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_tier_audit_log` ADD CONSTRAINT `source_tier_audit_log_changedBy_users_id_fk` FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_year_coverage` ADD CONSTRAINT `source_year_coverage_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verification_queue` ADD CONSTRAINT `verification_queue_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verification_queue` ADD CONSTRAINT `verification_queue_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `discovery_status_idx` ON `source_discovery_queue` (`status`);--> statement-breakpoint
CREATE INDEX `discovery_discovered_idx` ON `source_discovery_queue` (`discoveredAt`);--> statement-breakpoint
CREATE INDEX `feed_matrix_source_target_idx` ON `source_feed_matrix` (`sourceRegistryId`,`targetType`,`targetCode`);--> statement-breakpoint
CREATE INDEX `feed_matrix_target_idx` ON `source_feed_matrix` (`targetType`,`targetCode`);--> statement-breakpoint
CREATE INDEX `source_registry_source_id_idx` ON `source_registry` (`sourceId`);--> statement-breakpoint
CREATE INDEX `source_registry_name_idx` ON `source_registry` (`name`);--> statement-breakpoint
CREATE INDEX `source_registry_tier_idx` ON `source_registry` (`tier`);--> statement-breakpoint
CREATE INDEX `source_registry_status_idx` ON `source_registry` (`status`);--> statement-breakpoint
CREATE INDEX `source_registry_publisher_idx` ON `source_registry` (`publisher`);--> statement-breakpoint
CREATE INDEX `tier_audit_source_idx` ON `source_tier_audit_log` (`sourceRegistryId`);--> statement-breakpoint
CREATE INDEX `tier_audit_changed_idx` ON `source_tier_audit_log` (`changedAt`);--> statement-breakpoint
CREATE INDEX `source_year_idx` ON `source_year_coverage` (`sourceRegistryId`,`year`);--> statement-breakpoint
CREATE INDEX `verification_status_idx` ON `verification_queue` (`status`);--> statement-breakpoint
CREATE INDEX `verification_event_type_idx` ON `verification_queue` (`eventType`);--> statement-breakpoint
CREATE INDEX `verification_detected_idx` ON `verification_queue` (`detectedAt`);--> statement-breakpoint
CREATE INDEX `verification_sector_idx` ON `verification_queue` (`sectorCode`);
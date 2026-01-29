CREATE TABLE `update_evidence_bundles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`updateItemId` int NOT NULL,
	`citations` json DEFAULT ('[]'),
	`licenseType` varchar(100),
	`licenseUrl` varchar(500),
	`licensePermissions` json,
	`whatChanged` json DEFAULT ('[]'),
	`rawArtifactUrl` varchar(1000),
	`rawArtifactHash` varchar(64),
	`extractionAnchors` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `update_evidence_bundles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `update_ingestion_checkpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`lastCursor` varchar(500),
	`lastSeenDate` timestamp,
	`lastHash` varchar(64),
	`lastSuccessfulRun` timestamp,
	`totalIngested` int DEFAULT 0,
	`totalDuplicates` int DEFAULT 0,
	`totalErrors` int DEFAULT 0,
	`rateLimitRemaining` int,
	`rateLimitResetAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `update_ingestion_checkpoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `checkpoint_source_id_idx` UNIQUE(`sourceId`)
);
--> statement-breakpoint
CREATE TABLE `update_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleEn` varchar(500) NOT NULL,
	`titleAr` varchar(500) NOT NULL,
	`summaryEn` text NOT NULL,
	`summaryAr` text NOT NULL,
	`bodyEn` text,
	`bodyAr` text,
	`sourceId` int,
	`sourcePublisher` varchar(255),
	`sourceUrl` varchar(1000) NOT NULL,
	`publishedAt` timestamp NOT NULL,
	`retrievedAt` timestamp NOT NULL DEFAULT (now()),
	`contentHash` varchar(64) NOT NULL,
	`seenCount` int DEFAULT 1,
	`sectors` json DEFAULT ('[]'),
	`themes` json DEFAULT ('[]'),
	`entities` json DEFAULT ('[]'),
	`geography` json DEFAULT ('[]'),
	`regimeTag` enum('aden','sanaa','both','neutral'),
	`sensitivityLevel` enum('public_safe','needs_review','restricted_metadata_only') NOT NULL DEFAULT 'needs_review',
	`confidenceGrade` enum('A','B','C','D') DEFAULT 'B',
	`confidenceReason` text,
	`dqafSummary` json,
	`evidencePackId` int,
	`status` enum('draft','queued_for_review','published','rejected','archived') NOT NULL DEFAULT 'draft',
	`visibility` enum('public','vip_only','admin_only') NOT NULL DEFAULT 'admin_only',
	`updateType` enum('publication','funding','policy','data_release','report','announcement','other') DEFAULT 'other',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `update_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `update_content_hash_idx` UNIQUE(`contentHash`)
);
--> statement-breakpoint
CREATE TABLE `update_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`updateItemId` int,
	`updateSignalId` int,
	`notificationType` enum('high_importance_update','funding_shift','new_report','staleness_breach','translation_qa_failure','contradiction_detected') NOT NULL,
	`targetRole` enum('admin','data_steward','vip_president','vip_finance_minister','vip_central_bank_governor','vip_humanitarian_coordinator','vip_donor_analyst','partner','public'),
	`targetUserId` int,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`bodyEn` text,
	`bodyAr` text,
	`channel` enum('in_app','email','webhook') DEFAULT 'in_app',
	`status` enum('pending','sent','failed','read') DEFAULT 'pending',
	`sentAt` timestamp,
	`readAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `update_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `update_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`updateItemId` int NOT NULL,
	`signalType` enum('timeline_event','sector_signal','vip_alert','admin_alert','entity_update') NOT NULL,
	`targetType` enum('timeline','sector','vip_cockpit','admin_dashboard','entity_page') NOT NULL,
	`targetId` varchar(100),
	`signalTitleEn` varchar(255) NOT NULL,
	`signalTitleAr` varchar(255) NOT NULL,
	`signalSummaryEn` text,
	`signalSummaryAr` text,
	`priority` enum('critical','high','medium','low') DEFAULT 'medium',
	`status` enum('pending','approved','rejected','processed') DEFAULT 'pending',
	`evidencePackId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `update_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `update_evidence_bundles` ADD CONSTRAINT `update_evidence_bundles_updateItemId_update_items_id_fk` FOREIGN KEY (`updateItemId`) REFERENCES `update_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_ingestion_checkpoints` ADD CONSTRAINT `update_ingestion_checkpoints_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_items` ADD CONSTRAINT `update_items_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_items` ADD CONSTRAINT `update_items_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_items` ADD CONSTRAINT `update_items_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_notifications` ADD CONSTRAINT `update_notifications_updateItemId_update_items_id_fk` FOREIGN KEY (`updateItemId`) REFERENCES `update_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_notifications` ADD CONSTRAINT `update_notifications_updateSignalId_update_signals_id_fk` FOREIGN KEY (`updateSignalId`) REFERENCES `update_signals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_notifications` ADD CONSTRAINT `update_notifications_targetUserId_users_id_fk` FOREIGN KEY (`targetUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_signals` ADD CONSTRAINT `update_signals_updateItemId_update_items_id_fk` FOREIGN KEY (`updateItemId`) REFERENCES `update_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `update_signals` ADD CONSTRAINT `update_signals_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `evidence_update_item_idx` ON `update_evidence_bundles` (`updateItemId`);--> statement-breakpoint
CREATE INDEX `update_source_url_idx` ON `update_items` (`sourceUrl`);--> statement-breakpoint
CREATE INDEX `update_status_idx` ON `update_items` (`status`);--> statement-breakpoint
CREATE INDEX `update_published_at_idx` ON `update_items` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `update_source_id_idx` ON `update_items` (`sourceId`);--> statement-breakpoint
CREATE INDEX `notification_update_item_idx` ON `update_notifications` (`updateItemId`);--> statement-breakpoint
CREATE INDEX `notification_status_idx` ON `update_notifications` (`status`);--> statement-breakpoint
CREATE INDEX `notification_target_role_idx` ON `update_notifications` (`targetRole`);--> statement-breakpoint
CREATE INDEX `signal_update_item_idx` ON `update_signals` (`updateItemId`);--> statement-breakpoint
CREATE INDEX `signal_type_idx` ON `update_signals` (`signalType`);--> statement-breakpoint
CREATE INDEX `signal_status_idx` ON `update_signals` (`status`);
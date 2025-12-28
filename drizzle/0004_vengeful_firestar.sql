CREATE TABLE `confidence_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataPointId` int NOT NULL,
	`dataPointType` varchar(50) NOT NULL,
	`rating` enum('A','B','C','D') NOT NULL,
	`sourceCredibility` int NOT NULL,
	`dataCompleteness` int NOT NULL,
	`timeliness` int NOT NULL,
	`consistency` int NOT NULL,
	`methodology` int NOT NULL,
	`ratingJustification` text NOT NULL,
	`displayWarning` text,
	`ratedBy` varchar(255) NOT NULL,
	`ratedAt` timestamp NOT NULL DEFAULT (now()),
	`previousRating` enum('A','B','C','D'),
	`ratingChangeReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `confidence_ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_contradictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicatorCode` varchar(100) NOT NULL,
	`date` timestamp NOT NULL,
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown') NOT NULL,
	`value1` decimal(20,6) NOT NULL,
	`source1Id` int NOT NULL,
	`value2` decimal(20,6) NOT NULL,
	`source2Id` int NOT NULL,
	`discrepancyPercent` decimal(10,2) NOT NULL,
	`discrepancyType` enum('minor','significant','major','critical') NOT NULL,
	`plausibleReasons` json DEFAULT ('[]'),
	`resolutionNotes` text,
	`status` enum('detected','investigating','explained','resolved') NOT NULL DEFAULT 'detected',
	`resolvedValue` decimal(20,6),
	`resolvedSourceId` int,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_contradictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_vintages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataPointId` int NOT NULL,
	`dataPointType` varchar(50) NOT NULL,
	`vintageDate` timestamp NOT NULL,
	`value` decimal(20,6) NOT NULL,
	`previousValue` decimal(20,6),
	`changeType` enum('initial','revision','correction','restatement') NOT NULL,
	`changeReason` text,
	`changeMagnitude` decimal(10,4),
	`sourceId` int,
	`confidenceRating` enum('A','B','C','D'),
	`createdBy` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_vintages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provenance_ledger_full` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`datasetId` int,
	`documentId` int,
	`seriesId` int,
	`accessMethod` enum('api','scrape','manual','partner_upload','file_import') NOT NULL,
	`retrievalTime` timestamp NOT NULL,
	`retrievalDuration` int,
	`rawDataHash` varchar(64) NOT NULL,
	`rawDataLocation` text,
	`licenseType` varchar(100) NOT NULL,
	`licenseUrl` text,
	`termsAccepted` boolean NOT NULL DEFAULT false,
	`attributionRequired` boolean NOT NULL DEFAULT true,
	`attributionText` text,
	`commercialUseAllowed` boolean NOT NULL DEFAULT false,
	`derivativesAllowed` boolean NOT NULL DEFAULT true,
	`transformations` json DEFAULT ('[]'),
	`qaChecks` json DEFAULT ('[]'),
	`qaScore` int NOT NULL DEFAULT 0,
	`qaPassedAt` timestamp,
	`limitations` json DEFAULT ('[]'),
	`caveats` json DEFAULT ('[]'),
	`knownIssues` json DEFAULT ('[]'),
	`expectedUpdateFrequency` enum('realtime','daily','weekly','monthly','quarterly','annual','irregular') NOT NULL,
	`lastUpdated` timestamp NOT NULL,
	`nextExpectedUpdate` timestamp,
	`updateDelayDays` int,
	`createdBy` varchar(255) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `provenance_ledger_full_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `public_changelog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`changeType` enum('dataset_added','dataset_updated','document_added','methodology_change','correction','source_added','indicator_added') NOT NULL,
	`affectedDatasetIds` json DEFAULT ('[]'),
	`affectedIndicatorCodes` json DEFAULT ('[]'),
	`affectedDocumentIds` json DEFAULT ('[]'),
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`descriptionEn` text NOT NULL,
	`descriptionAr` text NOT NULL,
	`impactLevel` enum('low','medium','high') NOT NULL,
	`affectedDateRange` json,
	`isPublic` boolean NOT NULL DEFAULT true,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`publishedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `public_changelog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `data_contradictions` ADD CONSTRAINT `data_contradictions_source1Id_sources_id_fk` FOREIGN KEY (`source1Id`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `data_contradictions` ADD CONSTRAINT `data_contradictions_source2Id_sources_id_fk` FOREIGN KEY (`source2Id`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `data_contradictions` ADD CONSTRAINT `data_contradictions_resolvedSourceId_sources_id_fk` FOREIGN KEY (`resolvedSourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `data_contradictions` ADD CONSTRAINT `data_contradictions_resolvedBy_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `data_vintages` ADD CONSTRAINT `data_vintages_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` ADD CONSTRAINT `provenance_ledger_full_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` ADD CONSTRAINT `provenance_ledger_full_datasetId_datasets_id_fk` FOREIGN KEY (`datasetId`) REFERENCES `datasets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` ADD CONSTRAINT `provenance_ledger_full_documentId_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` ADD CONSTRAINT `provenance_ledger_full_seriesId_time_series_id_fk` FOREIGN KEY (`seriesId`) REFERENCES `time_series`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `public_changelog` ADD CONSTRAINT `public_changelog_publishedBy_users_id_fk` FOREIGN KEY (`publishedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `data_point_idx` ON `confidence_ratings` (`dataPointId`,`dataPointType`);--> statement-breakpoint
CREATE INDEX `rating_idx` ON `confidence_ratings` (`rating`);--> statement-breakpoint
CREATE INDEX `indicator_idx` ON `data_contradictions` (`indicatorCode`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `data_contradictions` (`date`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `data_contradictions` (`status`);--> statement-breakpoint
CREATE INDEX `data_point_idx` ON `data_vintages` (`dataPointId`,`dataPointType`);--> statement-breakpoint
CREATE INDEX `vintage_date_idx` ON `data_vintages` (`vintageDate`);--> statement-breakpoint
CREATE INDEX `change_type_idx` ON `data_vintages` (`changeType`);--> statement-breakpoint
CREATE INDEX `source_idx` ON `provenance_ledger_full` (`sourceId`);--> statement-breakpoint
CREATE INDEX `dataset_idx` ON `provenance_ledger_full` (`datasetId`);--> statement-breakpoint
CREATE INDEX `series_idx` ON `provenance_ledger_full` (`seriesId`);--> statement-breakpoint
CREATE INDEX `qa_score_idx` ON `provenance_ledger_full` (`qaScore`);--> statement-breakpoint
CREATE INDEX `retrieval_time_idx` ON `provenance_ledger_full` (`retrievalTime`);--> statement-breakpoint
CREATE INDEX `change_type_idx` ON `public_changelog` (`changeType`);--> statement-breakpoint
CREATE INDEX `published_at_idx` ON `public_changelog` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `is_public_idx` ON `public_changelog` (`isPublic`);
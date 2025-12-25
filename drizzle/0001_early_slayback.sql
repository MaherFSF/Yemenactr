CREATE TABLE `corrections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataPointId` int NOT NULL,
	`dataPointType` varchar(50) NOT NULL,
	`oldValue` decimal(20,6) NOT NULL,
	`newValue` decimal(20,6) NOT NULL,
	`reason` text NOT NULL,
	`correctedAt` timestamp NOT NULL DEFAULT (now()),
	`correctedBy` int NOT NULL,
	CONSTRAINT `corrections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_gap_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missingItem` varchar(255) NOT NULL,
	`whyItMatters` text NOT NULL,
	`candidateSources` text,
	`acquisitionMethod` varchar(100),
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`assignedTo` int,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_gap_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `datasets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sourceId` int NOT NULL,
	`publicationDate` timestamp,
	`timeCoverageStart` timestamp,
	`timeCoverageEnd` timestamp,
	`geographicScope` varchar(100),
	`confidenceRating` enum('A','B','C','D') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `datasets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int,
	`sourceId` int,
	`license` varchar(100),
	`publicationDate` timestamp,
	`uploadDate` timestamp NOT NULL DEFAULT (now()),
	`uploaderId` int,
	`category` varchar(100),
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `economic_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`description` text NOT NULL,
	`descriptionAr` text,
	`eventDate` timestamp NOT NULL,
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown') NOT NULL,
	`category` varchar(100),
	`impactLevel` enum('low','medium','high','critical'),
	`sourceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `economic_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `geospatial_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicatorCode` varchar(100) NOT NULL,
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown') NOT NULL,
	`governorate` varchar(100) NOT NULL,
	`date` timestamp NOT NULL,
	`value` decimal(20,6) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`confidenceRating` enum('A','B','C','D') NOT NULL,
	`sourceId` int NOT NULL,
	`datasetId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `geospatial_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `glossary_terms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`termEn` varchar(255) NOT NULL,
	`termAr` varchar(255) NOT NULL,
	`definitionEn` text NOT NULL,
	`definitionAr` text NOT NULL,
	`category` varchar(100),
	`relatedTerms` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `glossary_terms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`creator` varchar(255),
	`sourceUrl` text,
	`license` varchar(100) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`usageLocations` json,
	`retrievalDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provenance_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataPointId` int NOT NULL,
	`dataPointType` varchar(50) NOT NULL,
	`transformationType` varchar(100),
	`formula` text,
	`performedAt` timestamp NOT NULL DEFAULT (now()),
	`performedByUserId` int,
	CONSTRAINT `provenance_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publisher` varchar(255) NOT NULL,
	`url` text,
	`license` varchar(100),
	`retrievalDate` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stakeholders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`type` enum('government','ngo','international_org','research_institution','private_sector') NOT NULL,
	`country` varchar(100),
	`website` text,
	`contactEmail` varchar(320),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stakeholders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_series` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicatorCode` varchar(100) NOT NULL,
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown') NOT NULL,
	`date` timestamp NOT NULL,
	`value` decimal(20,6) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`confidenceRating` enum('A','B','C','D') NOT NULL,
	`sourceId` int NOT NULL,
	`datasetId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `time_series_id` PRIMARY KEY(`id`),
	CONSTRAINT `indicator_regime_date_unique` UNIQUE(`indicatorCode`,`regimeTag`,`date`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','partner_contributor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` enum('free','researcher','institutional') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `corrections` ADD CONSTRAINT `corrections_correctedBy_users_id_fk` FOREIGN KEY (`correctedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `data_gap_tickets` ADD CONSTRAINT `data_gap_tickets_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `data_gap_tickets` ADD CONSTRAINT `data_gap_tickets_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `datasets` ADD CONSTRAINT `datasets_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_uploaderId_users_id_fk` FOREIGN KEY (`uploaderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `economic_events` ADD CONSTRAINT `economic_events_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geospatial_data` ADD CONSTRAINT `geospatial_data_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geospatial_data` ADD CONSTRAINT `geospatial_data_datasetId_datasets_id_fk` FOREIGN KEY (`datasetId`) REFERENCES `datasets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `provenance_log` ADD CONSTRAINT `provenance_log_performedByUserId_users_id_fk` FOREIGN KEY (`performedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `time_series` ADD CONSTRAINT `time_series_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `time_series` ADD CONSTRAINT `time_series_datasetId_datasets_id_fk` FOREIGN KEY (`datasetId`) REFERENCES `datasets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `data_point_idx` ON `corrections` (`dataPointId`,`dataPointType`);--> statement-breakpoint
CREATE INDEX `corrected_at_idx` ON `corrections` (`correctedAt`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `data_gap_tickets` (`status`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `data_gap_tickets` (`priority`);--> statement-breakpoint
CREATE INDEX `source_idx` ON `datasets` (`sourceId`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `datasets` (`name`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `documents` (`category`);--> statement-breakpoint
CREATE INDEX `upload_date_idx` ON `documents` (`uploadDate`);--> statement-breakpoint
CREATE INDEX `event_date_idx` ON `economic_events` (`eventDate`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `economic_events` (`category`);--> statement-breakpoint
CREATE INDEX `indicator_idx` ON `geospatial_data` (`indicatorCode`);--> statement-breakpoint
CREATE INDEX `governorate_idx` ON `geospatial_data` (`governorate`);--> statement-breakpoint
CREATE INDEX `regime_idx` ON `geospatial_data` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `term_en_idx` ON `glossary_terms` (`termEn`);--> statement-breakpoint
CREATE INDEX `term_ar_idx` ON `glossary_terms` (`termAr`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `glossary_terms` (`category`);--> statement-breakpoint
CREATE INDEX `data_point_idx` ON `provenance_log` (`dataPointId`,`dataPointType`);--> statement-breakpoint
CREATE INDEX `publisher_idx` ON `sources` (`publisher`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `stakeholders` (`type`);--> statement-breakpoint
CREATE INDEX `indicator_idx` ON `time_series` (`indicatorCode`);--> statement-breakpoint
CREATE INDEX `regime_idx` ON `time_series` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `time_series` (`date`);
CREATE TABLE `data_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`sourceName` varchar(255),
	`sourceType` enum('official_stats','central_bank','international_org','ngo','academic','news','other') DEFAULT 'other',
	`sourceUrl` text,
	`sectorTags` json,
	`whyMatters` text,
	`whyMattersAr` text,
	`impactLevel` enum('high','medium','low') DEFAULT 'medium',
	`evidencePackId` int,
	`indicatorCodes` json,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`detectedBy` enum('connector','manual','ai_agent') DEFAULT 'connector',
	`isProcessed` boolean DEFAULT false,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `data_update_detected_idx` ON `data_updates` (`detectedAt`);--> statement-breakpoint
CREATE INDEX `data_update_source_type_idx` ON `data_updates` (`sourceType`);--> statement-breakpoint
CREATE INDEX `data_update_processed_idx` ON `data_updates` (`isProcessed`);
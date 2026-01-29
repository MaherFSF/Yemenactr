CREATE TABLE `ai_projections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioHash` varchar(64) NOT NULL,
	`timestamp` timestamp NOT NULL,
	`neutralizedEventIds` json NOT NULL,
	`projectionData` json NOT NULL,
	`modelUsed` varchar(100) NOT NULL,
	`generationTimeMs` int,
	`requestedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `ai_projections_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_projections_scenarioHash_unique` UNIQUE(`scenarioHash`)
);
--> statement-breakpoint
CREATE TABLE `historical_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`snapshotType` enum('monthly','quarterly','annual','event_triggered') NOT NULL,
	`indicatorValues` json NOT NULL,
	`eventCount` int NOT NULL,
	`summaryStats` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historical_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `key_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventDate` timestamp NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`description` text NOT NULL,
	`descriptionAr` text,
	`category` enum('political','economic','military','humanitarian','monetary','fiscal','trade','infrastructure','social') NOT NULL,
	`impactLevel` int NOT NULL,
	`regimeTag` enum('aden_irg','sanaa_defacto','all','international') NOT NULL,
	`affectedIndicators` json,
	`sourceCitation` text NOT NULL,
	`sourceUrl` text,
	`isNeutralizable` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `key_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_projections` ADD CONSTRAINT `ai_projections_requestedBy_users_id_fk` FOREIGN KEY (`requestedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ai_projection_hash_idx` ON `ai_projections` (`scenarioHash`);--> statement-breakpoint
CREATE INDEX `ai_projection_timestamp_idx` ON `ai_projections` (`timestamp`);--> statement-breakpoint
CREATE INDEX `ai_projection_created_idx` ON `ai_projections` (`createdAt`);--> statement-breakpoint
CREATE INDEX `snapshot_date_idx` ON `historical_snapshots` (`snapshotDate`);--> statement-breakpoint
CREATE INDEX `snapshot_type_idx` ON `historical_snapshots` (`snapshotType`);--> statement-breakpoint
CREATE INDEX `key_event_date_idx` ON `key_events` (`eventDate`);--> statement-breakpoint
CREATE INDEX `key_event_category_idx` ON `key_events` (`category`);--> statement-breakpoint
CREATE INDEX `key_event_regime_idx` ON `key_events` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `key_event_impact_idx` ON `key_events` (`impactLevel`);
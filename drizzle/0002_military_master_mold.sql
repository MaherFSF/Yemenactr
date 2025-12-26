CREATE TABLE `ai_query_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`query` text NOT NULL,
	`response` text,
	`confidenceLevel` enum('high','medium','low'),
	`sourcesUsed` json,
	`indicatorsUsed` json,
	`feedback` enum('positive','negative'),
	`feedbackNotes` text,
	`processingTimeMs` int,
	`queriedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_query_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_access_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`statusCode` int,
	`responseTimeMs` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_access_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_indicator_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`indicatorCode` varchar(100) NOT NULL,
	`impactDescription` text,
	`impactDirection` enum('positive','negative','neutral','mixed'),
	`lagDays` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_indicator_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(100) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`unit` varchar(50) NOT NULL,
	`sector` varchar(100) NOT NULL,
	`frequency` enum('daily','weekly','monthly','quarterly','annual') NOT NULL,
	`methodology` text,
	`primarySourceId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicators_id` PRIMARY KEY(`id`),
	CONSTRAINT `indicators_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `partner_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`indicatorCode` varchar(100),
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown'),
	`dataType` enum('time_series','geospatial','document','report') NOT NULL,
	`fileKey` varchar(255),
	`fileUrl` text,
	`rawData` json,
	`sourceDescription` text NOT NULL,
	`methodology` text,
	`confidenceRating` enum('A','B','C','D'),
	`status` enum('pending','under_review','approved','rejected','needs_revision') NOT NULL DEFAULT 'pending',
	`reviewNotes` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`reportConfig` json NOT NULL,
	`generatedFileKey` varchar(255),
	`generatedFileUrl` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('free','professional','enterprise') NOT NULL DEFAULT 'free',
	`status` enum('active','cancelled','expired','trial') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_query_logs` ADD CONSTRAINT `ai_query_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_access_logs` ADD CONSTRAINT `api_access_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_indicator_links` ADD CONSTRAINT `event_indicator_links_eventId_economic_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `economic_events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `indicators` ADD CONSTRAINT `indicators_primarySourceId_sources_id_fk` FOREIGN KEY (`primarySourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_submissions` ADD CONSTRAINT `partner_submissions_partnerId_users_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_submissions` ADD CONSTRAINT `partner_submissions_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_reports` ADD CONSTRAINT `saved_reports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_idx` ON `ai_query_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `queried_at_idx` ON `ai_query_logs` (`queriedAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `api_access_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `endpoint_idx` ON `api_access_logs` (`endpoint`);--> statement-breakpoint
CREATE INDEX `requested_at_idx` ON `api_access_logs` (`requestedAt`);--> statement-breakpoint
CREATE INDEX `event_idx` ON `event_indicator_links` (`eventId`);--> statement-breakpoint
CREATE INDEX `indicator_idx` ON `event_indicator_links` (`indicatorCode`);--> statement-breakpoint
CREATE INDEX `code_idx` ON `indicators` (`code`);--> statement-breakpoint
CREATE INDEX `sector_idx` ON `indicators` (`sector`);--> statement-breakpoint
CREATE INDEX `partner_idx` ON `partner_submissions` (`partnerId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `partner_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `submitted_at_idx` ON `partner_submissions` (`submittedAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `saved_reports` (`userId`);--> statement-breakpoint
CREATE INDEX `is_public_idx` ON `saved_reports` (`isPublic`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscriptions` (`status`);
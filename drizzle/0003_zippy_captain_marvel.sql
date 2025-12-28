CREATE TABLE `email_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`nameEn` varchar(255),
	`nameAr` varchar(255),
	`organization` varchar(255),
	`subscribedToDaily` boolean NOT NULL DEFAULT false,
	`subscribedToWeekly` boolean NOT NULL DEFAULT true,
	`subscribedToMonthly` boolean NOT NULL DEFAULT true,
	`subscribedToSpecial` boolean NOT NULL DEFAULT true,
	`preferredLanguage` enum('en','ar','both') NOT NULL DEFAULT 'both',
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationToken` varchar(64),
	`unsubscribeToken` varchar(64) NOT NULL,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`verifiedAt` timestamp,
	`lastEmailSentAt` timestamp,
	CONSTRAINT `email_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_subscriptions_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailDailyDigest` boolean NOT NULL DEFAULT false,
	`emailWeeklyMonitor` boolean NOT NULL DEFAULT true,
	`emailMonthlyBrief` boolean NOT NULL DEFAULT true,
	`emailSpecialReports` boolean NOT NULL DEFAULT true,
	`emailDataAlerts` boolean NOT NULL DEFAULT false,
	`emailCorrectionNotices` boolean NOT NULL DEFAULT true,
	`watchlistAlerts` boolean NOT NULL DEFAULT true,
	`preferredLanguage` enum('en','ar','both') NOT NULL DEFAULT 'both',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publication_drafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('daily_digest','weekly_monitor','monthly_brief','special_report') NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`contentEn` text NOT NULL,
	`contentAr` text NOT NULL,
	`status` enum('draft','pending_review','approved','published','archived') NOT NULL DEFAULT 'draft',
	`scheduledFor` timestamp,
	`publishedAt` timestamp,
	`createdBy` int,
	`approvedBy` int,
	`indicatorsIncluded` json,
	`eventsIncluded` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publication_drafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`searchQuery` text NOT NULL,
	`filters` json,
	`resultCount` int,
	`lastRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_searches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sent_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientUserId` int,
	`emailType` enum('daily_digest','weekly_monitor','monthly_brief','special_report','alert','correction_notice') NOT NULL,
	`subject` varchar(500) NOT NULL,
	`publicationDraftId` int,
	`status` enum('queued','sent','delivered','bounced','failed') NOT NULL DEFAULT 'queued',
	`externalId` varchar(255),
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sent_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`indicatorCode` varchar(100) NOT NULL,
	`alertThreshold` decimal(20,6),
	`alertDirection` enum('above','below','any_change') NOT NULL DEFAULT 'any_change',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_watchlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','analyst','partner_contributor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_drafts` ADD CONSTRAINT `publication_drafts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_drafts` ADD CONSTRAINT `publication_drafts_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_searches` ADD CONSTRAINT `saved_searches_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sent_emails` ADD CONSTRAINT `sent_emails_recipientUserId_users_id_fk` FOREIGN KEY (`recipientUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sent_emails` ADD CONSTRAINT `sent_emails_publicationDraftId_publication_drafts_id_fk` FOREIGN KEY (`publicationDraftId`) REFERENCES `publication_drafts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_watchlist` ADD CONSTRAINT `user_watchlist_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `email_idx` ON `email_subscriptions` (`email`);--> statement-breakpoint
CREATE INDEX `verification_token_idx` ON `email_subscriptions` (`verificationToken`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `notification_preferences` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `publication_drafts` (`type`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `publication_drafts` (`status`);--> statement-breakpoint
CREATE INDEX `scheduled_for_idx` ON `publication_drafts` (`scheduledFor`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `saved_searches` (`userId`);--> statement-breakpoint
CREATE INDEX `recipient_idx` ON `sent_emails` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `email_type_idx` ON `sent_emails` (`emailType`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `sent_emails` (`status`);--> statement-breakpoint
CREATE INDEX `sent_at_idx` ON `sent_emails` (`sentAt`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `user_watchlist` (`userId`);--> statement-breakpoint
CREATE INDEX `indicator_idx` ON `user_watchlist` (`indicatorCode`);
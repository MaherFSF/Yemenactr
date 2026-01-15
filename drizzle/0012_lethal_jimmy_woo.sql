CREATE TABLE `alert_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('exchange_rate_change','significant_event','new_publication','data_update','system_notification') NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`contentEn` text NOT NULL,
	`contentAr` text NOT NULL,
	`indicatorCode` varchar(100),
	`region` enum('aden','sanaa','both'),
	`sector` varchar(100),
	`publicationId` int,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`processedAt` timestamp,
	`recipientCount` int NOT NULL DEFAULT 0,
	`deduplicationKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `alert_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_delivery_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientName` varchar(255),
	`notificationPreferenceId` int,
	`emailType` enum('verification','alert','weekly_digest','monthly_report','quarterly_report','annual_report','publication_notification','custom_notification') NOT NULL,
	`subject` varchar(500) NOT NULL,
	`language` enum('en','ar') NOT NULL DEFAULT 'en',
	`scheduledReportId` int,
	`status` enum('pending','sent','delivered','bounced','failed','opened','clicked') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`bouncedAt` timestamp,
	`errorMessage` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`lastRetryAt` timestamp,
	`messageId` varchar(255),
	`providerResponse` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_delivery_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `institutional_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationName` varchar(255) NOT NULL,
	`organizationNameAr` varchar(255),
	`organizationType` enum('donor','un_agency','ngo','government','central_bank','commercial_bank','research_institution','media','embassy','other') NOT NULL,
	`primaryContactName` varchar(255) NOT NULL,
	`primaryContactEmail` varchar(320) NOT NULL,
	`secondaryContactEmail` varchar(320),
	`subscriptionTier` enum('basic','professional','enterprise') NOT NULL DEFAULT 'basic',
	`customReportAccess` boolean NOT NULL DEFAULT false,
	`apiAccess` boolean NOT NULL DEFAULT false,
	`receiveWeeklyDigest` boolean NOT NULL DEFAULT true,
	`receiveMonthlyReport` boolean NOT NULL DEFAULT true,
	`receiveQuarterlyReport` boolean NOT NULL DEFAULT true,
	`receiveAnnualReport` boolean NOT NULL DEFAULT true,
	`preferredLanguage` enum('en','ar','both') NOT NULL DEFAULT 'both',
	`interestedSectors` json,
	`interestedIndicators` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`activatedAt` timestamp,
	`deactivatedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutional_subscribers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences_enhanced` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`exchangeRateAlerts` boolean NOT NULL DEFAULT true,
	`exchangeRateThreshold` decimal(5,2) DEFAULT '2.00',
	`exchangeRateRegions` json DEFAULT ('["both"]'),
	`bankingAlerts` boolean NOT NULL DEFAULT true,
	`tradeAlerts` boolean NOT NULL DEFAULT true,
	`energyAlerts` boolean NOT NULL DEFAULT true,
	`foodSecurityAlerts` boolean NOT NULL DEFAULT true,
	`humanitarianAlerts` boolean NOT NULL DEFAULT true,
	`fiscalAlerts` boolean NOT NULL DEFAULT true,
	`macroeconomicAlerts` boolean NOT NULL DEFAULT true,
	`newPublicationsAlert` boolean NOT NULL DEFAULT true,
	`publicationCategories` json,
	`publicationOrganizations` json,
	`weeklyDigest` boolean NOT NULL DEFAULT true,
	`weeklyDigestDay` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') DEFAULT 'monday',
	`monthlyReport` boolean NOT NULL DEFAULT true,
	`monthlyReportDay` int DEFAULT 1,
	`quarterlyReport` boolean NOT NULL DEFAULT true,
	`annualReport` boolean NOT NULL DEFAULT true,
	`preferredLanguage` enum('en','ar','both') NOT NULL DEFAULT 'both',
	`reportFormat` enum('pdf','html','both') NOT NULL DEFAULT 'pdf',
	`includeCharts` boolean NOT NULL DEFAULT true,
	`includeDataTables` boolean NOT NULL DEFAULT true,
	`deliveryFrequency` enum('immediate','daily_digest','weekly_digest') NOT NULL DEFAULT 'daily_digest',
	`quietHoursStart` int,
	`quietHoursEnd` int,
	`timezone` varchar(50) DEFAULT 'Asia/Aden',
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationToken` varchar(64),
	`verifiedAt` timestamp,
	`unsubscribeToken` varchar(64) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`unsubscribedAt` timestamp,
	`unsubscribeReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_enhanced_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_report_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` enum('weekly_digest','monthly_report','quarterly_report','annual_report','custom_report','alert_digest') NOT NULL,
	`reportPeriodStart` timestamp NOT NULL,
	`reportPeriodEnd` timestamp NOT NULL,
	`reportTitle` varchar(255) NOT NULL,
	`reportTitleAr` varchar(255),
	`pdfFileKey` varchar(255),
	`pdfFileUrl` text,
	`htmlFileKey` varchar(255),
	`htmlFileUrl` text,
	`generationStatus` enum('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
	`generatedAt` timestamp,
	`generationError` text,
	`totalRecipients` int NOT NULL DEFAULT 0,
	`deliveredCount` int NOT NULL DEFAULT 0,
	`failedCount` int NOT NULL DEFAULT 0,
	`openedCount` int NOT NULL DEFAULT 0,
	`clickedCount` int NOT NULL DEFAULT 0,
	`scheduledFor` timestamp NOT NULL,
	`deliveryStartedAt` timestamp,
	`deliveryCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_report_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alert_queue` ADD CONSTRAINT `alert_queue_publicationId_research_publications_id_fk` FOREIGN KEY (`publicationId`) REFERENCES `research_publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_delivery_log` ADD CONSTRAINT `email_delivery_log_notificationPreferenceId_notification_preferences_enhanced_id_fk` FOREIGN KEY (`notificationPreferenceId`) REFERENCES `notification_preferences_enhanced`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_delivery_log` ADD CONSTRAINT `email_delivery_log_scheduledReportId_scheduled_report_deliveries_id_fk` FOREIGN KEY (`scheduledReportId`) REFERENCES `scheduled_report_deliveries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences_enhanced` ADD CONSTRAINT `notification_preferences_enhanced_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `queue_alert_type_idx` ON `alert_queue` (`alertType`);--> statement-breakpoint
CREATE INDEX `queue_status_idx` ON `alert_queue` (`status`);--> statement-breakpoint
CREATE INDEX `queue_priority_idx` ON `alert_queue` (`priority`);--> statement-breakpoint
CREATE INDEX `queue_dedup_idx` ON `alert_queue` (`deduplicationKey`);--> statement-breakpoint
CREATE INDEX `delivery_recipient_idx` ON `email_delivery_log` (`recipientEmail`);--> statement-breakpoint
CREATE INDEX `delivery_type_idx` ON `email_delivery_log` (`emailType`);--> statement-breakpoint
CREATE INDEX `delivery_status_idx` ON `email_delivery_log` (`status`);--> statement-breakpoint
CREATE INDEX `delivery_sent_idx` ON `email_delivery_log` (`sentAt`);--> statement-breakpoint
CREATE INDEX `delivery_report_idx` ON `email_delivery_log` (`scheduledReportId`);--> statement-breakpoint
CREATE INDEX `inst_org_name_idx` ON `institutional_subscribers` (`organizationName`);--> statement-breakpoint
CREATE INDEX `inst_org_type_idx` ON `institutional_subscribers` (`organizationType`);--> statement-breakpoint
CREATE INDEX `inst_primary_email_idx` ON `institutional_subscribers` (`primaryContactEmail`);--> statement-breakpoint
CREATE INDEX `inst_active_idx` ON `institutional_subscribers` (`isActive`);--> statement-breakpoint
CREATE INDEX `notification_user_idx` ON `notification_preferences_enhanced` (`userId`);--> statement-breakpoint
CREATE INDEX `notification_email_idx` ON `notification_preferences_enhanced` (`email`);--> statement-breakpoint
CREATE INDEX `notification_active_idx` ON `notification_preferences_enhanced` (`isActive`);--> statement-breakpoint
CREATE INDEX `notification_verification_idx` ON `notification_preferences_enhanced` (`verificationToken`);--> statement-breakpoint
CREATE INDEX `scheduled_report_type_idx` ON `scheduled_report_deliveries` (`reportType`);--> statement-breakpoint
CREATE INDEX `scheduled_for_idx` ON `scheduled_report_deliveries` (`scheduledFor`);--> statement-breakpoint
CREATE INDEX `generation_status_idx` ON `scheduled_report_deliveries` (`generationStatus`);
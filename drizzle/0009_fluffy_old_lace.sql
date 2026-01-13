CREATE TABLE `banking_sector_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`jurisdiction` enum('aden','sanaa','national') NOT NULL,
	`totalBanks` int,
	`totalAssets` decimal(20,2),
	`totalDeposits` decimal(20,2),
	`totalLoans` decimal(20,2),
	`loanToDepositRatio` decimal(5,2),
	`averageCAR` decimal(5,2),
	`averageNPL` decimal(5,2),
	`foreignReserves` decimal(20,2),
	`confidenceRating` enum('A','B','C','D') NOT NULL DEFAULT 'C',
	`sourceId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `banking_sector_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `date_jurisdiction_unique` UNIQUE(`date`,`jurisdiction`)
);
--> statement-breakpoint
CREATE TABLE `cby_directives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`directiveNumber` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`directiveType` enum('circular','regulation','law','decree','instruction','guideline','notice','amendment') NOT NULL,
	`category` varchar(100),
	`issuingAuthority` enum('cby_aden','cby_sanaa','government','parliament') NOT NULL,
	`issueDate` timestamp NOT NULL,
	`effectiveDate` timestamp,
	`expiryDate` timestamp,
	`summary` text,
	`summaryAr` text,
	`fullTextUrl` text,
	`pdfFileKey` varchar(255),
	`status` enum('active','superseded','expired','draft') NOT NULL DEFAULT 'active',
	`supersededBy` int,
	`affectedEntities` json,
	`impactLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`sourceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cby_directives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commercial_banks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`acronym` varchar(50),
	`swiftCode` varchar(20),
	`licenseNumber` varchar(100),
	`bankType` enum('commercial','islamic','specialized','microfinance') NOT NULL,
	`jurisdiction` enum('aden','sanaa','both') NOT NULL,
	`ownership` enum('state','private','mixed','foreign') NOT NULL DEFAULT 'private',
	`operationalStatus` enum('operational','limited','distressed','suspended','liquidation') NOT NULL DEFAULT 'operational',
	`sanctionsStatus` enum('none','ofac','un','eu','multiple') NOT NULL DEFAULT 'none',
	`totalAssets` decimal(20,2),
	`capitalAdequacyRatio` decimal(5,2),
	`nonPerformingLoans` decimal(5,2),
	`liquidityRatio` decimal(5,2),
	`returnOnAssets` decimal(5,2),
	`returnOnEquity` decimal(5,2),
	`branchCount` int,
	`employeeCount` int,
	`metricsAsOf` timestamp,
	`confidenceRating` enum('A','B','C','D') NOT NULL DEFAULT 'C',
	`sourceId` int,
	`headquarters` varchar(255),
	`website` text,
	`logoUrl` text,
	`foundedYear` int,
	`notes` text,
	`isUnderWatch` boolean NOT NULL DEFAULT false,
	`watchReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commercial_banks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executive_dashboard_widgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`executiveId` int NOT NULL,
	`widgetType` enum('kpi_card','chart','table','alert_feed','news_feed','calendar','report_generator','ai_assistant','quick_actions') NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`gridColumn` int NOT NULL DEFAULT 1,
	`gridRow` int NOT NULL DEFAULT 1,
	`gridWidth` int NOT NULL DEFAULT 1,
	`gridHeight` int NOT NULL DEFAULT 1,
	`dataSource` varchar(255),
	`filters` json,
	`refreshInterval` int DEFAULT 300,
	`isVisible` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `executive_dashboard_widgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executive_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`institution` varchar(255) NOT NULL,
	`institutionAr` varchar(255),
	`position` enum('governor','deputy_governor','board_member','director','minister','deputy_minister','advisor') NOT NULL,
	`department` varchar(255),
	`appointmentDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`photoUrl` text,
	`biography` text,
	`biographyAr` text,
	`education` json,
	`previousPositions` json,
	`policyFocus` json,
	`keyInitiatives` json,
	`email` varchar(320),
	`phone` varchar(50),
	`sourceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `executive_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`submittedByUserId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`description` text,
	`dataCategory` enum('exchange_rates','monetary_reserves','banking_statistics','fiscal_data','trade_data','price_indices','employment_data','sector_reports','regulatory_updates','other') NOT NULL,
	`timePeriod` varchar(100),
	`fileType` enum('excel','csv','pdf','api','json','other') NOT NULL,
	`fileKey` varchar(255),
	`fileUrl` text,
	`fileName` varchar(255),
	`fileSize` int,
	`status` enum('draft','submitted','under_review','clarification_needed','approved','published','rejected') NOT NULL DEFAULT 'draft',
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`rejectionReason` text,
	`publishedAt` timestamp,
	`publishedDatasetId` int,
	`submittedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`acronym` varchar(50),
	`organizationType` enum('central_bank','commercial_bank','ministry','statistical_office','international_org','research_institution','ngo','other') NOT NULL,
	`partnershipStatus` enum('active','pending','suspended','expired') NOT NULL DEFAULT 'pending',
	`partnershipStartDate` timestamp,
	`partnershipEndDate` timestamp,
	`primaryContactName` varchar(255),
	`primaryContactEmail` varchar(320),
	`primaryContactPhone` varchar(50),
	`totalContributions` int NOT NULL DEFAULT 0,
	`publishedContributions` int NOT NULL DEFAULT 0,
	`pendingContributions` int NOT NULL DEFAULT 0,
	`rejectedContributions` int NOT NULL DEFAULT 0,
	`agreementFileKey` varchar(255),
	`agreementFileUrl` text,
	`dataCategories` json,
	`logoUrl` text,
	`website` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `banking_sector_metrics` ADD CONSTRAINT `banking_sector_metrics_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cby_directives` ADD CONSTRAINT `cby_directives_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commercial_banks` ADD CONSTRAINT `commercial_banks_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `executive_dashboard_widgets` ADD CONSTRAINT `executive_dashboard_widgets_executiveId_executive_profiles_id_fk` FOREIGN KEY (`executiveId`) REFERENCES `executive_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `executive_profiles` ADD CONSTRAINT `executive_profiles_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_contributions` ADD CONSTRAINT `partner_contributions_organizationId_partner_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `partner_organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_contributions` ADD CONSTRAINT `partner_contributions_submittedByUserId_users_id_fk` FOREIGN KEY (`submittedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_contributions` ADD CONSTRAINT `partner_contributions_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_contributions` ADD CONSTRAINT `partner_contributions_publishedDatasetId_datasets_id_fk` FOREIGN KEY (`publishedDatasetId`) REFERENCES `datasets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sector_date_idx` ON `banking_sector_metrics` (`date`);--> statement-breakpoint
CREATE INDEX `sector_jurisdiction_idx` ON `banking_sector_metrics` (`jurisdiction`);--> statement-breakpoint
CREATE INDEX `directive_number_idx` ON `cby_directives` (`directiveNumber`);--> statement-breakpoint
CREATE INDEX `directive_type_idx` ON `cby_directives` (`directiveType`);--> statement-breakpoint
CREATE INDEX `issuing_authority_idx` ON `cby_directives` (`issuingAuthority`);--> statement-breakpoint
CREATE INDEX `issue_date_idx` ON `cby_directives` (`issueDate`);--> statement-breakpoint
CREATE INDEX `directive_status_idx` ON `cby_directives` (`status`);--> statement-breakpoint
CREATE INDEX `directive_category_idx` ON `cby_directives` (`category`);--> statement-breakpoint
CREATE INDEX `bank_name_idx` ON `commercial_banks` (`name`);--> statement-breakpoint
CREATE INDEX `bank_jurisdiction_idx` ON `commercial_banks` (`jurisdiction`);--> statement-breakpoint
CREATE INDEX `bank_type_idx` ON `commercial_banks` (`bankType`);--> statement-breakpoint
CREATE INDEX `bank_status_idx` ON `commercial_banks` (`operationalStatus`);--> statement-breakpoint
CREATE INDEX `bank_sanctions_idx` ON `commercial_banks` (`sanctionsStatus`);--> statement-breakpoint
CREATE INDEX `widget_executive_idx` ON `executive_dashboard_widgets` (`executiveId`);--> statement-breakpoint
CREATE INDEX `widget_type_idx` ON `executive_dashboard_widgets` (`widgetType`);--> statement-breakpoint
CREATE INDEX `exec_name_idx` ON `executive_profiles` (`name`);--> statement-breakpoint
CREATE INDEX `exec_institution_idx` ON `executive_profiles` (`institution`);--> statement-breakpoint
CREATE INDEX `exec_position_idx` ON `executive_profiles` (`position`);--> statement-breakpoint
CREATE INDEX `exec_is_active_idx` ON `executive_profiles` (`isActive`);--> statement-breakpoint
CREATE INDEX `contribution_org_idx` ON `partner_contributions` (`organizationId`);--> statement-breakpoint
CREATE INDEX `contribution_submitter_idx` ON `partner_contributions` (`submittedByUserId`);--> statement-breakpoint
CREATE INDEX `contribution_status_idx` ON `partner_contributions` (`status`);--> statement-breakpoint
CREATE INDEX `contribution_category_idx` ON `partner_contributions` (`dataCategory`);--> statement-breakpoint
CREATE INDEX `contribution_submitted_at_idx` ON `partner_contributions` (`submittedAt`);--> statement-breakpoint
CREATE INDEX `partner_org_name_idx` ON `partner_organizations` (`name`);--> statement-breakpoint
CREATE INDEX `partner_org_type_idx` ON `partner_organizations` (`organizationType`);--> statement-breakpoint
CREATE INDEX `partner_org_status_idx` ON `partner_organizations` (`partnershipStatus`);
CREATE TABLE `publication_authors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicationId` int NOT NULL,
	`authorId` int NOT NULL,
	`authorOrder` int NOT NULL DEFAULT 1,
	`isCorresponding` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publication_authors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`readingListId` int NOT NULL,
	`publicationId` int NOT NULL,
	`notes` text,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reading_list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_authors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`affiliation` varchar(255),
	`affiliationAr` varchar(255),
	`orcid` varchar(50),
	`email` varchar(320),
	`bio` text,
	`bioAr` text,
	`profileUrl` text,
	`publicationCount` int NOT NULL DEFAULT 0,
	`citationCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `research_authors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_completeness_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`organizationId` int,
	`expectedPublicationType` varchar(100) NOT NULL,
	`expectedTitle` varchar(500),
	`isFound` boolean NOT NULL DEFAULT false,
	`publicationId` int,
	`notes` text,
	`lastCheckedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `research_completeness_audit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_ingestion_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`organizationId` int,
	`sourceType` enum('api','rss','scrape','oai_pmh','manual') NOT NULL,
	`endpoint` text,
	`apiKey` varchar(255),
	`config` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastFetchAt` timestamp,
	`lastFetchStatus` enum('success','failed','partial'),
	`lastFetchCount` int,
	`totalIngested` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `research_ingestion_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`acronym` varchar(50),
	`type` enum('ifi','un_agency','bilateral_donor','gulf_fund','think_tank','academic','government','central_bank','ngo','private_sector','other') NOT NULL,
	`country` varchar(100),
	`website` text,
	`logoUrl` text,
	`description` text,
	`descriptionAr` text,
	`publicationCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `research_organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_publications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`abstract` text,
	`abstractAr` text,
	`publicationType` enum('research_paper','working_paper','policy_brief','technical_note','case_study','statistical_bulletin','sanctions_notice','presentation','evaluation_report','journal_article','book_chapter','thesis','dataset_documentation','methodology_note','survey_report','market_bulletin','economic_monitor','article_iv','country_report') NOT NULL,
	`researchCategory` enum('macroeconomic_analysis','banking_sector','monetary_policy','fiscal_policy','trade_external','poverty_development','conflict_economics','humanitarian_finance','split_system_analysis','labor_market','food_security','energy_sector','infrastructure','agriculture','health_sector','education','governance','sanctions_compliance') NOT NULL,
	`dataCategory` enum('economic_growth','inflation','employment','fiscal_policy','monetary_policy','trade_investment','social_indicators','humanitarian_aid','exchange_rates','banking_finance','public_debt','remittances','commodity_prices'),
	`dataType` enum('time_series','survey','spatial','qualitative','cross_sectional','panel','mixed_methods'),
	`geographicScope` enum('national','governorate','district','regional_comparison','international_comparison') DEFAULT 'national',
	`publicationDate` timestamp,
	`publicationYear` int NOT NULL,
	`publicationMonth` int,
	`publicationQuarter` int,
	`timeCoverageStart` int,
	`timeCoverageEnd` int,
	`organizationId` int,
	`externalId` varchar(255),
	`fileKey` varchar(255),
	`fileUrl` text,
	`mimeType` varchar(100),
	`fileSize` int,
	`sourceUrl` text,
	`doi` varchar(255),
	`isbn` varchar(50),
	`issn` varchar(50),
	`language` enum('en','ar','fr','other') DEFAULT 'en',
	`hasArabicVersion` boolean DEFAULT false,
	`isPeerReviewed` boolean DEFAULT false,
	`hasDataset` boolean DEFAULT false,
	`linkedDatasetIds` json,
	`downloadCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`citationCount` int NOT NULL DEFAULT 0,
	`altmetricScore` decimal(10,2),
	`keywords` json,
	`keywordsAr` json,
	`tags` json,
	`citationText` text,
	`bibtex` text,
	`status` enum('draft','pending_review','published','archived') NOT NULL DEFAULT 'published',
	`isFeatured` boolean DEFAULT false,
	`isRecurring` boolean DEFAULT false,
	`recurringFrequency` varchar(50),
	`uploaderId` int,
	`reviewerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `research_publications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topic_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`keywords` json NOT NULL,
	`categories` json,
	`organizations` json,
	`frequency` enum('immediate','daily','weekly') NOT NULL DEFAULT 'daily',
	`isActive` boolean NOT NULL DEFAULT true,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topic_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`publicationId` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_reading_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublic` boolean DEFAULT false,
	`itemCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_reading_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `publication_authors` ADD CONSTRAINT `publication_authors_publicationId_research_publications_id_fk` FOREIGN KEY (`publicationId`) REFERENCES `research_publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_authors` ADD CONSTRAINT `publication_authors_authorId_research_authors_id_fk` FOREIGN KEY (`authorId`) REFERENCES `research_authors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reading_list_items` ADD CONSTRAINT `reading_list_items_readingListId_user_reading_lists_id_fk` FOREIGN KEY (`readingListId`) REFERENCES `user_reading_lists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reading_list_items` ADD CONSTRAINT `reading_list_items_publicationId_research_publications_id_fk` FOREIGN KEY (`publicationId`) REFERENCES `research_publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_completeness_audit` ADD CONSTRAINT `research_completeness_audit_organizationId_research_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `research_organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_completeness_audit` ADD CONSTRAINT `research_completeness_audit_publicationId_research_publications_id_fk` FOREIGN KEY (`publicationId`) REFERENCES `research_publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_ingestion_sources` ADD CONSTRAINT `research_ingestion_sources_organizationId_research_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `research_organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_publications` ADD CONSTRAINT `research_publications_organizationId_research_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `research_organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_publications` ADD CONSTRAINT `research_publications_uploaderId_users_id_fk` FOREIGN KEY (`uploaderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_publications` ADD CONSTRAINT `research_publications_reviewerId_users_id_fk` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `topic_alerts` ADD CONSTRAINT `topic_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_bookmarks` ADD CONSTRAINT `user_bookmarks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_bookmarks` ADD CONSTRAINT `user_bookmarks_publicationId_research_publications_id_fk` FOREIGN KEY (`publicationId`) REFERENCES `research_publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_reading_lists` ADD CONSTRAINT `user_reading_lists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `publication_idx` ON `publication_authors` (`publicationId`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `publication_authors` (`authorId`);--> statement-breakpoint
CREATE INDEX `reading_list_idx` ON `reading_list_items` (`readingListId`);--> statement-breakpoint
CREATE INDEX `publication_idx` ON `reading_list_items` (`publicationId`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `research_authors` (`name`);--> statement-breakpoint
CREATE INDEX `affiliation_idx` ON `research_authors` (`affiliation`);--> statement-breakpoint
CREATE INDEX `year_idx` ON `research_completeness_audit` (`year`);--> statement-breakpoint
CREATE INDEX `organization_idx` ON `research_completeness_audit` (`organizationId`);--> statement-breakpoint
CREATE INDEX `is_found_idx` ON `research_completeness_audit` (`isFound`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `research_ingestion_sources` (`name`);--> statement-breakpoint
CREATE INDEX `source_type_idx` ON `research_ingestion_sources` (`sourceType`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `research_ingestion_sources` (`isActive`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `research_organizations` (`name`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `research_organizations` (`type`);--> statement-breakpoint
CREATE INDEX `acronym_idx` ON `research_organizations` (`acronym`);--> statement-breakpoint
CREATE INDEX `title_idx` ON `research_publications` (`title`);--> statement-breakpoint
CREATE INDEX `publication_type_idx` ON `research_publications` (`publicationType`);--> statement-breakpoint
CREATE INDEX `research_category_idx` ON `research_publications` (`researchCategory`);--> statement-breakpoint
CREATE INDEX `publication_year_idx` ON `research_publications` (`publicationYear`);--> statement-breakpoint
CREATE INDEX `organization_idx` ON `research_publications` (`organizationId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `research_publications` (`status`);--> statement-breakpoint
CREATE INDEX `is_peer_reviewed_idx` ON `research_publications` (`isPeerReviewed`);--> statement-breakpoint
CREATE INDEX `has_dataset_idx` ON `research_publications` (`hasDataset`);--> statement-breakpoint
CREATE INDEX `language_idx` ON `research_publications` (`language`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `topic_alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `topic_alerts` (`isActive`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `user_bookmarks` (`userId`);--> statement-breakpoint
CREATE INDEX `publication_idx` ON `user_bookmarks` (`publicationId`);--> statement-breakpoint
CREATE INDEX `unique_bookmark` ON `user_bookmarks` (`userId`,`publicationId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `user_reading_lists` (`userId`);
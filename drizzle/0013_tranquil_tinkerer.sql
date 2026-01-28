CREATE TABLE `api_registration_instructions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`registrationUrl` text NOT NULL,
	`documentationUrl` text,
	`credentialType` enum('api_key','oauth_token','basic_auth','certificate') NOT NULL,
	`steps` json NOT NULL,
	`requiresInstitutionalEmail` boolean NOT NULL DEFAULT false,
	`requiresApproval` boolean NOT NULL DEFAULT false,
	`approvalTimeline` varchar(100),
	`requiresPayment` boolean NOT NULL DEFAULT false,
	`pricingInfo` text,
	`keyFormat` varchar(255),
	`keyLocation` varchar(100),
	`keyHeaderName` varchar(100),
	`exampleRequest` text,
	`defaultRateLimit` int,
	`rateLimitPeriod` varchar(50),
	`rateLimitNotes` text,
	`commonIssues` json,
	`tipsAndTricks` json,
	`lastVerifiedAt` timestamp,
	`verifiedBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_registration_instructions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `source_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`contactType` enum('api_support','data_team','general','partnership') NOT NULL,
	`contactName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`department` varchar(255),
	`role` varchar(255),
	`notes` text,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `source_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `source_credentials` ADD `validationMessage` text;--> statement-breakpoint
ALTER TABLE `source_credentials` ADD `expiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `source_credentials` ADD `rateLimit` int;--> statement-breakpoint
ALTER TABLE `source_credentials` ADD `rateLimitPeriod` varchar(50);--> statement-breakpoint
ALTER TABLE `api_registration_instructions` ADD CONSTRAINT `api_registration_instructions_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `source_contacts` ADD CONSTRAINT `source_contacts_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `api_reg_source_idx` ON `api_registration_instructions` (`sourceId`);--> statement-breakpoint
CREATE INDEX `api_reg_cred_type_idx` ON `api_registration_instructions` (`credentialType`);--> statement-breakpoint
CREATE INDEX `source_contact_source_idx` ON `source_contacts` (`sourceId`);--> statement-breakpoint
CREATE INDEX `source_contact_email_idx` ON `source_contacts` (`email`);--> statement-breakpoint
CREATE INDEX `source_contact_primary_idx` ON `source_contacts` (`isPrimary`);--> statement-breakpoint
CREATE INDEX `source_cred_expiry_idx` ON `source_credentials` (`expiresAt`);
CREATE TABLE `access_needed_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` varchar(100) NOT NULL,
	`sourceName` varchar(200) NOT NULL,
	`accessType` enum('needs_key','partnership_required','subscription','restricted') NOT NULL,
	`organizationName` varchar(200),
	`organizationEmail` varchar(200),
	`organizationWebsite` varchar(500),
	`blockedDatasets` json,
	`benefitsForYeto` text,
	`benefitsForPartner` text,
	`outreachStatus` enum('queued','draft_ready','sent','responded','successful','failed') DEFAULT 'queued',
	`emailDraftId` int,
	`priority` enum('critical','high','medium','low') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `access_needed_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(100),
	`userRole` varchar(50),
	`action` varchar(100) NOT NULL,
	`actionCategory` enum('user_management','data_management','publication','moderation','configuration','security','incident','other') DEFAULT 'other',
	`targetType` varchar(50),
	`targetId` varchar(100),
	`targetName` varchar(200),
	`previousValue` json,
	`newValue` json,
	`ipAddress` varchar(50),
	`userAgent` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`category` enum('pipeline_outage','data_anomaly','security','performance','integration','other') DEFAULT 'other',
	`status` enum('open','investigating','mitigating','resolved','closed') NOT NULL DEFAULT 'open',
	`affectedDatasets` json,
	`affectedPublications` json,
	`affectedVipAlerts` json,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`closedAt` timestamp,
	`assignedTo` int,
	`postMortemUrl` varchar(500),
	`rootCause` text,
	`preventionMeasures` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `admin_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_outbox` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toEmail` varchar(200) NOT NULL,
	`toName` varchar(200),
	`subject` varchar(500) NOT NULL,
	`bodyHtml` text NOT NULL,
	`bodyText` text,
	`templateType` enum('initial_outreach','follow_up','data_sharing_agreement','thank_you') DEFAULT 'initial_outreach',
	`accessNeededItemId` int,
	`status` enum('draft','queued','sent','failed','bounced') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`sentBy` int,
	`failureReason` text,
	`responseReceived` boolean DEFAULT false,
	`responseReceivedAt` timestamp,
	`responseNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `admin_outbox_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` varchar(50) NOT NULL,
	`nameEn` varchar(200) NOT NULL,
	`nameAr` varchar(200),
	`datasetFamily` varchar(100) NOT NULL,
	`schemaVersion` varchar(20) NOT NULL DEFAULT '1.0',
	`requiredFields` json,
	`allowedUnits` json,
	`frequency` enum('daily','weekly','monthly','quarterly','annual','irregular') NOT NULL,
	`geoLevel` enum('national','governorate','district','locality') DEFAULT 'national',
	`regimeTagRules` json,
	`validationRules` json,
	`requiredMetadata` json,
	`privacyClassification` enum('public','restricted','confidential') NOT NULL DEFAULT 'restricted',
	`publicAggregationRule` text,
	`minimumCellSize` int DEFAULT 5,
	`allowedFormats` json DEFAULT ('["csv","xlsx","json"]'),
	`templateFileUrl` varchar(500),
	`status` enum('draft','active','deprecated') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `data_contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `data_contracts_contractId_unique` UNIQUE(`contractId`)
);
--> statement-breakpoint
CREATE TABLE `governance_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyKey` varchar(100) NOT NULL,
	`policyName` varchar(200) NOT NULL,
	`description` text,
	`policyValue` json NOT NULL,
	`defaultValue` json,
	`minValue` json,
	`maxValue` json,
	`allowedValues` json,
	`category` enum('evidence','publication','moderation','security','freshness','quality','other') DEFAULT 'other',
	`isActive` boolean DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedBy` int,
	CONSTRAINT `governance_policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `governance_policies_policyKey_unique` UNIQUE(`policyKey`)
);
--> statement-breakpoint
CREATE TABLE `moderation_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`validationId` int,
	`status` enum('received','validating','failed_validation','quarantined','pending_review','approved_restricted','approved_public_aggregate','published','rejected') NOT NULL DEFAULT 'received',
	`publishingLane` enum('lane_a_public','lane_b_restricted','none') DEFAULT 'none',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`qaSignoffBy` int,
	`qaSignoffAt` timestamp,
	`qaSignoffNotes` text,
	`evidenceCoverage` decimal(5,2),
	`evidencePackId` int,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderation_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submission_validations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`contractId` int,
	`layer1Passed` boolean DEFAULT false,
	`layer1Errors` json,
	`layer2Passed` boolean DEFAULT false,
	`layer2Issues` json,
	`layer3Passed` boolean DEFAULT false,
	`contradictionsFound` json,
	`overallPassed` boolean DEFAULT false,
	`validationScore` decimal(5,2),
	`validationReportUrl` varchar(500),
	`validatedAt` timestamp NOT NULL DEFAULT (now()),
	`validatedBy` varchar(50) DEFAULT 'system',
	CONSTRAINT `submission_validations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_outbox` ADD CONSTRAINT `admin_outbox_accessNeededItemId_access_needed_items_id_fk` FOREIGN KEY (`accessNeededItemId`) REFERENCES `access_needed_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moderation_queue` ADD CONSTRAINT `moderation_queue_submissionId_partner_submissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `partner_submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moderation_queue` ADD CONSTRAINT `moderation_queue_validationId_submission_validations_id_fk` FOREIGN KEY (`validationId`) REFERENCES `submission_validations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_validations` ADD CONSTRAINT `submission_validations_submissionId_partner_submissions_id_fk` FOREIGN KEY (`submissionId`) REFERENCES `partner_submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_validations` ADD CONSTRAINT `submission_validations_contractId_data_contracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `data_contracts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `access_source_idx` ON `access_needed_items` (`sourceId`);--> statement-breakpoint
CREATE INDEX `access_status_idx` ON `access_needed_items` (`outreachStatus`);--> statement-breakpoint
CREATE INDEX `access_type_idx` ON `access_needed_items` (`accessType`);--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `admin_audit_log` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `admin_audit_log` (`action`);--> statement-breakpoint
CREATE INDEX `audit_category_idx` ON `admin_audit_log` (`actionCategory`);--> statement-breakpoint
CREATE INDEX `audit_target_idx` ON `admin_audit_log` (`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `admin_audit_log` (`createdAt`);--> statement-breakpoint
CREATE INDEX `incident_severity_idx` ON `admin_incidents` (`severity`);--> statement-breakpoint
CREATE INDEX `incident_status_idx` ON `admin_incidents` (`status`);--> statement-breakpoint
CREATE INDEX `incident_category_idx` ON `admin_incidents` (`category`);--> statement-breakpoint
CREATE INDEX `outbox_status_idx` ON `admin_outbox` (`status`);--> statement-breakpoint
CREATE INDEX `outbox_access_item_idx` ON `admin_outbox` (`accessNeededItemId`);--> statement-breakpoint
CREATE INDEX `contract_id_idx` ON `data_contracts` (`contractId`);--> statement-breakpoint
CREATE INDEX `contract_family_idx` ON `data_contracts` (`datasetFamily`);--> statement-breakpoint
CREATE INDEX `contract_status_idx` ON `data_contracts` (`status`);--> statement-breakpoint
CREATE INDEX `policy_key_idx` ON `governance_policies` (`policyKey`);--> statement-breakpoint
CREATE INDEX `policy_category_idx` ON `governance_policies` (`category`);--> statement-breakpoint
CREATE INDEX `moderation_submission_idx` ON `moderation_queue` (`submissionId`);--> statement-breakpoint
CREATE INDEX `moderation_status_idx` ON `moderation_queue` (`status`);--> statement-breakpoint
CREATE INDEX `moderation_lane_idx` ON `moderation_queue` (`publishingLane`);--> statement-breakpoint
CREATE INDEX `validation_submission_idx` ON `submission_validations` (`submissionId`);--> statement-breakpoint
CREATE INDEX `validation_contract_idx` ON `submission_validations` (`contractId`);
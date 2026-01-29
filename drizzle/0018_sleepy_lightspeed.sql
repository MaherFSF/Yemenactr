CREATE TABLE `publication_changelog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicationRunId` int NOT NULL,
	`changeType` enum('correction','revision','retraction','update','clarification') NOT NULL,
	`titleEn` varchar(200) NOT NULL,
	`titleAr` varchar(200) NOT NULL,
	`descriptionEn` text NOT NULL,
	`descriptionAr` text NOT NULL,
	`affectedSections` json DEFAULT ('[]'),
	`previousValue` text,
	`newValue` text,
	`reasonEn` text,
	`reasonAr` text,
	`evidencePackId` int,
	`isPublic` boolean DEFAULT true,
	`changedBy` int,
	`changedByName` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publication_changelog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publication_evidence_bundles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicationRunId` int NOT NULL,
	`evidencePackIds` json DEFAULT ('[]'),
	`sectionCoverage` json,
	`topContradictions` json,
	`sensitivityAnalysis` json,
	`licenseSummary` json,
	`bundleUrl` varchar(500),
	`manifestUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publication_evidence_bundles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publication_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int,
	`metricDate` timestamp NOT NULL,
	`runsAttempted` int DEFAULT 0,
	`runsSucceeded` int DEFAULT 0,
	`runsFailed` int DEFAULT 0,
	`avgCitationCoverage` decimal(5,2),
	`avgContradictionRate` decimal(5,2),
	`avgFreshnessLagDays` decimal(5,2),
	`autoApproved` int DEFAULT 0,
	`adminApproved` int DEFAULT 0,
	`rejected` int DEFAULT 0,
	`onTimeRate` decimal(5,2),
	`avgGenerationTimeMs` int,
	`totalViews` int DEFAULT 0,
	`totalDownloads` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publication_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publication_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`templateCode` varchar(50) NOT NULL,
	`runWindowStart` timestamp NOT NULL,
	`runWindowEnd` timestamp NOT NULL,
	`generatedAt` timestamp,
	`inputsSnapshotRefs` json,
	`outputArtifacts` json,
	`evidencePackBundleId` int,
	`contradictionsSummary` json,
	`dqafQualitySummary` json,
	`confidenceSummary` json,
	`pipelineStages` json,
	`approvalState` enum('draft','in_review','approved','published','rejected','archived') DEFAULT 'draft',
	`approvalsLog` json,
	`publicUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publication_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publication_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateCode` varchar(50) NOT NULL,
	`nameEn` varchar(200) NOT NULL,
	`nameAr` varchar(200) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`publicationType` enum('daily','weekly','monthly','quarterly','annual','shock_note') NOT NULL,
	`audience` enum('public','vip','both') NOT NULL DEFAULT 'both',
	`languages` json DEFAULT ('["en","ar"]'),
	`sections` json,
	`requiredIndicators` json DEFAULT ('[]'),
	`requiredDatasets` json DEFAULT ('[]'),
	`requiredEntities` json DEFAULT ('[]'),
	`requiredSourcesMin` int DEFAULT 3,
	`evidenceThreshold` decimal(5,2) DEFAULT '95.00',
	`contradictionPolicy` enum('show_always','show_resolved_only','hide') DEFAULT 'show_always',
	`uncertaintyPolicy` enum('show_if_published','disclose_not_published','hide') DEFAULT 'show_if_published',
	`layoutTheme` json,
	`approvalPolicy` enum('auto','admin_required','risk_based') DEFAULT 'risk_based',
	`schedule` varchar(100),
	`isActive` boolean DEFAULT true,
	`lastGeneratedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publication_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `publication_templates_templateCode_unique` UNIQUE(`templateCode`)
);
--> statement-breakpoint
CREATE INDEX `pub_changelog_run_idx` ON `publication_changelog` (`publicationRunId`);--> statement-breakpoint
CREATE INDEX `pub_changelog_type_idx` ON `publication_changelog` (`changeType`);--> statement-breakpoint
CREATE INDEX `pub_evidence_run_idx` ON `publication_evidence_bundles` (`publicationRunId`);--> statement-breakpoint
CREATE INDEX `pub_metrics_template_idx` ON `publication_metrics` (`templateId`);--> statement-breakpoint
CREATE INDEX `pub_metrics_date_idx` ON `publication_metrics` (`metricDate`);--> statement-breakpoint
CREATE INDEX `pub_run_template_idx` ON `publication_runs` (`templateId`);--> statement-breakpoint
CREATE INDEX `pub_run_state_idx` ON `publication_runs` (`approvalState`);--> statement-breakpoint
CREATE INDEX `pub_run_window_idx` ON `publication_runs` (`runWindowStart`,`runWindowEnd`);--> statement-breakpoint
CREATE INDEX `pub_template_type_idx` ON `publication_templates` (`publicationType`);--> statement-breakpoint
CREATE INDEX `pub_template_audience_idx` ON `publication_templates` (`audience`);--> statement-breakpoint
CREATE INDEX `pub_template_active_idx` ON `publication_templates` (`isActive`);
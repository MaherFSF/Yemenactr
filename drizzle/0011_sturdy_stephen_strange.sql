CREATE TABLE `chart_overlays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visualizationSpecId` int NOT NULL,
	`eventId` int NOT NULL,
	`overlayType` enum('vertical_line','shaded_region','annotation') NOT NULL,
	`config` json,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chart_overlays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_disputes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`disputeType` enum('match_accuracy','data_error','outdated_info','defamation_concern') NOT NULL,
	`relatedMatchId` int,
	`relatedEntityType` varchar(100),
	`relatedEntityId` int,
	`disputeDescription` text NOT NULL,
	`disputeDescriptionAr` text,
	`supportingEvidence` text,
	`submittedBy` int,
	`submitterEmail` varchar(320),
	`submitterOrganization` varchar(255),
	`status` enum('submitted','under_review','additional_info_requested','resolved_accepted','resolved_rejected','escalated') NOT NULL DEFAULT 'submitted',
	`resolution` text,
	`resolutionAr` text,
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`auditLog` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_disputes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entity_matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platformEntityType` enum('bank','company','individual','organization') NOT NULL,
	`platformEntityId` int NOT NULL,
	`platformEntityName` varchar(500) NOT NULL,
	`sanctionsEntryId` int NOT NULL,
	`matchType` enum('exact','fuzzy','alias','identifier') NOT NULL,
	`matchConfidence` decimal(5,2) NOT NULL,
	`matchExplanation` text NOT NULL,
	`matchExplanationAr` text,
	`verificationStatus` enum('unverified','confirmed_match','false_positive','disputed','under_review') NOT NULL DEFAULT 'unverified',
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`verificationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entity_matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `glossary_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`termId` int NOT NULL,
	`version` int NOT NULL,
	`termEn` varchar(255) NOT NULL,
	`termAr` varchar(255) NOT NULL,
	`definitionEn` text NOT NULL,
	`definitionAr` text NOT NULL,
	`yemenExampleEn` text,
	`yemenExampleAr` text,
	`relatedChartSpecId` int,
	`crossLinks` json,
	`changeReason` text,
	`changedBy` int,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `glossary_versions_id` PRIMARY KEY(`id`),
	CONSTRAINT `term_version_unique` UNIQUE(`termId`,`version`)
);
--> statement-breakpoint
CREATE TABLE `insight_miner_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`headline` varchar(255) NOT NULL,
	`headlineAr` varchar(255),
	`summary` text NOT NULL,
	`summaryAr` text,
	`supportingIndicators` json,
	`supportingEvents` json,
	`supportingSources` json,
	`confidenceScore` decimal(5,2),
	`category` enum('trend_alert','anomaly_detection','correlation_discovery','forecast_update','risk_signal') NOT NULL,
	`status` enum('pending_review','approved','rejected','incorporated') NOT NULL DEFAULT 'pending_review',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`incorporatedInReportId` int,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insight_miner_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`reportingPeriod` varchar(100),
	`htmlContent` text,
	`htmlContentAr` text,
	`pdfFileKey` varchar(255),
	`pdfFileUrl` text,
	`pdfFileKeyAr` varchar(255),
	`pdfFileUrlAr` text,
	`evidenceAppendix` json,
	`workflowStatus` enum('draft','under_review','needs_edit','pending_approval','approved','published','archived') NOT NULL DEFAULT 'draft',
	`draftedBy` int,
	`draftedAt` timestamp,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`editedBy` int,
	`editedAt` timestamp,
	`approvedBy` int,
	`approvedAt` timestamp,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_instances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`description` text,
	`descriptionAr` text,
	`templateType` enum('monthly_pulse','quarterly_outlook','annual_review','ad_hoc','executive_brief','sector_report') NOT NULL,
	`templateSpec` json NOT NULL,
	`schedule` enum('daily','weekly','monthly','quarterly','annual','manual') NOT NULL DEFAULT 'manual',
	`cronExpression` varchar(100),
	`nextRunAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sanctions_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`entryType` enum('individual','entity','vessel','aircraft') NOT NULL,
	`primaryName` varchar(500) NOT NULL,
	`primaryNameAr` varchar(500),
	`aliases` json,
	`identifiers` json,
	`designationDate` timestamp,
	`programs` json,
	`remarks` text,
	`remarksAr` text,
	`sourceEntryId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sanctions_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sanctions_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listName` varchar(255) NOT NULL,
	`listNameAr` varchar(255),
	`issuingAuthority` varchar(255) NOT NULL,
	`sourceUrl` text NOT NULL,
	`legalBasis` text,
	`lastIngestedAt` timestamp,
	`entryCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sanctions_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_evidence_packs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`sourceIds` json NOT NULL,
	`documentIds` json,
	`beforeAfterData` json,
	`confidenceRating` enum('A','B','C','D') NOT NULL,
	`notes` text,
	`notesAr` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeline_evidence_packs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visual_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`triggerType` enum('data_update','user_query','scheduled','manual') NOT NULL,
	`triggerContext` json,
	`suggestedChartType` enum('line','bar','scatter','heatmap','network','sankey','timeline','area') NOT NULL,
	`suggestedConfig` json NOT NULL,
	`aiAnnotation` text,
	`aiAnnotationAr` text,
	`annotationSources` json,
	`status` enum('pending','approved','rejected','implemented') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`implementedSpecId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visual_suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visualization_specs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`description` text,
	`descriptionAr` text,
	`chartType` enum('line','bar','scatter','heatmap','network','sankey','timeline','area','pie','donut','treemap','choropleth') NOT NULL,
	`config` json NOT NULL,
	`evidencePackRequired` boolean NOT NULL DEFAULT true,
	`confidenceRating` enum('A','B','C','D'),
	`transformationLog` json,
	`sourceIds` json,
	`datasetIds` json,
	`usedOnPages` json,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visualization_specs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chart_overlays` ADD CONSTRAINT `chart_overlays_visualizationSpecId_visualization_specs_id_fk` FOREIGN KEY (`visualizationSpecId`) REFERENCES `visualization_specs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chart_overlays` ADD CONSTRAINT `chart_overlays_eventId_economic_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `economic_events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliance_disputes` ADD CONSTRAINT `compliance_disputes_relatedMatchId_entity_matches_id_fk` FOREIGN KEY (`relatedMatchId`) REFERENCES `entity_matches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliance_disputes` ADD CONSTRAINT `compliance_disputes_submittedBy_users_id_fk` FOREIGN KEY (`submittedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compliance_disputes` ADD CONSTRAINT `compliance_disputes_resolvedBy_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `entity_matches` ADD CONSTRAINT `entity_matches_sanctionsEntryId_sanctions_entries_id_fk` FOREIGN KEY (`sanctionsEntryId`) REFERENCES `sanctions_entries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `entity_matches` ADD CONSTRAINT `entity_matches_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `glossary_versions` ADD CONSTRAINT `glossary_versions_relatedChartSpecId_visualization_specs_id_fk` FOREIGN KEY (`relatedChartSpecId`) REFERENCES `visualization_specs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `glossary_versions` ADD CONSTRAINT `glossary_versions_changedBy_users_id_fk` FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insight_miner_proposals` ADD CONSTRAINT `insight_miner_proposals_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insight_miner_proposals` ADD CONSTRAINT `imp_report_fk` FOREIGN KEY (`incorporatedInReportId`) REFERENCES `report_instances`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_instances` ADD CONSTRAINT `report_instances_templateId_report_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `report_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_instances` ADD CONSTRAINT `report_instances_draftedBy_users_id_fk` FOREIGN KEY (`draftedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_instances` ADD CONSTRAINT `report_instances_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_instances` ADD CONSTRAINT `report_instances_editedBy_users_id_fk` FOREIGN KEY (`editedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_instances` ADD CONSTRAINT `report_instances_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_templates` ADD CONSTRAINT `report_templates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sanctions_entries` ADD CONSTRAINT `sanctions_entries_listId_sanctions_lists_id_fk` FOREIGN KEY (`listId`) REFERENCES `sanctions_lists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timeline_evidence_packs` ADD CONSTRAINT `timeline_evidence_packs_eventId_economic_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `economic_events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `visual_suggestions` ADD CONSTRAINT `visual_suggestions_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `visual_suggestions` ADD CONSTRAINT `visual_suggestions_implementedSpecId_visualization_specs_id_fk` FOREIGN KEY (`implementedSpecId`) REFERENCES `visualization_specs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `visualization_specs` ADD CONSTRAINT `visualization_specs_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `viz_spec_idx` ON `chart_overlays` (`visualizationSpecId`);--> statement-breakpoint
CREATE INDEX `event_idx` ON `chart_overlays` (`eventId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `compliance_disputes` (`status`);--> statement-breakpoint
CREATE INDEX `dispute_type_idx` ON `compliance_disputes` (`disputeType`);--> statement-breakpoint
CREATE INDEX `platform_entity_idx` ON `entity_matches` (`platformEntityType`,`platformEntityId`);--> statement-breakpoint
CREATE INDEX `sanctions_entry_idx` ON `entity_matches` (`sanctionsEntryId`);--> statement-breakpoint
CREATE INDEX `verification_status_idx` ON `entity_matches` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `insight_miner_proposals` (`status`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `insight_miner_proposals` (`category`);--> statement-breakpoint
CREATE INDEX `template_idx` ON `report_instances` (`templateId`);--> statement-breakpoint
CREATE INDEX `workflow_status_idx` ON `report_instances` (`workflowStatus`);--> statement-breakpoint
CREATE INDEX `reporting_period_idx` ON `report_instances` (`reportingPeriod`);--> statement-breakpoint
CREATE INDEX `template_type_idx` ON `report_templates` (`templateType`);--> statement-breakpoint
CREATE INDEX `schedule_idx` ON `report_templates` (`schedule`);--> statement-breakpoint
CREATE INDEX `list_idx` ON `sanctions_entries` (`listId`);--> statement-breakpoint
CREATE INDEX `entry_type_idx` ON `sanctions_entries` (`entryType`);--> statement-breakpoint
CREATE INDEX `primary_name_idx` ON `sanctions_entries` (`primaryName`);--> statement-breakpoint
CREATE INDEX `list_name_idx` ON `sanctions_lists` (`listName`);--> statement-breakpoint
CREATE INDEX `event_idx` ON `timeline_evidence_packs` (`eventId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `visual_suggestions` (`status`);--> statement-breakpoint
CREATE INDEX `trigger_type_idx` ON `visual_suggestions` (`triggerType`);--> statement-breakpoint
CREATE INDEX `chart_type_idx` ON `visualization_specs` (`chartType`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `visualization_specs` (`name`);
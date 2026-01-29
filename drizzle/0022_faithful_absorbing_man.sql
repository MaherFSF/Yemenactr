CREATE TABLE `graph_health_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`measuredAt` timestamp NOT NULL DEFAULT (now()),
	`docsLinkedToSectors` decimal(5,2),
	`updatesLinkedToEntities` decimal(5,2),
	`kpisWithRelatedDocs` decimal(5,2),
	`entitiesWithLinks` decimal(5,2),
	`eventsWithEvidence` decimal(5,2),
	`linksWithEvidence` decimal(5,2),
	`linksWithAnchors` decimal(5,2),
	`averageStrengthScore` decimal(5,4),
	`totalLinks` int DEFAULT 0,
	`activeLinks` int DEFAULT 0,
	`pendingReviewLinks` int DEFAULT 0,
	`deprecatedLinks` int DEFAULT 0,
	`linkTypeDistribution` json,
	`orphanDocuments` int DEFAULT 0,
	`orphanEntities` int DEFAULT 0,
	`orphanEvents` int DEFAULT 0,
	`brokenLinks` int DEFAULT 0,
	`brokenLinkDetails` json,
	`newLinksToday` int DEFAULT 0,
	`removedLinksToday` int DEFAULT 0,
	`driftScore` decimal(5,4),
	CONSTRAINT `graph_health_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `graph_review_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkId` int NOT NULL,
	`status` enum('pending','approved','rejected','merged') DEFAULT 'pending',
	`priority` enum('high','medium','low') DEFAULT 'medium',
	`evidenceSummary` text,
	`evidenceAnchors` json,
	`similarLinks` json,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewAction` enum('approve','reject','merge','edit'),
	`reviewNotes` text,
	`mergedIntoLinkId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `graph_review_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_graph_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkType` enum('publishes','funds','implements','located_in','mentions','measures','affects','related_to','contradicts','supersedes','update_signal','suspected_link','temporal_cooccurrence','cites','derived_from','part_of','regulates','operates_in') NOT NULL,
	`srcType` enum('entity','document','series','event','project','update','sector','indicator','dataset','geography') NOT NULL,
	`srcId` int NOT NULL,
	`srcLabel` varchar(255),
	`dstType` enum('entity','document','series','event','project','update','sector','indicator','dataset','geography') NOT NULL,
	`dstId` int NOT NULL,
	`dstLabel` varchar(255),
	`strengthScore` decimal(5,4) DEFAULT '0.5',
	`confidenceLevel` enum('high','medium','low','uncertain') DEFAULT 'medium',
	`method` enum('rule_based','extracted_from_anchor','structured_data','tag_based','embedding_similarity','manual','imported') NOT NULL,
	`evidencePackId` int,
	`ruleId` int,
	`anchorId` int,
	`evidenceSnippet` text,
	`evidenceUrl` varchar(500),
	`status` enum('active','needs_review','deprecated','rejected') DEFAULT 'active',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`bidirectional` boolean DEFAULT false,
	`regimeTag` enum('aden','sanaa','unified','pre_split'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `knowledge_graph_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `link_rule_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`status` enum('running','completed','failed') DEFAULT 'running',
	`itemsProcessed` int DEFAULT 0,
	`linksCreated` int DEFAULT 0,
	`linksSuggested` int DEFAULT 0,
	`linksSkipped` int DEFAULT 0,
	`errors` int DEFAULT 0,
	`errorLog` json,
	`triggeredBy` enum('nightly','manual','on_ingest') DEFAULT 'manual',
	`triggeredByUser` int,
	CONSTRAINT `link_rule_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `link_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` varchar(50) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`descriptionEn` text,
	`descriptionAr` text,
	`inputTypes` json NOT NULL,
	`matchLogic` json NOT NULL,
	`minEvidenceRequirements` json,
	`outputLinkType` varchar(50) NOT NULL,
	`strengthFormula` varchar(255) DEFAULT '0.5',
	`isPublicSafe` boolean DEFAULT false,
	`autoApprove` boolean DEFAULT false,
	`isEnabled` boolean DEFAULT true,
	`priority` int DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `link_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `link_rules_ruleId_unique` UNIQUE(`ruleId`)
);
--> statement-breakpoint
CREATE TABLE `related_items_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` varchar(50) NOT NULL,
	`sourceId` int NOT NULL,
	`relatedDocuments` json,
	`relatedEntities` json,
	`relatedDatasets` json,
	`relatedEvents` json,
	`contradictions` json,
	`cachedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`isValid` boolean DEFAULT true,
	CONSTRAINT `related_items_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `story_mode_narratives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` varchar(50) NOT NULL,
	`subjectType` enum('sector','entity','event','period','indicator') NOT NULL,
	`subjectId` int,
	`subjectLabel` varchar(255),
	`periodStart` date,
	`periodEnd` date,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`whatHappenedEn` text,
	`whatHappenedAr` text,
	`dataChangesEn` text,
	`dataChangesAr` text,
	`dataChangesCharts` json,
	`documentInsightsEn` text,
	`documentInsightsAr` text,
	`citedDocuments` json,
	`contradictionsEn` text,
	`contradictionsAr` text,
	`uncertaintyLevel` enum('low','medium','high') DEFAULT 'medium',
	`roleLensInsights` json,
	`evidencePackId` int,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`generatedBy` enum('system','admin') DEFAULT 'system',
	`evidenceCoverage` decimal(5,2),
	`isPublished` boolean DEFAULT false,
	`pdfUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `story_mode_narratives_id` PRIMARY KEY(`id`),
	CONSTRAINT `story_mode_narratives_storyId_unique` UNIQUE(`storyId`)
);
--> statement-breakpoint
ALTER TABLE `graph_review_queue` ADD CONSTRAINT `graph_review_queue_linkId_knowledge_graph_links_id_fk` FOREIGN KEY (`linkId`) REFERENCES `knowledge_graph_links`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `graph_review_queue` ADD CONSTRAINT `graph_review_queue_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `graph_review_queue` ADD CONSTRAINT `graph_review_queue_mergedIntoLinkId_knowledge_graph_links_id_fk` FOREIGN KEY (`mergedIntoLinkId`) REFERENCES `knowledge_graph_links`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_graph_links` ADD CONSTRAINT `knowledge_graph_links_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_graph_links` ADD CONSTRAINT `knowledge_graph_links_ruleId_link_rules_id_fk` FOREIGN KEY (`ruleId`) REFERENCES `link_rules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_graph_links` ADD CONSTRAINT `knowledge_graph_links_anchorId_citation_anchors_id_fk` FOREIGN KEY (`anchorId`) REFERENCES `citation_anchors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_graph_links` ADD CONSTRAINT `knowledge_graph_links_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_graph_links` ADD CONSTRAINT `knowledge_graph_links_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `link_rule_runs` ADD CONSTRAINT `link_rule_runs_ruleId_link_rules_id_fk` FOREIGN KEY (`ruleId`) REFERENCES `link_rules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `link_rule_runs` ADD CONSTRAINT `link_rule_runs_triggeredByUser_users_id_fk` FOREIGN KEY (`triggeredByUser`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `link_rules` ADD CONSTRAINT `link_rules_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `story_mode_narratives` ADD CONSTRAINT `story_mode_narratives_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `graph_health_measured_idx` ON `graph_health_metrics` (`measuredAt`);--> statement-breakpoint
CREATE INDEX `graph_review_link_idx` ON `graph_review_queue` (`linkId`);--> statement-breakpoint
CREATE INDEX `graph_review_status_idx` ON `graph_review_queue` (`status`);--> statement-breakpoint
CREATE INDEX `graph_review_priority_idx` ON `graph_review_queue` (`priority`);--> statement-breakpoint
CREATE INDEX `kg_link_type_idx` ON `knowledge_graph_links` (`linkType`);--> statement-breakpoint
CREATE INDEX `kg_src_idx` ON `knowledge_graph_links` (`srcType`,`srcId`);--> statement-breakpoint
CREATE INDEX `kg_dst_idx` ON `knowledge_graph_links` (`dstType`,`dstId`);--> statement-breakpoint
CREATE INDEX `kg_status_idx` ON `knowledge_graph_links` (`status`);--> statement-breakpoint
CREATE INDEX `kg_method_idx` ON `knowledge_graph_links` (`method`);--> statement-breakpoint
CREATE INDEX `kg_strength_idx` ON `knowledge_graph_links` (`strengthScore`);--> statement-breakpoint
CREATE INDEX `link_rule_run_rule_idx` ON `link_rule_runs` (`ruleId`);--> statement-breakpoint
CREATE INDEX `link_rule_run_status_idx` ON `link_rule_runs` (`status`);--> statement-breakpoint
CREATE INDEX `link_rule_run_started_idx` ON `link_rule_runs` (`startedAt`);--> statement-breakpoint
CREATE INDEX `link_rule_id_idx` ON `link_rules` (`ruleId`);--> statement-breakpoint
CREATE INDEX `link_rule_enabled_idx` ON `link_rules` (`isEnabled`);--> statement-breakpoint
CREATE INDEX `link_rule_priority_idx` ON `link_rules` (`priority`);--> statement-breakpoint
CREATE INDEX `related_cache_source_idx` ON `related_items_cache` (`sourceType`,`sourceId`);--> statement-breakpoint
CREATE INDEX `related_cache_valid_idx` ON `related_items_cache` (`isValid`);--> statement-breakpoint
CREATE INDEX `related_cache_expires_idx` ON `related_items_cache` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `story_story_id_idx` ON `story_mode_narratives` (`storyId`);--> statement-breakpoint
CREATE INDEX `story_subject_idx` ON `story_mode_narratives` (`subjectType`,`subjectId`);--> statement-breakpoint
CREATE INDEX `story_published_idx` ON `story_mode_narratives` (`isPublished`);
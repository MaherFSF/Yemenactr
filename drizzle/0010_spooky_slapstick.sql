CREATE TABLE `autopilot_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('ingestion_started','ingestion_completed','qa_started','qa_completed','page_generated','report_generated','publish_started','publish_completed','ticket_created','ticket_resolved','setting_changed','autopilot_paused','autopilot_resumed','error') NOT NULL,
	`summary` varchar(500) NOT NULL,
	`details` json,
	`relatedJobId` int,
	`relatedTicketId` int,
	`relatedPageRoute` varchar(255),
	`triggeredByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autopilot_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autopilot_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`settingType` enum('boolean','number','string','json') NOT NULL,
	`description` text,
	`category` enum('ingestion','qa','publishing','coverage','notifications','general') NOT NULL,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autopilot_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `autopilot_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `claim_evidence_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` varchar(36) NOT NULL,
	`evidenceType` enum('document','excerpt','dataset','observation') NOT NULL,
	`evidenceId` int NOT NULL,
	`relevanceScore` decimal(3,2),
	`isPrimary` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `claim_evidence_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `claim_sets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`purpose` enum('page_view','report','export','api_response') NOT NULL,
	`pageRoute` varchar(255),
	`evidenceSetHash` varchar(64),
	`claimIds` json,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`generatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `claim_sets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` varchar(36) NOT NULL,
	`claimType` enum('metric_value','event_statement','regulation_statement','narrative_statement','model_parameter') NOT NULL,
	`subjectType` enum('indicator','entity','event','regulation','geography') NOT NULL,
	`subjectId` varchar(100) NOT NULL,
	`subjectLabel` varchar(255),
	`subjectLabelAr` varchar(255),
	`predicate` enum('equals','increased_by','decreased_by','changed_to','announced','implemented','estimated_at','reported_as','projected_to','other') NOT NULL,
	`objectValue` decimal(20,6),
	`objectText` text,
	`objectUnit` varchar(50),
	`objectFrequency` varchar(50),
	`objectBaseYear` int,
	`geography` varchar(100),
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown') NOT NULL,
	`timeStart` timestamp,
	`timeEnd` timestamp,
	`asOfDate` timestamp,
	`computationLineage` json,
	`confidenceGrade` enum('A','B','C','D') NOT NULL,
	`confidenceRationale` text,
	`conflictStatus` enum('none','disputed','resolved') NOT NULL DEFAULT 'none',
	`conflictNotes` text,
	`visibility` enum('public','registered','pro','admin') NOT NULL DEFAULT 'public',
	`createdBy` enum('system_ingestion','contributor','analyst','admin') NOT NULL,
	`createdByUserId` int,
	`verifiedByUserId` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `confidence_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` varchar(36) NOT NULL,
	`sourceReliability` decimal(3,2),
	`dataRecency` decimal(3,2),
	`methodologyClarity` decimal(3,2),
	`corroborationLevel` decimal(3,2),
	`overallScore` decimal(3,2) NOT NULL,
	`grade` enum('A','B','C','D') NOT NULL,
	`computationMethod` varchar(100),
	`computationDetails` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `confidence_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conflicts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conflictType` enum('value_mismatch','date_mismatch','source_contradiction','methodology_difference') NOT NULL,
	`subjectType` varchar(50) NOT NULL,
	`subjectId` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`descriptionAr` text,
	`claimIds` json,
	`status` enum('detected','under_review','resolved','accepted') NOT NULL DEFAULT 'detected',
	`resolution` text,
	`resolvedClaimId` varchar(36),
	`resolvedByUserId` int,
	`resolvedAt` timestamp,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conflicts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coverage_cells` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`sector` varchar(100) NOT NULL,
	`governorate` varchar(100),
	`actorType` varchar(100),
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown'),
	`totalExpectedItems` int NOT NULL DEFAULT 0,
	`totalAvailableItems` int NOT NULL DEFAULT 0,
	`coverageScore` decimal(5,2),
	`indicatorsCovered` int NOT NULL DEFAULT 0,
	`indicatorsExpected` int NOT NULL DEFAULT 0,
	`eventsCovered` int NOT NULL DEFAULT 0,
	`eventsExpected` int NOT NULL DEFAULT 0,
	`documentsCovered` int NOT NULL DEFAULT 0,
	`documentsExpected` int NOT NULL DEFAULT 0,
	`regulationsCovered` int NOT NULL DEFAULT 0,
	`regulationsExpected` int NOT NULL DEFAULT 0,
	`averageConfidence` decimal(3,2),
	`lastUpdatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coverage_cells_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coverage_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cellId` int NOT NULL,
	`itemType` enum('indicator','event','document','regulation','actor','page') NOT NULL,
	`itemId` varchar(100) NOT NULL,
	`itemLabel` varchar(255),
	`status` enum('available','missing','partial','outdated') NOT NULL,
	`lastAvailableDate` timestamp,
	`confidenceGrade` enum('A','B','C','D'),
	`dataGapTicketId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coverage_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('central_bank','commercial_bank','mfi','exchange_company','government_ministry','customs_authority','tax_authority','un_agency','ingo','donor','company','political_party','armed_group','governorate','city','other') NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`acronym` varchar(50),
	`description` text,
	`descriptionAr` text,
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','neutral','unknown'),
	`parentEntityId` int,
	`headquarters` varchar(255),
	`website` text,
	`status` enum('active','inactive','dissolved','sanctioned','unknown') NOT NULL DEFAULT 'active',
	`establishedDate` timestamp,
	`dissolvedDate` timestamp,
	`logoUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entity_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceEntityId` int NOT NULL,
	`targetEntityId` int NOT NULL,
	`relationshipType` enum('parent_of','subsidiary_of','partner_with','regulates','funds','contracts_with','competes_with','affiliated_with','other') NOT NULL,
	`description` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entity_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence_datasets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`description` text,
	`descriptionAr` text,
	`datasetType` enum('time_series','cross_section','panel','geospatial','event_log','registry','other') NOT NULL,
	`schema` json,
	`timeCoverageStart` timestamp,
	`timeCoverageEnd` timestamp,
	`geographicScope` varchar(100),
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown'),
	`updateFrequency` enum('realtime','daily','weekly','monthly','quarterly','annual','irregular'),
	`lastUpdatedAt` timestamp,
	`recordCount` int,
	`apiEndpoint` text,
	`downloadUrl` text,
	`license` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidence_datasets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`documentType` enum('report','circular','law','decree','statistical_bulletin','press_release','dataset_metadata','academic_paper','news_article','other') NOT NULL,
	`publicationDate` timestamp,
	`retrievalDate` timestamp NOT NULL,
	`sourceUrl` text,
	`storageKey` varchar(255),
	`storageUrl` text,
	`contentHash` varchar(64),
	`mimeType` varchar(100),
	`fileSize` int,
	`pageCount` int,
	`language` enum('en','ar','both') NOT NULL DEFAULT 'en',
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown'),
	`license` varchar(100),
	`isProcessed` boolean NOT NULL DEFAULT false,
	`processingStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`extractedText` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidence_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence_excerpts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`excerptText` text NOT NULL,
	`excerptTextAr` text,
	`pageNumber` int,
	`startOffset` int,
	`endOffset` int,
	`highlightCoordinates` json,
	`extractionMethod` enum('manual','ocr','llm','api') NOT NULL DEFAULT 'manual',
	`extractedByUserId` int,
	`verifiedByUserId` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidence_excerpts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence_observations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`datasetId` int NOT NULL,
	`indicatorCode` varchar(100) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp,
	`value` decimal(20,6),
	`valueText` varchar(255),
	`unit` varchar(50),
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown'),
	`geography` varchar(100),
	`ingestionJobId` int,
	`rawValue` text,
	`transformationApplied` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidence_observations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`acronym` varchar(50),
	`category` enum('humanitarian','ifi','un_agency','sanctions','domestic_aden','domestic_sanaa','academic','think_tank','media','partner','other') NOT NULL,
	`isWhitelisted` boolean NOT NULL DEFAULT true,
	`trustLevel` enum('high','medium','low','unverified') NOT NULL DEFAULT 'medium',
	`baseUrl` text,
	`apiEndpoint` text,
	`apiType` enum('rest','graphql','sdmx','ckan','manual','none'),
	`updateFrequency` enum('realtime','daily','weekly','monthly','quarterly','annual','irregular'),
	`lastVerifiedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidence_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fix_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketType` enum('hardcoded_value','broken_link','missing_provenance','export_failure','translation_missing','ui_inconsistency','performance_issue','security_issue','other') NOT NULL,
	`filePath` varchar(500),
	`lineNumber` int,
	`pageRoute` varchar(255),
	`componentName` varchar(100),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`detectedValue` text,
	`expectedBehavior` text,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','wont_fix','duplicate') NOT NULL DEFAULT 'open',
	`resolvedByUserId` int,
	`resolvedAt` timestamp,
	`resolutionNotes` text,
	`detectedByJobId` int,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fix_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingestion_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`connectorName` varchar(100) NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`duration` int,
	`status` enum('running','success','partial','failed') NOT NULL,
	`recordsFetched` int NOT NULL DEFAULT 0,
	`recordsCreated` int NOT NULL DEFAULT 0,
	`recordsUpdated` int NOT NULL DEFAULT 0,
	`recordsSkipped` int NOT NULL DEFAULT 0,
	`claimsCreated` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`errorDetails` json,
	`coverageCellsUpdated` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ingestion_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrity_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`qaRunId` int,
	`reportType` enum('hardcode_scan','provenance_coverage','click_audit','export_integrity','full_integrity') NOT NULL,
	`overallScore` decimal(5,2),
	`provenanceCoverage` decimal(5,2),
	`hardcodeViolations` int NOT NULL DEFAULT 0,
	`brokenClicks` int NOT NULL DEFAULT 0,
	`exportFailures` int NOT NULL DEFAULT 0,
	`translationGaps` int NOT NULL DEFAULT 0,
	`reportJson` json,
	`jsonReportPath` varchar(255),
	`markdownReportPath` varchar(255),
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integrity_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_build_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageType` enum('year_page','sector_page','actor_page','regulation_page','governorate_page','report_page') NOT NULL,
	`pageIdentifier` varchar(255) NOT NULL,
	`pageRoute` varchar(255),
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`status` enum('running','success','failed','skipped') NOT NULL,
	`claimsUsed` int NOT NULL DEFAULT 0,
	`evidenceSetHash` varchar(64),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_build_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publish_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`status` enum('pending','running','success','failed','blocked') NOT NULL,
	`blockedReason` text,
	`qaRunId` int,
	`qaStatus` enum('pass','pass_warn','fail'),
	`pagesUpdated` int NOT NULL DEFAULT 0,
	`claimsPublished` int NOT NULL DEFAULT 0,
	`changelogSummary` text,
	`changelogDetails` json,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publish_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qa_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runType` enum('full_scan','hardcode_detection','click_audit','provenance_check','export_integrity','translation_check') NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`duration` int,
	`status` enum('running','pass','pass_warn','fail') NOT NULL,
	`totalChecks` int NOT NULL DEFAULT 0,
	`passedChecks` int NOT NULL DEFAULT 0,
	`warningChecks` int NOT NULL DEFAULT 0,
	`failedChecks` int NOT NULL DEFAULT 0,
	`ticketsCreated` int NOT NULL DEFAULT 0,
	`reportPath` varchar(255),
	`reportSummary` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qa_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regulationType` enum('law','decree','circular','directive','resolution','guideline','memorandum','other') NOT NULL,
	`referenceNumber` varchar(100),
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`summary` text,
	`summaryAr` text,
	`fullText` text,
	`fullTextAr` text,
	`issuingEntityId` int,
	`issuingAuthority` varchar(255),
	`issuedDate` timestamp,
	`effectiveDate` timestamp,
	`expiryDate` timestamp,
	`regimeTag` enum('aden_irg','sanaa_defacto','mixed','unknown'),
	`affectedSectors` json,
	`affectedIndicators` json,
	`status` enum('draft','active','superseded','repealed','expired') NOT NULL DEFAULT 'active',
	`supersededById` int,
	`documentId` int,
	`sourceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regulations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetType` enum('claim','document','page','regulation','entity') NOT NULL,
	`targetId` varchar(100) NOT NULL,
	`sourceLanguage` enum('en','ar') NOT NULL,
	`targetLanguage` enum('en','ar') NOT NULL,
	`status` enum('pending','in_progress','review','completed','failed') NOT NULL DEFAULT 'pending',
	`sourceText` text,
	`translatedText` text,
	`translationMethod` enum('human','machine','hybrid'),
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translation_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `autopilot_events` ADD CONSTRAINT `autopilot_events_triggeredByUserId_users_id_fk` FOREIGN KEY (`triggeredByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `autopilot_settings` ADD CONSTRAINT `autopilot_settings_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claim_evidence_links` ADD CONSTRAINT `claim_evidence_links_claimId_claims_id_fk` FOREIGN KEY (`claimId`) REFERENCES `claims`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claim_sets` ADD CONSTRAINT `claim_sets_generatedByUserId_users_id_fk` FOREIGN KEY (`generatedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_verifiedByUserId_users_id_fk` FOREIGN KEY (`verifiedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `confidence_scores` ADD CONSTRAINT `confidence_scores_claimId_claims_id_fk` FOREIGN KEY (`claimId`) REFERENCES `claims`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conflicts` ADD CONSTRAINT `conflicts_resolvedByUserId_users_id_fk` FOREIGN KEY (`resolvedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coverage_items` ADD CONSTRAINT `coverage_items_cellId_coverage_cells_id_fk` FOREIGN KEY (`cellId`) REFERENCES `coverage_cells`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `entity_links` ADD CONSTRAINT `entity_links_sourceEntityId_entities_id_fk` FOREIGN KEY (`sourceEntityId`) REFERENCES `entities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `entity_links` ADD CONSTRAINT `entity_links_targetEntityId_entities_id_fk` FOREIGN KEY (`targetEntityId`) REFERENCES `entities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_datasets` ADD CONSTRAINT `evidence_datasets_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_documents` ADD CONSTRAINT `evidence_documents_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_excerpts` ADD CONSTRAINT `evidence_excerpts_documentId_evidence_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `evidence_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_excerpts` ADD CONSTRAINT `evidence_excerpts_extractedByUserId_users_id_fk` FOREIGN KEY (`extractedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_excerpts` ADD CONSTRAINT `evidence_excerpts_verifiedByUserId_users_id_fk` FOREIGN KEY (`verifiedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidence_observations` ADD CONSTRAINT `evidence_observations_datasetId_evidence_datasets_id_fk` FOREIGN KEY (`datasetId`) REFERENCES `evidence_datasets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fix_tickets` ADD CONSTRAINT `fix_tickets_resolvedByUserId_users_id_fk` FOREIGN KEY (`resolvedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ingestion_runs` ADD CONSTRAINT `ingestion_runs_sourceId_evidence_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `evidence_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrity_reports` ADD CONSTRAINT `integrity_reports_qaRunId_qa_runs_id_fk` FOREIGN KEY (`qaRunId`) REFERENCES `qa_runs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publish_runs` ADD CONSTRAINT `publish_runs_qaRunId_qa_runs_id_fk` FOREIGN KEY (`qaRunId`) REFERENCES `qa_runs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publish_runs` ADD CONSTRAINT `publish_runs_approvedByUserId_users_id_fk` FOREIGN KEY (`approvedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regulations` ADD CONSTRAINT `regulations_issuingEntityId_entities_id_fk` FOREIGN KEY (`issuingEntityId`) REFERENCES `entities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regulations` ADD CONSTRAINT `regulations_documentId_evidence_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `evidence_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translation_jobs` ADD CONSTRAINT `translation_jobs_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `autopilot_event_type_idx` ON `autopilot_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `autopilot_event_created_idx` ON `autopilot_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `autopilot_setting_key_idx` ON `autopilot_settings` (`settingKey`);--> statement-breakpoint
CREATE INDEX `autopilot_setting_category_idx` ON `autopilot_settings` (`category`);--> statement-breakpoint
CREATE INDEX `claim_evidence_claim_idx` ON `claim_evidence_links` (`claimId`);--> statement-breakpoint
CREATE INDEX `claim_evidence_evidence_idx` ON `claim_evidence_links` (`evidenceType`,`evidenceId`);--> statement-breakpoint
CREATE INDEX `claim_set_purpose_idx` ON `claim_sets` (`purpose`);--> statement-breakpoint
CREATE INDEX `claim_set_page_idx` ON `claim_sets` (`pageRoute`);--> statement-breakpoint
CREATE INDEX `claim_type_idx` ON `claims` (`claimType`);--> statement-breakpoint
CREATE INDEX `claim_subject_idx` ON `claims` (`subjectType`,`subjectId`);--> statement-breakpoint
CREATE INDEX `claim_regime_idx` ON `claims` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `claim_time_idx` ON `claims` (`timeStart`,`timeEnd`);--> statement-breakpoint
CREATE INDEX `claim_confidence_idx` ON `claims` (`confidenceGrade`);--> statement-breakpoint
CREATE INDEX `claim_conflict_idx` ON `claims` (`conflictStatus`);--> statement-breakpoint
CREATE INDEX `confidence_claim_idx` ON `confidence_scores` (`claimId`);--> statement-breakpoint
CREATE INDEX `confidence_grade_idx` ON `confidence_scores` (`grade`);--> statement-breakpoint
CREATE INDEX `conflict_type_idx` ON `conflicts` (`conflictType`);--> statement-breakpoint
CREATE INDEX `conflict_subject_idx` ON `conflicts` (`subjectType`,`subjectId`);--> statement-breakpoint
CREATE INDEX `conflict_status_idx` ON `conflicts` (`status`);--> statement-breakpoint
CREATE INDEX `conflict_severity_idx` ON `conflicts` (`severity`);--> statement-breakpoint
CREATE INDEX `coverage_year_idx` ON `coverage_cells` (`year`);--> statement-breakpoint
CREATE INDEX `coverage_sector_idx` ON `coverage_cells` (`sector`);--> statement-breakpoint
CREATE INDEX `coverage_gov_idx` ON `coverage_cells` (`governorate`);--> statement-breakpoint
CREATE INDEX `coverage_regime_idx` ON `coverage_cells` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `coverage_score_idx` ON `coverage_cells` (`coverageScore`);--> statement-breakpoint
CREATE INDEX `coverage_item_cell_idx` ON `coverage_items` (`cellId`);--> statement-breakpoint
CREATE INDEX `coverage_item_type_idx` ON `coverage_items` (`itemType`);--> statement-breakpoint
CREATE INDEX `coverage_item_status_idx` ON `coverage_items` (`status`);--> statement-breakpoint
CREATE INDEX `entity_type_idx` ON `entities` (`entityType`);--> statement-breakpoint
CREATE INDEX `entity_name_idx` ON `entities` (`name`);--> statement-breakpoint
CREATE INDEX `entity_regime_idx` ON `entities` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `entity_status_idx` ON `entities` (`status`);--> statement-breakpoint
CREATE INDEX `entity_link_source_idx` ON `entity_links` (`sourceEntityId`);--> statement-breakpoint
CREATE INDEX `entity_link_target_idx` ON `entity_links` (`targetEntityId`);--> statement-breakpoint
CREATE INDEX `entity_link_type_idx` ON `entity_links` (`relationshipType`);--> statement-breakpoint
CREATE INDEX `evidence_dataset_source_idx` ON `evidence_datasets` (`sourceId`);--> statement-breakpoint
CREATE INDEX `evidence_dataset_type_idx` ON `evidence_datasets` (`datasetType`);--> statement-breakpoint
CREATE INDEX `evidence_dataset_name_idx` ON `evidence_datasets` (`name`);--> statement-breakpoint
CREATE INDEX `evidence_doc_source_idx` ON `evidence_documents` (`sourceId`);--> statement-breakpoint
CREATE INDEX `evidence_doc_type_idx` ON `evidence_documents` (`documentType`);--> statement-breakpoint
CREATE INDEX `evidence_doc_pub_date_idx` ON `evidence_documents` (`publicationDate`);--> statement-breakpoint
CREATE INDEX `evidence_doc_hash_idx` ON `evidence_documents` (`contentHash`);--> statement-breakpoint
CREATE INDEX `excerpt_document_idx` ON `evidence_excerpts` (`documentId`);--> statement-breakpoint
CREATE INDEX `excerpt_page_idx` ON `evidence_excerpts` (`pageNumber`);--> statement-breakpoint
CREATE INDEX `observation_dataset_idx` ON `evidence_observations` (`datasetId`);--> statement-breakpoint
CREATE INDEX `observation_indicator_idx` ON `evidence_observations` (`indicatorCode`);--> statement-breakpoint
CREATE INDEX `observation_period_idx` ON `evidence_observations` (`periodStart`);--> statement-breakpoint
CREATE INDEX `observation_regime_idx` ON `evidence_observations` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `evidence_source_name_idx` ON `evidence_sources` (`name`);--> statement-breakpoint
CREATE INDEX `evidence_source_category_idx` ON `evidence_sources` (`category`);--> statement-breakpoint
CREATE INDEX `evidence_source_whitelist_idx` ON `evidence_sources` (`isWhitelisted`);--> statement-breakpoint
CREATE INDEX `fix_ticket_type_idx` ON `fix_tickets` (`ticketType`);--> statement-breakpoint
CREATE INDEX `fix_ticket_severity_idx` ON `fix_tickets` (`severity`);--> statement-breakpoint
CREATE INDEX `fix_ticket_status_idx` ON `fix_tickets` (`status`);--> statement-breakpoint
CREATE INDEX `fix_ticket_page_idx` ON `fix_tickets` (`pageRoute`);--> statement-breakpoint
CREATE INDEX `ingestion_source_idx` ON `ingestion_runs` (`sourceId`);--> statement-breakpoint
CREATE INDEX `ingestion_connector_idx` ON `ingestion_runs` (`connectorName`);--> statement-breakpoint
CREATE INDEX `ingestion_status_idx` ON `ingestion_runs` (`status`);--> statement-breakpoint
CREATE INDEX `ingestion_started_idx` ON `ingestion_runs` (`startedAt`);--> statement-breakpoint
CREATE INDEX `integrity_qa_run_idx` ON `integrity_reports` (`qaRunId`);--> statement-breakpoint
CREATE INDEX `integrity_type_idx` ON `integrity_reports` (`reportType`);--> statement-breakpoint
CREATE INDEX `integrity_generated_idx` ON `integrity_reports` (`generatedAt`);--> statement-breakpoint
CREATE INDEX `page_build_type_idx` ON `page_build_runs` (`pageType`);--> statement-breakpoint
CREATE INDEX `page_build_identifier_idx` ON `page_build_runs` (`pageIdentifier`);--> statement-breakpoint
CREATE INDEX `page_build_status_idx` ON `page_build_runs` (`status`);--> statement-breakpoint
CREATE INDEX `publish_status_idx` ON `publish_runs` (`status`);--> statement-breakpoint
CREATE INDEX `publish_started_idx` ON `publish_runs` (`startedAt`);--> statement-breakpoint
CREATE INDEX `qa_type_idx` ON `qa_runs` (`runType`);--> statement-breakpoint
CREATE INDEX `qa_status_idx` ON `qa_runs` (`status`);--> statement-breakpoint
CREATE INDEX `qa_started_idx` ON `qa_runs` (`startedAt`);--> statement-breakpoint
CREATE INDEX `regulation_type_idx` ON `regulations` (`regulationType`);--> statement-breakpoint
CREATE INDEX `regulation_ref_idx` ON `regulations` (`referenceNumber`);--> statement-breakpoint
CREATE INDEX `regulation_issued_idx` ON `regulations` (`issuedDate`);--> statement-breakpoint
CREATE INDEX `regulation_regime_idx` ON `regulations` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `regulation_status_idx` ON `regulations` (`status`);--> statement-breakpoint
CREATE INDEX `translation_target_idx` ON `translation_jobs` (`targetType`,`targetId`);--> statement-breakpoint
CREATE INDEX `translation_status_idx` ON `translation_jobs` (`status`);
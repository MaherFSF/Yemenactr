CREATE TABLE `citation_anchors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anchorId` varchar(50) NOT NULL,
	`versionId` int NOT NULL,
	`anchorType` enum('page_text','page_bbox','table_cell','figure_caption','section_header','paragraph','footnote') NOT NULL,
	`pageNumber` int,
	`sectionNumber` varchar(50),
	`bboxX` decimal(10,2),
	`bboxY` decimal(10,2),
	`bboxWidth` decimal(10,2),
	`bboxHeight` decimal(10,2),
	`charStart` int,
	`charEnd` int,
	`snippetText` text,
	`snippetTextAr` text,
	`snippetHash` varchar(64),
	`s3PageImageKey` varchar(500),
	`s3PageImageUrl` text,
	`confidence` enum('high','medium','low') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `citation_anchors_id` PRIMARY KEY(`id`),
	CONSTRAINT `citation_anchors_anchorId_unique` UNIQUE(`anchorId`),
	CONSTRAINT `citation_anchor_id_idx` UNIQUE(`anchorId`)
);
--> statement-breakpoint
CREATE TABLE `document_event_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`eventId` int NOT NULL,
	`evidenceAnchorId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `document_event_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_indicator_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`seriesId` int NOT NULL,
	`relationType` enum('source','methodology','analysis','forecast','validation','contradiction') NOT NULL,
	`evidenceAnchorId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `document_indicator_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_search_index` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`versionId` int NOT NULL,
	`language` enum('en','ar') NOT NULL,
	`titleText` text,
	`bodyText` text,
	`keywords` json DEFAULT ('[]'),
	`namedEntities` json,
	`indexedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_search_index_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`versionNumber` int NOT NULL DEFAULT 1,
	`contentHash` varchar(64) NOT NULL,
	`s3OriginalKey` varchar(500),
	`s3OriginalUrl` text,
	`mimeType` varchar(100),
	`fileSize` int,
	`pageCount` int,
	`extractionStatus` enum('pending','ok','failed','partial') NOT NULL DEFAULT 'pending',
	`extractionMethod` enum('pdf_text','table_parser','ocr','html_parse','api_text','manual'),
	`extractionQualityScore` int,
	`extractionNotes` text,
	`extractedTextKey` varchar(500),
	`extractedTextUrl` text,
	`translationStatus` enum('pending','en_done','ar_done','both_done','needs_review') NOT NULL DEFAULT 'pending',
	`indexStatus` enum('pending','keyword_indexed','vector_indexed','both_indexed','failed') NOT NULL DEFAULT 'pending',
	`vectorEmbeddingKey` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `document_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `extracted_tables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tableId` varchar(50) NOT NULL,
	`versionId` int NOT NULL,
	`pageNumber` int,
	`tableIndex` int DEFAULT 0,
	`titleEn` varchar(255),
	`titleAr` varchar(255),
	`schemaGuess` json,
	`rowCount` int,
	`columnCount` int,
	`s3TableCsvKey` varchar(500),
	`s3TableJsonKey` varchar(500),
	`s3TableImageKey` varchar(500),
	`extractionMethod` enum('camelot','tabula','ocr','manual','api') DEFAULT 'manual',
	`extractionQuality` enum('high','medium','low','needs_review') DEFAULT 'needs_review',
	`extractionNotes` text,
	`promotionStatus` enum('not_promoted','pending_review','promoted','rejected') DEFAULT 'not_promoted',
	`promotedDatasetId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` int,
	CONSTRAINT `extracted_tables_id` PRIMARY KEY(`id`),
	CONSTRAINT `extracted_tables_tableId_unique` UNIQUE(`tableId`),
	CONSTRAINT `extracted_table_id_idx` UNIQUE(`tableId`)
);
--> statement-breakpoint
CREATE TABLE `library_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`docId` varchar(50) NOT NULL,
	`titleEn` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`publisherName` varchar(255) NOT NULL,
	`publisherEntityId` int,
	`sourceId` int,
	`canonicalUrl` text,
	`publishedAt` timestamp,
	`retrievedAt` timestamp NOT NULL,
	`licenseFlag` enum('open','restricted_metadata_only','unknown_requires_review') NOT NULL DEFAULT 'unknown_requires_review',
	`licenseDetails` varchar(255),
	`languageOriginal` enum('en','ar','both','other') NOT NULL DEFAULT 'en',
	`docType` enum('report','working_paper','policy_brief','dataset_doc','sitrep','evaluation','annex','law_regulation','bulletin','circular','press_release','academic_paper','thesis','methodology_note','other') NOT NULL,
	`sectors` json DEFAULT ('[]'),
	`entityIds` json DEFAULT ('[]'),
	`geographies` json DEFAULT ('[]'),
	`regimeTagApplicability` enum('aden_irg','sanaa_defacto','both','mixed','unknown') DEFAULT 'unknown',
	`currentVersionId` int,
	`status` enum('draft','queued_for_review','published','archived') NOT NULL DEFAULT 'draft',
	`importanceScore` int DEFAULT 50,
	`summaryEn` text,
	`summaryAr` text,
	`summaryIsAiGenerated` boolean DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `library_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `library_documents_docId_unique` UNIQUE(`docId`),
	CONSTRAINT `lib_doc_id_idx` UNIQUE(`docId`)
);
--> statement-breakpoint
CREATE TABLE `literature_coverage_map` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`sector` varchar(100) NOT NULL,
	`publisherEntityId` int,
	`publisherName` varchar(255),
	`documentCount` int DEFAULT 0,
	`expectedDocumentCount` int,
	`coveragePercent` decimal(5,2),
	`avgExtractionQuality` decimal(5,2),
	`avgTranslationQuality` decimal(5,2),
	`hasGap` boolean DEFAULT false,
	`gapTicketId` int,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `literature_coverage_map_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `literature_gap_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` varchar(50) NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`descriptionEn` text NOT NULL,
	`descriptionAr` text,
	`yearStart` int,
	`yearEnd` int,
	`sectors` json DEFAULT ('[]'),
	`publishers` json DEFAULT ('[]'),
	`impactEn` text,
	`impactAr` text,
	`candidateSources` json,
	`acquisitionPlan` text,
	`priority` enum('critical','high','medium','low') DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','wont_fix') NOT NULL DEFAULT 'open',
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`resolutionNotes` text,
	`resolvedDocumentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `literature_gap_tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `literature_gap_tickets_ticketId_unique` UNIQUE(`ticketId`),
	CONSTRAINT `lit_gap_ticket_id_idx` UNIQUE(`ticketId`)
);
--> statement-breakpoint
CREATE TABLE `literature_ingestion_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` varchar(50) NOT NULL,
	`sourceId` int,
	`sourceName` varchar(255) NOT NULL,
	`runType` enum('scheduled','manual','backfill') NOT NULL DEFAULT 'scheduled',
	`windowStart` timestamp,
	`windowEnd` timestamp,
	`documentsFound` int DEFAULT 0,
	`documentsNew` int DEFAULT 0,
	`documentsUpdated` int DEFAULT 0,
	`documentsDuplicate` int DEFAULT 0,
	`documentsFailed` int DEFAULT 0,
	`extractionsAttempted` int DEFAULT 0,
	`extractionsSucceeded` int DEFAULT 0,
	`extractionsFailed` int DEFAULT 0,
	`translationsAttempted` int DEFAULT 0,
	`translationsSucceeded` int DEFAULT 0,
	`translationsFailed` int DEFAULT 0,
	`indexingAttempted` int DEFAULT 0,
	`indexingSucceeded` int DEFAULT 0,
	`indexingFailed` int DEFAULT 0,
	`status` enum('running','completed','failed','partial') NOT NULL DEFAULT 'running',
	`errorMessage` text,
	`errorDetails` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`triggeredBy` int,
	CONSTRAINT `literature_ingestion_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `literature_ingestion_runs_runId_unique` UNIQUE(`runId`),
	CONSTRAINT `lit_ingestion_run_id_idx` UNIQUE(`runId`)
);
--> statement-breakpoint
CREATE TABLE `translation_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`translationId` varchar(50) NOT NULL,
	`versionId` int NOT NULL,
	`targetLang` enum('en','ar') NOT NULL,
	`method` enum('human','machine','hybrid','api') NOT NULL DEFAULT 'machine',
	`modelVersion` varchar(100),
	`glossaryAdherenceScore` decimal(5,2),
	`numericIntegrityPass` boolean DEFAULT false,
	`glossaryIssues` json,
	`numericIssues` json,
	`status` enum('pending','ok','needs_review','rejected') NOT NULL DEFAULT 'pending',
	`s3TranslatedKey` varchar(500),
	`s3TranslatedUrl` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `translation_records_translationId_unique` UNIQUE(`translationId`),
	CONSTRAINT `translation_record_id_idx` UNIQUE(`translationId`)
);
--> statement-breakpoint
ALTER TABLE `citation_anchors` ADD CONSTRAINT `citation_anchors_versionId_document_versions_id_fk` FOREIGN KEY (`versionId`) REFERENCES `document_versions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_event_links` ADD CONSTRAINT `document_event_links_documentId_library_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `library_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_event_links` ADD CONSTRAINT `document_event_links_eventId_economic_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `economic_events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_event_links` ADD CONSTRAINT `document_event_links_evidenceAnchorId_citation_anchors_id_fk` FOREIGN KEY (`evidenceAnchorId`) REFERENCES `citation_anchors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_event_links` ADD CONSTRAINT `document_event_links_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_indicator_links` ADD CONSTRAINT `document_indicator_links_documentId_library_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `library_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_indicator_links` ADD CONSTRAINT `document_indicator_links_seriesId_time_series_id_fk` FOREIGN KEY (`seriesId`) REFERENCES `time_series`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_indicator_links` ADD CONSTRAINT `document_indicator_links_evidenceAnchorId_citation_anchors_id_fk` FOREIGN KEY (`evidenceAnchorId`) REFERENCES `citation_anchors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_indicator_links` ADD CONSTRAINT `document_indicator_links_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_search_index` ADD CONSTRAINT `document_search_index_documentId_library_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `library_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_search_index` ADD CONSTRAINT `document_search_index_versionId_document_versions_id_fk` FOREIGN KEY (`versionId`) REFERENCES `document_versions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `document_versions` ADD CONSTRAINT `document_versions_documentId_library_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `library_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extracted_tables` ADD CONSTRAINT `extracted_tables_versionId_document_versions_id_fk` FOREIGN KEY (`versionId`) REFERENCES `document_versions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extracted_tables` ADD CONSTRAINT `extracted_tables_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `library_documents` ADD CONSTRAINT `library_documents_publisherEntityId_entities_id_fk` FOREIGN KEY (`publisherEntityId`) REFERENCES `entities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `library_documents` ADD CONSTRAINT `library_documents_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `library_documents` ADD CONSTRAINT `library_documents_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `literature_coverage_map` ADD CONSTRAINT `literature_coverage_map_publisherEntityId_entities_id_fk` FOREIGN KEY (`publisherEntityId`) REFERENCES `entities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `literature_coverage_map` ADD CONSTRAINT `literature_coverage_map_gapTicketId_literature_gap_tickets_id_fk` FOREIGN KEY (`gapTicketId`) REFERENCES `literature_gap_tickets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `literature_gap_tickets` ADD CONSTRAINT `literature_gap_tickets_resolvedBy_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `literature_gap_tickets` ADD CONSTRAINT `lgt_doc_fk` FOREIGN KEY (`resolvedDocumentId`) REFERENCES `library_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `literature_gap_tickets` ADD CONSTRAINT `literature_gap_tickets_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `literature_ingestion_runs` ADD CONSTRAINT `literature_ingestion_runs_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `literature_ingestion_runs` ADD CONSTRAINT `literature_ingestion_runs_triggeredBy_users_id_fk` FOREIGN KEY (`triggeredBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translation_records` ADD CONSTRAINT `translation_records_versionId_document_versions_id_fk` FOREIGN KEY (`versionId`) REFERENCES `document_versions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translation_records` ADD CONSTRAINT `translation_records_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `citation_anchor_version_idx` ON `citation_anchors` (`versionId`);--> statement-breakpoint
CREATE INDEX `citation_anchor_type_idx` ON `citation_anchors` (`anchorType`);--> statement-breakpoint
CREATE INDEX `citation_anchor_page_idx` ON `citation_anchors` (`pageNumber`);--> statement-breakpoint
CREATE INDEX `doc_event_link_doc_idx` ON `document_event_links` (`documentId`);--> statement-breakpoint
CREATE INDEX `doc_event_link_event_idx` ON `document_event_links` (`eventId`);--> statement-breakpoint
CREATE INDEX `doc_indicator_link_doc_idx` ON `document_indicator_links` (`documentId`);--> statement-breakpoint
CREATE INDEX `doc_indicator_link_series_idx` ON `document_indicator_links` (`seriesId`);--> statement-breakpoint
CREATE INDEX `doc_indicator_link_relation_idx` ON `document_indicator_links` (`relationType`);--> statement-breakpoint
CREATE INDEX `doc_search_document_idx` ON `document_search_index` (`documentId`);--> statement-breakpoint
CREATE INDEX `doc_search_version_idx` ON `document_search_index` (`versionId`);--> statement-breakpoint
CREATE INDEX `doc_search_language_idx` ON `document_search_index` (`language`);--> statement-breakpoint
CREATE INDEX `doc_version_document_idx` ON `document_versions` (`documentId`);--> statement-breakpoint
CREATE INDEX `doc_version_hash_idx` ON `document_versions` (`contentHash`);--> statement-breakpoint
CREATE INDEX `doc_version_extraction_idx` ON `document_versions` (`extractionStatus`);--> statement-breakpoint
CREATE INDEX `doc_version_translation_idx` ON `document_versions` (`translationStatus`);--> statement-breakpoint
CREATE INDEX `doc_version_index_idx` ON `document_versions` (`indexStatus`);--> statement-breakpoint
CREATE INDEX `extracted_table_version_idx` ON `extracted_tables` (`versionId`);--> statement-breakpoint
CREATE INDEX `extracted_table_promotion_idx` ON `extracted_tables` (`promotionStatus`);--> statement-breakpoint
CREATE INDEX `lib_doc_source_idx` ON `library_documents` (`sourceId`);--> statement-breakpoint
CREATE INDEX `lib_doc_publisher_idx` ON `library_documents` (`publisherEntityId`);--> statement-breakpoint
CREATE INDEX `lib_doc_type_idx` ON `library_documents` (`docType`);--> statement-breakpoint
CREATE INDEX `lib_doc_status_idx` ON `library_documents` (`status`);--> statement-breakpoint
CREATE INDEX `lib_doc_published_at_idx` ON `library_documents` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `lib_doc_license_idx` ON `library_documents` (`licenseFlag`);--> statement-breakpoint
CREATE INDEX `lit_coverage_year_idx` ON `literature_coverage_map` (`year`);--> statement-breakpoint
CREATE INDEX `lit_coverage_sector_idx` ON `literature_coverage_map` (`sector`);--> statement-breakpoint
CREATE INDEX `lit_coverage_publisher_idx` ON `literature_coverage_map` (`publisherEntityId`);--> statement-breakpoint
CREATE INDEX `lit_coverage_year_sector_idx` ON `literature_coverage_map` (`year`,`sector`);--> statement-breakpoint
CREATE INDEX `lit_gap_status_idx` ON `literature_gap_tickets` (`status`);--> statement-breakpoint
CREATE INDEX `lit_gap_priority_idx` ON `literature_gap_tickets` (`priority`);--> statement-breakpoint
CREATE INDEX `lit_ingestion_source_idx` ON `literature_ingestion_runs` (`sourceId`);--> statement-breakpoint
CREATE INDEX `lit_ingestion_status_idx` ON `literature_ingestion_runs` (`status`);--> statement-breakpoint
CREATE INDEX `lit_ingestion_started_at_idx` ON `literature_ingestion_runs` (`startedAt`);--> statement-breakpoint
CREATE INDEX `translation_record_version_idx` ON `translation_records` (`versionId`);--> statement-breakpoint
CREATE INDEX `translation_record_status_idx` ON `translation_records` (`status`);--> statement-breakpoint
CREATE INDEX `translation_record_lang_idx` ON `translation_records` (`targetLang`);
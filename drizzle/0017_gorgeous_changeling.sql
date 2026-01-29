CREATE TABLE `credibility_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50),
	`metricDate` timestamp NOT NULL,
	`tier1SourceCount` int DEFAULT 0,
	`tier2SourceCount` int DEFAULT 0,
	`tier3SourceCount` int DEFAULT 0,
	`openLicenseCount` int DEFAULT 0,
	`restrictedLicenseCount` int DEFAULT 0,
	`contradictionCount` int DEFAULT 0,
	`resolvedContradictionCount` int DEFAULT 0,
	`revisionCount` int DEFAULT 0,
	`vintageCount` int DEFAULT 0,
	`citationCoveragePercent` decimal(5,2),
	`evalPassRate` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credibility_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `methodology_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`contentEn` text NOT NULL,
	`contentAr` text NOT NULL,
	`category` enum('data_collection','contradiction_handling','confidence_grades','revisions_vintages','uncertainty_interpretation','missing_data','data_licenses','general') DEFAULT 'general',
	`sectorCode` varchar(50),
	`isPublished` boolean DEFAULT false,
	`publishedAt` timestamp,
	`authorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `methodology_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sector_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`alertType` enum('threshold_breach','staleness','contradiction_detected','significant_change','data_gap','source_update') NOT NULL,
	`severity` enum('critical','warning','info') DEFAULT 'info',
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`indicatorCode` varchar(100),
	`entityId` int,
	`evidencePackId` int,
	`status` enum('active','acknowledged','resolved') DEFAULT 'active',
	`acknowledgedAt` timestamp,
	`acknowledgedBy` int,
	`resolvedAt` timestamp,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sector_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sector_briefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`briefType` enum('public','vip') NOT NULL,
	`weekStart` timestamp NOT NULL,
	`weekEnd` timestamp NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`summaryEn` text,
	`summaryAr` text,
	`sections` json,
	`evidenceAppendix` json,
	`pdfUrlEn` varchar(500),
	`pdfUrlAr` varchar(500),
	`s3KeyEn` varchar(500),
	`s3KeyAr` varchar(500),
	`status` enum('draft','review','published') DEFAULT 'draft',
	`publishedAt` timestamp,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sector_briefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sector_context_packs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`packDate` timestamp NOT NULL,
	`packVersion` int DEFAULT 1,
	`keyIndicators` json,
	`topEvents` json,
	`topDocuments` json,
	`contradictions` json,
	`gaps` json,
	`whatChanged` json,
	`whatToWatch` json,
	`dataCoveragePercent` decimal(5,2),
	`dataFreshnessPercent` decimal(5,2),
	`contradictionCount` int DEFAULT 0,
	`gapCount` int DEFAULT 0,
	`s3Key` varchar(500),
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sector_context_packs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sector_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`missionEn` text,
	`missionAr` text,
	`displayOrder` int DEFAULT 0,
	`navLabelEn` varchar(100),
	`navLabelAr` varchar(100),
	`iconName` varchar(50),
	`heroImageUrl` varchar(500),
	`heroColor` varchar(50),
	`flagshipIndicatorCode` varchar(100),
	`coreDatasets` json,
	`hasRegimeSplit` boolean DEFAULT false,
	`defaultRegime` enum('both','aden_irg','sanaa_dfa') DEFAULT 'both',
	`isActive` boolean DEFAULT true,
	`isPublished` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sector_definitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sector_definitions_sectorCode_unique` UNIQUE(`sectorCode`)
);
--> statement-breakpoint
CREATE TABLE `sector_faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`questionEn` text NOT NULL,
	`questionAr` text NOT NULL,
	`answerEn` text NOT NULL,
	`answerAr` text NOT NULL,
	`citations` json,
	`isRefusalAnswer` boolean DEFAULT false,
	`refusalReasonEn` text,
	`refusalReasonAr` text,
	`displayOrder` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sector_faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sector_kpis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`indicatorCode` varchar(100) NOT NULL,
	`displayOrder` int DEFAULT 0,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`unitEn` varchar(50),
	`unitAr` varchar(50),
	`formatType` enum('number','percent','currency','index') DEFAULT 'number',
	`decimalPlaces` int DEFAULT 1,
	`warningThreshold` decimal(15,4),
	`criticalThreshold` decimal(15,4),
	`thresholdDirection` enum('above','below') DEFAULT 'above',
	`regimeTag` enum('both','aden_irg','sanaa_dfa') DEFAULT 'both',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sector_kpis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sector_mechanisms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`sectionOrder` int DEFAULT 0,
	`headingEn` varchar(255) NOT NULL,
	`headingAr` varchar(255) NOT NULL,
	`contentEn` text NOT NULL,
	`contentAr` text NOT NULL,
	`contentType` enum('evidence_backed','conceptual') DEFAULT 'evidence_backed',
	`citations` json,
	`hasGap` boolean DEFAULT false,
	`gapTicketId` int,
	`isActive` boolean DEFAULT true,
	`lastReviewedAt` timestamp,
	`reviewedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sector_mechanisms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sector_release_gates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`evidenceCoveragePercent` decimal(5,2),
	`evidenceCoveragePassed` boolean DEFAULT false,
	`exportsWorking` boolean DEFAULT false,
	`contradictionsVisible` boolean DEFAULT false,
	`bilingualParityPassed` boolean DEFAULT false,
	`noPlaceholdersPassed` boolean DEFAULT false,
	`allGatesPassed` boolean DEFAULT false,
	`lastCheckedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sector_release_gates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sector_watchlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`itemType` enum('indicator','entity','project','event','risk') NOT NULL,
	`itemId` varchar(100) NOT NULL,
	`titleEn` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`importance` enum('critical','high','medium','low') DEFAULT 'medium',
	`displayOrder` int DEFAULT 0,
	`visibilityLevel` enum('public','vip_only') DEFAULT 'public',
	`vipRoles` json,
	`reasonEn` text,
	`reasonAr` text,
	`evidencePackId` int,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sector_watchlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `cred_metric_sector_idx` ON `credibility_metrics` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `cred_metric_date_idx` ON `credibility_metrics` (`metricDate`);--> statement-breakpoint
CREATE INDEX `method_note_category_idx` ON `methodology_notes` (`category`);--> statement-breakpoint
CREATE INDEX `method_note_sector_idx` ON `methodology_notes` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `method_note_published_idx` ON `methodology_notes` (`isPublished`);--> statement-breakpoint
CREATE INDEX `sector_alert_sector_idx` ON `sector_alerts` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_alert_type_idx` ON `sector_alerts` (`alertType`);--> statement-breakpoint
CREATE INDEX `sector_alert_status_idx` ON `sector_alerts` (`status`);--> statement-breakpoint
CREATE INDEX `sector_alert_severity_idx` ON `sector_alerts` (`severity`);--> statement-breakpoint
CREATE INDEX `sector_brief_sector_idx` ON `sector_briefs` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_brief_type_idx` ON `sector_briefs` (`briefType`);--> statement-breakpoint
CREATE INDEX `sector_brief_week_idx` ON `sector_briefs` (`weekStart`);--> statement-breakpoint
CREATE INDEX `sector_brief_status_idx` ON `sector_briefs` (`status`);--> statement-breakpoint
CREATE INDEX `sector_ctx_sector_idx` ON `sector_context_packs` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_ctx_date_idx` ON `sector_context_packs` (`packDate`);--> statement-breakpoint
CREATE INDEX `sector_ctx_sector_date_idx` ON `sector_context_packs` (`sectorCode`,`packDate`);--> statement-breakpoint
CREATE INDEX `sector_def_code_idx` ON `sector_definitions` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_def_order_idx` ON `sector_definitions` (`displayOrder`);--> statement-breakpoint
CREATE INDEX `sector_faq_sector_idx` ON `sector_faqs` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_faq_order_idx` ON `sector_faqs` (`sectorCode`,`displayOrder`);--> statement-breakpoint
CREATE INDEX `sector_kpi_sector_idx` ON `sector_kpis` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_kpi_indicator_idx` ON `sector_kpis` (`indicatorCode`);--> statement-breakpoint
CREATE INDEX `sector_kpi_order_idx` ON `sector_kpis` (`sectorCode`,`displayOrder`);--> statement-breakpoint
CREATE INDEX `sector_mech_sector_idx` ON `sector_mechanisms` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_mech_order_idx` ON `sector_mechanisms` (`sectorCode`,`sectionOrder`);--> statement-breakpoint
CREATE INDEX `sector_gate_sector_idx` ON `sector_release_gates` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_gate_passed_idx` ON `sector_release_gates` (`allGatesPassed`);--> statement-breakpoint
CREATE INDEX `sector_watch_sector_idx` ON `sector_watchlist_items` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `sector_watch_type_idx` ON `sector_watchlist_items` (`itemType`);--> statement-breakpoint
CREATE INDEX `sector_watch_visibility_idx` ON `sector_watchlist_items` (`visibilityLevel`);
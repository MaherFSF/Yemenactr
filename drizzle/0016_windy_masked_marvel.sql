CREATE TABLE `agent_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` varchar(100) NOT NULL,
	`taskType` varchar(100) NOT NULL,
	`description` text,
	`inputData` json,
	`orchestrationPattern` enum('planner_specialists_verifier','parallel_merge_tribunal','sequential_handoff','peer_review') NOT NULL,
	`assignedAgents` json,
	`status` enum('pending','in_progress','review','tribunal','completed','failed') DEFAULT 'pending',
	`currentAgentCode` varchar(50),
	`requiresTribunal` boolean DEFAULT true,
	`tribunalStatus` enum('pending','passed','failed','appealed'),
	`tribunalVotes` json,
	`finalOutput` json,
	`outputQuality` decimal(5,4),
	`citationCoverage` decimal(5,4),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`durationMs` int,
	CONSTRAINT `agent_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_tasks_taskId_unique` UNIQUE(`taskId`)
);
--> statement-breakpoint
CREATE TABLE `auto_brief_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`userId` int,
	`briefCode` varchar(100) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`executiveSummary` text NOT NULL,
	`executiveSummaryAr` text NOT NULL,
	`sectionsContent` json,
	`totalSignals` int DEFAULT 0,
	`criticalSignals` int DEFAULT 0,
	`warningSignals` int DEFAULT 0,
	`newDrivers` int DEFAULT 0,
	`activeOptions` int DEFAULT 0,
	`evidencePackIds` json,
	`deliveryStatus` enum('pending','sent','failed','read') DEFAULT 'pending',
	`sentAt` timestamp,
	`readAt` timestamp,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`generationDurationMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auto_brief_instances_id` PRIMARY KEY(`id`),
	CONSTRAINT `auto_brief_instances_briefCode_unique` UNIQUE(`briefCode`)
);
--> statement-breakpoint
CREATE TABLE `auto_brief_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int NOT NULL,
	`customDeliveryTime` varchar(10),
	`customTimezone` varchar(50),
	`customSections` json,
	`emailEnabled` boolean DEFAULT true,
	`dashboardEnabled` boolean DEFAULT true,
	`isActive` boolean DEFAULT true,
	`pausedUntil` timestamp,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_brief_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_brief_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateCode` varchar(100) NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`templateNameAr` varchar(255) NOT NULL,
	`roleProfileId` int,
	`frequency` enum('daily','weekly','monthly','on_demand') DEFAULT 'daily',
	`sections` json,
	`deliveryChannels` json,
	`deliveryTime` varchar(10),
	`timezone` varchar(50) DEFAULT 'Asia/Aden',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_brief_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `auto_brief_templates_templateCode_unique` UNIQUE(`templateCode`)
);
--> statement-breakpoint
CREATE TABLE `cockpit_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleProfileId` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`totalSignals` int DEFAULT 0,
	`criticalSignals` int DEFAULT 0,
	`warningSignals` int DEFAULT 0,
	`normalSignals` int DEFAULT 0,
	`overallCoverage` decimal(5,2),
	`dataFreshness` decimal(5,2),
	`contradictionCount` int DEFAULT 0,
	`gapCount` int DEFAULT 0,
	`signalsSnapshot` json,
	`driversSnapshot` json,
	`optionsSnapshot` json,
	`watchlistSnapshot` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cockpit_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `context_packs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`packCode` varchar(100) NOT NULL,
	`packDate` date NOT NULL,
	`packType` enum('global','sector','role','entity') NOT NULL,
	`targetCode` varchar(100),
	`contentHash` varchar(64) NOT NULL,
	`s3Key` varchar(255) NOT NULL,
	`s3Url` text,
	`fileSizeBytes` int,
	`topIndicatorsCount` int,
	`eventsCount` int,
	`contradictionsCount` int,
	`gapsCount` int,
	`glossaryDeltasCount` int,
	`generatedAt` timestamp NOT NULL,
	`generationDurationMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `context_packs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dataset_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`datasetId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`vintageDate` timestamp NOT NULL,
	`changeType` enum('initial','revision','correction','restatement','methodology_change') NOT NULL,
	`changeDescription` text,
	`changeSummary` json,
	`diffFileKey` varchar(512),
	`diffFileUrl` text,
	`snapshotFileKey` varchar(512),
	`snapshotFileUrl` text,
	`sourceId` int,
	`confidenceRating` enum('A','B','C','D'),
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dataset_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decision_follow_ups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` int NOT NULL,
	`followUpType` enum('review','action','update','escalation') NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`description` text NOT NULL,
	`descriptionAr` text,
	`assignedTo` int,
	`status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
	`priority` enum('high','medium','low') DEFAULT 'medium',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decision_follow_ups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decision_journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleProfileId` int,
	`decisionCode` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`contextSummary` text NOT NULL,
	`contextSummaryAr` text,
	`keySignals` json,
	`keyDrivers` json,
	`decision` text NOT NULL,
	`decisionAr` text,
	`rationale` text NOT NULL,
	`rationaleAr` text,
	`alternativesConsidered` json,
	`expectedOutcomes` json,
	`identifiedRisks` json,
	`confidenceLevel` enum('high','medium','low') DEFAULT 'medium',
	`confidenceExplanation` text,
	`evidencePackId` int,
	`supportingDocuments` json,
	`status` enum('draft','active','implemented','abandoned','superseded') DEFAULT 'draft',
	`decisionDate` timestamp NOT NULL,
	`implementationDeadline` timestamp,
	`reviewDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decision_journal_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `decision_journal_entries_decisionCode_unique` UNIQUE(`decisionCode`)
);
--> statement-breakpoint
CREATE TABLE `decision_outcomes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` int NOT NULL,
	`outcomeCode` varchar(100) NOT NULL,
	`expectedOutcomeIndex` int,
	`actualOutcome` text NOT NULL,
	`actualOutcomeAr` text,
	`actualValue` decimal(20,4),
	`outcomeStatus` enum('achieved','partially_achieved','not_achieved','unexpected') DEFAULT 'partially_achieved',
	`variancePercent` decimal(10,4),
	`analysisNotes` text,
	`analysisNotesAr` text,
	`lessonsLearned` text,
	`lessonsLearnedAr` text,
	`evidencePackId` int,
	`observedAt` timestamp NOT NULL,
	`recordedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decision_outcomes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drift_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricDate` date NOT NULL,
	`driftType` enum('retrieval','evidence','translation','dashboard','model') NOT NULL,
	`metricName` varchar(100) NOT NULL,
	`metricValue` decimal(10,4) NOT NULL,
	`previousValue` decimal(10,4),
	`baselineValue` decimal(10,4),
	`thresholdValue` decimal(10,4),
	`isBreached` boolean DEFAULT false,
	`breachSeverity` enum('warning','critical'),
	`ticketId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drift_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entity_spine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityCode` varchar(50) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`entityType` enum('international_org','un_agency','development_bank','bilateral_donor','central_bank','ministry','local_ngo','international_ngo','private_bank','microfinance','chamber_of_commerce','think_tank','research_institution','media_outlet','other') NOT NULL,
	`regimeAffiliation` enum('aden','sanaa','neutral','international'),
	`countryCode` varchar(3),
	`website` text,
	`dataPortalUrl` text,
	`apiEndpoint` text,
	`descriptionEn` text,
	`descriptionAr` text,
	`keyFunctions` json,
	`keyPublications` json,
	`keyDatasets` json,
	`reliabilityTier` enum('tier1_official','tier2_credible','tier3_proxy','tier4_disputed'),
	`lastVerified` timestamp,
	`verificationNotes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entity_spine_id` PRIMARY KEY(`id`),
	CONSTRAINT `entity_spine_entityCode_unique` UNIQUE(`entityCode`)
);
--> statement-breakpoint
CREATE TABLE `eval_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` varchar(100) NOT NULL,
	`evalType` enum('retrieval','generation','citation','skills','regression') NOT NULL,
	`targetScope` varchar(100),
	`totalTests` int NOT NULL,
	`passedTests` int NOT NULL,
	`failedTests` int NOT NULL,
	`skippedTests` int DEFAULT 0,
	`recallAtK` decimal(5,4),
	`precisionAtK` decimal(5,4),
	`ndcg` decimal(5,4),
	`citationCoverage` decimal(5,4),
	`baselineRunId` varchar(100),
	`isRegression` boolean DEFAULT false,
	`regressionDetails` json,
	`reportS3Key` varchar(255),
	`reportUrl` text,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`durationMs` int,
	`triggeredBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eval_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `eval_runs_runId_unique` UNIQUE(`runId`)
);
--> statement-breakpoint
CREATE TABLE `evidence_packs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subjectType` enum('metric','series','document','claim','alert','report','chart','kpi','table_cell') NOT NULL,
	`subjectId` varchar(255) NOT NULL,
	`subjectLabel` varchar(500),
	`citations` json NOT NULL,
	`transforms` json,
	`regimeTags` json NOT NULL,
	`geoScope` varchar(255) NOT NULL,
	`timeCoverageStart` timestamp,
	`timeCoverageEnd` timestamp,
	`missingRanges` json,
	`contradictions` json,
	`hasContradictions` boolean NOT NULL DEFAULT false,
	`dqafIntegrity` enum('pass','needs_review','unknown') NOT NULL DEFAULT 'unknown',
	`dqafMethodology` enum('pass','needs_review','unknown') NOT NULL DEFAULT 'unknown',
	`dqafAccuracyReliability` enum('pass','needs_review','unknown') NOT NULL DEFAULT 'unknown',
	`dqafServiceability` enum('pass','needs_review','unknown') NOT NULL DEFAULT 'unknown',
	`dqafAccessibility` enum('pass','needs_review','unknown') NOT NULL DEFAULT 'unknown',
	`uncertaintyInterval` varchar(100),
	`uncertaintyNote` text,
	`confidenceGrade` enum('A','B','C','D') NOT NULL,
	`confidenceExplanation` text NOT NULL,
	`whatWouldChange` json,
	`promptVersion` varchar(50),
	`modelVersion` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidence_packs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `export_manifests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exportType` enum('csv','json','xlsx','pdf','png','svg','markdown') NOT NULL,
	`exportName` varchar(255) NOT NULL,
	`userId` int,
	`userRole` varchar(50),
	`sessionId` varchar(255),
	`filters` json,
	`exportFileKey` varchar(512) NOT NULL,
	`exportFileUrl` text NOT NULL,
	`exportFileSize` int,
	`manifestFileKey` varchar(512) NOT NULL,
	`manifestFileUrl` text NOT NULL,
	`evidencePackFileKey` varchar(512) NOT NULL,
	`evidencePackFileUrl` text NOT NULL,
	`licenseSummaryFileKey` varchar(512) NOT NULL,
	`licenseSummaryFileUrl` text NOT NULL,
	`dataCoverageWindow` json,
	`recordCount` int NOT NULL,
	`sourceCount` int NOT NULL,
	`evidencePackIds` json,
	`overallConfidence` enum('A','B','C','D'),
	`limitations` json,
	`signedUrlExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `export_manifests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`periodLabel` varchar(50) NOT NULL,
	`status` enum('pending','generating','success','failed') NOT NULL DEFAULT 'pending',
	`s3KeyEn` varchar(512),
	`s3KeyAr` varchar(512),
	`s3UrlEn` varchar(1024),
	`s3UrlAr` varchar(1024),
	`fileSizeBytesEn` int,
	`fileSizeBytesAr` int,
	`pageCountEn` int,
	`pageCountAr` int,
	`generationDurationMs` int,
	`errorMessage` text,
	`summary` json,
	`generatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`triggeredBy` enum('scheduled','admin','api') NOT NULL DEFAULT 'scheduled',
	`triggeredByUserId` int,
	CONSTRAINT `generated_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nightly_job_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` varchar(100) NOT NULL,
	`runDate` date NOT NULL,
	`connectorsStatus` enum('pending','running','completed','failed') DEFAULT 'pending',
	`connectorsDetails` json,
	`indexingStatus` enum('pending','running','completed','failed') DEFAULT 'pending',
	`indexingDetails` json,
	`contextPacksStatus` enum('pending','running','completed','failed') DEFAULT 'pending',
	`contextPacksGenerated` int DEFAULT 0,
	`evalsStatus` enum('pending','running','completed','failed') DEFAULT 'pending',
	`evalRunId` varchar(100),
	`driftStatus` enum('pending','running','completed','failed') DEFAULT 'pending',
	`driftBreaches` int DEFAULT 0,
	`overallStatus` enum('pending','running','completed','partial','failed') DEFAULT 'pending',
	`digestEnUrl` text,
	`digestArUrl` text,
	`digestSentAt` timestamp,
	`evidenceCoveragePercent` decimal(5,2),
	`newContradictions` int DEFAULT 0,
	`alertsGenerated` int DEFAULT 0,
	`ticketsCreated` int DEFAULT 0,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`durationMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nightly_job_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `nightly_job_runs_runId_unique` UNIQUE(`runId`)
);
--> statement-breakpoint
CREATE TABLE `policy_event_spine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventCode` varchar(100) NOT NULL,
	`titleEn` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`descriptionEn` text,
	`descriptionAr` text,
	`eventDate` date NOT NULL,
	`eventEndDate` date,
	`precision` enum('exact','month','quarter','year') DEFAULT 'exact',
	`eventType` enum('policy_change','central_bank_action','fiscal_measure','conflict_event','humanitarian_crisis','international_intervention','sanctions_action','market_event','political_event','natural_disaster','infrastructure_event','other') NOT NULL,
	`impactSectors` json,
	`impactRegimes` json,
	`impactSeverity` enum('low','medium','high','critical'),
	`citations` json NOT NULL,
	`relatedIndicators` json,
	`relatedDocuments` json,
	`verificationStatus` enum('unverified','verified','disputed') DEFAULT 'unverified',
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policy_event_spine_id` PRIMARY KEY(`id`),
	CONSTRAINT `policy_event_spine_eventCode_unique` UNIQUE(`eventCode`)
);
--> statement-breakpoint
CREATE TABLE `prompt_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promptCode` varchar(100) NOT NULL,
	`version` varchar(20) NOT NULL,
	`promptContent` text NOT NULL,
	`contentHash` varchar(64) NOT NULL,
	`agentCode` varchar(50),
	`roleCode` varchar(50),
	`sectorCode` varchar(50),
	`status` enum('draft','testing','baseline','active','deprecated') DEFAULT 'draft',
	`lastEvalRunId` varchar(100),
	`evalScore` decimal(5,4),
	`isRegressing` boolean DEFAULT false,
	`promotedAt` timestamp,
	`promotedBy` int,
	`promotionNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prompt_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publication_spine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicationCode` varchar(100) NOT NULL,
	`titleEn` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`abstractEn` text,
	`abstractAr` text,
	`publicationType` enum('daily_brief','weekly_digest','monthly_report','quarterly_outlook','annual_review','sector_analysis','special_report','data_release','methodology_note','correction_notice') NOT NULL,
	`status` enum('draft','review','approved','published','archived') DEFAULT 'draft',
	`contentEnUrl` text,
	`contentArUrl` text,
	`contentEnFileKey` varchar(255),
	`contentArFileKey` varchar(255),
	`evidencePackId` int,
	`evidenceAppendixUrl` text,
	`citationCount` int DEFAULT 0,
	`coveragePeriodStart` date,
	`coveragePeriodEnd` date,
	`sectors` json,
	`regimes` json,
	`confidenceGrade` enum('A','B','C','D'),
	`tribunalApproved` boolean DEFAULT false,
	`tribunalApprovedAt` timestamp,
	`tribunalNotes` text,
	`publishedAt` timestamp,
	`publishedBy` int,
	`version` int NOT NULL DEFAULT 1,
	`viewCount` int DEFAULT 0,
	`downloadCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publication_spine_id` PRIMARY KEY(`id`),
	CONSTRAINT `publication_spine_publicationCode_unique` UNIQUE(`publicationCode`)
);
--> statement-breakpoint
CREATE TABLE `release_gate_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checkName` varchar(100) NOT NULL,
	`checkCategory` enum('evidence_coverage','placeholder_scan','contradiction_ui','vintages','exports','bilingual_parity','security') NOT NULL,
	`status` enum('pass','fail','warning','skipped') NOT NULL,
	`score` int,
	`threshold` int,
	`details` json,
	`message` text,
	`recommendation` text,
	`runId` varchar(64) NOT NULL,
	`runAt` timestamp NOT NULL DEFAULT (now()),
	`runBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `release_gate_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `release_gate_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` varchar(64) NOT NULL,
	`overallStatus` enum('pass','fail') NOT NULL,
	`checksTotal` int NOT NULL,
	`checksPassed` int NOT NULL,
	`checksFailed` int NOT NULL,
	`checksWarning` int NOT NULL,
	`blockingIssues` json,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`durationMs` int,
	`runBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `release_gate_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `release_gate_runs_runId_unique` UNIQUE(`runId`)
);
--> statement-breakpoint
CREATE TABLE `report_distribution_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`subscriberId` int NOT NULL,
	`emailAddress` varchar(255) NOT NULL,
	`language` enum('en','ar') NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`emailStatus` enum('queued','sent','delivered','bounced','failed') NOT NULL DEFAULT 'queued',
	`sesMessageId` varchar(255),
	`errorMessage` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`lastRetryAt` timestamp,
	CONSTRAINT `report_distribution_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_schedule` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`cronExpression` varchar(100) NOT NULL,
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`nextRunAt` timestamp NOT NULL,
	`lastRunAt` timestamp,
	`lastRunStatus` enum('success','failed','skipped'),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`nameAr` varchar(255),
	`organization` varchar(255),
	`tier` enum('public','premium','vip') NOT NULL DEFAULT 'public',
	`preferredLanguage` enum('en','ar') NOT NULL DEFAULT 'en',
	`subscribedTemplates` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`unsubscribedAt` timestamp,
	`verificationToken` varchar(100),
	`isVerified` boolean NOT NULL DEFAULT false,
	`verifiedAt` timestamp,
	CONSTRAINT `report_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `report_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `sector_spine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`keyIndicators` json,
	`definitionsEn` json,
	`definitionsAr` json,
	`mechanismsEn` text,
	`mechanismsAr` text,
	`keyDocRefs` json,
	`knownContradictions` json,
	`qualityNotes` text,
	`qualityNotesAr` text,
	`dataCoveragePercent` int,
	`lastQualityReview` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sector_spine_id` PRIMARY KEY(`id`),
	CONSTRAINT `sector_spine_sectorCode_unique` UNIQUE(`sectorCode`)
);
--> statement-breakpoint
CREATE TABLE `time_spine_day` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day` date NOT NULL,
	`dayOfWeek` int NOT NULL,
	`weekNumber` int NOT NULL,
	`monthNumber` int NOT NULL,
	`quarterNumber` int NOT NULL,
	`yearNumber` int NOT NULL,
	`regimeTag` enum('aden','sanaa','national','pre_split'),
	`geoScope` varchar(100),
	`eventRefs` json,
	`datasetRefs` json,
	`docRefs` json,
	`alerts` json,
	`notes` text,
	`notesAr` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `time_spine_day_id` PRIMARY KEY(`id`),
	CONSTRAINT `time_spine_day_day_unique` UNIQUE(`day`)
);
--> statement-breakpoint
CREATE TABLE `vip_cockpit_drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleProfileId` int NOT NULL,
	`signalId` int,
	`driverCode` varchar(100) NOT NULL,
	`factor` varchar(255) NOT NULL,
	`factorAr` varchar(255) NOT NULL,
	`impact` enum('positive','negative','mixed') DEFAULT 'mixed',
	`confidence` enum('high','medium','low') DEFAULT 'medium',
	`explanation` text NOT NULL,
	`explanationAr` text NOT NULL,
	`evidencePackId` int,
	`citations` json,
	`identifiedAt` timestamp NOT NULL DEFAULT (now()),
	`validUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vip_cockpit_drivers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vip_cockpit_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleProfileId` int NOT NULL,
	`optionCode` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`mechanism` text NOT NULL,
	`mechanismAr` text NOT NULL,
	`preconditions` json,
	`preconditionsAr` json,
	`risks` json,
	`risksAr` json,
	`timeframe` varchar(50),
	`confidence` enum('high','medium','low') DEFAULT 'medium',
	`priority` int DEFAULT 0,
	`evidencePackId` int,
	`status` enum('active','implemented','rejected','expired') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vip_cockpit_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vip_cockpit_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleProfileId` int NOT NULL,
	`signalCode` varchar(100) NOT NULL,
	`indicatorCode` varchar(100),
	`indicatorName` varchar(255) NOT NULL,
	`indicatorNameAr` varchar(255) NOT NULL,
	`currentValue` decimal(20,4),
	`previousValue` decimal(20,4),
	`unit` varchar(50),
	`change` decimal(20,4),
	`changePercent` decimal(10,4),
	`trend` enum('up','down','stable') DEFAULT 'stable',
	`status` enum('normal','warning','critical') DEFAULT 'normal',
	`significance` enum('high','medium','low') DEFAULT 'medium',
	`evidencePackId` int,
	`periodStart` timestamp,
	`periodEnd` timestamp,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vip_cockpit_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vip_role_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleCode` varchar(50) NOT NULL,
	`roleName` varchar(255) NOT NULL,
	`roleNameAr` varchar(255) NOT NULL,
	`roleDescription` text,
	`roleDescriptionAr` text,
	`primarySectors` json,
	`primaryIndicators` json,
	`primaryEntities` json,
	`regimeFocus` enum('IRG','DFA','both') DEFAULT 'both',
	`timeHorizon` enum('short','medium','long','all') DEFAULT 'all',
	`dashboardLayout` json,
	`alertThresholds` json,
	`requiredRole` enum('user','admin','editor','viewer','analyst','partner_contributor') DEFAULT 'analyst',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vip_role_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vip_role_profiles_roleCode_unique` UNIQUE(`roleCode`)
);
--> statement-breakpoint
CREATE TABLE `vip_user_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleProfileId` int NOT NULL,
	`customWatchlist` json,
	`customAlertThresholds` json,
	`notificationPreferences` json,
	`isActive` boolean DEFAULT true,
	`lastAccessedAt` timestamp,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`assignedBy` int,
	CONSTRAINT `vip_user_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vip_watchlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleProfileId` int,
	`itemType` enum('indicator','entity','event','sector') NOT NULL,
	`itemCode` varchar(100) NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`itemNameAr` varchar(255) NOT NULL,
	`status` enum('normal','warning','critical') DEFAULT 'normal',
	`currentValue` decimal(20,4),
	`change7d` decimal(10,4),
	`change30d` decimal(10,4),
	`change90d` decimal(10,4),
	`alertThreshold` decimal(10,4),
	`alertDirection` enum('above','below','both') DEFAULT 'both',
	`lastAlertAt` timestamp,
	`evidencePackId` int,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`lastCheckedAt` timestamp,
	CONSTRAINT `vip_watchlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `report_templates` DROP FOREIGN KEY `report_templates_createdBy_users_id_fk`;
--> statement-breakpoint
DROP INDEX `template_type_idx` ON `report_templates`;--> statement-breakpoint
DROP INDEX `schedule_idx` ON `report_templates`;--> statement-breakpoint
ALTER TABLE `report_templates` MODIFY COLUMN `nameAr` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `report_templates` ADD `slug` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `report_templates` ADD `nameEn` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `report_templates` ADD `descriptionEn` text;--> statement-breakpoint
ALTER TABLE `report_templates` ADD `frequency` enum('quarterly','annual','monthly','on_demand') NOT NULL;--> statement-breakpoint
ALTER TABLE `report_templates` ADD `templateComponentPath` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `report_templates` ADD `config` json;--> statement-breakpoint
ALTER TABLE `report_templates` ADD CONSTRAINT `report_templates_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
ALTER TABLE `auto_brief_instances` ADD CONSTRAINT `auto_brief_instances_templateId_auto_brief_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `auto_brief_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_brief_instances` ADD CONSTRAINT `auto_brief_instances_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_brief_subscriptions` ADD CONSTRAINT `auto_brief_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_brief_subscriptions` ADD CONSTRAINT `auto_brief_subscriptions_templateId_auto_brief_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `auto_brief_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_brief_templates` ADD CONSTRAINT `auto_brief_templates_roleProfileId_vip_role_profiles_id_fk` FOREIGN KEY (`roleProfileId`) REFERENCES `vip_role_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cockpit_snapshots` ADD CONSTRAINT `cockpit_snapshots_roleProfileId_vip_role_profiles_id_fk` FOREIGN KEY (`roleProfileId`) REFERENCES `vip_role_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dataset_versions` ADD CONSTRAINT `dataset_versions_datasetId_datasets_id_fk` FOREIGN KEY (`datasetId`) REFERENCES `datasets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dataset_versions` ADD CONSTRAINT `dataset_versions_sourceId_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dataset_versions` ADD CONSTRAINT `dataset_versions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_follow_ups` ADD CONSTRAINT `decision_follow_ups_decisionId_decision_journal_entries_id_fk` FOREIGN KEY (`decisionId`) REFERENCES `decision_journal_entries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_follow_ups` ADD CONSTRAINT `decision_follow_ups_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_follow_ups` ADD CONSTRAINT `decision_follow_ups_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_journal_entries` ADD CONSTRAINT `decision_journal_entries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_journal_entries` ADD CONSTRAINT `decision_journal_entries_roleProfileId_vip_role_profiles_id_fk` FOREIGN KEY (`roleProfileId`) REFERENCES `vip_role_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_journal_entries` ADD CONSTRAINT `decision_journal_entries_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_outcomes` ADD CONSTRAINT `decision_outcomes_decisionId_decision_journal_entries_id_fk` FOREIGN KEY (`decisionId`) REFERENCES `decision_journal_entries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_outcomes` ADD CONSTRAINT `decision_outcomes_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_outcomes` ADD CONSTRAINT `decision_outcomes_recordedBy_users_id_fk` FOREIGN KEY (`recordedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `export_manifests` ADD CONSTRAINT `export_manifests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generated_reports` ADD CONSTRAINT `generated_reports_templateId_report_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `report_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generated_reports` ADD CONSTRAINT `generated_reports_triggeredByUserId_users_id_fk` FOREIGN KEY (`triggeredByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_event_spine` ADD CONSTRAINT `policy_event_spine_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prompt_versions` ADD CONSTRAINT `prompt_versions_promotedBy_users_id_fk` FOREIGN KEY (`promotedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_spine` ADD CONSTRAINT `publication_spine_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_spine` ADD CONSTRAINT `publication_spine_publishedBy_users_id_fk` FOREIGN KEY (`publishedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `release_gate_checks` ADD CONSTRAINT `release_gate_checks_runBy_users_id_fk` FOREIGN KEY (`runBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `release_gate_runs` ADD CONSTRAINT `release_gate_runs_runBy_users_id_fk` FOREIGN KEY (`runBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_distribution_log` ADD CONSTRAINT `report_distribution_log_reportId_generated_reports_id_fk` FOREIGN KEY (`reportId`) REFERENCES `generated_reports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_distribution_log` ADD CONSTRAINT `report_distribution_log_subscriberId_report_subscribers_id_fk` FOREIGN KEY (`subscriberId`) REFERENCES `report_subscribers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_schedule` ADD CONSTRAINT `report_schedule_templateId_report_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `report_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_cockpit_drivers` ADD CONSTRAINT `vip_cockpit_drivers_roleProfileId_vip_role_profiles_id_fk` FOREIGN KEY (`roleProfileId`) REFERENCES `vip_role_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_cockpit_drivers` ADD CONSTRAINT `vip_cockpit_drivers_signalId_vip_cockpit_signals_id_fk` FOREIGN KEY (`signalId`) REFERENCES `vip_cockpit_signals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_cockpit_drivers` ADD CONSTRAINT `vip_cockpit_drivers_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_cockpit_options` ADD CONSTRAINT `vip_cockpit_options_roleProfileId_vip_role_profiles_id_fk` FOREIGN KEY (`roleProfileId`) REFERENCES `vip_role_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_cockpit_options` ADD CONSTRAINT `vip_cockpit_options_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_cockpit_signals` ADD CONSTRAINT `vip_cockpit_signals_roleProfileId_vip_role_profiles_id_fk` FOREIGN KEY (`roleProfileId`) REFERENCES `vip_role_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_cockpit_signals` ADD CONSTRAINT `vip_cockpit_signals_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_user_assignments` ADD CONSTRAINT `vip_user_assignments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_user_assignments` ADD CONSTRAINT `vip_user_assignments_roleProfileId_vip_role_profiles_id_fk` FOREIGN KEY (`roleProfileId`) REFERENCES `vip_role_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_user_assignments` ADD CONSTRAINT `vip_user_assignments_assignedBy_users_id_fk` FOREIGN KEY (`assignedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_watchlist_items` ADD CONSTRAINT `vip_watchlist_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_watchlist_items` ADD CONSTRAINT `vip_watchlist_items_roleProfileId_vip_role_profiles_id_fk` FOREIGN KEY (`roleProfileId`) REFERENCES `vip_role_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_watchlist_items` ADD CONSTRAINT `vip_watchlist_items_evidencePackId_evidence_packs_id_fk` FOREIGN KEY (`evidencePackId`) REFERENCES `evidence_packs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `task_id_idx` ON `agent_tasks` (`taskId`);--> statement-breakpoint
CREATE INDEX `task_status_idx` ON `agent_tasks` (`status`);--> statement-breakpoint
CREATE INDEX `task_tribunal_idx` ON `agent_tasks` (`tribunalStatus`);--> statement-breakpoint
CREATE INDEX `brief_instance_template_idx` ON `auto_brief_instances` (`templateId`);--> statement-breakpoint
CREATE INDEX `brief_instance_user_idx` ON `auto_brief_instances` (`userId`);--> statement-breakpoint
CREATE INDEX `brief_instance_code_idx` ON `auto_brief_instances` (`briefCode`);--> statement-breakpoint
CREATE INDEX `brief_instance_period_idx` ON `auto_brief_instances` (`periodStart`,`periodEnd`);--> statement-breakpoint
CREATE INDEX `brief_instance_status_idx` ON `auto_brief_instances` (`deliveryStatus`);--> statement-breakpoint
CREATE INDEX `brief_sub_user_idx` ON `auto_brief_subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `brief_sub_template_idx` ON `auto_brief_subscriptions` (`templateId`);--> statement-breakpoint
CREATE INDEX `brief_sub_user_template_idx` ON `auto_brief_subscriptions` (`userId`,`templateId`);--> statement-breakpoint
CREATE INDEX `brief_template_code_idx` ON `auto_brief_templates` (`templateCode`);--> statement-breakpoint
CREATE INDEX `brief_template_role_idx` ON `auto_brief_templates` (`roleProfileId`);--> statement-breakpoint
CREATE INDEX `brief_template_freq_idx` ON `auto_brief_templates` (`frequency`);--> statement-breakpoint
CREATE INDEX `snapshot_role_idx` ON `cockpit_snapshots` (`roleProfileId`);--> statement-breakpoint
CREATE INDEX `snapshot_date_idx` ON `cockpit_snapshots` (`snapshotDate`);--> statement-breakpoint
CREATE INDEX `snapshot_role_date_idx` ON `cockpit_snapshots` (`roleProfileId`,`snapshotDate`);--> statement-breakpoint
CREATE INDEX `pack_code_idx` ON `context_packs` (`packCode`);--> statement-breakpoint
CREATE INDEX `pack_date_idx` ON `context_packs` (`packDate`);--> statement-breakpoint
CREATE INDEX `pack_type_idx` ON `context_packs` (`packType`);--> statement-breakpoint
CREATE INDEX `version_dataset_idx` ON `dataset_versions` (`datasetId`);--> statement-breakpoint
CREATE INDEX `version_vintage_idx` ON `dataset_versions` (`vintageDate`);--> statement-breakpoint
CREATE INDEX `version_number_idx` ON `dataset_versions` (`datasetId`,`versionNumber`);--> statement-breakpoint
CREATE INDEX `followup_decision_idx` ON `decision_follow_ups` (`decisionId`);--> statement-breakpoint
CREATE INDEX `followup_type_idx` ON `decision_follow_ups` (`followUpType`);--> statement-breakpoint
CREATE INDEX `followup_status_idx` ON `decision_follow_ups` (`status`);--> statement-breakpoint
CREATE INDEX `followup_due_idx` ON `decision_follow_ups` (`dueDate`);--> statement-breakpoint
CREATE INDEX `decision_user_idx` ON `decision_journal_entries` (`userId`);--> statement-breakpoint
CREATE INDEX `decision_role_idx` ON `decision_journal_entries` (`roleProfileId`);--> statement-breakpoint
CREATE INDEX `decision_code_idx` ON `decision_journal_entries` (`decisionCode`);--> statement-breakpoint
CREATE INDEX `decision_status_idx` ON `decision_journal_entries` (`status`);--> statement-breakpoint
CREATE INDEX `decision_date_idx` ON `decision_journal_entries` (`decisionDate`);--> statement-breakpoint
CREATE INDEX `outcome_decision_idx` ON `decision_outcomes` (`decisionId`);--> statement-breakpoint
CREATE INDEX `outcome_status_idx` ON `decision_outcomes` (`outcomeStatus`);--> statement-breakpoint
CREATE INDEX `outcome_observed_idx` ON `decision_outcomes` (`observedAt`);--> statement-breakpoint
CREATE INDEX `drift_date_idx` ON `drift_metrics` (`metricDate`);--> statement-breakpoint
CREATE INDEX `drift_type_idx` ON `drift_metrics` (`driftType`);--> statement-breakpoint
CREATE INDEX `drift_breached_idx` ON `drift_metrics` (`isBreached`);--> statement-breakpoint
CREATE INDEX `entity_code_idx` ON `entity_spine` (`entityCode`);--> statement-breakpoint
CREATE INDEX `entity_type_idx` ON `entity_spine` (`entityType`);--> statement-breakpoint
CREATE INDEX `entity_reliability_idx` ON `entity_spine` (`reliabilityTier`);--> statement-breakpoint
CREATE INDEX `eval_run_id_idx` ON `eval_runs` (`runId`);--> statement-breakpoint
CREATE INDEX `eval_type_idx` ON `eval_runs` (`evalType`);--> statement-breakpoint
CREATE INDEX `eval_created_idx` ON `eval_runs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `evidence_subject_idx` ON `evidence_packs` (`subjectType`,`subjectId`);--> statement-breakpoint
CREATE INDEX `evidence_confidence_idx` ON `evidence_packs` (`confidenceGrade`);--> statement-breakpoint
CREATE INDEX `evidence_contradictions_idx` ON `evidence_packs` (`hasContradictions`);--> statement-breakpoint
CREATE INDEX `evidence_created_idx` ON `evidence_packs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `export_user_idx` ON `export_manifests` (`userId`);--> statement-breakpoint
CREATE INDEX `export_type_idx` ON `export_manifests` (`exportType`);--> statement-breakpoint
CREATE INDEX `export_created_idx` ON `export_manifests` (`createdAt`);--> statement-breakpoint
CREATE INDEX `generated_report_template_idx` ON `generated_reports` (`templateId`);--> statement-breakpoint
CREATE INDEX `generated_report_status_idx` ON `generated_reports` (`status`);--> statement-breakpoint
CREATE INDEX `generated_report_period_idx` ON `generated_reports` (`periodStart`,`periodEnd`);--> statement-breakpoint
CREATE INDEX `generated_report_created_idx` ON `generated_reports` (`createdAt`);--> statement-breakpoint
CREATE INDEX `nightly_run_id_idx` ON `nightly_job_runs` (`runId`);--> statement-breakpoint
CREATE INDEX `nightly_run_date_idx` ON `nightly_job_runs` (`runDate`);--> statement-breakpoint
CREATE INDEX `nightly_status_idx` ON `nightly_job_runs` (`overallStatus`);--> statement-breakpoint
CREATE INDEX `event_code_idx` ON `policy_event_spine` (`eventCode`);--> statement-breakpoint
CREATE INDEX `event_date_idx` ON `policy_event_spine` (`eventDate`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `policy_event_spine` (`eventType`);--> statement-breakpoint
CREATE INDEX `prompt_code_idx` ON `prompt_versions` (`promptCode`);--> statement-breakpoint
CREATE INDEX `prompt_version_idx` ON `prompt_versions` (`version`);--> statement-breakpoint
CREATE INDEX `prompt_status_idx` ON `prompt_versions` (`status`);--> statement-breakpoint
CREATE INDEX `pub_code_idx` ON `publication_spine` (`publicationCode`);--> statement-breakpoint
CREATE INDEX `pub_type_idx` ON `publication_spine` (`publicationType`);--> statement-breakpoint
CREATE INDEX `pub_status_idx` ON `publication_spine` (`status`);--> statement-breakpoint
CREATE INDEX `pub_published_idx` ON `publication_spine` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `gate_run_idx` ON `release_gate_checks` (`runId`);--> statement-breakpoint
CREATE INDEX `gate_check_name_idx` ON `release_gate_checks` (`checkName`);--> statement-breakpoint
CREATE INDEX `gate_status_idx` ON `release_gate_checks` (`status`);--> statement-breakpoint
CREATE INDEX `gate_run_at_idx` ON `release_gate_checks` (`runAt`);--> statement-breakpoint
CREATE INDEX `gate_runs_run_idx` ON `release_gate_runs` (`runId`);--> statement-breakpoint
CREATE INDEX `gate_runs_status_idx` ON `release_gate_runs` (`overallStatus`);--> statement-breakpoint
CREATE INDEX `gate_runs_created_idx` ON `release_gate_runs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `distribution_report_idx` ON `report_distribution_log` (`reportId`);--> statement-breakpoint
CREATE INDEX `distribution_subscriber_idx` ON `report_distribution_log` (`subscriberId`);--> statement-breakpoint
CREATE INDEX `distribution_status_idx` ON `report_distribution_log` (`emailStatus`);--> statement-breakpoint
CREATE INDEX `distribution_sent_idx` ON `report_distribution_log` (`sentAt`);--> statement-breakpoint
CREATE INDEX `schedule_template_idx` ON `report_schedule` (`templateId`);--> statement-breakpoint
CREATE INDEX `schedule_next_run_idx` ON `report_schedule` (`nextRunAt`);--> statement-breakpoint
CREATE INDEX `subscriber_email_idx` ON `report_subscribers` (`email`);--> statement-breakpoint
CREATE INDEX `subscriber_tier_idx` ON `report_subscribers` (`tier`);--> statement-breakpoint
CREATE INDEX `sector_code_idx` ON `sector_spine` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `time_spine_day_idx` ON `time_spine_day` (`day`);--> statement-breakpoint
CREATE INDEX `time_spine_year_idx` ON `time_spine_day` (`yearNumber`);--> statement-breakpoint
CREATE INDEX `time_spine_regime_idx` ON `time_spine_day` (`regimeTag`);--> statement-breakpoint
CREATE INDEX `driver_role_idx` ON `vip_cockpit_drivers` (`roleProfileId`);--> statement-breakpoint
CREATE INDEX `driver_signal_idx` ON `vip_cockpit_drivers` (`signalId`);--> statement-breakpoint
CREATE INDEX `driver_code_idx` ON `vip_cockpit_drivers` (`driverCode`);--> statement-breakpoint
CREATE INDEX `option_role_idx` ON `vip_cockpit_options` (`roleProfileId`);--> statement-breakpoint
CREATE INDEX `option_code_idx` ON `vip_cockpit_options` (`optionCode`);--> statement-breakpoint
CREATE INDEX `option_status_idx` ON `vip_cockpit_options` (`status`);--> statement-breakpoint
CREATE INDEX `signal_role_idx` ON `vip_cockpit_signals` (`roleProfileId`);--> statement-breakpoint
CREATE INDEX `signal_code_idx` ON `vip_cockpit_signals` (`signalCode`);--> statement-breakpoint
CREATE INDEX `signal_status_idx` ON `vip_cockpit_signals` (`status`);--> statement-breakpoint
CREATE INDEX `signal_updated_idx` ON `vip_cockpit_signals` (`lastUpdatedAt`);--> statement-breakpoint
CREATE INDEX `vip_role_code_idx` ON `vip_role_profiles` (`roleCode`);--> statement-breakpoint
CREATE INDEX `vip_active_idx` ON `vip_role_profiles` (`isActive`);--> statement-breakpoint
CREATE INDEX `vip_user_idx` ON `vip_user_assignments` (`userId`);--> statement-breakpoint
CREATE INDEX `vip_role_profile_idx` ON `vip_user_assignments` (`roleProfileId`);--> statement-breakpoint
CREATE INDEX `vip_user_role_idx` ON `vip_user_assignments` (`userId`,`roleProfileId`);--> statement-breakpoint
CREATE INDEX `watchlist_user_idx` ON `vip_watchlist_items` (`userId`);--> statement-breakpoint
CREATE INDEX `watchlist_role_idx` ON `vip_watchlist_items` (`roleProfileId`);--> statement-breakpoint
CREATE INDEX `watchlist_type_idx` ON `vip_watchlist_items` (`itemType`);--> statement-breakpoint
CREATE INDEX `watchlist_status_idx` ON `vip_watchlist_items` (`status`);--> statement-breakpoint
CREATE INDEX `report_template_slug_idx` ON `report_templates` (`slug`);--> statement-breakpoint
CREATE INDEX `report_template_frequency_idx` ON `report_templates` (`frequency`);--> statement-breakpoint
ALTER TABLE `report_templates` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `report_templates` DROP COLUMN `description`;--> statement-breakpoint
ALTER TABLE `report_templates` DROP COLUMN `templateType`;--> statement-breakpoint
ALTER TABLE `report_templates` DROP COLUMN `templateSpec`;--> statement-breakpoint
ALTER TABLE `report_templates` DROP COLUMN `schedule`;--> statement-breakpoint
ALTER TABLE `report_templates` DROP COLUMN `cronExpression`;--> statement-breakpoint
ALTER TABLE `report_templates` DROP COLUMN `nextRunAt`;--> statement-breakpoint
ALTER TABLE `report_templates` DROP COLUMN `createdBy`;
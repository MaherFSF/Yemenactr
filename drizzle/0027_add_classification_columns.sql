ALTER TABLE `source_registry` ADD `tierClassificationSuggested` enum('T0','T1','T2','T3','T4','UNKNOWN');--> statement-breakpoint
ALTER TABLE `source_registry` ADD `tierClassificationReason` text;--> statement-breakpoint
ALTER TABLE `source_registry` ADD `tierClassificationConfidence` decimal(5,4);--> statement-breakpoint
ALTER TABLE `source_registry` ADD `requiresHumanReview` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `source_registry` ADD `classificationMatchedRule` varchar(255);
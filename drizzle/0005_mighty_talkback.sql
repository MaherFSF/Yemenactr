ALTER TABLE `data_contradictions` MODIFY COLUMN `plausibleReasons` json;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` MODIFY COLUMN `transformations` json;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` MODIFY COLUMN `qaChecks` json;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` MODIFY COLUMN `limitations` json;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` MODIFY COLUMN `caveats` json;--> statement-breakpoint
ALTER TABLE `provenance_ledger_full` MODIFY COLUMN `knownIssues` json;--> statement-breakpoint
ALTER TABLE `public_changelog` MODIFY COLUMN `affectedDatasetIds` json;--> statement-breakpoint
ALTER TABLE `public_changelog` MODIFY COLUMN `affectedIndicatorCodes` json;--> statement-breakpoint
ALTER TABLE `public_changelog` MODIFY COLUMN `affectedDocumentIds` json;
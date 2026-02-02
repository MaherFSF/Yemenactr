ALTER TABLE `literature_gap_tickets` DROP FOREIGN KEY `lgt_doc_fk`;
--> statement-breakpoint
ALTER TABLE `insight_miner_proposals` DROP FOREIGN KEY `imp_report_fk`;
--> statement-breakpoint
ALTER TABLE `literature_gap_tickets` ADD CONSTRAINT `literature_gap_tickets_resolvedDocumentId_library_documents_id_fk` FOREIGN KEY (`resolvedDocumentId`) REFERENCES `library_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insight_miner_proposals` ADD CONSTRAINT `insight_miner_proposals_incorporatedInReportId_report_instances_id_fk` FOREIGN KEY (`incorporatedInReportId`) REFERENCES `report_instances`(`id`) ON DELETE no action ON UPDATE no action;
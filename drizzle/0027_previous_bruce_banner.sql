ALTER TABLE `literature_gap_tickets` DROP FOREIGN KEY `lgt_doc_fk`;
--> statement-breakpoint
ALTER TABLE `partnership_access_requests` DROP FOREIGN KEY `par_source_fk`;
--> statement-breakpoint
ALTER TABLE `research_completeness_audit` DROP FOREIGN KEY `research_completeness_audit_publicationId_research_publications_id_fk`;
--> statement-breakpoint
ALTER TABLE `insight_miner_proposals` DROP FOREIGN KEY `imp_report_fk`;
--> statement-breakpoint
DROP INDEX `update_source_url_idx` ON `update_items`;--> statement-breakpoint
ALTER TABLE `literature_gap_tickets` ADD CONSTRAINT `literature_gap_tickets_resolvedDocumentId_library_documents_id_fk` FOREIGN KEY (`resolvedDocumentId`) REFERENCES `library_documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partnership_access_requests` ADD CONSTRAINT `partnership_access_requests_sourceRegistryId_source_registry_id_fk` FOREIGN KEY (`sourceRegistryId`) REFERENCES `source_registry`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_completeness_audit` ADD CONSTRAINT `rca_pub_fk` FOREIGN KEY (`publicationId`) REFERENCES `research_publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insight_miner_proposals` ADD CONSTRAINT `insight_miner_proposals_incorporatedInReportId_report_instances_id_fk` FOREIGN KEY (`incorporatedInReportId`) REFERENCES `report_instances`(`id`) ON DELETE no action ON UPDATE no action;
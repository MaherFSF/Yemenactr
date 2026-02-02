ALTER TABLE `research_completeness_audit` DROP FOREIGN KEY `research_completeness_audit_organizationId_research_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `research_completeness_audit` DROP FOREIGN KEY `research_completeness_audit_publicationId_research_publications_id_fk`;
--> statement-breakpoint
ALTER TABLE `research_ingestion_sources` DROP FOREIGN KEY `research_ingestion_sources_organizationId_research_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `research_publications` DROP FOREIGN KEY `research_publications_organizationId_research_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `research_completeness_audit` ADD CONSTRAINT `rca_org_fk` FOREIGN KEY (`organizationId`) REFERENCES `research_organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_completeness_audit` ADD CONSTRAINT `rca_pub_fk` FOREIGN KEY (`publicationId`) REFERENCES `research_publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_ingestion_sources` ADD CONSTRAINT `ris_org_fk` FOREIGN KEY (`organizationId`) REFERENCES `research_organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `research_publications` ADD CONSTRAINT `res_pub_org_fk` FOREIGN KEY (`organizationId`) REFERENCES `research_organizations`(`id`) ON DELETE no action ON UPDATE no action;
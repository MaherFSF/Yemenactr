ALTER TABLE `research_completeness_audit` DROP FOREIGN KEY `research_completeness_audit_organizationId_research_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `research_completeness_audit` DROP FOREIGN KEY `research_completeness_audit_publicationId_research_publications_id_fk`;
--> statement-breakpoint
ALTER TABLE `research_ingestion_sources` DROP FOREIGN KEY `ris_org_fk`;
--> statement-breakpoint
ALTER TABLE `research_publications` DROP FOREIGN KEY `res_pub_org_fk`;
--> statement-breakpoint
DROP INDEX `update_source_url_idx` ON `update_items`;
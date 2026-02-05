-- Migration: Add v2.5 Governance Columns to source_registry
-- Purpose: Add schema v2.5 governance-critical columns for tier classification,
--          license compliance, and reliability scoring
-- Safety: All columns are nullable with no defaults to preserve data integrity
-- Rollback: Safe - no existing data to lose

-- Add sourceType for source classification
ALTER TABLE `source_registry` ADD COLUMN `sourceType` ENUM('DATA','DOCUMENT','API','MEDIA','RESEARCH','OFFICIAL','OTHER') NULL;

-- Add licenseState for compliance tracking
ALTER TABLE `source_registry` ADD COLUMN `licenseState` ENUM('open','known','unknown','restricted','paywalled') NULL;

-- Add needsClassification flag for workflow management
ALTER TABLE `source_registry` ADD COLUMN `needsClassification` BOOLEAN NULL;

-- Add reliabilityScore for quality metrics (0.00 to 100.00)
ALTER TABLE `source_registry` ADD COLUMN `reliabilityScore` DECIMAL(5,2) NULL;

-- Add evidencePackFlag for documentation tracking
ALTER TABLE `source_registry` ADD COLUMN `evidencePackFlag` BOOLEAN NULL;

-- Add indexes for performance on frequently queried governance columns
CREATE INDEX `source_registry_source_type_idx` ON `source_registry` (`sourceType`);
CREATE INDEX `source_registry_license_state_idx` ON `source_registry` (`licenseState`);
CREATE INDEX `source_registry_reliability_score_idx` ON `source_registry` (`reliabilityScore`);

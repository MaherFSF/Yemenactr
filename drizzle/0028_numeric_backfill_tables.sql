-- ============================================================================
-- Numeric Data Backfill Infrastructure
-- Migration: 0028
-- Created: 2026-02-05
-- ============================================================================

-- Numeric Series - Metadata for time series at native frequency
CREATE TABLE IF NOT EXISTS `numeric_series` (
  `id` VARCHAR(255) PRIMARY KEY,
  `sourceId` VARCHAR(100) NOT NULL,
  `productId` VARCHAR(100) NOT NULL,
  `name` VARCHAR(500) NOT NULL,
  `nameAr` VARCHAR(500),
  `frequency` ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual') NOT NULL,
  `unit` VARCHAR(100) NOT NULL,
  `regimeTag` ENUM('aden_irg', 'sanaa_defacto', 'mixed', 'international'),
  `description` TEXT,
  `descriptionAr` TEXT,
  `metadata` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `num_series_source_product_idx` (`sourceId`, `productId`),
  INDEX `num_series_frequency_idx` (`frequency`),
  INDEX `num_series_regime_idx` (`regimeTag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Numeric Observations - Individual data points with evidence
CREATE TABLE IF NOT EXISTS `numeric_observations` (
  `id` VARCHAR(255) PRIMARY KEY,
  `seriesId` VARCHAR(255) NOT NULL,
  `observationDate` TIMESTAMP NOT NULL,
  `value` DECIMAL(30, 10) NOT NULL,
  `unit` VARCHAR(100) NOT NULL,
  `frequency` ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual') NOT NULL,
  `regimeTag` ENUM('aden_irg', 'sanaa_defacto', 'mixed', 'international') NOT NULL,
  `evidencePackId` VARCHAR(255) NOT NULL,
  `rawData` JSON,
  `flags` JSON,
  `revisionNumber` INT DEFAULT 0,
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`seriesId`) REFERENCES `numeric_series`(`id`) ON DELETE CASCADE,
  INDEX `num_obs_series_idx` (`seriesId`),
  INDEX `num_obs_date_idx` (`observationDate`),
  INDEX `num_obs_evidence_pack_idx` (`evidencePackId`),
  UNIQUE KEY `num_obs_series_date_regime_unique` (`seriesId`, `observationDate`, `regimeTag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Numeric Evidence Packs - Provenance for backfill runs
CREATE TABLE IF NOT EXISTS `numeric_evidence_packs` (
  `id` VARCHAR(255) PRIMARY KEY,
  `sourceId` VARCHAR(100) NOT NULL,
  `productId` VARCHAR(100) NOT NULL,
  `year` INT NOT NULL,
  `checkpointId` VARCHAR(255),
  `runTimestamp` TIMESTAMP NOT NULL,
  `sourceUrl` TEXT,
  `apiVersion` VARCHAR(50),
  `rawResponse` JSON,
  `observationCount` INT DEFAULT 0,
  `metadata` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `num_evidence_source_product_idx` (`sourceId`, `productId`),
  INDEX `num_evidence_year_idx` (`year`),
  INDEX `num_evidence_checkpoint_idx` (`checkpointId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Contradictions - Track conflicting values
CREATE TABLE IF NOT EXISTS `data_contradictions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `indicatorCode` VARCHAR(100) NOT NULL,
  `observationDate` TIMESTAMP NOT NULL,
  `regimeTag` ENUM('aden_irg', 'sanaa_defacto', 'mixed', 'international') NOT NULL,
  `observation1Id` VARCHAR(255) NOT NULL,
  `observation1Value` DECIMAL(30, 10) NOT NULL,
  `observation1Source` VARCHAR(100) NOT NULL,
  `observation2Id` VARCHAR(255) NOT NULL,
  `observation2Value` DECIMAL(30, 10) NOT NULL,
  `observation2Source` VARCHAR(100) NOT NULL,
  `variancePercent` DECIMAL(10, 4) NOT NULL,
  `varianceAbsolute` DECIMAL(30, 10) NOT NULL,
  `status` ENUM('unresolved', 'investigating', 'resolved', 'accepted_variance') DEFAULT 'unresolved' NOT NULL,
  `resolution` TEXT,
  `preferredObservationId` VARCHAR(255),
  `detectedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `resolvedAt` TIMESTAMP,
  `resolvedBy` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `contradiction_indicator_date_idx` (`indicatorCode`, `observationDate`),
  INDEX `contradiction_status_idx` (`status`),
  INDEX `contradiction_detected_idx` (`detectedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

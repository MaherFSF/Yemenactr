/**
 * YETO Platform - Data Governance Services
 * Section 8: The Trust Engine
 * 
 * Comprehensive data governance layer for:
 * - Provenance tracking (8A)
 * - Confidence ratings (8B)
 * - Contradiction detection (8C)
 * - Versioning & vintages (8D)
 * - Public changelog (8E)
 */

export { provenanceLedgerService, type ProvenanceEntry, type TransformationStep, type QACheckResult } from './provenanceLedger';
export { confidenceRatingService, type ConfidenceRatingInput, type ConfidenceRatingResult } from './confidenceRating';
export { contradictionDetectorService, type ContradictionInput, type ContradictionResult } from './contradictionDetector';
export { dataVintagesService, type VintageInput, type VintageRecord, type VersionDiff } from './dataVintages';
export { publicChangelogService, type ChangelogInput, type ChangelogEntry } from './publicChangelog';

/**
 * Data Governance Summary
 * 
 * The Trust Engine ensures all data on YETO is:
 * 1. Traceable - Every data point has complete provenance
 * 2. Rated - Confidence ratings A-D based on source quality
 * 3. Validated - Contradictions are detected and explained
 * 4. Versioned - Historical views preserved with revision tracking
 * 5. Transparent - Public changelog of all updates
 */

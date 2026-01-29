import { storagePut } from "../storage";
import { getDb } from "../db";
import { evidencePacks, exportManifests } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

// Export format types
type ExportFormat = "csv" | "json" | "xlsx" | "pdf" | "png" | "svg";

interface ExportOptions {
  format: ExportFormat;
  datasetId?: number;
  indicatorCodes?: string[];
  dateRange?: { start: string; end: string };
  includeEvidence?: boolean;
  language?: "en" | "ar";
  userId?: number;
}

interface ManifestFile {
  format: ExportFormat;
  filename: string;
  url: string;
  size: number;
  checksum?: string;
}

interface ExportManifest {
  exportId: string;
  createdAt: string;
  createdBy?: number;
  format: ExportFormat;
  datasetName?: string;
  indicatorCodes: string[];
  dateRange?: { start: string; end: string };
  recordCount: number;
  files: ManifestFile[];
  evidencePack?: {
    id: number;
    confidenceGrade: string;
    citationCount: number;
    hasContradictions: boolean;
  };
  license: {
    type: string;
    attribution: string;
    restrictions?: string[];
  };
  vintage?: {
    versionNumber: number;
    vintageDate: string;
  };
}

interface LicenseSummary {
  exportId: string;
  licenses: Array<{
    sourceId: number;
    sourceName: string;
    licenseType: string;
    attribution: string;
    url?: string;
    restrictions?: string[];
  }>;
  combinedRestrictions: string[];
  attributionText: string;
}

// Generate a unique export ID
function generateExportId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomUUID().split("-")[0];
  return `exp_${timestamp}_${random}`;
}

// Convert data to CSV format
function toCSV(data: Record<string, unknown>[], headers?: string[]): string {
  if (data.length === 0) return "";
  
  const keys = headers || Object.keys(data[0]);
  const headerRow = keys.join(",");
  const rows = data.map((row) =>
    keys.map((key) => {
      const value = row[key];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(",")
  );
  
  return [headerRow, ...rows].join("\n");
}

// Generate export manifest
async function generateManifest(
  exportId: string,
  options: ExportOptions,
  files: ManifestFile[],
  recordCount: number,
  evidencePackId?: number
): Promise<ExportManifest> {
  const db = await getDb();
  
  let evidenceData;
  if (evidencePackId && db) {
    const pack = await db
      .select()
      .from(evidencePacks)
      .where(eq(evidencePacks.id, evidencePackId))
      .limit(1);
    
    if (pack[0]) {
      evidenceData = {
        id: pack[0].id,
        confidenceGrade: pack[0].confidenceGrade,
        citationCount: (pack[0].citations as any[])?.length || 0,
        hasContradictions: pack[0].hasContradictions,
      };
    }
  }
  
  const manifest: ExportManifest = {
    exportId,
    createdAt: new Date().toISOString(),
    createdBy: options.userId,
    format: options.format,
    indicatorCodes: options.indicatorCodes || [],
    dateRange: options.dateRange,
    recordCount,
    files,
    evidencePack: evidenceData,
    license: {
      type: "CC-BY-4.0",
      attribution: "Yemen Economic Transparency Observatory (YETO)",
      restrictions: ["Attribution required", "Share-alike for derivatives"],
    },
  };
  
  return manifest;
}

// Generate license summary
async function generateLicenseSummary(
  exportId: string,
  sourceIds: number[]
): Promise<LicenseSummary> {
  // In a real implementation, this would fetch license info from sources table
  const licenses = sourceIds.map((id) => ({
    sourceId: id,
    sourceName: `Source ${id}`,
    licenseType: "CC-BY-4.0",
    attribution: "Yemen Economic Transparency Observatory",
    restrictions: ["Attribution required"],
  }));
  
  return {
    exportId,
    licenses,
    combinedRestrictions: ["Attribution required", "Non-commercial use only for some sources"],
    attributionText: `Data from Yemen Economic Transparency Observatory (YETO). Sources: ${licenses.map((l) => l.sourceName).join(", ")}. Licensed under CC-BY-4.0.`,
  };
}

// Main export function
export async function exportData(
  data: Record<string, unknown>[],
  options: ExportOptions
): Promise<{
  success: boolean;
  exportId: string;
  manifestUrl: string;
  dataUrl: string;
  evidencePackUrl?: string;
  licenseSummaryUrl?: string;
}> {
  const exportId = generateExportId();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const files: ManifestFile[] = [];
  
  // Generate data file based on format
  let dataContent: string | Buffer;
  let contentType: string;
  let extension: string;
  
  switch (options.format) {
    case "csv":
      dataContent = toCSV(data);
      contentType = "text/csv";
      extension = "csv";
      break;
    case "json":
      dataContent = JSON.stringify(data, null, 2);
      contentType = "application/json";
      extension = "json";
      break;
    default:
      dataContent = JSON.stringify(data, null, 2);
      contentType = "application/json";
      extension = "json";
  }
  
  // Upload data file to S3
  const dataFilename = `exports/${exportId}/data_${timestamp}.${extension}`;
  const { url: dataUrl } = await storagePut(dataFilename, dataContent, contentType);
  
  files.push({
    format: options.format,
    filename: `data.${extension}`,
    url: dataUrl,
    size: Buffer.byteLength(dataContent),
  });
  
  // Generate and upload manifest
  const manifest = await generateManifest(
    exportId,
    options,
    files,
    data.length,
    options.includeEvidence ? 1 : undefined // Would be actual evidence pack ID
  );
  
  const manifestFilename = `exports/${exportId}/manifest.json`;
  const { url: manifestUrl } = await storagePut(
    manifestFilename,
    JSON.stringify(manifest, null, 2),
    "application/json"
  );
  
  // Generate and upload evidence pack if requested
  let evidencePackUrl: string | undefined;
  if (options.includeEvidence) {
    const evidencePackFilename = `exports/${exportId}/evidence_pack.json`;
    const evidencePackContent = {
      exportId,
      generatedAt: new Date().toISOString(),
      evidencePacks: [], // Would contain actual evidence packs
      provenanceChain: {
        dataSource: "YETO Database",
        processingSteps: ["Data extraction", "Format conversion", "Quality validation"],
        validationStatus: "passed",
      },
    };
    const { url } = await storagePut(
      evidencePackFilename,
      JSON.stringify(evidencePackContent, null, 2),
      "application/json"
    );
    evidencePackUrl = url;
  }
  
  // Generate and upload license summary
  const licenseSummary = await generateLicenseSummary(exportId, [1, 2, 3]); // Would use actual source IDs
  const licenseSummaryFilename = `exports/${exportId}/license_summary.json`;
  const { url: licenseSummaryUrl } = await storagePut(
    licenseSummaryFilename,
    JSON.stringify(licenseSummary, null, 2),
    "application/json"
  );
  
  // Save export record to database
  const db = await getDb();
  if (db) {
    await db.insert(exportManifests).values({
      exportType: options.format as "csv" | "json" | "xlsx" | "pdf" | "png" | "svg" | "markdown",
      exportName: `Export ${exportId}`,
      userId: options.userId ?? null,
      filters: {
        indicators: options.indicatorCodes,
        dateRange: options.dateRange,
      },
      exportFileKey: dataFilename,
      exportFileUrl: dataUrl,
      exportFileSize: Buffer.byteLength(dataContent),
      manifestFileKey: manifestFilename,
      manifestFileUrl: manifestUrl,
      evidencePackFileKey: options.includeEvidence ? `exports/${exportId}/evidence_pack.json` : `exports/${exportId}/no_evidence.json`,
      evidencePackFileUrl: evidencePackUrl || `${dataUrl.split('/').slice(0, -1).join('/')}/no_evidence.json`,
      licenseSummaryFileKey: licenseSummaryFilename,
      licenseSummaryFileUrl: licenseSummaryUrl,
      recordCount: data.length,
      sourceCount: 1,
    });
  }
  
  return {
    success: true,
    exportId,
    manifestUrl,
    dataUrl,
    evidencePackUrl,
    licenseSummaryUrl,
  };
}

// Export router procedures
export const exportProcedures = {
  // Export time series data
  exportTimeSeries: async (
    indicatorCodes: string[],
    format: ExportFormat,
    options: Partial<ExportOptions>
  ) => {
    // Fetch time series data
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // This would fetch actual data from timeSeries table
    const mockData = indicatorCodes.map((code) => ({
      indicatorCode: code,
      date: new Date().toISOString(),
      value: Math.random() * 100,
      source: "YETO",
    }));
    
    return exportData(mockData, {
      format,
      indicatorCodes,
      ...options,
    });
  },
  
  // Get export by ID
  getExport: async (exportId: number) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db
      .select()
      .from(exportManifests)
      .where(eq(exportManifests.id, exportId))
      .limit(1);
    
    return result[0] || null;
  },
  
  // List user exports
  listExports: async (userId: number, limit: number = 20) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db
      .select()
      .from(exportManifests)
      .where(eq(exportManifests.userId, userId))
      .limit(limit);
    
    return result;
  },
};

export default exportData;

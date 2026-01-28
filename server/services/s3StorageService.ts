/**
 * YETO S3 Storage Service
 * 
 * Enhanced storage service with prefix management for different asset types.
 * All files are stored in S3 with proper organization and metadata tracking.
 * 
 * Prefixes:
 * - documents/    → PDFs, reports, publications
 * - raw-data/     → Ingestion payloads, API responses
 * - processed-data/ → Normalized, cleaned data
 * - exports/      → User-generated exports (CSV, XLSX, PDF)
 * - logs/         → Application logs, audit trails
 * - backups/      → Database backups
 * - assets/       → Images, media files
 */

import { storagePut, storageGet } from '../storage';
import crypto from 'crypto';

// S3 Prefix Constants
export const S3_PREFIXES = {
  DOCUMENTS: 'documents/',
  RAW_DATA: 'raw-data/',
  PROCESSED_DATA: 'processed-data/',
  EXPORTS: 'exports/',
  LOGS: 'logs/',
  BACKUPS: 'backups/',
  ASSETS: 'assets/',
  TEMP: 'temp/',
} as const;

export type S3Prefix = typeof S3_PREFIXES[keyof typeof S3_PREFIXES];

// Content type mappings
const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.csv': 'text/csv',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
};

/**
 * Generate a random suffix to prevent enumeration attacks
 */
function generateRandomSuffix(length = 8): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Get content type from file extension
 */
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

/**
 * Build a secure, non-enumerable S3 key
 */
function buildSecureKey(prefix: S3Prefix, filename: string, userId?: string): string {
  const timestamp = Date.now();
  const suffix = generateRandomSuffix();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  if (userId) {
    return `${prefix}${userId}/${timestamp}-${suffix}-${sanitizedFilename}`;
  }
  return `${prefix}${timestamp}-${suffix}-${sanitizedFilename}`;
}

/**
 * Upload a document (PDF, report, publication)
 */
export async function uploadDocument(
  filename: string,
  data: Buffer | Uint8Array | string,
  options?: {
    userId?: string;
    category?: string;
    contentType?: string;
  }
): Promise<{ key: string; url: string }> {
  const prefix = options?.category 
    ? `${S3_PREFIXES.DOCUMENTS}${options.category}/` as S3Prefix
    : S3_PREFIXES.DOCUMENTS;
  
  const key = buildSecureKey(prefix, filename, options?.userId);
  const contentType = options?.contentType || getContentType(filename);
  
  return storagePut(key, data, contentType);
}

/**
 * Upload raw data from API ingestion
 */
export async function uploadRawData(
  sourceId: string,
  data: Buffer | Uint8Array | string,
  options?: {
    format?: 'json' | 'xml' | 'csv';
    timestamp?: Date;
  }
): Promise<{ key: string; url: string }> {
  const timestamp = options?.timestamp || new Date();
  const dateStr = timestamp.toISOString().split('T')[0];
  const format = options?.format || 'json';
  const suffix = generateRandomSuffix(4);
  
  const key = `${S3_PREFIXES.RAW_DATA}${sourceId}/${dateStr}/${timestamp.getTime()}-${suffix}.${format}`;
  const contentType = CONTENT_TYPES[`.${format}`] || 'application/octet-stream';
  
  return storagePut(key, data, contentType);
}

/**
 * Upload processed/normalized data
 */
export async function uploadProcessedData(
  datasetId: string,
  data: Buffer | Uint8Array | string,
  options?: {
    version?: string;
    format?: 'json' | 'csv';
  }
): Promise<{ key: string; url: string }> {
  const version = options?.version || 'v1';
  const format = options?.format || 'json';
  const timestamp = Date.now();
  const suffix = generateRandomSuffix(4);
  
  const key = `${S3_PREFIXES.PROCESSED_DATA}${datasetId}/${version}/${timestamp}-${suffix}.${format}`;
  const contentType = CONTENT_TYPES[`.${format}`] || 'application/octet-stream';
  
  return storagePut(key, data, contentType);
}

/**
 * Upload user export (CSV, XLSX, PDF, JSON)
 */
export async function uploadExport(
  userId: string,
  filename: string,
  data: Buffer | Uint8Array | string,
  options?: {
    exportType?: 'csv' | 'xlsx' | 'pdf' | 'json';
    expiresIn?: number; // hours
  }
): Promise<{ key: string; url: string; expiresAt?: Date }> {
  const exportType = options?.exportType || 'csv';
  const timestamp = Date.now();
  const suffix = generateRandomSuffix(4);
  
  const key = `${S3_PREFIXES.EXPORTS}${userId}/${timestamp}-${suffix}-${filename}.${exportType}`;
  const contentType = CONTENT_TYPES[`.${exportType}`] || 'application/octet-stream';
  
  const result = await storagePut(key, data, contentType);
  
  // Calculate expiration if specified
  const expiresAt = options?.expiresIn 
    ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000)
    : undefined;
  
  return { ...result, expiresAt };
}

/**
 * Upload application log
 */
export async function uploadLog(
  logType: 'app' | 'audit' | 'error' | 'access',
  data: Buffer | Uint8Array | string,
  options?: {
    date?: Date;
  }
): Promise<{ key: string; url: string }> {
  const date = options?.date || new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timestamp = date.getTime();
  const suffix = generateRandomSuffix(4);
  
  const key = `${S3_PREFIXES.LOGS}${logType}/${dateStr}/${timestamp}-${suffix}.log`;
  
  return storagePut(key, data, 'text/plain');
}

/**
 * Upload database backup
 */
export async function uploadBackup(
  backupType: 'full' | 'incremental' | 'schema',
  data: Buffer | Uint8Array | string,
  options?: {
    compressed?: boolean;
  }
): Promise<{ key: string; url: string }> {
  const date = new Date();
  const dateStr = date.toISOString().replace(/[:.]/g, '-');
  const ext = options?.compressed ? '.sql.gz' : '.sql';
  const suffix = generateRandomSuffix(4);
  
  const key = `${S3_PREFIXES.BACKUPS}${backupType}/${dateStr}-${suffix}${ext}`;
  const contentType = options?.compressed ? 'application/gzip' : 'text/plain';
  
  return storagePut(key, data, contentType);
}

/**
 * Upload asset (image, media)
 */
export async function uploadAsset(
  filename: string,
  data: Buffer | Uint8Array | string,
  options?: {
    category?: string;
    contentType?: string;
  }
): Promise<{ key: string; url: string }> {
  const prefix = options?.category 
    ? `${S3_PREFIXES.ASSETS}${options.category}/` as S3Prefix
    : S3_PREFIXES.ASSETS;
  
  const key = buildSecureKey(prefix, filename);
  const contentType = options?.contentType || getContentType(filename);
  
  return storagePut(key, data, contentType);
}

/**
 * Get a signed download URL for a file
 */
export async function getDownloadUrl(key: string): Promise<string> {
  const result = await storageGet(key);
  return result.url;
}

/**
 * List files in a prefix (for admin/debugging)
 * Note: This is a placeholder - actual implementation depends on S3 API access
 */
export async function listFiles(prefix: S3Prefix): Promise<string[]> {
  // In production, this would call S3 ListObjects API
  // For now, return empty array as placeholder
  console.log(`[S3] Listing files in prefix: ${prefix}`);
  return [];
}

/**
 * Delete a file from S3
 * Note: This is a placeholder - actual implementation depends on S3 API access
 */
export async function deleteFile(key: string): Promise<boolean> {
  // In production, this would call S3 DeleteObject API
  console.log(`[S3] Deleting file: ${key}`);
  return true;
}

/**
 * Storage usage statistics
 */
export interface StorageStats {
  prefix: S3Prefix;
  fileCount: number;
  totalSizeBytes: number;
  lastModified?: Date;
}

/**
 * Get storage statistics for each prefix
 * Note: This is a placeholder - actual implementation depends on S3 API access
 */
export async function getStorageStats(): Promise<StorageStats[]> {
  return Object.values(S3_PREFIXES).map(prefix => ({
    prefix,
    fileCount: 0,
    totalSizeBytes: 0,
    lastModified: undefined,
  }));
}

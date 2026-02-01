#!/usr/bin/env node
/**
 * S3 Asset Upload Script
 * 
 * Uploads large binary assets (images, documents, PDFs) to S3 storage.
 * These assets are excluded from git to keep the repository slim.
 * 
 * Usage: node scripts/upload-assets-to-s3.mjs [--dry-run]
 * 
 * Environment variables required:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION
 * - S3_BUCKET
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';
import { createHash } from 'crypto';

// Configuration
const ASSET_DIRECTORIES = [
  { local: 'cby-publications', s3Prefix: 'assets/cby-publications' },
  { local: 'client/public/documents', s3Prefix: 'assets/documents' },
  { local: 'client/public/images/generated', s3Prefix: 'assets/images/generated' },
  { local: 'client/public/images/sectors', s3Prefix: 'assets/images/sectors' },
  { local: 'client/public/images/events', s3Prefix: 'assets/images/events' },
  { local: 'client/public/images/yemen', s3Prefix: 'assets/images/yemen' },
];

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

const DRY_RUN = process.argv.includes('--dry-run');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET;

if (!BUCKET && !DRY_RUN) {
  console.error('❌ S3_BUCKET environment variable is required');
  process.exit(1);
}

/**
 * Get all files recursively from a directory
 */
async function getFilesRecursively(dir, baseDir = dir) {
  const files = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await getFilesRecursively(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const relativePath = relative(baseDir, fullPath);
        files.push({ fullPath, relativePath });
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`⚠️  Warning: Could not read directory ${dir}: ${err.message}`);
    }
  }
  
  return files;
}

/**
 * Calculate MD5 hash of file content
 */
function calculateMD5(buffer) {
  return createHash('md5').update(buffer).digest('hex');
}

/**
 * Check if file already exists in S3 with same content
 */
async function fileExistsInS3(key, localMD5) {
  try {
    const response = await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
    
    // Check if ETag matches (ETag is MD5 for non-multipart uploads)
    const s3ETag = response.ETag?.replace(/"/g, '');
    return s3ETag === localMD5;
  } catch (err) {
    if (err.name === 'NotFound') {
      return false;
    }
    throw err;
  }
}

/**
 * Upload a single file to S3
 */
async function uploadFile(localPath, s3Key, contentType) {
  const content = await readFile(localPath);
  const md5 = calculateMD5(content);
  
  // Check if file already exists with same content
  if (!DRY_RUN) {
    const exists = await fileExistsInS3(s3Key, md5);
    if (exists) {
      return { status: 'skipped', reason: 'already exists' };
    }
  }
  
  if (DRY_RUN) {
    return { status: 'dry-run', size: content.length };
  }
  
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    Body: content,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
  }));
  
  return { status: 'uploaded', size: content.length };
}

/**
 * Get MIME type for file
 */
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main upload function
 */
async function main() {
  console.log('🚀 YETO S3 Asset Upload Script');
  console.log('================================');
  
  if (DRY_RUN) {
    console.log('📋 DRY RUN MODE - No files will be uploaded\n');
  } else {
    console.log(`📦 Target bucket: ${BUCKET}\n`);
  }
  
  const stats = {
    uploaded: 0,
    skipped: 0,
    failed: 0,
    totalBytes: 0,
  };
  
  for (const { local, s3Prefix } of ASSET_DIRECTORIES) {
    const localDir = join(process.cwd(), local);
    console.log(`\n📁 Processing: ${local}`);
    
    const files = await getFilesRecursively(localDir);
    
    if (files.length === 0) {
      console.log('   (no files found)');
      continue;
    }
    
    console.log(`   Found ${files.length} files`);
    
    for (const { fullPath, relativePath } of files) {
      const s3Key = `${s3Prefix}/${relativePath}`.replace(/\\/g, '/');
      const mimeType = getMimeType(fullPath);
      
      try {
        const result = await uploadFile(fullPath, s3Key, mimeType);
        
        if (result.status === 'uploaded' || result.status === 'dry-run') {
          stats.uploaded++;
          stats.totalBytes += result.size;
          console.log(`   ✅ ${relativePath} (${formatBytes(result.size)})`);
        } else if (result.status === 'skipped') {
          stats.skipped++;
          console.log(`   ⏭️  ${relativePath} (${result.reason})`);
        }
      } catch (err) {
        stats.failed++;
        console.error(`   ❌ ${relativePath}: ${err.message}`);
      }
    }
  }
  
  console.log('\n================================');
  console.log('📊 Summary:');
  console.log(`   Uploaded: ${stats.uploaded} files (${formatBytes(stats.totalBytes)})`);
  console.log(`   Skipped:  ${stats.skipped} files`);
  console.log(`   Failed:   ${stats.failed} files`);
  
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to actually upload files');
  }
  
  // Generate manifest
  if (!DRY_RUN && stats.uploaded > 0) {
    console.log('\n📝 Generating asset manifest...');
    // The manifest would be generated here for production use
  }
  
  process.exit(stats.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

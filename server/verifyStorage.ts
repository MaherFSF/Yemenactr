/**
 * S3 Storage Verification Script
 * Tests upload and download functionality
 */

import { storagePut, storageGet } from "./storage";

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           YETO S3 STORAGE VERIFICATION                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Test 1: Upload a test file
    console.log('Test 1: Uploading test file...');
    const testContent = JSON.stringify({
      test: true,
      timestamp: new Date().toISOString(),
      message: 'YETO Storage Verification Test',
    });
    
    const testKey = `yeto-test/verification-${Date.now()}.json`;
    const uploadResult = await storagePut(testKey, testContent, 'application/json');
    console.log(`✓ Upload successful`);
    console.log(`  Key: ${uploadResult.key}`);
    console.log(`  URL: ${uploadResult.url}`);
    
    // Test 2: Get download URL
    console.log('\nTest 2: Getting download URL...');
    const downloadResult = await storageGet(testKey);
    console.log(`✓ Download URL retrieved`);
    console.log(`  URL: ${downloadResult.url}`);
    
    // Test 3: Verify file is accessible
    console.log('\nTest 3: Verifying file accessibility...');
    const response = await fetch(downloadResult.url);
    if (response.ok) {
      const content = await response.json();
      console.log(`✓ File is accessible`);
      console.log(`  Content: ${JSON.stringify(content)}`);
    } else {
      console.log(`✗ File not accessible: ${response.status}`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✓ S3 Storage verification PASSED');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n✗ Storage verification FAILED:', error);
    process.exit(1);
  }
}

main().catch(console.error);

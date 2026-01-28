#!/bin/bash

# check-large-files.sh — Guard against committing large files to Git
# This script is used as a pre-commit hook to prevent files > 20MB from being committed

set -e

# Configuration
MAX_FILE_SIZE=20971520  # 20 MB in bytes
EXIT_CODE=0

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to format bytes to human-readable size
format_size() {
    local bytes=$1
    if [ $bytes -lt 1024 ]; then
        echo "${bytes}B"
    elif [ $bytes -lt 1048576 ]; then
        echo "$((bytes / 1024))KB"
    else
        echo "$((bytes / 1048576))MB"
    fi
}

# Function to check if file should be excluded
should_exclude() {
    local file=$1
    
    # Exclude patterns
    local exclude_patterns=(
        "node_modules/"
        ".git/"
        ".next/"
        "dist/"
        "build/"
        ".env"
        ".env.local"
        ".env.*.local"
        "*.lock"
        "pnpm-lock.yaml"
        "package-lock.json"
        "yarn.lock"
    )
    
    for pattern in "${exclude_patterns[@]}"; do
        if [[ $file == *"$pattern"* ]]; then
            return 0  # Should exclude
        fi
    done
    
    return 1  # Should not exclude
}

# Main check
echo "🔍 Checking for large files..."

# Get list of staged files
staged_files=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$staged_files" ]; then
    echo -e "${GREEN}✓ No files staged${NC}"
    exit 0
fi

large_files_found=0

while IFS= read -r file; do
    # Skip if file should be excluded
    if should_exclude "$file"; then
        continue
    fi
    
    # Get file size
    if [ -f "$file" ]; then
        file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        
        if [ "$file_size" -gt "$MAX_FILE_SIZE" ]; then
            echo -e "${RED}✗ File too large: $file ($(format_size $file_size))${NC}"
            echo "  → Move to S3 and update manifests/s3-assets.json"
            large_files_found=$((large_files_found + 1))
            EXIT_CODE=1
        fi
    fi
done <<< "$staged_files"

if [ $large_files_found -eq 0 ]; then
    echo -e "${GREEN}✓ All files are within size limits${NC}"
else
    echo ""
    echo -e "${RED}Error: $large_files_found file(s) exceed 20MB limit${NC}"
    echo ""
    echo "📋 To fix this:"
    echo "  1. Remove the large file from staging:"
    echo "     git reset HEAD <file>"
    echo ""
    echo "  2. Upload to S3:"
    echo "     aws s3 cp <file> s3://yeto-data-prod/<prefix>/"
    echo ""
    echo "  3. Update manifests/s3-assets.json with the S3 location"
    echo ""
    echo "  4. Add reference to .gitignore if needed"
    echo ""
    echo "  5. Commit the manifest update:"
    echo "     git add manifests/s3-assets.json"
    echo "     git commit -m 'docs: update S3 asset manifest'"
    echo ""
fi

exit $EXIT_CODE

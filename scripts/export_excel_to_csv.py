#!/usr/bin/env python3
"""
YETO Source Registry Excel to CSV Exporter

Exports each sheet from YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx
to individual CSV files for easier programmatic access and version control.

Usage:
    python scripts/export_excel_to_csv.py

Output:
    data/exports/yeto_sources_universe/<sheet_name>.csv
"""

import os
import re
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("Error: pandas is required. Install with: pip install pandas openpyxl")
    sys.exit(1)


def sanitize_sheet_name(name: str) -> str:
    """
    Sanitize sheet name for use as filename.
    
    Examples:
        'SECTOR_CODEBOOK_16' -> 'sector_codebook_16'
        'SOURCE-SECTOR MATRIX_292' -> 'source_sector_matrix_292'
        'Source Products (v2)' -> 'source_products_v2'
    """
    # Convert to lowercase
    sanitized = name.lower()
    
    # Replace spaces, hyphens, and parentheses with underscores
    sanitized = re.sub(r'[\s\-\(\)]+', '_', sanitized)
    
    # Remove any remaining special characters except underscores and alphanumeric
    sanitized = re.sub(r'[^a-z0-9_]', '', sanitized)
    
    # Remove duplicate underscores
    sanitized = re.sub(r'_+', '_', sanitized)
    
    # Strip leading/trailing underscores
    sanitized = sanitized.strip('_')
    
    return sanitized


def export_excel_to_csv(excel_path: str, output_dir: str, verbose: bool = True):
    """
    Export each sheet from Excel file to separate CSV files.
    
    Args:
        excel_path: Path to the Excel file
        output_dir: Directory to save CSV files
        verbose: Print progress information
    """
    # Check if Excel file exists
    if not os.path.exists(excel_path):
        print(f"Error: Excel file not found: {excel_path}")
        sys.exit(1)
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    if verbose:
        print(f"Reading Excel file: {excel_path}")
        print(f"Output directory: {output_dir}\n")
    
    # Read Excel file
    try:
        excel_file = pd.ExcelFile(excel_path)
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        sys.exit(1)
    
    # Export each sheet
    exported_count = 0
    skipped_count = 0
    errors = []
    
    for sheet_name in excel_file.sheet_names:
        try:
            # Read the sheet
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Sanitize sheet name for filename
            sanitized_name = sanitize_sheet_name(sheet_name)
            output_file = os.path.join(output_dir, f"{sanitized_name}.csv")
            
            # Export to CSV
            df.to_csv(output_file, index=False, encoding='utf-8')
            
            if verbose:
                print(f"✓ Exported '{sheet_name}' -> {sanitized_name}.csv ({len(df)} rows, {len(df.columns)} columns)")
            
            exported_count += 1
            
        except Exception as e:
            error_msg = f"✗ Failed to export '{sheet_name}': {str(e)}"
            errors.append(error_msg)
            if verbose:
                print(error_msg)
            skipped_count += 1
    
    # Summary
    if verbose:
        print(f"\n{'='*70}")
        print(f"Export Summary:")
        print(f"  Successfully exported: {exported_count} sheets")
        if skipped_count > 0:
            print(f"  Skipped/Failed: {skipped_count} sheets")
        print(f"  Output directory: {output_dir}")
        print(f"{'='*70}")
    
    # Print errors if any
    if errors:
        print("\nErrors encountered:")
        for error in errors:
            print(f"  {error}")
        sys.exit(1)


def main():
    """Main entry point."""
    # Define paths relative to repository root
    repo_root = Path(__file__).parent.parent
    
    # Use canonical location
    excel_path = repo_root / "data" / "source_registry" / "YETO_Sources_Universe_Master_PRODUCTION_READY_v2_3.xlsx"
    output_dir = repo_root / "data" / "exports" / "yeto_sources_universe"
    
    print("="*70)
    print("YETO Source Registry Excel to CSV Exporter")
    print("="*70)
    print()
    
    # Export sheets
    export_excel_to_csv(str(excel_path), str(output_dir), verbose=True)
    
    print("\n✓ Export complete!")
    print(f"\nCSV files are available at: {output_dir}")


if __name__ == "__main__":
    main()

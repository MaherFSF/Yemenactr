/**
 * Sector Export Buttons Component
 * Provides consistent export functionality across all sector pages
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileJson, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExportData {
  title: string;
  data: Record<string, any>[];
  filename: string;
}

interface SectorExportButtonsProps {
  sectorName: string;
  datasets: ExportData[];
  className?: string;
}

export function SectorExportButtons({ sectorName, datasets, className = '' }: SectorExportButtonsProps) {
  const { t, language } = useLanguage();
  const [exporting, setExporting] = useState<string | null>(null);

  const exportToCSV = (data: Record<string, any>[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');
    
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };

  const exportToJSON = (data: Record<string, any>[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
  };

  const exportToXLSX = async (data: Record<string, any>[], filename: string) => {
    // For XLSX, we'll create a simple tab-separated format that Excel can open
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const tsvContent = [
      headers.join('\t'),
      ...data.map(row => headers.map(h => row[h] ?? '').join('\t'))
    ].join('\n');
    
    downloadFile(tsvContent, `${filename}.xls`, 'application/vnd.ms-excel');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'csv' | 'json' | 'xlsx', dataset: ExportData) => {
    setExporting(`${dataset.filename}-${format}`);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    switch (format) {
      case 'csv':
        exportToCSV(dataset.data, dataset.filename);
        break;
      case 'json':
        exportToJSON(dataset.data, dataset.filename);
        break;
      case 'xlsx':
        await exportToXLSX(dataset.data, dataset.filename);
        break;
    }
    
    setExporting(null);
  };

  const isRTL = language === 'ar';

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {datasets.map((dataset) => (
        <DropdownMenu key={dataset.filename}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              disabled={exporting !== null}
            >
              {exporting?.startsWith(dataset.filename) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{dataset.title}</span>
              <span className="sm:hidden">{isRTL ? 'تصدير' : 'Export'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => handleExport('csv', dataset)}>
              <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json', dataset)}>
              <FileJson className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('xlsx', dataset)}>
              <FileSpreadsheet className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      
      {/* Export All Button */}
      {datasets.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="default" 
              size="sm"
              className="gap-2 bg-[#107040] hover:bg-[#0d5a34]"
              disabled={exporting !== null}
            >
              <Download className="h-4 w-4" />
              {isRTL ? 'تصدير الكل' : 'Export All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => {
              datasets.forEach(ds => handleExport('csv', ds));
            }}>
              <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'الكل كـ CSV' : 'All as CSV'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              datasets.forEach(ds => handleExport('json', ds));
            }}>
              <FileJson className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'الكل كـ JSON' : 'All as JSON'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default SectorExportButtons;

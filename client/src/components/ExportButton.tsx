import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileJson, FileText, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface ExportButtonProps {
  data: any[];
  filename: string;
  title?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton({ 
  data, 
  filename, 
  title,
  variant = "outline",
  size = "default"
}: ExportButtonProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or newline
          if (typeof value === "string" && (value.includes(",") || value.includes("\n") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      )
    ];
    
    return csvRows.join("\n");
  };

  const downloadFile = (content: string, type: string, extension: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: "csv" | "json" | "xlsx") => {
    if (data.length === 0) {
      toast.error(isArabic ? "لا توجد بيانات للتصدير" : "No data to export");
      return;
    }

    setIsExporting(true);
    
    try {
      switch (format) {
        case "csv":
          const csv = convertToCSV(data);
          downloadFile(csv, "text/csv;charset=utf-8;", "csv");
          toast.success(isArabic ? "تم تصدير البيانات بنجاح (CSV)" : "Data exported successfully (CSV)");
          break;
          
        case "json":
          const json = JSON.stringify(data, null, 2);
          downloadFile(json, "application/json", "json");
          toast.success(isArabic ? "تم تصدير البيانات بنجاح (JSON)" : "Data exported successfully (JSON)");
          break;
          
        case "xlsx":
          // For XLSX, we'll use CSV as a fallback since we don't have xlsx library
          const xlsxCsv = convertToCSV(data);
          downloadFile(xlsxCsv, "text/csv;charset=utf-8;", "csv");
          toast.success(isArabic ? "تم تصدير البيانات بنجاح (CSV)" : "Data exported successfully (CSV format)");
          break;
      }
    } catch (error) {
      toast.error(isArabic ? "فشل تصدير البيانات" : "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {title || (isArabic ? "تصدير" : "Export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {isArabic ? "تصدير CSV" : "Export as CSV"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="h-4 w-4 mr-2" />
          {isArabic ? "تصدير JSON" : "Export as JSON"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")}>
          <FileText className="h-4 w-4 mr-2" />
          {isArabic ? "تصدير Excel" : "Export as Excel"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick export button for single format
interface QuickExportButtonProps {
  data: any[];
  filename: string;
  format: "csv" | "json";
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function QuickExportButton({
  data,
  filename,
  format,
  variant = "outline",
  size = "sm"
}: QuickExportButtonProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === "string" && (value.includes(",") || value.includes("\n") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      )
    ];
    
    return csvRows.join("\n");
  };

  const handleExport = async () => {
    if (data.length === 0) {
      toast.error(isArabic ? "لا توجد بيانات للتصدير" : "No data to export");
      return;
    }

    setIsExporting(true);
    
    try {
      const content = format === "csv" ? convertToCSV(data) : JSON.stringify(data, null, 2);
      const type = format === "csv" ? "text/csv;charset=utf-8;" : "application/json";
      
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(isArabic ? `تم تصدير البيانات بنجاح (${format.toUpperCase()})` : `Data exported successfully (${format.toUpperCase()})`);
    } catch (error) {
      toast.error(isArabic ? "فشل تصدير البيانات" : "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileJson, FileText, Loader2, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ExportButtonProps {
  data: any[];
  filename: string;
  title?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  /** If true, uploads to S3 and returns signed URL */
  useS3?: boolean;
  /** Optional sources for evidence pack */
  sources?: Array<{ sourceId: string; name: string; tier: string }>;
}

export function ExportButton({ 
  data, 
  filename, 
  title,
  variant = "outline",
  size = "default",
  useS3 = true,
  sources = []
}: ExportButtonProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [isExporting, setIsExporting] = useState(false);
  
  // tRPC mutation for S3 upload
  const uploadExport = trpc.storage.uploadExport.useMutation();

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

  const downloadFromUrl = (url: string, downloadFilename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFilename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      let content: string;
      let contentType: string;
      
      switch (format) {
        case "csv":
          content = convertToCSV(data);
          contentType = "text/csv";
          break;
        case "json":
          content = JSON.stringify(data, null, 2);
          contentType = "application/json";
          break;
        case "xlsx":
          // Fallback to CSV for Excel
          content = convertToCSV(data);
          contentType = "text/csv";
          format = "csv";
          break;
        default:
          content = convertToCSV(data);
          contentType = "text/csv";
      }

      if (useS3) {
        // Upload to S3 and get signed URL
        const base64Data = btoa(unescape(encodeURIComponent(content)));
        const result = await uploadExport.mutateAsync({
          filename: `${filename}_${new Date().toISOString().split('T')[0]}`,
          data: base64Data,
          exportType: format as "csv" | "json" | "xlsx" | "pdf",
          expiresInHours: 168, // 7 days
        });

        if (result.success && result.url) {
          // Open signed URL in new tab for download
          downloadFromUrl(result.url, `${filename}_${new Date().toISOString().split('T')[0]}.${format}`);
          toast.success(
            isArabic 
              ? `تم تصدير البيانات بنجاح (${format.toUpperCase()}) - رابط صالح لمدة 7 أيام` 
              : `Data exported successfully (${format.toUpperCase()}) - Link valid for 7 days`
          );
        } else {
          throw new Error("Upload failed");
        }
      } else {
        // Local download fallback
        downloadFile(content, contentType, format);
        toast.success(isArabic ? `تم تصدير البيانات بنجاح (${format.toUpperCase()})` : `Data exported successfully (${format.toUpperCase()})`);
      }
    } catch (error) {
      console.error("Export error:", error);
      // Fallback to local download on S3 error
      if (useS3) {
        toast.info(isArabic ? "جاري التصدير محليًا..." : "Falling back to local export...");
        const content = format === "json" ? JSON.stringify(data, null, 2) : convertToCSV(data);
        const type = format === "json" ? "application/json" : "text/csv;charset=utf-8;";
        downloadFile(content, type, format === "json" ? "json" : "csv");
        toast.success(isArabic ? "تم تصدير البيانات محليًا" : "Data exported locally");
      } else {
        toast.error(isArabic ? "فشل تصدير البيانات" : "Failed to export data");
      }
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
          {useS3 && <ExternalLink className="h-3 w-3 ml-2 opacity-50" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="h-4 w-4 mr-2" />
          {isArabic ? "تصدير JSON" : "Export as JSON"}
          {useS3 && <ExternalLink className="h-3 w-3 ml-2 opacity-50" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")}>
          <FileText className="h-4 w-4 mr-2" />
          {isArabic ? "تصدير Excel" : "Export as Excel"}
          {useS3 && <ExternalLink className="h-3 w-3 ml-2 opacity-50" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick export button for single format with S3 support
interface QuickExportButtonProps {
  data: any[];
  filename: string;
  format: "csv" | "json";
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  useS3?: boolean;
}

export function QuickExportButton({
  data,
  filename,
  format,
  variant = "outline",
  size = "sm",
  useS3 = true
}: QuickExportButtonProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [isExporting, setIsExporting] = useState(false);
  
  const uploadExport = trpc.storage.uploadExport.useMutation();

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
      
      if (useS3) {
        const base64Data = btoa(unescape(encodeURIComponent(content)));
        const result = await uploadExport.mutateAsync({
          filename: `${filename}_${new Date().toISOString().split('T')[0]}`,
          data: base64Data,
          exportType: format,
          expiresInHours: 168,
        });

        if (result.success && result.url) {
          window.open(result.url, "_blank");
          toast.success(
            isArabic 
              ? `تم تصدير البيانات (${format.toUpperCase()})` 
              : `Data exported (${format.toUpperCase()})`
          );
        }
      } else {
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
      }
    } catch (error) {
      console.error("Export error:", error);
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

// S3 Download Link component for direct signed URL downloads
interface S3DownloadLinkProps {
  s3Key: string;
  filename: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function S3DownloadLink({
  s3Key,
  filename,
  children,
  variant = "link",
  size = "default"
}: S3DownloadLinkProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [isLoading, setIsLoading] = useState(false);
  
  const getDownloadUrl = trpc.storage.getDownloadUrl.useQuery(
    { key: s3Key },
    { enabled: false }
  );

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const result = await getDownloadUrl.refetch();
      if (result.data?.url) {
        window.open(result.data.url, "_blank");
      }
    } catch (error) {
      toast.error(isArabic ? "فشل الحصول على رابط التحميل" : "Failed to get download link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {children || filename}
    </Button>
  );
}

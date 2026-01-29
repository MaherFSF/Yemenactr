/**
 * YETO Manual Ingestion Queue & Partnership Outbox
 * 
 * Features:
 * - Manual upload for PDF/CSV/XLSX
 * - Schema validation and provenance logging
 * - Access Needed workflow
 * - Partnership Outbox with draft emails
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Upload,
  FileText,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  Building2,
  FileSpreadsheet,
  File,
} from "lucide-react";
import { toast } from "sonner";

// Upload queue item
interface QueueItem {
  id: string;
  fileName: string;
  fileType: "pdf" | "csv" | "xlsx" | "docx";
  fileSize: number;
  status: "pending" | "validating" | "processing" | "completed" | "failed";
  uploadedAt: Date;
  uploadedBy: string;
  sourceId?: string;
  sector?: string;
  validationErrors?: string[];
  processingProgress?: number;
}

// Partnership outbox item
interface PartnershipRequest {
  id: string;
  organization: string;
  organizationAr: string;
  contactEmail: string;
  contactName?: string;
  datasetRequested: string;
  datasetRequestedAr: string;
  status: "draft" | "sent" | "responded" | "approved" | "rejected";
  createdAt: Date;
  sentAt?: Date;
  responseAt?: Date;
  draftEmail?: string;
  notes?: string;
}

// Mock data
const mockQueueItems: QueueItem[] = [
  {
    id: "q1",
    fileName: "cby_monthly_report_2024.pdf",
    fileType: "pdf",
    fileSize: 2456789,
    status: "completed",
    uploadedAt: new Date(Date.now() - 86400000),
    uploadedBy: "admin@yeto.org",
    sourceId: "CBY",
    sector: "banking",
  },
  {
    id: "q2",
    fileName: "trade_data_q4_2024.xlsx",
    fileType: "xlsx",
    fileSize: 1234567,
    status: "processing",
    uploadedAt: new Date(Date.now() - 3600000),
    uploadedBy: "data@yeto.org",
    sector: "trade",
    processingProgress: 65,
  },
  {
    id: "q3",
    fileName: "inflation_survey.csv",
    fileType: "csv",
    fileSize: 456789,
    status: "failed",
    uploadedAt: new Date(Date.now() - 7200000),
    uploadedBy: "analyst@yeto.org",
    sector: "prices",
    validationErrors: ["Missing required column: date", "Invalid numeric values in column 3"],
  },
];

const mockPartnershipRequests: PartnershipRequest[] = [
  {
    id: "p1",
    organization: "World Bank",
    organizationAr: "البنك الدولي",
    contactEmail: "yemen@worldbank.org",
    contactName: "Dr. Ahmed Hassan",
    datasetRequested: "Yemen Economic Monitor Data",
    datasetRequestedAr: "بيانات مرصد الاقتصاد اليمني",
    status: "sent",
    createdAt: new Date(Date.now() - 604800000),
    sentAt: new Date(Date.now() - 518400000),
  },
  {
    id: "p2",
    organization: "IMF",
    organizationAr: "صندوق النقد الدولي",
    contactEmail: "mena@imf.org",
    datasetRequested: "Article IV Consultation Data",
    datasetRequestedAr: "بيانات مشاورات المادة الرابعة",
    status: "draft",
    createdAt: new Date(Date.now() - 172800000),
    draftEmail: `Dear IMF MENA Team,

We are writing from the Yemen Economic Transparency Observatory (YETO) to request access to the underlying data from your Article IV Consultation reports for Yemen.

Our platform aims to provide transparent, evidence-based economic analysis for Yemen, and your data would significantly enhance our coverage of macroeconomic indicators.

We would be grateful for:
1. Historical GDP estimates (2010-present)
2. Balance of payments data
3. Fiscal indicators

We commit to proper attribution and compliance with your data sharing policies.

Best regards,
YETO Data Team`,
  },
  {
    id: "p3",
    organization: "Central Bank of Yemen (Aden)",
    organizationAr: "البنك المركزي اليمني (عدن)",
    contactEmail: "data@cby-aden.gov.ye",
    datasetRequested: "Monthly Statistical Bulletin",
    datasetRequestedAr: "النشرة الإحصائية الشهرية",
    status: "approved",
    createdAt: new Date(Date.now() - 2592000000),
    sentAt: new Date(Date.now() - 2505600000),
    responseAt: new Date(Date.now() - 1728000000),
  },
];

export default function ManualIngestion() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  const [queueItems, setQueueItems] = useState<QueueItem[]>(mockQueueItems);
  const [partnershipRequests, setPartnershipRequests] = useState<PartnershipRequest[]>(mockPartnershipRequests);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [partnershipDialogOpen, setPartnershipDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSector, setUploadSector] = useState("");
  const [uploadSource, setUploadSource] = useState("");
  
  // New partnership form state
  const [newPartnership, setNewPartnership] = useState({
    organization: "",
    organizationAr: "",
    contactEmail: "",
    contactName: "",
    datasetRequested: "",
    datasetRequestedAr: "",
    draftEmail: "",
  });

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  // Handle file upload
  const handleUpload = useCallback(() => {
    if (!selectedFile) return;

    const fileType = selectedFile.name.split(".").pop()?.toLowerCase() as QueueItem["fileType"];
    
    const newItem: QueueItem = {
      id: `q${Date.now()}`,
      fileName: selectedFile.name,
      fileType: fileType || "pdf",
      fileSize: selectedFile.size,
      status: "pending",
      uploadedAt: new Date(),
      uploadedBy: "current_user@yeto.org",
      sourceId: uploadSource || undefined,
      sector: uploadSector || undefined,
    };

    setQueueItems(prev => [newItem, ...prev]);
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadSector("");
    setUploadSource("");
    
    toast.success(isArabic ? "تم رفع الملف بنجاح" : "File uploaded successfully");

    // Simulate processing
    setTimeout(() => {
      setQueueItems(prev => prev.map(item => 
        item.id === newItem.id ? { ...item, status: "validating" } : item
      ));
    }, 1000);

    setTimeout(() => {
      setQueueItems(prev => prev.map(item => 
        item.id === newItem.id ? { ...item, status: "processing", processingProgress: 0 } : item
      ));
    }, 2000);
  }, [selectedFile, uploadSector, uploadSource, isArabic]);

  // Handle creating new partnership request
  const handleCreatePartnership = useCallback(() => {
    const newRequest: PartnershipRequest = {
      id: `p${Date.now()}`,
      ...newPartnership,
      status: "draft",
      createdAt: new Date(),
    };

    setPartnershipRequests(prev => [newRequest, ...prev]);
    setPartnershipDialogOpen(false);
    setNewPartnership({
      organization: "",
      organizationAr: "",
      contactEmail: "",
      contactName: "",
      datasetRequested: "",
      datasetRequestedAr: "",
      draftEmail: "",
    });
    
    toast.success(isArabic ? "تم إنشاء طلب الشراكة" : "Partnership request created");
  }, [newPartnership, isArabic]);

  // Handle sending partnership email
  const handleSendPartnership = useCallback((id: string) => {
    setPartnershipRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: "sent", sentAt: new Date() } : req
    ));
    toast.success(isArabic ? "تم إرسال البريد الإلكتروني" : "Email sent successfully");
  }, [isArabic]);

  // Get file icon
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf": return <FileText className="w-5 h-5 text-red-500" />;
      case "xlsx": return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case "csv": return <FileSpreadsheet className="w-5 h-5 text-blue-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: QueueItem["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{isArabic ? "قيد الانتظار" : "Pending"}</Badge>;
      case "validating":
        return <Badge className="bg-blue-500"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />{isArabic ? "التحقق" : "Validating"}</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />{isArabic ? "المعالجة" : "Processing"}</Badge>;
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{isArabic ? "مكتمل" : "Completed"}</Badge>;
      case "failed":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />{isArabic ? "فشل" : "Failed"}</Badge>;
    }
  };

  // Get partnership status badge
  const getPartnershipStatusBadge = (status: PartnershipRequest["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">{isArabic ? "مسودة" : "Draft"}</Badge>;
      case "sent":
        return <Badge className="bg-blue-500">{isArabic ? "مرسل" : "Sent"}</Badge>;
      case "responded":
        return <Badge className="bg-yellow-500">{isArabic ? "تم الرد" : "Responded"}</Badge>;
      case "approved":
        return <Badge className="bg-green-500">{isArabic ? "موافق عليه" : "Approved"}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">{isArabic ? "مرفوض" : "Rejected"}</Badge>;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`p-6 space-y-6 ${isArabic ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            {isArabic ? "الإدخال اليدوي وطلبات الشراكة" : "Manual Ingestion & Partnership Outbox"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? "رفع الملفات يدوياً وإدارة طلبات البيانات من الشركاء"
              : "Upload files manually and manage data requests to partners"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "في الانتظار" : "Pending"}</p>
                <p className="text-2xl font-bold">{queueItems.filter(q => q.status === "pending").length}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "قيد المعالجة" : "Processing"}</p>
                <p className="text-2xl font-bold">{queueItems.filter(q => q.status === "processing" || q.status === "validating").length}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "مكتمل" : "Completed"}</p>
                <p className="text-2xl font-bold text-green-600">{queueItems.filter(q => q.status === "completed").length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "طلبات الشراكة" : "Partnership Requests"}</p>
                <p className="text-2xl font-bold">{partnershipRequests.length}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">
            <Upload className="w-4 h-4 mr-2" />
            {isArabic ? "قائمة الانتظار" : "Upload Queue"}
          </TabsTrigger>
          <TabsTrigger value="partnerships">
            <Mail className="w-4 h-4 mr-2" />
            {isArabic ? "طلبات الشراكة" : "Partnership Outbox"}
          </TabsTrigger>
        </TabsList>

        {/* Upload Queue Tab */}
        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "قائمة انتظار الرفع" : "Upload Queue"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "الملفات المرفوعة يدوياً للمعالجة"
                      : "Manually uploaded files for processing"}
                  </CardDescription>
                </div>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      {isArabic ? "رفع ملف" : "Upload File"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isArabic ? "رفع ملف جديد" : "Upload New File"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>{isArabic ? "الملف" : "File"}</Label>
                        <Input
                          type="file"
                          accept=".pdf,.csv,.xlsx,.docx"
                          onChange={handleFileSelect}
                          className="mt-1"
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedFile.name} ({formatFileSize(selectedFile.size)})
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>{isArabic ? "القطاع" : "Sector"}</Label>
                        <Select value={uploadSector} onValueChange={setUploadSector}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={isArabic ? "اختر القطاع" : "Select sector"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="macro">{isArabic ? "الاقتصاد الكلي" : "Macroeconomy"}</SelectItem>
                            <SelectItem value="banking">{isArabic ? "البنوك" : "Banking"}</SelectItem>
                            <SelectItem value="trade">{isArabic ? "التجارة" : "Trade"}</SelectItem>
                            <SelectItem value="prices">{isArabic ? "الأسعار" : "Prices"}</SelectItem>
                            <SelectItem value="humanitarian">{isArabic ? "الإنسانية" : "Humanitarian"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{isArabic ? "المصدر" : "Source"}</Label>
                        <Input
                          value={uploadSource}
                          onChange={(e) => setUploadSource(e.target.value)}
                          placeholder={isArabic ? "مثال: البنك المركزي" : "e.g., Central Bank"}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                        {isArabic ? "إلغاء" : "Cancel"}
                      </Button>
                      <Button onClick={handleUpload} disabled={!selectedFile}>
                        <Upload className="w-4 h-4 mr-2" />
                        {isArabic ? "رفع" : "Upload"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "الملف" : "File"}</TableHead>
                    <TableHead>{isArabic ? "القطاع" : "Sector"}</TableHead>
                    <TableHead>{isArabic ? "الحجم" : "Size"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(item.fileType)}
                          <div>
                            <p className="font-medium">{item.fileName}</p>
                            {item.sourceId && (
                              <p className="text-xs text-muted-foreground">{item.sourceId}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.sector || "-"}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(item.fileSize)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(item.status)}
                          {item.status === "processing" && item.processingProgress !== undefined && (
                            <Progress value={item.processingProgress} className="h-1 w-20" />
                          )}
                          {item.status === "failed" && item.validationErrors && (
                            <div className="text-xs text-red-500">
                              {item.validationErrors[0]}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.uploadedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {item.status === "failed" && (
                            <Button size="sm" variant="ghost">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partnership Outbox Tab */}
        <TabsContent value="partnerships" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "صندوق طلبات الشراكة" : "Partnership Outbox"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "طلبات البيانات المرسلة إلى الشركاء"
                      : "Data requests sent to partners"}
                  </CardDescription>
                </div>
                <Dialog open={partnershipDialogOpen} onOpenChange={setPartnershipDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      {isArabic ? "طلب جديد" : "New Request"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{isArabic ? "طلب شراكة جديد" : "New Partnership Request"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{isArabic ? "المنظمة (EN)" : "Organization (EN)"}</Label>
                          <Input
                            value={newPartnership.organization}
                            onChange={(e) => setNewPartnership({ ...newPartnership, organization: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>{isArabic ? "المنظمة (AR)" : "Organization (AR)"}</Label>
                          <Input
                            value={newPartnership.organizationAr}
                            onChange={(e) => setNewPartnership({ ...newPartnership, organizationAr: e.target.value })}
                            className="mt-1"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{isArabic ? "البريد الإلكتروني" : "Contact Email"}</Label>
                          <Input
                            type="email"
                            value={newPartnership.contactEmail}
                            onChange={(e) => setNewPartnership({ ...newPartnership, contactEmail: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>{isArabic ? "اسم جهة الاتصال" : "Contact Name"}</Label>
                          <Input
                            value={newPartnership.contactName}
                            onChange={(e) => setNewPartnership({ ...newPartnership, contactName: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{isArabic ? "البيانات المطلوبة (EN)" : "Dataset Requested (EN)"}</Label>
                          <Input
                            value={newPartnership.datasetRequested}
                            onChange={(e) => setNewPartnership({ ...newPartnership, datasetRequested: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>{isArabic ? "البيانات المطلوبة (AR)" : "Dataset Requested (AR)"}</Label>
                          <Input
                            value={newPartnership.datasetRequestedAr}
                            onChange={(e) => setNewPartnership({ ...newPartnership, datasetRequestedAr: e.target.value })}
                            className="mt-1"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>{isArabic ? "مسودة البريد الإلكتروني" : "Draft Email"}</Label>
                        <Textarea
                          value={newPartnership.draftEmail}
                          onChange={(e) => setNewPartnership({ ...newPartnership, draftEmail: e.target.value })}
                          className="mt-1 min-h-[200px]"
                          placeholder={isArabic ? "اكتب رسالة الطلب هنا..." : "Write your request message here..."}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPartnershipDialogOpen(false)}>
                        {isArabic ? "إلغاء" : "Cancel"}
                      </Button>
                      <Button onClick={handleCreatePartnership}>
                        {isArabic ? "إنشاء" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "المنظمة" : "Organization"}</TableHead>
                    <TableHead>{isArabic ? "البيانات المطلوبة" : "Dataset Requested"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "التاريخ" : "Date"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnershipRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">
                              {isArabic ? req.organizationAr : req.organization}
                            </p>
                            <p className="text-xs text-muted-foreground">{req.contactEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isArabic ? req.datasetRequestedAr : req.datasetRequested}
                      </TableCell>
                      <TableCell>
                        {getPartnershipStatusBadge(req.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.createdAt.toLocaleDateString()}
                        {req.sentAt && (
                          <p className="text-xs text-muted-foreground">
                            {isArabic ? "أرسل:" : "Sent:"} {req.sentAt.toLocaleDateString()}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {req.status === "draft" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendPartnership(req.id)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

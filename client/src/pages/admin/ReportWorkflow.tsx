import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye, 
  Send,
  Calendar,
  User,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type WorkflowStatus = "draft" | "review" | "revision" | "approved" | "published" | "archived";

interface ReportInstance {
  id: number;
  templateId: number;
  templateName: string;
  title: string;
  titleAr?: string;
  status: WorkflowStatus;
  periodStart?: string;
  periodEnd?: string;
  createdBy: number;
  createdByName?: string;
  reviewedBy?: number;
  reviewedByName?: string;
  approvedBy?: number;
  approvedByName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  evidenceCount: number;
}

// Mock data for demonstration
const mockReports: ReportInstance[] = [
  {
    id: 1,
    templateId: 1,
    templateName: "YETO Pulse",
    title: "YETO Pulse - January 2026",
    titleAr: "نبض يتو - يناير 2026",
    status: "review",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    createdBy: 1,
    createdByName: "System",
    createdAt: "2026-01-14T06:00:00Z",
    updatedAt: "2026-01-14T08:00:00Z",
    evidenceCount: 24
  },
  {
    id: 2,
    templateId: 2,
    templateName: "Quarterly Outlook",
    title: "Q4 2025 Economic Outlook & Risk Monitor",
    titleAr: "التوقعات الاقتصادية للربع الرابع 2025",
    status: "approved",
    periodStart: "2025-10-01",
    periodEnd: "2025-12-31",
    createdBy: 1,
    createdByName: "System",
    reviewedBy: 2,
    reviewedByName: "Editor",
    approvedBy: 3,
    approvedByName: "Super Admin",
    createdAt: "2026-01-05T06:00:00Z",
    updatedAt: "2026-01-10T14:00:00Z",
    evidenceCount: 48
  },
  {
    id: 3,
    templateId: 3,
    templateName: "Year-in-Review",
    title: "Yemen Economic Year-in-Review 2025",
    titleAr: "مراجعة العام الاقتصادية لليمن 2025",
    status: "draft",
    periodStart: "2025-01-01",
    periodEnd: "2025-12-31",
    createdBy: 1,
    createdByName: "System",
    createdAt: "2026-01-01T06:00:00Z",
    updatedAt: "2026-01-01T06:00:00Z",
    evidenceCount: 156
  },
  {
    id: 4,
    templateId: 1,
    templateName: "YETO Pulse",
    title: "YETO Pulse - December 2025",
    titleAr: "نبض يتو - ديسمبر 2025",
    status: "published",
    periodStart: "2025-12-01",
    periodEnd: "2025-12-31",
    createdBy: 1,
    createdByName: "System",
    reviewedBy: 2,
    reviewedByName: "Editor",
    approvedBy: 3,
    approvedByName: "Super Admin",
    createdAt: "2025-12-31T06:00:00Z",
    updatedAt: "2026-01-02T10:00:00Z",
    publishedAt: "2026-01-02T10:00:00Z",
    evidenceCount: 22
  }
];

const statusConfig: Record<WorkflowStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "bg-gray-500", icon: <Edit className="w-4 h-4" /> },
  review: { label: "In Review", color: "bg-yellow-500", icon: <Eye className="w-4 h-4" /> },
  revision: { label: "Needs Revision", color: "bg-orange-500", icon: <AlertTriangle className="w-4 h-4" /> },
  approved: { label: "Approved", color: "bg-green-500", icon: <CheckCircle className="w-4 h-4" /> },
  published: { label: "Published", color: "bg-blue-500", icon: <Send className="w-4 h-4" /> },
  archived: { label: "Archived", color: "bg-gray-400", icon: <Clock className="w-4 h-4" /> }
};

export default function ReportWorkflow() {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportInstance | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"submit" | "approve" | "reject" | "publish" | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.templateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === "all" || report.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const handleAction = (report: ReportInstance, action: "submit" | "approve" | "reject" | "publish") => {
    setSelectedReport(report);
    setActionType(action);
    setActionNotes("");
    setIsActionDialogOpen(true);
  };

  const executeAction = () => {
    if (!selectedReport || !actionType) return;
    
    // In production, this would call tRPC mutation
    const actionLabels = {
      submit: "submitted for review",
      approve: "approved",
      reject: "sent back for revision",
      publish: "published"
    };
    
    toast.success(`Report "${selectedReport.title}" has been ${actionLabels[actionType]}.`);
    setIsActionDialogOpen(false);
    setSelectedReport(null);
    setActionType(null);
  };

  const getAvailableActions = (status: WorkflowStatus): Array<"submit" | "approve" | "reject" | "publish"> => {
    switch (status) {
      case "draft":
      case "revision":
        return ["submit"];
      case "review":
        return ["approve", "reject"];
      case "approved":
        return ["publish"];
      default:
        return [];
    }
  };

  const renderReportCard = (report: ReportInstance) => {
    const status = statusConfig[report.status];
    const actions = getAvailableActions(report.status);

    return (
      <Card key={report.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {report.templateName}
                </Badge>
                <Badge className={`${status.color} text-white text-xs`}>
                  {status.icon}
                  <span className="ml-1">{status.label}</span>
                </Badge>
              </div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              {report.titleAr && (
                <p className="text-sm text-muted-foreground mt-1 font-arabic" dir="rtl">
                  {report.titleAr}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {report.periodStart && report.periodEnd
                  ? `${new Date(report.periodStart).toLocaleDateString()} - ${new Date(report.periodEnd).toLocaleDateString()}`
                  : "No period set"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{report.evidenceCount} evidence items</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Created by {report.createdByName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Updated {new Date(report.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Workflow Trail */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 p-2 bg-muted/50 rounded">
            <span>Draft</span>
            <span>→</span>
            <span className={report.reviewedByName ? "text-foreground font-medium" : ""}>
              {report.reviewedByName ? `Reviewed by ${report.reviewedByName}` : "Review"}
            </span>
            <span>→</span>
            <span className={report.approvedByName ? "text-foreground font-medium" : ""}>
              {report.approvedByName ? `Approved by ${report.approvedByName}` : "Approval"}
            </span>
            <span>→</span>
            <span className={report.publishedAt ? "text-foreground font-medium" : ""}>
              {report.publishedAt ? `Published ${new Date(report.publishedAt).toLocaleDateString()}` : "Publish"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedReport(report);
                setIsPreviewOpen(true);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            {actions.map(action => (
              <Button
                key={action}
                size="sm"
                variant={action === "reject" ? "destructive" : "default"}
                onClick={() => handleAction(report, action)}
              >
                {action === "submit" && <Send className="w-4 h-4 mr-1" />}
                {action === "approve" && <CheckCircle className="w-4 h-4 mr-1" />}
                {action === "reject" && <XCircle className="w-4 h-4 mr-1" />}
                {action === "publish" && <Send className="w-4 h-4 mr-1" />}
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Report Workflow</h1>
            <p className="text-muted-foreground mt-1">
              Manage report drafts, reviews, approvals, and publications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = mockReports.filter(r => r.status === status).length;
            return (
              <Card 
                key={status} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${selectedTab === status ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedTab(status)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${config.color} text-white`}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTab} onValueChange={setSelectedTab}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              {Object.entries(statusConfig).map(([status, config]) => (
                <SelectItem key={status} value={status}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reports found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query" : "Create a new report to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map(renderReportCard)
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedReport?.title}</DialogTitle>
              <DialogDescription>
                {selectedReport?.templateName} • {selectedReport?.periodStart && selectedReport?.periodEnd
                  ? `${new Date(selectedReport.periodStart).toLocaleDateString()} - ${new Date(selectedReport.periodEnd).toLocaleDateString()}`
                  : "Preview"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Report Preview Content */}
              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-4">Executive Summary</h3>
                <p className="text-muted-foreground mb-4">
                  This report covers Yemen's economic developments during the reporting period, 
                  including exchange rate movements, inflation trends, humanitarian funding flows, 
                  and key policy developments.
                </p>
                
                <h3 className="font-semibold mb-4">Key Findings</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Exchange rate in Aden stabilized at 1,620 YER/USD</li>
                  <li>Inflation rate decreased to 15.0% year-over-year</li>
                  <li>Humanitarian funding reached $2.1B for 2025</li>
                  <li>Oil exports resumed at 50,000 bpd capacity</li>
                </ul>

                <h3 className="font-semibold mt-6 mb-4">Evidence Appendix</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">Data Sources</p>
                      <p className="text-2xl font-bold">{selectedReport?.evidenceCount || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">Confidence Rating</p>
                      <p className="text-2xl font-bold">A</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Dialog */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "submit" && "Submit for Review"}
                {actionType === "approve" && "Approve Report"}
                {actionType === "reject" && "Request Revision"}
                {actionType === "publish" && "Publish Report"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "submit" && "This will send the report to editors for review."}
                {actionType === "approve" && "This will approve the report for publication."}
                {actionType === "reject" && "This will send the report back to the author for revision."}
                {actionType === "publish" && "This will make the report publicly available."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Report</Label>
                <p className="text-sm text-muted-foreground">{selectedReport?.title}</p>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder={actionType === "reject" ? "Please specify what needs to be revised..." : "Add any notes..."}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant={actionType === "reject" ? "destructive" : "default"}
                onClick={executeAction}
              >
                {actionType === "submit" && "Submit"}
                {actionType === "approve" && "Approve"}
                {actionType === "reject" && "Request Revision"}
                {actionType === "publish" && "Publish"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

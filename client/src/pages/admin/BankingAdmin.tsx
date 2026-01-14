/**
 * Banking Administration Page
 * 
 * Admin controls for managing banking sector data:
 * - CRUD operations for banks
 * - Sanctions management
 * - Data refresh triggers
 * - Ingestion logs
 */

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  RefreshCw, 
  AlertTriangle, 
  Plus, 
  Pencil, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  Database,
  Shield,
  FileText
} from "lucide-react";

export default function BankingAdmin() {
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newBank, setNewBank] = useState({
    nameEn: "",
    nameAr: "",
    shortCode: "",
    swiftCode: "",
    jurisdiction: "aden" as "aden" | "sanaa" | "both",
    operationalStatus: "operational" as "operational" | "limited" | "suspended" | "closed",
    totalAssets: 0,
    capitalAdequacyRatio: 0,
    nonPerformingLoans: 0,
  });

  // Fetch banks data
  const { data: banksData, refetch: refetchBanks, isLoading } = trpc.banking.getBanks.useQuery();
  
  // Fetch scheduler jobs
  const { data: schedulerJobs } = trpc.scheduler.getJobs.useQuery();
  
  // Mutations
  const triggerRefresh = trpc.scheduler.triggerJob.useMutation({
    onSuccess: () => {
      toast.success("Data refresh triggered successfully");
      setIsRefreshing(false);
    },
    onError: (error) => {
      toast.error(`Failed to trigger refresh: ${error.message}`);
      setIsRefreshing(false);
    }
  });

  const handleTriggerRefresh = async (jobName: string) => {
    setIsRefreshing(true);
    triggerRefresh.mutate({ jobName });
  };

  const bankingJobs = schedulerJobs?.filter(job => 
    job.jobName.includes('banking') || job.jobName.includes('sanctions')
  ) || [];

  const banks = banksData || [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Banking Sector Administration</h1>
            <p className="text-muted-foreground">
              Manage banks, sanctions, and data refresh schedules
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleTriggerRefresh('banking_data_refresh')}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh All Data
            </Button>
            <Dialog open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Bank</DialogTitle>
                  <DialogDescription>
                    Add a new commercial bank to the YETO database
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Name (English)</Label>
                    <Input
                      id="nameEn"
                      value={newBank.nameEn}
                      onChange={(e) => setNewBank({ ...newBank, nameEn: e.target.value })}
                      placeholder="Yemen Commercial Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">Name (Arabic)</Label>
                    <Input
                      id="nameAr"
                      value={newBank.nameAr}
                      onChange={(e) => setNewBank({ ...newBank, nameAr: e.target.value })}
                      placeholder="البنك التجاري اليمني"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortCode">Short Code</Label>
                    <Input
                      id="shortCode"
                      value={newBank.shortCode}
                      onChange={(e) => setNewBank({ ...newBank, shortCode: e.target.value })}
                      placeholder="YCB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="swiftCode">SWIFT Code</Label>
                    <Input
                      id="swiftCode"
                      value={newBank.swiftCode}
                      onChange={(e) => setNewBank({ ...newBank, swiftCode: e.target.value })}
                      placeholder="YCBAYESA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction</Label>
                    <Select
                      value={newBank.jurisdiction}
                      onValueChange={(value) => setNewBank({ ...newBank, jurisdiction: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aden">Aden (IRG)</SelectItem>
                        <SelectItem value="sanaa">Sana'a (DFA)</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Operational Status</Label>
                    <Select
                      value={newBank.operationalStatus}
                      onValueChange={(value) => setNewBank({ ...newBank, operationalStatus: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="limited">Limited Operations</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assets">Total Assets (USD millions)</Label>
                    <Input
                      id="assets"
                      type="number"
                      value={newBank.totalAssets}
                      onChange={(e) => setNewBank({ ...newBank, totalAssets: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="car">Capital Adequacy Ratio (%)</Label>
                    <Input
                      id="car"
                      type="number"
                      step="0.1"
                      value={newBank.capitalAdequacyRatio}
                      onChange={(e) => setNewBank({ ...newBank, capitalAdequacyRatio: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddBankOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.info("Bank creation coming soon - use database directly for now");
                    setIsAddBankOpen(false);
                  }}>
                    Add Bank
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Banks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{banks.length}</div>
              <p className="text-xs text-muted-foreground">
                CBY-Aden licensed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sanctioned Banks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {banks.filter((b: any) => b.sanctionsStatus === 'sanctioned').length}
              </div>
              <p className="text-xs text-muted-foreground">
                OFAC/UN designated
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Data Refresh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bankingJobs[0]?.lastRunAt 
                  ? new Date(bankingJobs[0].lastRunAt).toLocaleDateString()
                  : 'Never'}
              </div>
              <p className="text-xs text-muted-foreground">
                {bankingJobs[0]?.lastRunStatus || 'No runs yet'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scheduler Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {bankingJobs.some(j => j.isEnabled) ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-bold text-green-600">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-lg font-bold text-red-600">Inactive</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {bankingJobs.length} jobs configured
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="banks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="banks">
              <Building2 className="h-4 w-4 mr-2" />
              Banks ({banks.length})
            </TabsTrigger>
            <TabsTrigger value="sanctions">
              <Shield className="h-4 w-4 mr-2" />
              Sanctions
            </TabsTrigger>
            <TabsTrigger value="scheduler">
              <Clock className="h-4 w-4 mr-2" />
              Scheduler Jobs
            </TabsTrigger>
            <TabsTrigger value="logs">
              <FileText className="h-4 w-4 mr-2" />
              Ingestion Logs
            </TabsTrigger>
          </TabsList>

          {/* Banks Tab */}
          <TabsContent value="banks">
            <Card>
              <CardHeader>
                <CardTitle>Commercial Banks</CardTitle>
                <CardDescription>
                  All banks in the YETO database with their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading banks...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bank</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Jurisdiction</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assets (USD M)</TableHead>
                        <TableHead>CAR</TableHead>
                        <TableHead>NPL</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {banks.slice(0, 20).map((bank: any) => (
                        <TableRow key={bank.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bank.nameEn}</div>
                              <div className="text-sm text-muted-foreground" dir="rtl">
                                {bank.nameAr}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs">{bank.shortCode}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              bank.jurisdiction === 'aden' ? 'default' :
                              bank.jurisdiction === 'sanaa' ? 'secondary' : 'outline'
                            }>
                              {bank.jurisdiction === 'aden' ? 'Aden' :
                               bank.jurisdiction === 'sanaa' ? "Sana'a" : 'Both'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {bank.sanctionsStatus === 'sanctioned' ? (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Sanctioned
                              </Badge>
                            ) : (
                              <Badge variant={
                                bank.operationalStatus === 'operational' ? 'default' :
                                bank.operationalStatus === 'limited' ? 'secondary' : 'destructive'
                              }>
                                {bank.operationalStatus}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            ${bank.totalAssets?.toLocaleString() || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {bank.capitalAdequacyRatio?.toFixed(1) || 'N/A'}%
                          </TableCell>
                          <TableCell>
                            {bank.nonPerformingLoans?.toFixed(1) || 'N/A'}%
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {banks.length > 20 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Showing 20 of {banks.length} banks
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sanctions Tab */}
          <TabsContent value="sanctions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sanctions Management</CardTitle>
                    <CardDescription>
                      OFAC, UN, and EU sanctions designations for Yemen banks
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleTriggerRefresh('sanctions_monitoring')}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Check OFAC SDN List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bank</TableHead>
                      <TableHead>Authority</TableHead>
                      <TableHead>Designation Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banks
                      .filter((b: any) => b.sanctionsStatus === 'sanctioned')
                      .map((bank: any) => (
                        <TableRow key={bank.id}>
                          <TableCell>
                            <div className="font-medium">{bank.nameEn}</div>
                            <div className="text-sm text-muted-foreground">{bank.shortCode}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">OFAC</Badge>
                          </TableCell>
                          <TableCell>
                            {bank.shortCode === 'IBY' ? 'April 17, 2025' :
                             bank.shortCode === 'YKB' ? 'January 17, 2025' :
                             bank.shortCode === 'CAC' ? 'January 17, 2025' : 'Unknown'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            Support for Houthi movement / financial facilitation
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduler Tab */}
          <TabsContent value="scheduler">
            <Card>
              <CardHeader>
                <CardTitle>Scheduler Jobs</CardTitle>
                <CardDescription>
                  Automated data refresh schedules for banking sector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Run Count</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankingJobs.map((job: any) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="font-medium">{job.jobName}</div>
                          <div className="text-xs text-muted-foreground">
                            {job.jobType}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{job.cronExpression}</code>
                        </TableCell>
                        <TableCell>
                          {job.lastRunAt 
                            ? new Date(job.lastRunAt).toLocaleString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          {job.isEnabled ? (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Disabled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{job.runCount || 0}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTriggerRefresh(job.jobName)}
                            disabled={isRefreshing}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Run Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {bankingJobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No banking scheduler jobs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Ingestion Logs</CardTitle>
                <CardDescription>
                  Recent data ingestion activity for banking sector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No ingestion logs available yet.</p>
                  <p className="text-sm">Logs will appear here after scheduler jobs run.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

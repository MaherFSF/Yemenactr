/**
 * Page Feed Matrix Admin Page
 * 
 * Shows which sources feed each page/module with ingestion stats.
 * Pages: dashboard, data-repository, research-library, timeline, entities, corporate-registry, methodology, vip-cockpits
 */

import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LayoutDashboard,
  BookOpen,
  Clock,
  Users,
  Building2,
  FileText,
  Crown,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// Tier badge colors
const TIER_COLORS: Record<string, string> = {
  T0: 'bg-emerald-500 text-white',
  T1: 'bg-blue-500 text-white',
  T2: 'bg-amber-500 text-white',
  T3: 'bg-orange-500 text-white',
  T4: 'bg-red-500 text-white',
  UNKNOWN: 'bg-gray-500 text-white',
};

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  NEEDS_KEY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  DEPRECATED: 'bg-red-100 text-red-800 border-red-200',
};

// Page icons
const PAGE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="h-5 w-5" />,
  'data-repository': <Database className="h-5 w-5" />,
  'research-library': <BookOpen className="h-5 w-5" />,
  timeline: <Clock className="h-5 w-5" />,
  entities: <Users className="h-5 w-5" />,
  'corporate-registry': <Building2 className="h-5 w-5" />,
  methodology: <FileText className="h-5 w-5" />,
  'vip-cockpits': <Crown className="h-5 w-5" />,
};

export default function PageFeedMatrix() {
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch page feed matrix
  const { data: matrixData, isLoading } = trpc.feedMatrix.getPageFeedMatrix.useQuery({
    pageKey: selectedPage === 'all' ? undefined : selectedPage,
    limit: 50,
  });

  // Filter pages by search
  const filteredPages = useMemo(() => {
    if (!matrixData?.pages) return [];
    if (!searchQuery) return matrixData.pages;
    
    const query = searchQuery.toLowerCase();
    return matrixData.pages.filter((p: any) => 
      p.page.name.toLowerCase().includes(query) ||
      p.page.nameAr.includes(searchQuery) ||
      p.sources.some((src: any) => 
        src.name.toLowerCase().includes(query) ||
        src.sourceId.toLowerCase().includes(query)
      )
    );
  }, [matrixData?.pages, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Page Feed Matrix</h1>
            <p className="text-muted-foreground">
              View which sources feed each page/module in the platform
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {matrixData?.pages?.slice(0, 4).map((pageData: any) => (
            <Card key={pageData.page.key}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {PAGE_ICONS[pageData.page.key]}
                  <CardTitle className="text-sm font-medium">
                    {pageData.page.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pageData.sourceCount}</div>
                <p className="text-xs text-muted-foreground">
                  {pageData.activeCount} active sources
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search pages or sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="data-repository">Data Repository</SelectItem>
                  <SelectItem value="research-library">Research Library</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="entities">Entities</SelectItem>
                  <SelectItem value="corporate-registry">Corporate Registry</SelectItem>
                  <SelectItem value="methodology">Methodology</SelectItem>
                  <SelectItem value="vip-cockpits">VIP Cockpits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Matrix Content */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-pulse">Loading page feed matrix...</div>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {filteredPages.map((pageData: any) => (
              <AccordionItem
                key={pageData.page.key}
                value={pageData.page.key}
                className="border rounded-lg bg-card"
              >
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {PAGE_ICONS[pageData.page.key]}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{pageData.page.name}</div>
                        <div className="text-sm text-muted-foreground" dir="rtl">
                          {pageData.page.nameAr}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span>{pageData.sourceCount} sources</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{pageData.activeCount} active</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="mt-4 space-y-4">
                    {/* Tier Distribution */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(pageData.tierDistribution || {}).map(
                        ([tier, count]) => (
                          <Badge key={tier} className={TIER_COLORS[tier] || 'bg-gray-500'}>
                            {tier}: {count as number}
                          </Badge>
                        )
                      )}
                    </div>

                    {/* Sources Table */}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Source ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Allowed Use</TableHead>
                            <TableHead>Last Fetch</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pageData.sources.map((source: any) => (
                            <TableRow key={source.sourceId}>
                              <TableCell className="font-mono text-xs">
                                {source.sourceId}
                              </TableCell>
                              <TableCell>
                                <div className="max-w-[200px] truncate" title={source.name}>
                                  {source.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={TIER_COLORS[source.tier] || 'bg-gray-500'}>
                                  {source.tier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={STATUS_COLORS[source.status] || ''}
                                >
                                  {source.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {source.confidenceRating || '-'}
                              </TableCell>
                              <TableCell className="text-xs">
                                {source.allowedUse || '-'}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {source.lastFetch
                                  ? new Date(source.lastFetch).toLocaleDateString()
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {source.webUrl && (
                                  <a
                                    href={source.webUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {filteredPages.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No pages found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

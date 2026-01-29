/**
 * Research Hub - Public research library with search and filters
 */

import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Building2,
  Globe,
  Filter,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertCircle
} from 'lucide-react';

// Document type labels
const DOC_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  report: { en: 'Report', ar: 'تقرير' },
  working_paper: { en: 'Working Paper', ar: 'ورقة عمل' },
  policy_brief: { en: 'Policy Brief', ar: 'موجز سياسات' },
  dataset_doc: { en: 'Dataset Documentation', ar: 'توثيق البيانات' },
  sitrep: { en: 'Situation Report', ar: 'تقرير الوضع' },
  evaluation: { en: 'Evaluation', ar: 'تقييم' },
  annex: { en: 'Annex', ar: 'ملحق' },
  law_regulation: { en: 'Law/Regulation', ar: 'قانون/لائحة' },
  bulletin: { en: 'Bulletin', ar: 'نشرة' },
  circular: { en: 'Circular', ar: 'تعميم' },
  press_release: { en: 'Press Release', ar: 'بيان صحفي' },
  academic_paper: { en: 'Academic Paper', ar: 'ورقة أكاديمية' },
  thesis: { en: 'Thesis', ar: 'أطروحة' },
  methodology_note: { en: 'Methodology Note', ar: 'ملاحظة منهجية' },
  other: { en: 'Other', ar: 'أخرى' }
};

// Sector labels
const SECTOR_LABELS: Record<string, { en: string; ar: string }> = {
  banking_finance: { en: 'Banking & Finance', ar: 'البنوك والمالية' },
  fiscal_policy: { en: 'Fiscal Policy', ar: 'السياسة المالية' },
  monetary_policy: { en: 'Monetary Policy', ar: 'السياسة النقدية' },
  currency_fx: { en: 'Currency & FX', ar: 'العملة والصرف' },
  trade: { en: 'Trade', ar: 'التجارة' },
  food_security: { en: 'Food Security', ar: 'الأمن الغذائي' },
  humanitarian: { en: 'Humanitarian', ar: 'الإنسانية' },
  macroeconomic: { en: 'Macroeconomic', ar: 'الاقتصاد الكلي' },
  aid_flows: { en: 'Aid Flows', ar: 'تدفقات المساعدات' },
  energy: { en: 'Energy', ar: 'الطاقة' },
  infrastructure: { en: 'Infrastructure', ar: 'البنية التحتية' },
  environment: { en: 'Environment', ar: 'البيئة' }
};

// License flag labels
const LICENSE_LABELS: Record<string, { en: string; ar: string; color: string }> = {
  open: { en: 'Open Access', ar: 'وصول مفتوح', color: 'bg-green-100 text-green-800' },
  restricted_metadata_only: { en: 'Metadata Only', ar: 'بيانات وصفية فقط', color: 'bg-yellow-100 text-yellow-800' },
  unknown_requires_review: { en: 'Under Review', ar: 'قيد المراجعة', color: 'bg-gray-100 text-gray-800' }
};

export default function ResearchHub() {
  const { language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedLicense, setSelectedLicense] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Build filters
  const filters = useMemo(() => {
    const f: any = {
      limit: pageSize,
      offset: currentPage * pageSize
    };
    if (searchQuery) f.query = searchQuery;
    if (selectedSector !== 'all') f.sectors = [selectedSector];
    if (selectedDocType !== 'all') f.docTypes = [selectedDocType];
    if (selectedYear !== 'all') f.years = [parseInt(selectedYear)];
    if (selectedLicense !== 'all') f.licenseFlags = [selectedLicense];
    return f;
  }, [searchQuery, selectedSector, selectedDocType, selectedYear, selectedLicense, currentPage]);

  // Fetch documents
  const { data: searchResult, isLoading } = trpc.library.searchDocuments.useQuery(filters);
  const { data: stats } = trpc.library.getDocumentStatistics.useQuery();

  // Generate year options (2010 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector('all');
    setSelectedDocType('all');
    setSelectedYear('all');
    setSelectedLicense('all');
    setCurrentPage(0);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-10 w-10" />
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'مركز الأبحاث' : 'Research Hub'}
            </h1>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl">
            {language === 'ar'
              ? 'مكتبة شاملة للوثائق والتقارير والدراسات المتعلقة بالاقتصاد اليمني منذ عام 2010'
              : 'Comprehensive library of documents, reports, and studies on Yemen\'s economy since 2010'}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <div className="text-sm text-emerald-100">
                {language === 'ar' ? 'إجمالي الوثائق' : 'Total Documents'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{Object.keys(stats?.byYear || {}).length || 0}</div>
              <div className="text-sm text-emerald-100">
                {language === 'ar' ? 'سنوات التغطية' : 'Years Covered'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{Object.keys(stats?.byType || {}).length || 0}</div>
              <div className="text-sm text-emerald-100">
                {language === 'ar' ? 'أنواع الوثائق' : 'Document Types'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 -mt-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400`} />
                <Input
                  type="text"
                  placeholder={language === 'ar' ? 'ابحث في الوثائق...' : 'Search documents...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} h-12`}
                />
              </div>
              <Button type="submit" className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700">
                <Search className="h-5 w-5" />
              </Button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="h-5 w-5 text-gray-400" />
              
              {/* Sector Filter */}
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={language === 'ar' ? 'القطاع' : 'Sector'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'جميع القطاعات' : 'All Sectors'}</SelectItem>
                  {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {language === 'ar' ? label.ar : label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Document Type Filter */}
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={language === 'ar' ? 'نوع الوثيقة' : 'Document Type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                  {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {language === 'ar' ? label.ar : label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Filter */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={language === 'ar' ? 'السنة' : 'Year'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'جميع السنوات' : 'All Years'}</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* License Filter */}
              <Select value={selectedLicense} onValueChange={setSelectedLicense}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={language === 'ar' ? 'الترخيص' : 'License'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'جميع التراخيص' : 'All Licenses'}</SelectItem>
                  {Object.entries(LICENSE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {language === 'ar' ? label.ar : label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {language === 'ar'
              ? `عرض ${searchResult?.documents.length || 0} من ${searchResult?.total || 0} وثيقة`
              : `Showing ${searchResult?.documents.length || 0} of ${searchResult?.total || 0} documents`}
          </p>
        </div>

        {/* Document Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchResult?.documents.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'ar' ? 'لم يتم العثور على وثائق' : 'No documents found'}
            </h3>
            <p className="text-gray-500">
              {language === 'ar'
                ? 'جرب تعديل معايير البحث أو مسح الفلاتر'
                : 'Try adjusting your search criteria or clearing filters'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResult?.documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} language={language} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {searchResult && searchResult.total > pageSize && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            <span className="text-gray-600">
              {language === 'ar'
                ? `صفحة ${currentPage + 1} من ${Math.ceil(searchResult.total / pageSize)}`
                : `Page ${currentPage + 1} of ${Math.ceil(searchResult.total / pageSize)}`}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!searchResult.hasMore}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Document Card Component
function DocumentCard({ document, language }: { document: any; language: string }) {
  const isRTL = language === 'ar';
  const title = language === 'ar' && document.titleAr ? document.titleAr : document.titleEn;
  const summary = language === 'ar' && document.summaryAr ? document.summaryAr : document.summaryEn;
  const docTypeLabel = DOC_TYPE_LABELS[document.docType] || DOC_TYPE_LABELS.other;
  const licenseLabel = LICENSE_LABELS[document.licenseFlag] || LICENSE_LABELS.unknown_requires_review;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <CardContent className="p-6">
        {/* Document Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs">
            {language === 'ar' ? docTypeLabel.ar : docTypeLabel.en}
          </Badge>
          <Badge className={`text-xs ${licenseLabel.color}`}>
            <Shield className="h-3 w-3 mr-1" />
            {language === 'ar' ? licenseLabel.ar : licenseLabel.en}
          </Badge>
        </div>

        {/* Title */}
        <Link href={`/research/${document.docId}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors cursor-pointer">
            {title}
          </h3>
        </Link>

        {/* Publisher & Date */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {document.publisherName}
          </span>
          {document.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(document.publishedAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US', {
                year: 'numeric',
                month: 'short'
              })}
            </span>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {summary}
          </p>
        )}

        {/* Sectors */}
        {document.sectors && document.sectors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {document.sectors.slice(0, 3).map((sector: string) => {
              const sectorLabel = SECTOR_LABELS[sector];
              return (
                <Badge key={sector} variant="outline" className="text-xs">
                  {sectorLabel ? (language === 'ar' ? sectorLabel.ar : sectorLabel.en) : sector}
                </Badge>
              );
            })}
            {document.sectors.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{document.sectors.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t">
          <Link href={`/research/${document.docId}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <FileText className="h-4 w-4 mr-1" />
              {language === 'ar' ? 'عرض' : 'View'}
            </Button>
          </Link>
          {document.canonicalUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.canonicalUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Globe,
  Building2,
  ArrowRightLeft,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  Database,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Link as LinkIcon,
  Zap,
  Lock,
  Unlock,
  Users,
  BarChart3,
} from "lucide-react";
import { Link } from "wouter";

// Partner organizations
const partnerOrganizations = [
  {
    id: "world_bank",
    name: "World Bank",
    nameAr: "البنك الدولي",
    logo: "🏦",
    type: "multilateral",
    status: "active",
    dataShared: 45,
    dataReceived: 128,
    lastSync: "2026-01-10T10:30:00Z",
    formats: ["API", "CSV", "JSON"],
    description: "Development indicators, economic forecasts, and project data",
    descriptionAr: "مؤشرات التنمية والتوقعات الاقتصادية وبيانات المشاريع",
  },
  {
    id: "imf",
    name: "International Monetary Fund",
    nameAr: "صندوق النقد الدولي",
    logo: "💰",
    type: "multilateral",
    status: "active",
    dataShared: 32,
    dataReceived: 89,
    lastSync: "2026-01-09T15:45:00Z",
    formats: ["SDMX", "JSON", "CSV"],
    description: "Fiscal data, balance of payments, and monetary statistics",
    descriptionAr: "البيانات المالية وميزان المدفوعات والإحصاءات النقدية",
  },
  {
    id: "undp",
    name: "UNDP",
    nameAr: "برنامج الأمم المتحدة الإنمائي",
    logo: "🌍",
    type: "un_agency",
    status: "active",
    dataShared: 28,
    dataReceived: 67,
    lastSync: "2026-01-10T08:15:00Z",
    formats: ["API", "JSON"],
    description: "Human development indicators and project monitoring data",
    descriptionAr: "مؤشرات التنمية البشرية وبيانات مراقبة المشاريع",
  },
  {
    id: "wfp",
    name: "World Food Programme",
    nameAr: "برنامج الأغذية العالمي",
    logo: "🌾",
    type: "un_agency",
    status: "active",
    dataShared: 56,
    dataReceived: 234,
    lastSync: "2026-01-10T12:00:00Z",
    formats: ["API", "CSV", "GeoJSON"],
    description: "Food security assessments, market prices, and distribution data",
    descriptionAr: "تقييمات الأمن الغذائي وأسعار السوق وبيانات التوزيع",
  },
  {
    id: "ocha",
    name: "UN OCHA",
    nameAr: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية",
    logo: "🆘",
    type: "un_agency",
    status: "active",
    dataShared: 41,
    dataReceived: 156,
    lastSync: "2026-01-10T09:30:00Z",
    formats: ["HDX", "API", "JSON"],
    description: "Humanitarian needs, funding flows, and operational data",
    descriptionAr: "الاحتياجات الإنسانية وتدفقات التمويل والبيانات التشغيلية",
  },
  {
    id: "unhcr",
    name: "UNHCR",
    nameAr: "المفوضية السامية للاجئين",
    logo: "🏠",
    type: "un_agency",
    status: "active",
    dataShared: 18,
    dataReceived: 89,
    lastSync: "2026-01-09T18:00:00Z",
    formats: ["API", "JSON"],
    description: "Refugee and IDP statistics, protection data",
    descriptionAr: "إحصاءات اللاجئين والنازحين وبيانات الحماية",
  },
  {
    id: "who",
    name: "World Health Organization",
    nameAr: "منظمة الصحة العالمية",
    logo: "🏥",
    type: "un_agency",
    status: "active",
    dataShared: 22,
    dataReceived: 78,
    lastSync: "2026-01-08T14:20:00Z",
    formats: ["API", "CSV"],
    description: "Health indicators, disease surveillance, and facility data",
    descriptionAr: "المؤشرات الصحية ومراقبة الأمراض وبيانات المرافق",
  },
  {
    id: "fao",
    name: "FAO",
    nameAr: "منظمة الأغذية والزراعة",
    logo: "🌱",
    type: "un_agency",
    status: "active",
    dataShared: 35,
    dataReceived: 112,
    lastSync: "2026-01-10T07:45:00Z",
    formats: ["FAOSTAT", "API", "CSV"],
    description: "Agricultural production, food prices, and trade statistics",
    descriptionAr: "الإنتاج الزراعي وأسعار الغذاء وإحصاءات التجارة",
  },
  {
    id: "iati",
    name: "IATI",
    nameAr: "مبادرة الشفافية في المعونات الدولية",
    logo: "📊",
    type: "transparency",
    status: "active",
    dataShared: 0,
    dataReceived: 456,
    lastSync: "2026-01-10T11:00:00Z",
    formats: ["IATI XML", "JSON"],
    description: "Aid activity data from all publishing organizations",
    descriptionAr: "بيانات أنشطة المعونات من جميع المنظمات الناشرة",
  },
  {
    id: "cby_aden",
    name: "Central Bank of Yemen (Aden)",
    nameAr: "البنك المركزي اليمني (عدن)",
    logo: "🏛️",
    type: "national",
    status: "active",
    dataShared: 67,
    dataReceived: 12,
    lastSync: "2026-01-10T06:00:00Z",
    formats: ["API", "Excel"],
    description: "Official exchange rates, monetary aggregates, banking statistics",
    descriptionAr: "أسعار الصرف الرسمية والمجاميع النقدية والإحصاءات المصرفية",
  },
  {
    id: "cso",
    name: "Central Statistical Organization",
    nameAr: "الجهاز المركزي للإحصاء",
    logo: "📈",
    type: "national",
    status: "limited",
    dataShared: 23,
    dataReceived: 5,
    lastSync: "2024-11-15T10:00:00Z",
    formats: ["Excel", "PDF"],
    description: "National statistics, census data, economic surveys",
    descriptionAr: "الإحصاءات الوطنية وبيانات التعداد والمسوحات الاقتصادية",
  },
  {
    id: "acled",
    name: "ACLED",
    nameAr: "مشروع بيانات مواقع النزاعات المسلحة والأحداث",
    logo: "⚔️",
    type: "research",
    status: "pending",
    dataShared: 0,
    dataReceived: 0,
    lastSync: null,
    formats: ["API", "CSV"],
    description: "Conflict events, fatalities, and actor data",
    descriptionAr: "أحداث النزاع والوفيات وبيانات الأطراف الفاعلة",
  },
];

// Data exchange protocols
const exchangeProtocols = [
  {
    name: "SDMX",
    fullName: "Statistical Data and Metadata eXchange",
    description: "ISO standard for exchanging statistical data",
    supported: true,
  },
  {
    name: "IATI",
    fullName: "International Aid Transparency Initiative",
    description: "Standard for publishing aid information",
    supported: true,
  },
  {
    name: "HDX",
    fullName: "Humanitarian Data Exchange",
    description: "OCHA's platform for humanitarian data",
    supported: true,
  },
  {
    name: "OData",
    fullName: "Open Data Protocol",
    description: "REST-based data access protocol",
    supported: true,
  },
  {
    name: "GeoJSON",
    fullName: "Geographic JSON",
    description: "Format for encoding geographic data",
    supported: true,
  },
];

// Recent data exchanges
const recentExchanges = [
  {
    id: 1,
    partner: "WFP",
    direction: "received",
    dataset: "Yemen Market Price Monitoring",
    records: 1245,
    timestamp: "2026-01-10T12:00:00Z",
    status: "success",
  },
  {
    id: 2,
    partner: "World Bank",
    direction: "shared",
    dataset: "Exchange Rate Time Series",
    records: 365,
    timestamp: "2026-01-10T10:30:00Z",
    status: "success",
  },
  {
    id: 3,
    partner: "UNDP",
    direction: "received",
    dataset: "Human Development Indicators",
    records: 89,
    timestamp: "2026-01-10T08:15:00Z",
    status: "success",
  },
  {
    id: 4,
    partner: "OCHA",
    direction: "received",
    dataset: "Humanitarian Needs Overview",
    records: 456,
    timestamp: "2026-01-10T09:30:00Z",
    status: "success",
  },
  {
    id: 5,
    partner: "ACLED",
    direction: "pending",
    dataset: "Conflict Events Data",
    records: 0,
    timestamp: null,
    status: "pending_api_key",
  },
];

export default function DataExchangeHub() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPartner, setSelectedPartner] = useState<typeof partnerOrganizations[0] | null>(null);

  const filteredPartners = partnerOrganizations.filter(partner => {
    const matchesSearch = 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.nameAr.includes(searchQuery);
    const matchesType = selectedType === "all" || partner.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalDataShared = partnerOrganizations.reduce((sum, p) => sum + p.dataShared, 0);
  const totalDataReceived = partnerOrganizations.reduce((sum, p) => sum + p.dataReceived, 0);
  const activePartners = partnerOrganizations.filter(p => p.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2e6b4f] to-[#5a7a5a] text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-[#C0A030] text-[#2e6b4f]">
              {language === "ar" ? "تبادل البيانات" : "Data Exchange"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === "ar" ? "مركز تبادل البيانات الدولي" : "International Data Exchange Hub"}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {language === "ar"
                ? "منصة موحدة لتبادل البيانات مع المنظمات الدولية والوكالات الأممية"
                : "Unified platform for data exchange with international organizations and UN agencies"}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                icon: Building2, 
                value: activePartners, 
                label: language === "ar" ? "شركاء نشطون" : "Active Partners",
                color: "text-green-500",
              },
              { 
                icon: Upload, 
                value: totalDataShared, 
                label: language === "ar" ? "مجموعات بيانات مشاركة" : "Datasets Shared",
                color: "text-blue-500",
              },
              { 
                icon: Download, 
                value: totalDataReceived, 
                label: language === "ar" ? "مجموعات بيانات مستلمة" : "Datasets Received",
                color: "text-purple-500",
              },
              { 
                icon: RefreshCw, 
                value: "24/7", 
                label: language === "ar" ? "مزامنة تلقائية" : "Auto Sync",
                color: "text-[#C0A030]",
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-[#2e6b4f] dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <Tabs defaultValue="partners" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="partners">
                {language === "ar" ? "الشركاء" : "Partners"}
              </TabsTrigger>
              <TabsTrigger value="activity">
                {language === "ar" ? "النشاط" : "Activity"}
              </TabsTrigger>
              <TabsTrigger value="protocols">
                {language === "ar" ? "البروتوكولات" : "Protocols"}
              </TabsTrigger>
            </TabsList>

            {/* Partners Tab */}
            <TabsContent value="partners">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={language === "ar" ? "بحث عن شريك..." : "Search partners..."}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    { value: "all", label: language === "ar" ? "الكل" : "All" },
                    { value: "un_agency", label: language === "ar" ? "وكالات أممية" : "UN Agencies" },
                    { value: "multilateral", label: language === "ar" ? "متعدد الأطراف" : "Multilateral" },
                    { value: "national", label: language === "ar" ? "وطني" : "National" },
                  ].map((filter) => (
                    <Button
                      key={filter.value}
                      variant={selectedType === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(filter.value)}
                      className={selectedType === filter.value ? "bg-[#C0A030] text-[#2e6b4f]" : ""}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Partners Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPartners.map((partner) => (
                  <Card 
                    key={partner.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedPartner?.id === partner.id ? "ring-2 ring-[#C0A030]" : ""
                    }`}
                    onClick={() => setSelectedPartner(partner)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                            {partner.logo}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {language === "ar" ? partner.nameAr : partner.name}
                            </CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                partner.status === "active" 
                                  ? "border-green-500 text-green-600" 
                                  : partner.status === "limited"
                                  ? "border-yellow-500 text-yellow-600"
                                  : "border-gray-500 text-gray-600"
                              }`}
                            >
                              {partner.status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {partner.status === "limited" && <AlertCircle className="w-3 h-3 mr-1" />}
                              {partner.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                              {partner.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {language === "ar" ? partner.descriptionAr : partner.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-blue-600">
                            <Upload className="w-4 h-4" />
                            <span>{partner.dataShared}</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-600">
                            <Download className="w-4 h-4" />
                            <span>{partner.dataReceived}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {partner.formats.slice(0, 2).map((format, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {format}
                            </Badge>
                          ))}
                          {partner.formats.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{partner.formats.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {partner.lastSync && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {language === "ar" ? "آخر مزامنة:" : "Last sync:"}{" "}
                          {new Date(partner.lastSync).toLocaleString(language === "ar" ? "ar-YE" : "en-US")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-[#C0A030]" />
                    {language === "ar" ? "سجل التبادلات الأخيرة" : "Recent Exchange Log"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentExchanges.map((exchange) => (
                      <div
                        key={exchange.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            exchange.direction === "received" 
                              ? "bg-purple-100 text-purple-600" 
                              : exchange.direction === "shared"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {exchange.direction === "received" ? (
                              <Download className="w-5 h-5" />
                            ) : exchange.direction === "shared" ? (
                              <Upload className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{exchange.dataset}</div>
                            <div className="text-sm text-gray-500">
                              {exchange.direction === "received" 
                                ? (language === "ar" ? "من" : "From") 
                                : (language === "ar" ? "إلى" : "To")}{" "}
                              {exchange.partner}
                              {exchange.records > 0 && ` • ${exchange.records.toLocaleString()} ${language === "ar" ? "سجل" : "records"}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={exchange.status === "success" ? "default" : "secondary"}
                            className={exchange.status === "success" ? "bg-green-500" : ""}
                          >
                            {exchange.status === "success" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {exchange.status === "pending_api_key" && <Lock className="w-3 h-3 mr-1" />}
                            {exchange.status === "success" 
                              ? (language === "ar" ? "نجاح" : "Success")
                              : (language === "ar" ? "في انتظار مفتاح API" : "Pending API Key")}
                          </Badge>
                          {exchange.timestamp && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(exchange.timestamp).toLocaleString(language === "ar" ? "ar-YE" : "en-US")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Protocols Tab */}
            <TabsContent value="protocols">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-[#C0A030]" />
                      {language === "ar" ? "بروتوكولات التبادل المدعومة" : "Supported Exchange Protocols"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {exchangeProtocols.map((protocol, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          protocol.supported ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}>
                          {protocol.supported ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium">{protocol.name}</div>
                          <div className="text-sm text-gray-500">{protocol.fullName}</div>
                          <div className="text-xs text-gray-400 mt-1">{protocol.description}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#C0A030]" />
                      {language === "ar" ? "معايير الأمان والجودة" : "Security & Quality Standards"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        icon: Lock,
                        title: language === "ar" ? "تشفير البيانات" : "Data Encryption",
                        description: language === "ar" ? "TLS 1.3 لجميع عمليات النقل" : "TLS 1.3 for all transfers",
                      },
                      {
                        icon: Users,
                        title: language === "ar" ? "التحكم في الوصول" : "Access Control",
                        description: language === "ar" ? "مصادقة OAuth 2.0 و API keys" : "OAuth 2.0 & API key authentication",
                      },
                      {
                        icon: BarChart3,
                        title: language === "ar" ? "التحقق من الجودة" : "Quality Validation",
                        description: language === "ar" ? "فحوصات تلقائية للبيانات الواردة" : "Automated checks on incoming data",
                      },
                      {
                        icon: Clock,
                        title: language === "ar" ? "سجل التدقيق" : "Audit Trail",
                        description: language === "ar" ? "تتبع كامل لجميع عمليات التبادل" : "Complete tracking of all exchanges",
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-[#C0A030]" />
                        </div>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Export Formats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-[#C0A030]" />
                    {language === "ar" ? "صيغ التصدير المتاحة" : "Available Export Formats"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      { name: "JSON", icon: FileJson, description: "JavaScript Object Notation" },
                      { name: "CSV", icon: FileSpreadsheet, description: "Comma-Separated Values" },
                      { name: "Excel", icon: FileSpreadsheet, description: "Microsoft Excel" },
                      { name: "SDMX", icon: Database, description: "Statistical Data Exchange" },
                      { name: "GeoJSON", icon: Globe, description: "Geographic JSON" },
                      { name: "API", icon: Zap, description: "RESTful API" },
                    ].map((format, index) => (
                      <div key={index} className="p-4 border rounded-lg text-center hover:border-[#C0A030] transition-colors">
                        <format.icon className="w-8 h-8 mx-auto mb-2 text-[#C0A030]" />
                        <div className="font-medium">{format.name}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#2e6b4f] text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === "ar" ? "هل تريد أن تصبح شريكًا في البيانات؟" : "Want to Become a Data Partner?"}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {language === "ar"
              ? "انضم إلى شبكتنا من المنظمات الدولية والوكالات الأممية لتبادل البيانات الاقتصادية والإنسانية حول اليمن."
              : "Join our network of international organizations and UN agencies to exchange economic and humanitarian data on Yemen."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="bg-[#C0A030] hover:bg-[#a08020] text-[#2e6b4f]">
                {language === "ar" ? "تواصل معنا" : "Contact Us"}
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {language === "ar" ? "وثائق API" : "API Documentation"}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

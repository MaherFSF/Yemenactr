import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Code, 
  Copy, 
  Check, 
  Key, 
  BookOpen, 
  Zap, 
  Shield, 
  Globe,
  Database,
  BarChart3,
  FileText,
  Clock,
  ChevronRight,
  Search,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { Link } from "wouter";

// API Endpoints data
const apiEndpoints = [
  {
    category: "Time Series Data",
    categoryAr: "بيانات السلاسل الزمنية",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/timeseries",
        description: "Retrieve time series data for economic indicators",
        descriptionAr: "استرجاع بيانات السلاسل الزمنية للمؤشرات الاقتصادية",
        params: [
          { name: "indicator", type: "string", required: true, description: "Indicator code (e.g., CBY_FX_PARALLEL_ADEN)" },
          { name: "regime", type: "string", required: false, description: "Filter by regime: aden_irg, sanaa_defacto, mixed" },
          { name: "start_date", type: "string", required: false, description: "Start date (ISO 8601 format)" },
          { name: "end_date", type: "string", required: false, description: "End date (ISO 8601 format)" },
          { name: "limit", type: "number", required: false, description: "Maximum number of records (default: 100)" },
        ],
        response: `{
  "data": [
    {
      "date": "2024-01-15",
      "value": 1620.5,
      "unit": "YER/USD",
      "confidence": "A",
      "regime": "aden_irg",
      "source": "Central Bank of Yemen - Aden"
    }
  ],
  "meta": {
    "total": 365,
    "page": 1,
    "limit": 100
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/timeseries/latest",
        description: "Get the latest value for an indicator",
        descriptionAr: "الحصول على أحدث قيمة لمؤشر",
        params: [
          { name: "indicator", type: "string", required: true, description: "Indicator code" },
          { name: "regime", type: "string", required: false, description: "Filter by regime" },
        ],
        response: `{
  "indicator": "CBY_FX_PARALLEL_ADEN",
  "value": 2050.0,
  "date": "2026-01-10",
  "unit": "YER/USD",
  "confidence": "A",
  "change_24h": 15.5,
  "change_percent_24h": 0.76
}`,
      },
    ],
  },
  {
    category: "Indicators Catalog",
    categoryAr: "كتالوج المؤشرات",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/indicators",
        description: "List all available economic indicators",
        descriptionAr: "قائمة جميع المؤشرات الاقتصادية المتاحة",
        params: [
          { name: "sector", type: "string", required: false, description: "Filter by sector" },
          { name: "search", type: "string", required: false, description: "Search by name or code" },
        ],
        response: `{
  "indicators": [
    {
      "code": "CBY_FX_PARALLEL_ADEN",
      "name": "Exchange Rate (Parallel Market - Aden)",
      "nameAr": "سعر الصرف (السوق الموازي - عدن)",
      "unit": "YER/USD",
      "sector": "currency_exchange",
      "frequency": "daily",
      "source": "Central Bank of Yemen - Aden"
    }
  ],
  "total": 156
}`,
      },
      {
        method: "GET",
        path: "/api/v1/indicators/{code}",
        description: "Get detailed information about a specific indicator",
        descriptionAr: "الحصول على معلومات تفصيلية حول مؤشر معين",
        params: [
          { name: "code", type: "string", required: true, description: "Indicator code" },
        ],
        response: `{
  "code": "CBY_FX_PARALLEL_ADEN",
  "name": "Exchange Rate (Parallel Market - Aden)",
  "nameAr": "سعر الصرف (السوق الموازي - عدن)",
  "description": "Daily parallel market exchange rate in Aden",
  "unit": "YER/USD",
  "sector": "currency_exchange",
  "frequency": "daily",
  "coverage": {
    "start": "2015-01-01",
    "end": "2026-01-10"
  },
  "methodology": "Collected from licensed exchange bureaus",
  "source": {
    "name": "Central Bank of Yemen - Aden",
    "url": "https://cby-aden.com"
  }
}`,
      },
    ],
  },
  {
    category: "Documents & Reports",
    categoryAr: "الوثائق والتقارير",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/documents",
        description: "Search and retrieve documents from the research library",
        descriptionAr: "البحث واسترجاع الوثائق من مكتبة الأبحاث",
        params: [
          { name: "category", type: "string", required: false, description: "Document category" },
          { name: "search", type: "string", required: false, description: "Full-text search query" },
          { name: "language", type: "string", required: false, description: "Filter by language: en, ar" },
          { name: "from_date", type: "string", required: false, description: "Publication date from" },
          { name: "to_date", type: "string", required: false, description: "Publication date to" },
        ],
        response: `{
  "documents": [
    {
      "id": "doc_123",
      "title": "Monthly Economic Report - December 2024",
      "titleAr": "التقرير الاقتصادي الشهري - ديسمبر 2024",
      "category": "monthly_report",
      "publicationDate": "2025-12-14",
      "language": "en",
      "downloadUrl": "https://api.yeto.org/v1/documents/doc_123/download"
    }
  ],
  "total": 245
}`,
      },
    ],
  },
  {
    category: "Economic Events",
    categoryAr: "الأحداث الاقتصادية",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/events",
        description: "Retrieve economic events and policy changes",
        descriptionAr: "استرجاع الأحداث الاقتصادية وتغييرات السياسات",
        params: [
          { name: "category", type: "string", required: false, description: "Event category" },
          { name: "from_date", type: "string", required: false, description: "Events from date" },
          { name: "to_date", type: "string", required: false, description: "Events to date" },
          { name: "regime", type: "string", required: false, description: "Filter by regime" },
        ],
        response: `{
  "events": [
    {
      "id": 1,
      "title": "CBY Aden announces new monetary policy",
      "titleAr": "البنك المركزي في عدن يعلن سياسة نقدية جديدة",
      "date": "2025-12-28",
      "category": "monetary_policy",
      "regime": "aden_irg",
      "impact": "high",
      "description": "..."
    }
  ],
  "total": 89
}`,
      },
    ],
  },
  {
    category: "Regime Comparison",
    categoryAr: "مقارنة الأنظمة",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/compare",
        description: "Compare indicators between Aden and Sana'a regimes",
        descriptionAr: "مقارنة المؤشرات بين نظامي عدن وصنعاء",
        params: [
          { name: "indicators", type: "string[]", required: true, description: "Comma-separated indicator codes" },
          { name: "date", type: "string", required: false, description: "Comparison date (default: latest)" },
        ],
        response: `{
  "comparison": [
    {
      "indicator": "CBY_FX_PARALLEL",
      "aden_irg": {
        "value": 2050.0,
        "date": "2026-01-10"
      },
      "sanaa_defacto": {
        "value": 535.0,
        "date": "2026-01-10"
      },
      "divergence": 283.18,
      "divergence_percent": 283.18
    }
  ]
}`,
      },
    ],
  },
];

// Code examples
const codeExamples = {
  python: `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.yeto.org/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Get latest exchange rate for Aden
response = requests.get(
    f"{BASE_URL}/timeseries/latest",
    headers=headers,
    params={
        "indicator": "CBY_FX_PARALLEL_ADEN",
        "regime": "aden_irg"
    }
)

data = response.json()
print(f"Exchange Rate: {data['value']} {data['unit']}")
print(f"Last Updated: {data['date']}")`,

  javascript: `const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.yeto.org/v1';

async function getLatestExchangeRate() {
  const response = await fetch(
    \`\${BASE_URL}/timeseries/latest?indicator=CBY_FX_PARALLEL_ADEN&regime=aden_irg\`,
    {
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  console.log(\`Exchange Rate: \${data.value} \${data.unit}\`);
  console.log(\`Last Updated: \${data.date}\`);
}

getLatestExchangeRate();`,

  curl: `# Get latest exchange rate
curl -X GET "https://api.yeto.org/v1/timeseries/latest?indicator=CBY_FX_PARALLEL_ADEN&regime=aden_irg" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"

# Get time series data
curl -X GET "https://api.yeto.org/v1/timeseries?indicator=CBY_FX_PARALLEL_ADEN&start_date=2024-01-01&limit=30" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"`,

  r: `library(httr)
library(jsonlite)

API_KEY <- "your_api_key_here"
BASE_URL <- "https://api.yeto.org/v1"

# Get time series data
response <- GET(
  paste0(BASE_URL, "/timeseries"),
  add_headers(
    Authorization = paste("Bearer", API_KEY),
    \`Content-Type\` = "application/json"
  ),
  query = list(
    indicator = "CBY_FX_PARALLEL_ADEN",
    start_date = "2024-01-01",
    limit = 100
  )
)

data <- fromJSON(content(response, "text"))
print(head(data$data))`,
};

export default function ApiDocs() {
  const { language } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<typeof apiEndpoints[0]["endpoints"][0] | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredEndpoints = apiEndpoints.map(category => ({
    ...category,
    endpoints: category.endpoints.filter(
      endpoint =>
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.endpoints.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2e6b4f] to-[#5a7a5a] text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-[#C0A030] text-[#2e6b4f]">
              {language === "ar" ? "وثائق API" : "API Documentation"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === "ar" ? "بوابة مطوري YETO" : "YETO Developer Portal"}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {language === "ar"
                ? "الوصول البرمجي إلى بيانات اليمن الاقتصادية الشاملة"
                : "Programmatic access to comprehensive Yemen economic data"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-[#C0A030] hover:bg-[#a08020] text-[#2e6b4f]">
                <Key className="w-5 h-5 mr-2" />
                {language === "ar" ? "احصل على مفتاح API" : "Get API Key"}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <BookOpen className="w-5 h-5 mr-2" />
                {language === "ar" ? "دليل البدء السريع" : "Quick Start Guide"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: language === "ar" ? "سريع وموثوق" : "Fast & Reliable",
                description: language === "ar" ? "وقت استجابة أقل من 100 مللي ثانية" : "Sub-100ms response times",
              },
              {
                icon: Shield,
                title: language === "ar" ? "آمن" : "Secure",
                description: language === "ar" ? "مصادقة OAuth 2.0 و HTTPS" : "OAuth 2.0 & HTTPS encryption",
              },
              {
                icon: Globe,
                title: language === "ar" ? "RESTful" : "RESTful",
                description: language === "ar" ? "واجهة برمجة تطبيقات REST قياسية" : "Standard REST API interface",
              },
              {
                icon: Database,
                title: language === "ar" ? "بيانات شاملة" : "Comprehensive Data",
                description: language === "ar" ? "أكثر من 150 مؤشر اقتصادي" : "150+ economic indicators",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#C0A030]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-[#C0A030]" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "نقاط النهاية" : "Endpoints"}
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={language === "ar" ? "بحث..." : "Search..."}
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {filteredEndpoints.map((category, catIndex) => (
                      <div key={catIndex}>
                        <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {language === "ar" ? category.categoryAr : category.category}
                        </div>
                        {category.endpoints.map((endpoint, endIndex) => (
                          <button
                            key={endIndex}
                            onClick={() => setSelectedEndpoint(endpoint)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 ${
                              selectedEndpoint?.path === endpoint.path ? "bg-[#C0A030]/10 border-l-2 border-[#C0A030]" : ""
                            }`}
                          >
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                endpoint.method === "GET"
                                  ? "border-green-500 text-green-600"
                                  : endpoint.method === "POST"
                                  ? "border-blue-500 text-blue-600"
                                  : "border-orange-500 text-orange-600"
                              }`}
                            >
                              {endpoint.method}
                            </Badge>
                            <span className="truncate font-mono text-xs">{endpoint.path}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Getting Started */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#C0A030]" />
                    {language === "ar" ? "البدء السريع" : "Quick Start"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar"
                      ? "ابدأ باستخدام YETO API في دقائق"
                      : "Get started with the YETO API in minutes"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="python">
                    <TabsList className="mb-4">
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="r">R</TabsTrigger>
                    </TabsList>
                    {Object.entries(codeExamples).map(([lang, code]) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="relative">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{code}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => copyToClipboard(code, lang)}
                          >
                            {copiedCode === lang ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Selected Endpoint Details */}
              {selectedEndpoint ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${
                          selectedEndpoint.method === "GET"
                            ? "bg-green-500"
                            : selectedEndpoint.method === "POST"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }`}
                      >
                        {selectedEndpoint.method}
                      </Badge>
                      <code className="text-lg font-mono">{selectedEndpoint.path}</code>
                    </div>
                    <CardDescription>
                      {language === "ar" ? selectedEndpoint.descriptionAr : selectedEndpoint.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Parameters */}
                    <div>
                      <h4 className="font-semibold mb-3">
                        {language === "ar" ? "المعلمات" : "Parameters"}
                      </h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-2 text-left">{language === "ar" ? "الاسم" : "Name"}</th>
                              <th className="px-4 py-2 text-left">{language === "ar" ? "النوع" : "Type"}</th>
                              <th className="px-4 py-2 text-left">{language === "ar" ? "مطلوب" : "Required"}</th>
                              <th className="px-4 py-2 text-left">{language === "ar" ? "الوصف" : "Description"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEndpoint.params.map((param, index) => (
                              <tr key={index} className="border-t">
                                <td className="px-4 py-2 font-mono text-[#C0A030]">{param.name}</td>
                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{param.type}</td>
                                <td className="px-4 py-2">
                                  {param.required ? (
                                    <Badge variant="destructive" className="text-xs">Required</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{param.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <h4 className="font-semibold mb-3">
                        {language === "ar" ? "الاستجابة" : "Response"}
                      </h4>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{selectedEndpoint.response}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard(selectedEndpoint.response, "response")}
                        >
                          {copiedCode === "response" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* All Endpoints Overview */
                <div className="space-y-6">
                  {apiEndpoints.map((category, catIndex) => (
                    <Card key={catIndex}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {catIndex === 0 && <BarChart3 className="w-5 h-5 text-[#C0A030]" />}
                          {catIndex === 1 && <Database className="w-5 h-5 text-[#C0A030]" />}
                          {catIndex === 2 && <FileText className="w-5 h-5 text-[#C0A030]" />}
                          {catIndex === 3 && <Clock className="w-5 h-5 text-[#C0A030]" />}
                          {catIndex === 4 && <Globe className="w-5 h-5 text-[#C0A030]" />}
                          {language === "ar" ? category.categoryAr : category.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.endpoints.map((endpoint, endIndex) => (
                            <button
                              key={endIndex}
                              onClick={() => setSelectedEndpoint(endpoint)}
                              className="w-full text-left p-4 border rounded-lg hover:border-[#C0A030] hover:bg-[#C0A030]/5 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      endpoint.method === "GET"
                                        ? "border-green-500 text-green-600"
                                        : endpoint.method === "POST"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-orange-500 text-orange-600"
                                    }`}
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <code className="font-mono text-sm">{endpoint.path}</code>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {language === "ar" ? endpoint.descriptionAr : endpoint.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Rate Limits & Authentication */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#C0A030]" />
                      {language === "ar" ? "المصادقة" : "Authentication"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === "ar"
                        ? "جميع طلبات API تتطلب مفتاح API صالح في رأس Authorization."
                        : "All API requests require a valid API key in the Authorization header."}
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <code className="text-sm">Authorization: Bearer your_api_key_here</code>
                    </div>
                    <Button className="w-full bg-[#C0A030] hover:bg-[#a08020] text-[#2e6b4f]">
                      <Key className="w-4 h-4 mr-2" />
                      {language === "ar" ? "احصل على مفتاح API" : "Get Your API Key"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#C0A030]" />
                      {language === "ar" ? "حدود الاستخدام" : "Rate Limits"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { tier: "Free", limit: "100 requests/day", color: "bg-gray-500" },
                        { tier: "Researcher", limit: "10,000 requests/day", color: "bg-blue-500" },
                        { tier: "Institutional", limit: "100,000 requests/day", color: "bg-[#C0A030]" },
                      ].map((tier, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                            <span className="font-medium">{tier.tier}</span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{tier.limit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SDKs & Libraries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#C0A030]" />
                    {language === "ar" ? "حزم SDK والمكتبات" : "SDKs & Libraries"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar"
                      ? "مكتبات رسمية للغات البرمجة الشائعة"
                      : "Official libraries for popular programming languages"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { name: "Python", package: "pip install yeto-sdk", icon: "🐍" },
                      { name: "JavaScript/Node.js", package: "npm install @yeto/sdk", icon: "📦" },
                      { name: "R", package: 'install.packages("yeto")', icon: "📊" },
                    ].map((sdk, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{sdk.icon}</span>
                          <span className="font-medium">{sdk.name}</span>
                        </div>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">
                          {sdk.package}
                        </code>
                        <Button variant="link" className="p-0 h-auto mt-2 text-[#C0A030]">
                          {language === "ar" ? "عرض على GitHub" : "View on GitHub"}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#2e6b4f] text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === "ar" ? "هل أنت مستعد للبدء؟" : "Ready to Get Started?"}
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            {language === "ar"
              ? "انضم إلى مئات المطورين والباحثين الذين يستخدمون YETO API للوصول إلى بيانات اليمن الاقتصادية."
              : "Join hundreds of developers and researchers using the YETO API to access Yemen economic data."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-[#C0A030] hover:bg-[#a08020] text-[#2e6b4f]">
              <Key className="w-5 h-5 mr-2" />
              {language === "ar" ? "إنشاء حساب مجاني" : "Create Free Account"}
            </Button>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {language === "ar" ? "اتصل بنا" : "Contact Us"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

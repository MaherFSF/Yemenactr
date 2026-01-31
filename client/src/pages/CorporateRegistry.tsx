import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Search,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  ExternalLink,
  Factory,
  Briefcase,
  Landmark,
  Ship,
  Fuel,
  Wheat,
  Building,
  Banknote
} from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CorporateRegistry() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Business registration statistics
  const registrationStats = {
    totalRegistered: {
      value: "45,230",
      labelEn: "Total Registered Businesses",
      labelAr: "إجمالي الشركات المسجلة",
      source: "Ministry of Industry & Trade",
      date: "2024"
    },
    activeBusinesses: {
      value: "28,450",
      labelEn: "Active Businesses",
      labelAr: "الشركات النشطة",
      source: "Chamber of Commerce",
      date: "2024"
    },
    newRegistrations2024: {
      value: "1,240",
      labelEn: "New Registrations (2024)",
      labelAr: "التسجيلات الجديدة (2024)",
      source: "Ministry of Industry & Trade",
      date: "2024"
    },
    closures2024: {
      value: "3,150",
      labelEn: "Business Closures (2024)",
      labelAr: "إغلاق الشركات (2024)",
      source: "Chamber of Commerce",
      date: "2024"
    }
  };

  // Sector distribution
  const sectorDistribution = [
    { nameEn: "Trade & Commerce", nameAr: "التجارة", value: 35, color: "#2e8b6e" },
    { nameEn: "Services", nameAr: "الخدمات", value: 25, color: "#C0A030" },
    { nameEn: "Construction", nameAr: "البناء", value: 12, color: "#1e40af" },
    { nameEn: "Manufacturing", nameAr: "التصنيع", value: 10, color: "#7c3aed" },
    { nameEn: "Agriculture", nameAr: "الزراعة", value: 8, color: "#059669" },
    { nameEn: "Transport", nameAr: "النقل", value: 6, color: "#dc2626" },
    { nameEn: "Other", nameAr: "أخرى", value: 4, color: "#6b7280" },
  ];

  // Registration trends by year
  const registrationTrends = [
    { year: "2014", new: 4500, closed: 1200 },
    { year: "2015", new: 1200, closed: 8500 },
    { year: "2016", new: 800, closed: 6200 },
    { year: "2017", new: 950, closed: 4100 },
    { year: "2018", new: 1100, closed: 3500 },
    { year: "2019", new: 1300, closed: 3200 },
    { year: "2020", new: 900, closed: 4800 },
    { year: "2021", new: 1050, closed: 3900 },
    { year: "2022", new: 1150, closed: 3600 },
    { year: "2023", new: 1180, closed: 3400 },
    { year: "2024", new: 1240, closed: 3150 },
  ];

  // Major companies by sector
  const majorCompanies = [
    {
      nameEn: "Yemen LNG Company",
      nameAr: "شركة الغاز الطبيعي المسال اليمنية",
      sector: "Energy",
      sectorAr: "الطاقة",
      status: "Suspended",
      statusAr: "معلقة",
      location: "Balhaf",
      employees: "~500 (pre-war: 2,000+)",
      icon: Fuel,
      notes: "Operations suspended since 2015 due to conflict"
    },
    {
      nameEn: "Hayel Saeed Anam Group",
      nameAr: "مجموعة هائل سعيد أنعم",
      sector: "Conglomerate",
      sectorAr: "مجموعة متنوعة",
      status: "Active",
      statusAr: "نشطة",
      location: "Taiz/Aden",
      employees: "~15,000",
      icon: Building2,
      notes: "Largest private sector employer in Yemen"
    },
    {
      nameEn: "Yemen Bank for Reconstruction",
      nameAr: "بنك اليمن للإنشاء والتعمير",
      sector: "Banking",
      sectorAr: "المصارف",
      status: "Active",
      statusAr: "نشط",
      location: "Sana'a/Aden",
      employees: "~800",
      icon: Banknote,
      notes: "State-owned development bank"
    },
    {
      nameEn: "Safer Exploration & Production",
      nameAr: "سيفر للاستكشاف والإنتاج",
      sector: "Oil & Gas",
      sectorAr: "النفط والغاز",
      status: "Limited",
      statusAr: "محدودة",
      location: "Marib",
      employees: "~300",
      icon: Fuel,
      notes: "Joint venture, reduced operations"
    },
    {
      nameEn: "Yemen Mobile (Sabafon)",
      nameAr: "يمن موبايل (سبأفون)",
      sector: "Telecom",
      sectorAr: "الاتصالات",
      status: "Active",
      statusAr: "نشطة",
      location: "Sana'a",
      employees: "~1,200",
      icon: Building,
      notes: "Major mobile operator"
    },
    {
      nameEn: "Red Sea Ports Corporation",
      nameAr: "مؤسسة موانئ البحر الأحمر",
      sector: "Ports",
      sectorAr: "الموانئ",
      status: "Active",
      statusAr: "نشطة",
      location: "Hodeidah",
      employees: "~2,500",
      icon: Ship,
      notes: "Under Houthi control since 2014"
    },
  ];

  // Regional distribution
  const regionalDistribution = [
    { regionEn: "Sana'a", regionAr: "صنعاء", businesses: 12500, percentage: 28 },
    { regionEn: "Aden", regionAr: "عدن", businesses: 8200, percentage: 18 },
    { regionEn: "Taiz", regionAr: "تعز", businesses: 5800, percentage: 13 },
    { regionEn: "Hodeidah", regionAr: "الحديدة", businesses: 4500, percentage: 10 },
    { regionEn: "Hadramawt", regionAr: "حضرموت", businesses: 3800, percentage: 8 },
    { regionEn: "Ibb", regionAr: "إب", businesses: 3200, percentage: 7 },
    { regionEn: "Other", regionAr: "أخرى", businesses: 7230, percentage: 16 },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-indigo-500 text-white border-0">
                {language === "ar" ? "بيانات الأعمال" : "Business Data"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "سجل الشركات والأعمال"
                : "Corporate & Business Registry"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "بيانات تسجيل الأعمال والشركات الرئيسية العاملة في اليمن"
                : "Business registration data and major companies operating in Yemen"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {Object.entries(registrationStats).map(([key, data]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardDescription>
                  {language === "ar" ? data.labelAr : data.labelEn}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.value}</div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {data.source} ({data.date})
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              {language === "ar" ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="companies">
              {language === "ar" ? "الشركات الكبرى" : "Major Companies"}
            </TabsTrigger>
            <TabsTrigger value="trends">
              {language === "ar" ? "الاتجاهات" : "Trends"}
            </TabsTrigger>
            <TabsTrigger value="regional">
              {language === "ar" ? "التوزيع الجغرافي" : "Regional"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "التوزيع القطاعي" : "Sector Distribution"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "الشركات المسجلة حسب القطاع" : "Registered businesses by sector"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sectorDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                      >
                        {sectorDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, language === "ar" ? "النسبة" : "Percentage"]}
                      />
                      <Legend 
                        formatter={(value, entry: any) => 
                          language === "ar" 
                            ? sectorDistribution.find(s => s.nameEn === value)?.nameAr 
                            : value
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "التوزيع الجغرافي" : "Geographic Distribution"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "الشركات حسب المنطقة" : "Businesses by region"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalDistribution.map((region, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium">
                          {language === "ar" ? region.regionAr : region.regionEn}
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${region.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-20 text-sm text-right">
                          {region.businesses.toLocaleString()} ({region.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "الشركات الرئيسية في اليمن" : "Major Companies in Yemen"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" 
                        ? "أكبر الشركات والمؤسسات العاملة"
                        : "Largest operating companies and institutions"}
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={language === "ar" ? "البحث..." : "Search..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {majorCompanies.map((company, index) => {
                    const Icon = company.icon;
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">
                                {language === "ar" ? company.nameAr : company.nameEn}
                              </h4>
                              <Badge variant={
                                company.status === "Active" ? "default" :
                                company.status === "Suspended" ? "destructive" : "secondary"
                              }>
                                {language === "ar" ? company.statusAr : company.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {language === "ar" ? company.sectorAr : company.sector}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {company.employees}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {company.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "اتجاهات تسجيل الأعمال" : "Business Registration Trends"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "التسجيلات الجديدة مقابل الإغلاقات (2014-2024)"
                    : "New registrations vs closures (2014-2024)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={registrationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="new" 
                      fill="#2e8b6e" 
                      name={language === "ar" ? "تسجيلات جديدة" : "New Registrations"}
                    />
                    <Bar 
                      dataKey="closed" 
                      fill="#dc2626" 
                      name={language === "ar" ? "إغلاقات" : "Closures"}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === "ar"
                      ? "ملاحظة: شهد عام 2015 أعلى معدل إغلاق للشركات بسبب اندلاع الصراع. تظهر البيانات تعافياً تدريجياً منذ 2017، لكن الإغلاقات لا تزال تفوق التسجيلات الجديدة."
                      : "Note: 2015 saw the highest business closure rate due to conflict outbreak. Data shows gradual recovery since 2017, but closures still exceed new registrations."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ar" ? "المصدر:" : "Source:"} Ministry of Industry & Trade, Chamber of Commerce (2024)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "التوزيع الجغرافي للأعمال" : "Geographic Business Distribution"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "الشركات المسجلة حسب المحافظة"
                    : "Registered businesses by governorate"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={regionalDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey={language === "ar" ? "regionAr" : "regionEn"}
                      width={80}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="businesses" 
                      fill="#2e8b6e"
                      name={language === "ar" ? "عدد الشركات" : "Number of Businesses"}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

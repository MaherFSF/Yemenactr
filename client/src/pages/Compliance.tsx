import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertTriangle,
  Shield,
  Search,
  Download,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle,
  Ban,
  Globe,
  Building2,
  User,
  Ship,
  FileText,
  Info,
} from "lucide-react";
import { useState } from "react";

export default function Compliance() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedList, setSelectedList] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Sanctions lists
  const sanctionsLists = [
    { id: "ofac", name: "OFAC SDN List", nameAr: "قائمة OFAC SDN", country: "USA", lastUpdated: "2026-01-08" },
    { id: "un", name: "UN Security Council", nameAr: "مجلس الأمن الدولي", country: "UN", lastUpdated: "2026-01-05" },
    { id: "eu", name: "EU Sanctions List", nameAr: "قائمة عقوبات الاتحاد الأوروبي", country: "EU", lastUpdated: "2026-01-06" },
    { id: "uk", name: "UK Sanctions List", nameAr: "قائمة عقوبات المملكة المتحدة", country: "UK", lastUpdated: "2026-01-07" },
  ];

  // Sanctioned entities relevant to Yemen
  const sanctionedEntities = [
    {
      id: "SE-001",
      name: "Abdul Malik Al-Houthi",
      nameAr: "عبدالملك الحوثي",
      type: "individual",
      lists: ["ofac", "un", "eu", "uk"],
      reason: "Leader of Ansar Allah movement",
      reasonAr: "قائد حركة أنصار الله",
      dateAdded: "2015-04-14",
      status: "active",
    },
    {
      id: "SE-002",
      name: "Ahmed Ali Abdullah Saleh",
      nameAr: "أحمد علي عبدالله صالح",
      type: "individual",
      lists: ["ofac", "un"],
      reason: "Former military commander, sanctions evasion",
      reasonAr: "قائد عسكري سابق، التحايل على العقوبات",
      dateAdded: "2017-11-07",
      status: "active",
    },
    {
      id: "SE-003",
      name: "Houthi-controlled Central Bank of Yemen",
      nameAr: "البنك المركزي اليمني الخاضع لسيطرة الحوثيين",
      type: "entity",
      lists: ["ofac"],
      reason: "Facilitating financial transactions for sanctioned parties",
      reasonAr: "تسهيل المعاملات المالية للأطراف الخاضعة للعقوبات",
      dateAdded: "2024-01-17",
      status: "active",
    },
    {
      id: "SE-004",
      name: "Yemen Red Sea Ports Corporation (Houthi-controlled)",
      nameAr: "مؤسسة موانئ البحر الأحمر اليمنية (الخاضعة لسيطرة الحوثيين)",
      type: "entity",
      lists: ["ofac", "uk"],
      reason: "Revenue generation for Ansar Allah",
      reasonAr: "توليد الإيرادات لأنصار الله",
      dateAdded: "2024-02-15",
      status: "active",
    },
    {
      id: "SE-005",
      name: "MV Rubymar (Vessel)",
      nameAr: "السفينة روبيمار",
      type: "vessel",
      lists: ["uk"],
      reason: "Attacked in Red Sea, environmental damage",
      reasonAr: "تعرضت للهجوم في البحر الأحمر، أضرار بيئية",
      dateAdded: "2024-03-01",
      status: "monitoring",
    },
  ];

  // Recent sanctions updates
  const recentUpdates = [
    {
      date: "2026-01-08",
      title: "OFAC updates Yemen-related designations",
      titleAr: "OFAC تحدث التصنيفات المتعلقة باليمن",
      description: "New designations targeting Houthi financial networks",
      descriptionAr: "تصنيفات جديدة تستهدف الشبكات المالية الحوثية",
      type: "addition",
    },
    {
      date: "2026-01-05",
      title: "UN Panel of Experts report released",
      titleAr: "صدور تقرير فريق خبراء الأمم المتحدة",
      description: "Annual report on Yemen sanctions implementation",
      descriptionAr: "التقرير السنوي عن تنفيذ العقوبات على اليمن",
      type: "report",
    },
    {
      date: "2026-01-03",
      title: "EU extends Yemen sanctions regime",
      titleAr: "الاتحاد الأوروبي يمدد نظام العقوبات على اليمن",
      description: "Sanctions framework extended until February 2026",
      descriptionAr: "تمديد إطار العقوبات حتى فبراير 2026",
      type: "extension",
    },
  ];

  // Compliance alerts
  const complianceAlerts = [
    {
      level: "high",
      title: "New OFAC designations affecting Yemen trade",
      titleAr: "تصنيفات OFAC جديدة تؤثر على التجارة اليمنية",
      date: "2026-01-08",
      action: "Review all transactions with designated entities",
      actionAr: "مراجعة جميع المعاملات مع الكيانات المصنفة",
    },
    {
      level: "medium",
      title: "Red Sea shipping insurance requirements updated",
      titleAr: "تحديث متطلبات تأمين الشحن في البحر الأحمر",
      date: "2026-01-06",
      action: "Verify insurance coverage for Yemen-bound cargo",
      actionAr: "التحقق من التغطية التأمينية للشحنات المتجهة إلى اليمن",
    },
    {
      level: "low",
      title: "Humanitarian exemption guidance clarified",
      titleAr: "توضيح إرشادات الإعفاء الإنساني",
      date: "2026-01-05",
      action: "Review updated OFAC humanitarian guidance",
      actionAr: "مراجعة إرشادات OFAC الإنسانية المحدثة",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "individual":
        return <User className="h-4 w-4" />;
      case "entity":
        return <Building2 className="h-4 w-4" />;
      case "vessel":
        return <Ship className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "low":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredEntities = sanctionedEntities.filter((entity) => {
    if (selectedList !== "all" && !entity.lists.includes(selectedList)) return false;
    if (selectedType !== "all" && entity.type !== selectedType) return false;
    if (searchQuery && !entity.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !entity.nameAr.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2e8b6e] to-[#6b8e6b] text-white">
        <div className="container py-8">
          <div className={language === "ar" ? "text-right" : ""}>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8" />
              <h1 className="text-3xl font-bold">
                {language === "ar" ? "مراقبة الامتثال والعقوبات" : "Compliance & Sanctions Monitoring"}
              </h1>
            </div>
            <p className="text-white/80 max-w-2xl">
              {language === "ar"
                ? "تتبع العقوبات الدولية والتصنيفات المتعلقة باليمن لضمان الامتثال التنظيمي"
                : "Track international sanctions and Yemen-related designations to ensure regulatory compliance"}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Compliance Alerts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {language === "ar" ? "تنبيهات الامتثال" : "Compliance Alerts"}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {complianceAlerts.map((alert, index) => (
              <Card key={index} className={`border-l-4 ${
                alert.level === "high" ? "border-l-red-500" :
                alert.level === "medium" ? "border-l-yellow-500" : "border-l-blue-500"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.level)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {language === "ar" ? alert.titleAr : alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === "ar" ? alert.actionAr : alert.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.date}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="entities" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="entities">
              {language === "ar" ? "الكيانات المصنفة" : "Sanctioned Entities"}
            </TabsTrigger>
            <TabsTrigger value="lists">
              {language === "ar" ? "قوائم العقوبات" : "Sanctions Lists"}
            </TabsTrigger>
            <TabsTrigger value="updates">
              {language === "ar" ? "التحديثات" : "Updates"}
            </TabsTrigger>
          </TabsList>

          {/* Sanctioned Entities Tab */}
          <TabsContent value="entities">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "الكيانات والأفراد الخاضعون للعقوبات" : "Sanctioned Entities & Individuals"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "قاعدة بيانات شاملة للعقوبات المتعلقة باليمن"
                    : "Comprehensive database of Yemen-related sanctions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={language === "ar" ? "البحث عن كيان أو فرد..." : "Search entity or individual..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedList} onValueChange={setSelectedList}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={language === "ar" ? "قائمة العقوبات" : "Sanctions List"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ar" ? "جميع القوائم" : "All Lists"}</SelectItem>
                      {sanctionsLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {language === "ar" ? list.nameAr : list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={language === "ar" ? "النوع" : "Type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                      <SelectItem value="individual">{language === "ar" ? "أفراد" : "Individuals"}</SelectItem>
                      <SelectItem value="entity">{language === "ar" ? "كيانات" : "Entities"}</SelectItem>
                      <SelectItem value="vessel">{language === "ar" ? "سفن" : "Vessels"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* Entities Table */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800">
                        <TableHead className="w-[50px]">{language === "ar" ? "النوع" : "Type"}</TableHead>
                        <TableHead>{language === "ar" ? "الاسم" : "Name"}</TableHead>
                        <TableHead>{language === "ar" ? "القوائم" : "Lists"}</TableHead>
                        <TableHead>{language === "ar" ? "السبب" : "Reason"}</TableHead>
                        <TableHead>{language === "ar" ? "تاريخ الإضافة" : "Date Added"}</TableHead>
                        <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntities.map((entity) => (
                        <TableRow key={entity.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell>
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full w-fit">
                              {getTypeIcon(entity.type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{language === "ar" ? entity.nameAr : entity.name}</p>
                              <p className="text-xs text-muted-foreground">{entity.id}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {entity.lists.map((list) => (
                                <Badge key={list} variant="outline" className="text-xs">
                                  {list.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-sm line-clamp-2">
                              {language === "ar" ? entity.reasonAr : entity.reason}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{entity.dateAdded}</TableCell>
                          <TableCell>
                            <Badge variant={entity.status === "active" ? "destructive" : "secondary"}>
                              {entity.status === "active" 
                                ? (language === "ar" ? "نشط" : "Active")
                                : (language === "ar" ? "مراقبة" : "Monitoring")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sanctions Lists Tab */}
          <TabsContent value="lists">
            <div className="grid md:grid-cols-2 gap-6">
              {sanctionsLists.map((list) => (
                <Card key={list.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {language === "ar" ? list.nameAr : list.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Globe className="h-4 w-4" />
                          {list.country}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{list.id.toUpperCase()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "آخر تحديث" : "Last Updated"}
                        </span>
                        <span>{list.lastUpdated}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "الكيانات المتعلقة باليمن" : "Yemen-related Entries"}
                        </span>
                        <span>{sanctionedEntities.filter(e => e.lists.includes(list.id)).length}</span>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {language === "ar" ? "عرض القائمة الكاملة" : "View Full List"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "التحديثات الأخيرة" : "Recent Updates"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "آخر التغييرات في أنظمة العقوبات المتعلقة باليمن"
                    : "Latest changes to Yemen-related sanctions regimes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUpdates.map((update, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {update.type === "addition" && <Ban className="h-5 w-5 text-red-500" />}
                        {update.type === "report" && <FileText className="h-5 w-5 text-blue-500" />}
                        {update.type === "extension" && <Clock className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium">
                            {language === "ar" ? update.titleAr : update.title}
                          </h3>
                          <span className="text-sm text-muted-foreground">{update.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === "ar" ? update.descriptionAr : update.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Card className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  {language === "ar" ? "إخلاء المسؤولية" : "Disclaimer"}
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {language === "ar"
                    ? "هذه المعلومات مقدمة لأغراض إعلامية فقط ولا تشكل مشورة قانونية. يرجى استشارة مستشار قانوني مؤهل للحصول على إرشادات امتثال محددة."
                    : "This information is provided for informational purposes only and does not constitute legal advice. Please consult a qualified legal advisor for specific compliance guidance."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

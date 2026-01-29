/**
 * Contributor Portal
 * Public portal for anyone to contribute data and suggestions
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Send,
  Shield,
  Globe
} from "lucide-react";
import { Link } from "wouter";

export default function ContributorPortal() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [contributionType, setContributionType] = useState<string>("data_correction");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sourceUrl: "",
    category: ""
  });

  // Queries
  const { data: contracts } = trpc.partnerEngine.getContracts.useQuery();

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      toast.error(isArabic ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }
    toast.success(isArabic ? "شكراً لمساهمتك! سنراجعها قريباً" : "Thank you for your contribution! We'll review it soon.");
    setFormData({ title: "", description: "", sourceUrl: "", category: "" });
  };

  return (
    <div className="min-h-screen bg-background" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">YETO</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/partner-dashboard">
              <Button variant="outline">
                {isArabic ? "لوحة تحكم الشريك" : "Partner Dashboard"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              {isArabic ? "بوابة المساهمين" : "Contributor Portal"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {isArabic 
                ? "ساعدنا في تحسين جودة البيانات الاقتصادية لليمن"
                : "Help us improve the quality of Yemen's economic data"}
            </p>
          </div>

          {/* Contribution Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${contributionType === "data_correction" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setContributionType("data_correction")}
            >
              <CardContent className="pt-6 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="font-semibold">{isArabic ? "تصحيح البيانات" : "Data Correction"}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {isArabic 
                    ? "الإبلاغ عن أخطاء أو تناقضات في البيانات"
                    : "Report errors or inconsistencies in data"}
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${contributionType === "new_source" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setContributionType("new_source")}
            >
              <CardContent className="pt-6 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold">{isArabic ? "مصدر جديد" : "New Source"}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {isArabic 
                    ? "اقتراح مصدر بيانات جديد"
                    : "Suggest a new data source"}
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${contributionType === "feedback" ? "ring-2 ring-primary" : ""}`}
              onClick={() => setContributionType("feedback")}
            >
              <CardContent className="pt-6 text-center">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold">{isArabic ? "ملاحظات عامة" : "General Feedback"}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {isArabic 
                    ? "مشاركة اقتراحات أو ملاحظات"
                    : "Share suggestions or observations"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contribution Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {contributionType === "data_correction" && (isArabic ? "الإبلاغ عن تصحيح" : "Report a Correction")}
                {contributionType === "new_source" && (isArabic ? "اقتراح مصدر جديد" : "Suggest a New Source")}
                {contributionType === "feedback" && (isArabic ? "إرسال ملاحظات" : "Submit Feedback")}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? "جميع المساهمات تخضع للمراجعة قبل النشر"
                  : "All contributions are reviewed before publication"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {isArabic ? "العنوان" : "Title"} *
                </label>
                <Input
                  placeholder={isArabic ? "عنوان موجز لمساهمتك" : "Brief title for your contribution"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {contributionType === "data_correction" && (
                <div>
                  <label className="text-sm font-medium">
                    {isArabic ? "الفئة" : "Category"}
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts?.map((contract) => (
                        <SelectItem key={contract.contractId} value={contract.datasetFamily}>
                          {contract.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">
                  {isArabic ? "الوصف" : "Description"} *
                </label>
                <Textarea
                  placeholder={
                    contributionType === "data_correction" 
                      ? (isArabic ? "صف الخطأ أو التناقض بالتفصيل..." : "Describe the error or inconsistency in detail...")
                      : contributionType === "new_source"
                      ? (isArabic ? "صف المصدر ونوع البيانات المتاحة..." : "Describe the source and type of data available...")
                      : (isArabic ? "شارك ملاحظاتك أو اقتراحاتك..." : "Share your observations or suggestions...")
                  }
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
              </div>

              {(contributionType === "data_correction" || contributionType === "new_source") && (
                <div>
                  <label className="text-sm font-medium">
                    {isArabic ? "رابط المصدر" : "Source URL"}
                  </label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  />
                </div>
              )}

              <Button className="w-full" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" />
                {isArabic ? "إرسال المساهمة" : "Submit Contribution"}
              </Button>
            </CardContent>
          </Card>

          {/* Trust & Transparency Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {isArabic ? "الثقة والشفافية" : "Trust & Transparency"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">{isArabic ? "كيف نعالج مساهماتك" : "How We Process Contributions"}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      {isArabic ? "مراجعة من قبل فريق متخصص" : "Review by specialized team"}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      {isArabic ? "التحقق من المصادر" : "Source verification"}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      {isArabic ? "التوثيق الكامل" : "Full documentation"}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      {isArabic ? "الاعتراف بالمساهمين" : "Contributor acknowledgment"}
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{isArabic ? "معايير الجودة" : "Quality Standards"}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">DQAF</Badge>
                      {isArabic ? "إطار جودة البيانات" : "Data Quality Framework"}
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">SDDS</Badge>
                      {isArabic ? "معايير نشر البيانات" : "Data Dissemination Standards"}
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">GDDS</Badge>
                      {isArabic ? "النظام العام لنشر البيانات" : "General Data Dissemination System"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold mb-2">
                {isArabic ? "هل أنت منظمة؟" : "Are you an organization?"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic 
                  ? "انضم كشريك بيانات للحصول على وصول موسع وأدوات متقدمة"
                  : "Join as a data partner for expanded access and advanced tools"}
              </p>
              <Link href="/partner-dashboard">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  {isArabic ? "كن شريكاً" : "Become a Partner"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            {isArabic 
              ? "© 2024 مرصد الشفافية الاقتصادية اليمني (YETO). جميع الحقوق محفوظة."
              : "© 2024 Yemen Economic Transparency Observatory (YETO). All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}

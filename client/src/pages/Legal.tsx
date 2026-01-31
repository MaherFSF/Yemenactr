import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileText, 
  Database, 
  Accessibility,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";

export default function Legal() {
  const { language } = useLanguage();
  const [location] = useLocation();
  
  // Determine initial tab from URL hash
  const getInitialTab = () => {
    if (location.includes("privacy")) return "privacy";
    if (location.includes("terms")) return "terms";
    if (location.includes("data-license") || location.includes("data-policy")) return "data-license";
    if (location.includes("accessibility")) return "accessibility";
    return "privacy";
  };

  const lastUpdated = "December 2024";

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#4C583E] to-[#0B1F33] text-white">
        <div className="container py-12">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">
            {language === "ar" ? "قانوني" : "Legal"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {language === "ar" ? "الشروط والسياسات" : "Legal & Policies"}
          </h1>
          <p className="text-white/70 max-w-2xl">
            {language === "ar"
              ? "سياسات الخصوصية وشروط الاستخدام وترخيص البيانات وبيان إمكانية الوصول"
              : "Privacy policy, terms of service, data licensing, and accessibility statement"}
          </p>
        </div>
      </section>

      <div className="container py-8">
        <Tabs defaultValue={getInitialTab()} className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">
                {language === "ar" ? "الخصوصية" : "Privacy"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">
                {language === "ar" ? "الشروط" : "Terms"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="data-license" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden md:inline">
                {language === "ar" ? "ترخيص البيانات" : "Data License"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              <span className="hidden md:inline">
                {language === "ar" ? "إمكانية الوصول" : "Accessibility"}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Privacy Policy */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#4C583E]" />
                    {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                  </CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lastUpdated}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                {language === "ar" ? (
                  <div className="space-y-6 text-right" dir="rtl">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. مقدمة</h3>
                      <p className="text-muted-foreground">
                        مرصد اليمن للشفافية الاقتصادية (YETO) ملتزم بحماية خصوصيتك. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. المعلومات التي نجمعها</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>معلومات الحساب (البريد الإلكتروني، الاسم) عند التسجيل</li>
                        <li>بيانات الاستخدام (الصفحات التي تمت زيارتها، عمليات البحث)</li>
                        <li>المعلومات التقنية (نوع المتصفح، عنوان IP)</li>
                        <li>تفضيلات اللغة والإعدادات</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. كيف نستخدم معلوماتك</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>تقديم خدمات المنصة وتحسينها</li>
                        <li>إرسال تنبيهات وتحديثات مهمة</li>
                        <li>تحليل أنماط الاستخدام لتحسين التجربة</li>
                        <li>الامتثال للمتطلبات القانونية</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. حماية البيانات</h3>
                      <p className="text-muted-foreground">
                        نستخدم تشفير SSL/TLS لجميع عمليات نقل البيانات. يتم تخزين البيانات في خوادم آمنة مع ضوابط وصول صارمة.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. حقوقك</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>الوصول إلى بياناتك الشخصية</li>
                        <li>طلب تصحيح أو حذف بياناتك</li>
                        <li>إلغاء الاشتراك في الاتصالات التسويقية</li>
                        <li>تصدير بياناتك بتنسيق قابل للقراءة</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">6. اتصل بنا</h3>
                      <p className="text-muted-foreground">
                        للاستفسارات المتعلقة بالخصوصية، يرجى التواصل معنا على:
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Mail className="h-4 w-4 text-[#4C583E]" />
                        <a href="mailto:yeto@causewaygrp.com" className="text-[#4C583E] hover:underline">
                          yeto@causewaygrp.com
                        </a>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. Introduction</h3>
                      <p className="text-muted-foreground">
                        The Yemen Economic Transparency Observatory (YETO) is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. Information We Collect</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Account information (email, name) when you register</li>
                        <li>Usage data (pages visited, searches performed)</li>
                        <li>Technical information (browser type, IP address)</li>
                        <li>Language preferences and settings</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. How We Use Your Information</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Provide and improve platform services</li>
                        <li>Send important alerts and updates</li>
                        <li>Analyze usage patterns to enhance experience</li>
                        <li>Comply with legal requirements</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. Data Protection</h3>
                      <p className="text-muted-foreground">
                        We use SSL/TLS encryption for all data transfers. Data is stored on secure servers with strict access controls.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. Your Rights</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Access your personal data</li>
                        <li>Request correction or deletion of your data</li>
                        <li>Opt out of marketing communications</li>
                        <li>Export your data in a readable format</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">6. Contact Us</h3>
                      <p className="text-muted-foreground">
                        For privacy-related inquiries, please contact us at:
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Mail className="h-4 w-4 text-[#4C583E]" />
                        <a href="mailto:yeto@causewaygrp.com" className="text-[#4C583E] hover:underline">
                          yeto@causewaygrp.com
                        </a>
                      </div>
                    </section>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms of Service */}
          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#4C583E]" />
                    {language === "ar" ? "شروط الخدمة" : "Terms of Service"}
                  </CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lastUpdated}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                {language === "ar" ? (
                  <div className="space-y-6 text-right" dir="rtl">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. قبول الشروط</h3>
                      <p className="text-muted-foreground">
                        باستخدام منصة YETO، فإنك توافق على هذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام المنصة.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. استخدام الخدمة</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>يجب أن يكون عمرك 18 عامًا أو أكثر لاستخدام المنصة</li>
                        <li>أنت مسؤول عن الحفاظ على أمان حسابك</li>
                        <li>يجب عدم استخدام المنصة لأغراض غير قانونية</li>
                        <li>يجب احترام حقوق الملكية الفكرية</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. المحتوى والبيانات</h3>
                      <p className="text-muted-foreground">
                        جميع البيانات والتحليلات مقدمة لأغراض إعلامية فقط. نحن نسعى للدقة ولكن لا نضمن اكتمال أو دقة جميع المعلومات.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. إخلاء المسؤولية</h3>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <p className="text-amber-800 text-sm">
                            المعلومات المقدمة على هذه المنصة هي لأغراض إعلامية عامة فقط. لا ينبغي اعتبارها نصيحة مالية أو استثمارية أو قانونية.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. التعديلات</h3>
                      <p className="text-muted-foreground">
                        نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بالتغييرات الجوهرية.
                      </p>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                      <p className="text-muted-foreground">
                        By using the YETO platform, you agree to these terms. If you do not agree, please do not use the platform.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. Use of Service</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>You must be 18 years or older to use the platform</li>
                        <li>You are responsible for maintaining account security</li>
                        <li>The platform must not be used for illegal purposes</li>
                        <li>Intellectual property rights must be respected</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. Content and Data</h3>
                      <p className="text-muted-foreground">
                        All data and analysis are provided for informational purposes only. We strive for accuracy but do not guarantee completeness or accuracy of all information.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. Disclaimer</h3>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <p className="text-amber-800 text-sm">
                            Information provided on this platform is for general informational purposes only. It should not be considered financial, investment, or legal advice.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. Modifications</h3>
                      <p className="text-muted-foreground">
                        We reserve the right to modify these terms at any time. Users will be notified of material changes.
                      </p>
                    </section>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data License */}
          <TabsContent value="data-license">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-[#4C583E]" />
                    {language === "ar" ? "ترخيص البيانات وإعادة الاستخدام" : "Data License & Reuse"}
                  </CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lastUpdated}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                {language === "ar" ? (
                  <div className="space-y-6 text-right" dir="rtl">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. ترخيص البيانات</h3>
                      <p className="text-muted-foreground">
                        البيانات المتاحة على منصة YETO مرخصة بموجب شروط مختلفة حسب المصدر. يتم عرض معلومات الترخيص لكل مجموعة بيانات.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. الاستخدام المسموح</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800">مسموح</p>
                            <ul className="text-sm text-green-700 mt-1 space-y-1">
                              <li>• البحث الأكاديمي والتعليمي</li>
                              <li>• التقارير الصحفية مع الإسناد</li>
                              <li>• تحليل السياسات غير الربحي</li>
                              <li>• الاستخدام الشخصي غير التجاري</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. متطلبات الإسناد</h3>
                      <p className="text-muted-foreground mb-3">
                        عند استخدام بيانات YETO، يجب الإشارة إلى:
                      </p>
                      <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                        المصدر: مرصد اليمن للشفافية الاقتصادية (YETO)، [السنة]. متاح على: yeto.causewaygrp.com
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. الاستخدام التجاري</h3>
                      <p className="text-muted-foreground">
                        للاستخدام التجاري أو إعادة التوزيع بكميات كبيرة، يرجى الاتصال بنا للحصول على ترخيص مناسب.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. بيانات الطرف الثالث</h3>
                      <p className="text-muted-foreground">
                        بعض البيانات مصدرها منظمات خارجية (البنك الدولي، صندوق النقد الدولي، الأمم المتحدة، إلخ). تخضع هذه البيانات لشروط الترخيص الخاصة بها.
                      </p>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">1. Data Licensing</h3>
                      <p className="text-muted-foreground">
                        Data available on the YETO platform is licensed under various terms depending on the source. Licensing information is displayed for each dataset.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">2. Permitted Use</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800">Permitted</p>
                            <ul className="text-sm text-green-700 mt-1 space-y-1">
                              <li>• Academic and educational research</li>
                              <li>• Journalistic reporting with attribution</li>
                              <li>• Non-profit policy analysis</li>
                              <li>• Personal non-commercial use</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">3. Attribution Requirements</h3>
                      <p className="text-muted-foreground mb-3">
                        When using YETO data, please cite as:
                      </p>
                      <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                        Source: Yemen Economic Transparency Observatory (YETO), [Year]. Available at: yeto.causewaygrp.com
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">4. Commercial Use</h3>
                      <p className="text-muted-foreground">
                        For commercial use or bulk redistribution, please contact us for appropriate licensing.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">5. Third-Party Data</h3>
                      <p className="text-muted-foreground">
                        Some data is sourced from external organizations (World Bank, IMF, UN, etc.). This data is subject to their respective licensing terms.
                      </p>
                    </section>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility */}
          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Accessibility className="h-5 w-5 text-[#4C583E]" />
                    {language === "ar" ? "بيان إمكانية الوصول" : "Accessibility Statement"}
                  </CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {lastUpdated}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                {language === "ar" ? (
                  <div className="space-y-6 text-right" dir="rtl">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">التزامنا</h3>
                      <p className="text-muted-foreground">
                        نحن ملتزمون بضمان إمكانية الوصول الرقمي للأشخاص ذوي الإعاقة. نعمل باستمرار على تحسين تجربة المستخدم للجميع.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">معايير إمكانية الوصول</h3>
                      <p className="text-muted-foreground">
                        نسعى للامتثال لإرشادات إمكانية الوصول إلى محتوى الويب (WCAG) 2.1 المستوى AA، بما في ذلك:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                        <li>التنقل بلوحة المفاتيح لجميع الوظائف</li>
                        <li>نص بديل للصور والرسوم البيانية</li>
                        <li>تباين ألوان كافٍ</li>
                        <li>دعم قارئ الشاشة</li>
                        <li>دعم كامل للغة العربية RTL</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">ميزات إمكانية الوصول</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">التنقل</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• روابط تخطي إلى المحتوى</li>
                            <li>• بنية عناوين متسقة</li>
                            <li>• مؤشرات تركيز مرئية</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">المحتوى</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• نص قابل لتغيير الحجم</li>
                            <li>• تسميات ARIA للعناصر التفاعلية</li>
                            <li>• رسائل خطأ واضحة</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">الإبلاغ عن مشكلات إمكانية الوصول</h3>
                      <p className="text-muted-foreground">
                        إذا واجهت أي عوائق في إمكانية الوصول، يرجى الاتصال بنا:
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Mail className="h-4 w-4 text-[#4C583E]" />
                        <a href="mailto:yeto@causewaygrp.com" className="text-[#4C583E] hover:underline">
                          yeto@causewaygrp.com
                        </a>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3">Our Commitment</h3>
                      <p className="text-muted-foreground">
                        We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Accessibility Standards</h3>
                      <p className="text-muted-foreground">
                        We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, including:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                        <li>Keyboard navigation for all functionality</li>
                        <li>Alternative text for images and charts</li>
                        <li>Sufficient color contrast</li>
                        <li>Screen reader support</li>
                        <li>Full Arabic RTL language support</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Accessibility Features</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Navigation</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Skip to content links</li>
                            <li>• Consistent heading structure</li>
                            <li>• Visible focus indicators</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Content</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Resizable text</li>
                            <li>• ARIA labels for interactive elements</li>
                            <li>• Clear error messages</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3">Reporting Accessibility Issues</h3>
                      <p className="text-muted-foreground">
                        If you encounter any accessibility barriers, please contact us:
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Mail className="h-4 w-4 text-[#4C583E]" />
                        <a href="mailto:yeto@causewaygrp.com" className="text-[#4C583E] hover:underline">
                          yeto@causewaygrp.com
                        </a>
                      </div>
                    </section>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check,
  X,
  Zap,
  Building2,
  Users,
  Crown,
  ArrowRight,
  HelpCircle
} from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const { language } = useLanguage();

  const tiers = [
    {
      id: "free",
      nameEn: "Free",
      nameAr: "مجاني",
      priceEn: "$0",
      priceAr: "مجاناً",
      periodEn: "forever",
      periodAr: "للأبد",
      descriptionEn: "Essential access for researchers and journalists",
      descriptionAr: "وصول أساسي للباحثين والصحفيين",
      icon: Users,
      featured: false,
      features: [
        { en: "Access to all public dashboards", ar: "الوصول إلى جميع لوحات المعلومات العامة", included: true },
        { en: "Basic data export (CSV)", ar: "تصدير البيانات الأساسي (CSV)", included: true },
        { en: "5 AI queries per day", ar: "5 استفسارات ذكاء اصطناعي يومياً", included: true },
        { en: "Access to methodology docs", ar: "الوصول إلى وثائق المنهجية", included: true },
        { en: "Email newsletter", ar: "النشرة البريدية", included: true },
        { en: "API access", ar: "الوصول إلى API", included: false },
        { en: "Custom reports", ar: "التقارير المخصصة", included: false },
        { en: "Priority support", ar: "الدعم ذو الأولوية", included: false },
      ]
    },
    {
      id: "professional",
      nameEn: "Professional",
      nameAr: "احترافي",
      priceEn: "$49",
      priceAr: "$49",
      periodEn: "/month",
      periodAr: "/شهر",
      descriptionEn: "For analysts and research organizations",
      descriptionAr: "للمحللين والمؤسسات البحثية",
      icon: Zap,
      featured: true,
      features: [
        { en: "Everything in Free", ar: "كل ما في الباقة المجانية", included: true },
        { en: "Unlimited AI queries", ar: "استفسارات ذكاء اصطناعي غير محدودة", included: true },
        { en: "Advanced data export (Excel, PDF)", ar: "تصدير متقدم (Excel, PDF)", included: true },
        { en: "Custom report builder", ar: "منشئ التقارير المخصصة", included: true },
        { en: "API access (10K calls/month)", ar: "الوصول إلى API (10 آلاف طلب/شهر)", included: true },
        { en: "Scenario simulator", ar: "محاكي السيناريوهات", included: true },
        { en: "Email support", ar: "الدعم عبر البريد", included: true },
        { en: "White-label reports", ar: "تقارير بعلامتك التجارية", included: false },
      ]
    },
    {
      id: "enterprise",
      nameEn: "Enterprise",
      nameAr: "مؤسسي",
      priceEn: "Custom",
      priceAr: "مخصص",
      periodEn: "",
      periodAr: "",
      descriptionEn: "For governments, NGOs, and large organizations",
      descriptionAr: "للحكومات والمنظمات غير الحكومية والمؤسسات الكبيرة",
      icon: Building2,
      featured: false,
      features: [
        { en: "Everything in Professional", ar: "كل ما في الباقة الاحترافية", included: true },
        { en: "Unlimited API access", ar: "وصول غير محدود إلى API", included: true },
        { en: "White-label reports", ar: "تقارير بعلامتك التجارية", included: true },
        { en: "Custom data integrations", ar: "تكاملات بيانات مخصصة", included: true },
        { en: "Dedicated account manager", ar: "مدير حساب مخصص", included: true },
        { en: "Priority support (24/7)", ar: "دعم ذو أولوية (24/7)", included: true },
        { en: "Training sessions", ar: "جلسات تدريبية", included: true },
        { en: "Custom features on request", ar: "ميزات مخصصة حسب الطلب", included: true },
      ]
    },
  ];

  const faqs = [
    {
      questionEn: "Can I switch plans at any time?",
      questionAr: "هل يمكنني تغيير الباقة في أي وقت؟",
      answerEn: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
      answerAr: "نعم، يمكنك ترقية أو تخفيض باقتك في أي وقت. التغييرات تسري فوراً."
    },
    {
      questionEn: "Is there a discount for NGOs and academic institutions?",
      questionAr: "هل هناك خصم للمنظمات غير الحكومية والمؤسسات الأكاديمية؟",
      answerEn: "Yes, we offer 50% discount for verified NGOs and academic institutions. Contact us for details.",
      answerAr: "نعم، نقدم خصم 50% للمنظمات غير الحكومية والمؤسسات الأكاديمية المعتمدة. تواصل معنا للتفاصيل."
    },
    {
      questionEn: "What payment methods do you accept?",
      questionAr: "ما هي طرق الدفع المقبولة؟",
      answerEn: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
      answerAr: "نقبل جميع بطاقات الائتمان الرئيسية، PayPal، والتحويلات البنكية للباقات المؤسسية."
    },
    {
      questionEn: "Can I get a refund?",
      questionAr: "هل يمكنني استرداد المبلغ؟",
      answerEn: "We offer a 14-day money-back guarantee for all paid plans.",
      answerAr: "نقدم ضمان استرداد المبلغ خلال 14 يوماً لجميع الباقات المدفوعة."
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              {language === "ar" ? "الباقات والأسعار" : "Pricing"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" 
                ? "اختر الباقة المناسبة لك"
                : "Choose the Right Plan for You"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === "ar"
                ? "من الوصول المجاني للباحثين إلى الحلول المؤسسية الكاملة"
                : "From free access for researchers to full enterprise solutions"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-16">
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={tier.id} 
                className={`relative ${tier.featured ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <Crown className="h-3 w-3" />
                      {language === "ar" ? "الأكثر شعبية" : "Most Popular"}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">
                    {language === "ar" ? tier.nameAr : tier.nameEn}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? tier.descriptionAr : tier.descriptionEn}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">
                      {language === "ar" ? tier.priceAr : tier.priceEn}
                    </span>
                    <span className="text-muted-foreground">
                      {language === "ar" ? tier.periodAr : tier.periodEn}
                    </span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {language === "ar" ? feature.ar : feature.en}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full gap-2" 
                    variant={tier.featured ? "default" : "outline"}
                  >
                    {tier.id === "enterprise" 
                      ? (language === "ar" ? "تواصل معنا" : "Contact Us")
                      : (language === "ar" ? "ابدأ الآن" : "Get Started")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center">
              {language === "ar" ? "مقارنة الميزات" : "Feature Comparison"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-4 font-medium">
                      {language === "ar" ? "الميزة" : "Feature"}
                    </th>
                    <th className="text-center p-4 font-medium">
                      {language === "ar" ? "مجاني" : "Free"}
                    </th>
                    <th className="text-center p-4 font-medium bg-primary/5">
                      {language === "ar" ? "احترافي" : "Professional"}
                    </th>
                    <th className="text-center p-4 font-medium">
                      {language === "ar" ? "مؤسسي" : "Enterprise"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">{language === "ar" ? "استفسارات الذكاء الاصطناعي" : "AI Queries"}</td>
                    <td className="text-center p-4">5/{language === "ar" ? "يوم" : "day"}</td>
                    <td className="text-center p-4 bg-primary/5">{language === "ar" ? "غير محدود" : "Unlimited"}</td>
                    <td className="text-center p-4">{language === "ar" ? "غير محدود" : "Unlimited"}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">{language === "ar" ? "طلبات API" : "API Calls"}</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4 bg-primary/5">10K/{language === "ar" ? "شهر" : "month"}</td>
                    <td className="text-center p-4">{language === "ar" ? "غير محدود" : "Unlimited"}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">{language === "ar" ? "تصدير البيانات" : "Data Export"}</td>
                    <td className="text-center p-4">CSV</td>
                    <td className="text-center p-4 bg-primary/5">CSV, Excel, PDF</td>
                    <td className="text-center p-4">CSV, Excel, PDF, JSON</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">{language === "ar" ? "التقارير المخصصة" : "Custom Reports"}</td>
                    <td className="text-center p-4"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                    <td className="text-center p-4 bg-primary/5"><Check className="h-4 w-4 mx-auto text-green-600" /></td>
                    <td className="text-center p-4"><Check className="h-4 w-4 mx-auto text-green-600" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">{language === "ar" ? "محاكي السيناريوهات" : "Scenario Simulator"}</td>
                    <td className="text-center p-4"><X className="h-4 w-4 mx-auto text-muted-foreground" /></td>
                    <td className="text-center p-4 bg-primary/5"><Check className="h-4 w-4 mx-auto text-green-600" /></td>
                    <td className="text-center p-4"><Check className="h-4 w-4 mx-auto text-green-600" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">{language === "ar" ? "الدعم" : "Support"}</td>
                    <td className="text-center p-4">{language === "ar" ? "مجتمعي" : "Community"}</td>
                    <td className="text-center p-4 bg-primary/5">{language === "ar" ? "بريد إلكتروني" : "Email"}</td>
                    <td className="text-center p-4">{language === "ar" ? "مخصص 24/7" : "Dedicated 24/7"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            {language === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    {language === "ar" ? faq.questionAr : faq.questionEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground pl-7">
                    {language === "ar" ? faq.answerAr : faq.answerEn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Card className="inline-block p-8 bg-primary/5">
            <h3 className="text-2xl font-bold mb-2">
              {language === "ar" ? "هل لديك أسئلة؟" : "Have Questions?"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "ar"
                ? "تواصل مع فريقنا للحصول على عرض مخصص"
                : "Contact our team for a custom quote"}
            </p>
            <Link href="/contact">
              <Button className="gap-2">
                {language === "ar" ? "تواصل معنا" : "Contact Us"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

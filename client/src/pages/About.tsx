import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Eye, 
  Award, 
  Users, 
  Building2,
  Mail,
  MapPin
} from "lucide-react";

export default function About() {
  const { language } = useLanguage();

  const team = [
    {
      nameEn: "Hani Al-Faqih",
      nameAr: "هاني الفقيه",
      titleEn: "Chief Operating Officer",
      titleAr: "الرئيس التنفيذي للعمليات",
      photo: true,
    },
    {
      nameEn: "Maher Faisal Saeed Farea",
      nameAr: "ماهر فيصل سعيد فارع",
      titleEn: "Founder & Chief Executive Officer",
      titleAr: "المؤسس والرئيس التنفيذي",
      photo: true,
    },
    {
      nameEn: "Zakaria Kamaly",
      nameAr: "زكريا الكمالي",
      titleEn: "General Coordinator - Transparency & Accountability",
      titleAr: "المنسق العام - الشفافية والمساءلة",
      photo: false,
    },
    {
      nameEn: "Dhuha Al-Basha",
      nameAr: "ضحى الباشا",
      titleEn: "Director - Partnerships, Clients & Institutional Relations",
      titleAr: "مديرة الشراكات والعملاء والعلاقات المؤسسية",
      photo: false,
    },
    {
      nameEn: "Mohammed Faisal Saeed Farea",
      nameAr: "محمد فيصل سعيد فارع",
      titleEn: "Deputy Director - Academy",
      titleAr: "نائب المدير - الأكاديمية",
      photo: false,
    },
    {
      nameEn: "Sadiq Ghanem",
      nameAr: "صادق غانم",
      titleEn: "Site Inspections & Quality Improvement",
      titleAr: "التفتيش الميداني وتحسين الجودة",
      photo: false,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container relative py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              {language === "ar" ? "من نحن" : "About Us"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === "ar" 
                ? "المرصد اليمني للشفافية الاقتصادية"
                : "Yemen Economic Transparency Observatory"}
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              {language === "ar"
                ? "منصة رائدة للذكاء الاقتصادي المبني على الأدلة، مدعومة من CauseWay للاستشارات المالية والمصرفية"
                : "A flagship economic intelligence platform powered by evidence-based data, backed by CauseWay Financial & Banking Consultancies"}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      {language === "ar" ? "مهمتنا" : "Our Mission"}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {language === "ar"
                        ? "توفير بيانات اقتصادية موثوقة وشفافة للحكومة اليمنية والمنظمات الدولية والباحثين وصناع السياسات، مع تتبع كامل للمصادر وتقييم الثقة لكل نقطة بيانات."
                        : "Provide reliable, transparent economic data to the Yemeni government, international organizations, researchers, and policymakers, with complete provenance tracking and confidence ratings for every data point."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      {language === "ar" ? "رؤيتنا" : "Our Vision"}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {language === "ar"
                        ? "أن نصبح المصدر الأكثر موثوقية للذكاء الاقتصادي في اليمن، مما يمكّن اتخاذ القرارات المستنيرة من خلال البيانات القابلة للتحقق والتحليل العميق."
                        : "To become the most trusted source of economic intelligence for Yemen, enabling informed decision-making through verifiable data and deep analysis."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {language === "ar" ? "قيمنا الأساسية" : "Our Core Values"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "ar"
                ? "المبادئ التي توجه عملنا وتضمن أعلى معايير الجودة والنزاهة"
                : "The principles that guide our work and ensure the highest standards of quality and integrity"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {language === "ar" ? "الشفافية" : "Transparency"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "ar"
                    ? "كل نقطة بيانات تأتي مع مصدر كامل وتقييم للثقة"
                    : "Every data point comes with complete source attribution and confidence rating"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {language === "ar" ? "الدقة" : "Accuracy"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "ar"
                    ? "منهجيات صارمة للتحقق من البيانات وتتبع الجودة"
                    : "Rigorous data validation methodologies and quality tracking"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {language === "ar" ? "التعاون" : "Collaboration"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "ar"
                    ? "العمل مع الشركاء المحليين والدوليين لتحسين جودة البيانات"
                    : "Working with local and international partners to improve data quality"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {language === "ar" ? "فريقنا" : "Our Team"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "ar"
                ? "خبراء متخصصون في الاقتصاد والمالية والبيانات"
                : "Dedicated experts in economics, finance, and data analytics"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.photo ? (
                      <Users className="h-12 w-12" />
                    ) : (
                      (language === "ar" ? member.nameAr : member.nameEn).charAt(0)
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">
                    {language === "ar" ? member.nameAr : member.nameEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? member.titleAr : member.titleEn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CauseWay Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {language === "ar" ? "من نحن - كوزواي" : "About CauseWay"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "ar"
                ? "الشركة الأم المؤسسة لمرصد الشفافية الاقتصادية اليمني"
                : "The parent company behind Yemen Economic Transparency Observatory"}
            </p>
          </div>
          <Card className="border-2 border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Logo Section */}
                <div className="lg:w-1/3 bg-white p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r">
                  <img 
                    src="/causeway-logo.jpeg" 
                    alt="CauseWay - كوزواي" 
                    className="max-w-full h-auto max-h-48 object-contain"
                  />
                </div>
                {/* Content Section */}
                <div className="lg:w-2/3 p-8">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B6B3D' }}>
                    {language === "ar" 
                      ? "كوزواي للاستشارات المالية والمصرفية"
                      : "CauseWay Financial & Banking Consultancies"}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {language === "ar"
                      ? "كوزواي هي شركة استشارات رائدة متخصصة في الخدمات المالية والمصرفية والتنمية الاقتصادية. تأسست بهدف تقديم حلول مبتكرة للتحديات الاقتصادية في منطقة الشرق الأوسط وشمال أفريقيا، مع التركيز بشكل خاص على اليمن. YETO هو المنتج الرئيسي لكوزواي، ويمثل التزامنا بالشفافية والمساءلة في القطاع الاقتصادي."
                      : "CauseWay is a leading consultancy firm specializing in financial services, banking, and economic development. Founded with the goal of providing innovative solutions to economic challenges in the MENA region, with a particular focus on Yemen. YETO is CauseWay's flagship product, representing our commitment to transparency and accountability in the economic sector."}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-[#1B6B3D]/5 rounded-lg">
                      <h4 className="font-semibold mb-2" style={{ color: '#1B6B3D' }}>
                        {language === "ar" ? "خدماتنا" : "Our Services"}
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {language === "ar" ? "الاستشارات المالية" : "Financial Consulting"}</li>
                        <li>• {language === "ar" ? "الاستشارات المصرفية" : "Banking Advisory"}</li>
                        <li>• {language === "ar" ? "تحليل البيانات الاقتصادية" : "Economic Data Analysis"}</li>
                        <li>• {language === "ar" ? "دراسات الجدوى" : "Feasibility Studies"}</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-[#D4A84B]/10 rounded-lg">
                      <h4 className="font-semibold mb-2" style={{ color: '#D4A84B' }}>
                        {language === "ar" ? "مجالات التخصص" : "Areas of Expertise"}
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {language === "ar" ? "التنمية الاقتصادية" : "Economic Development"}</li>
                        <li>• {language === "ar" ? "الشفافية والحوكمة" : "Transparency & Governance"}</li>
                        <li>• {language === "ar" ? "إدارة المخاطر" : "Risk Management"}</li>
                        <li>• {language === "ar" ? "التحول الرقمي" : "Digital Transformation"}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" style={{ color: '#1B6B3D' }} />
                      <span>yeto@causewaygrp.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" style={{ color: '#1B6B3D' }} />
                      <span>{language === "ar" ? "عدن، اليمن" : "Aden, Yemen"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

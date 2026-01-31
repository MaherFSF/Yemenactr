/**
 * Data Policy Page
 * 
 * Comprehensive data policy covering:
 * - Data collection practices
 * - Data usage policies
 * - User rights and GDPR compliance
 * - Data retention policies
 * - Third-party data sharing policies
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Database, 
  Eye, 
  Clock, 
  Share2, 
  Lock, 
  FileText,
  Users,
  Globe,
  AlertTriangle,
  CheckCircle,
  Mail
} from "lucide-react";

export default function DataPolicy() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const sections = [
    {
      id: "collection",
      icon: Database,
      titleEn: "Data Collection Practices",
      titleAr: "ممارسات جمع البيانات",
      contentEn: `YETO collects economic data from multiple authoritative sources to provide comprehensive insights into Yemen's economic landscape. Our data collection practices are designed to ensure accuracy, transparency, and ethical sourcing.

**Types of Data Collected:**
- **Economic Indicators:** Exchange rates, inflation rates, GDP estimates, trade statistics, and financial sector metrics from official government sources and international organizations.
- **User Account Data:** When you create an account, we collect your name, email address, and authentication credentials through our secure OAuth provider.
- **Usage Analytics:** We collect anonymized usage data to improve our platform, including page views, feature usage patterns, and session duration.
- **Research Submissions:** If you contribute data or research, we collect the submitted content along with attribution information.

**Data Sources:**
Our economic data is sourced from:
- Central Bank of Yemen (Aden and Sana'a branches)
- World Bank Open Data
- International Monetary Fund (IMF)
- United Nations agencies (OCHA, WFP, UNDP)
- Humanitarian Data Exchange (HDX)
- Academic research institutions
- Partner organizations with verified credentials`,
      contentAr: `يجمع يتو البيانات الاقتصادية من مصادر موثوقة متعددة لتقديم رؤى شاملة حول المشهد الاقتصادي اليمني. تم تصميم ممارسات جمع البيانات لدينا لضمان الدقة والشفافية والمصادر الأخلاقية.

**أنواع البيانات المجمعة:**
- **المؤشرات الاقتصادية:** أسعار الصرف ومعدلات التضخم وتقديرات الناتج المحلي الإجمالي وإحصاءات التجارة ومقاييس القطاع المالي من المصادر الحكومية الرسمية والمنظمات الدولية.
- **بيانات حساب المستخدم:** عند إنشاء حساب، نجمع اسمك وعنوان بريدك الإلكتروني وبيانات اعتماد المصادقة من خلال مزود OAuth الآمن الخاص بنا.
- **تحليلات الاستخدام:** نجمع بيانات استخدام مجهولة الهوية لتحسين منصتنا، بما في ذلك مشاهدات الصفحة وأنماط استخدام الميزات ومدة الجلسة.
- **المساهمات البحثية:** إذا ساهمت ببيانات أو أبحاث، فإننا نجمع المحتوى المقدم مع معلومات الإسناد.

**مصادر البيانات:**
يتم الحصول على بياناتنا الاقتصادية من:
- البنك المركزي اليمني (فرعي عدن وصنعاء)
- البيانات المفتوحة للبنك الدولي
- صندوق النقد الدولي
- وكالات الأمم المتحدة (أوتشا، برنامج الأغذية العالمي، برنامج الأمم المتحدة الإنمائي)
- منصة تبادل البيانات الإنسانية (HDX)
- المؤسسات البحثية الأكاديمية
- المنظمات الشريكة ذات الاعتماد الموثق`
    },
    {
      id: "usage",
      icon: Eye,
      titleEn: "Data Usage Policies",
      titleAr: "سياسات استخدام البيانات",
      contentEn: `**How We Use Your Data:**

1. **Platform Operation:** Your account data is used to authenticate you, personalize your experience, and provide access to premium features based on your subscription tier.

2. **Research and Analysis:** Economic data is processed, analyzed, and visualized to generate insights, reports, and forecasts. All analysis maintains source attribution and confidence ratings.

3. **Service Improvement:** Anonymized usage data helps us understand how users interact with YETO, enabling us to improve features, fix issues, and optimize performance.

4. **Communication:** We may use your email to send important updates about the platform, security notices, or (with your consent) newsletters and research highlights.

5. **Legal Compliance:** We may process data as required by law, including responding to legal requests and protecting our rights.

**What We Don't Do:**
- We never sell personal data to third parties
- We don't use your data for targeted advertising
- We don't share individual user behavior with external parties
- We don't create profiles for marketing purposes`,
      contentAr: `**كيف نستخدم بياناتك:**

1. **تشغيل المنصة:** تُستخدم بيانات حسابك للتحقق من هويتك وتخصيص تجربتك وتوفير الوصول إلى الميزات المتميزة بناءً على مستوى اشتراكك.

2. **البحث والتحليل:** تتم معالجة البيانات الاقتصادية وتحليلها وتصويرها لتوليد الرؤى والتقارير والتوقعات. يحافظ كل التحليل على إسناد المصدر وتصنيفات الثقة.

3. **تحسين الخدمة:** تساعدنا بيانات الاستخدام المجهولة على فهم كيفية تفاعل المستخدمين مع يتو، مما يمكننا من تحسين الميزات وإصلاح المشكلات وتحسين الأداء.

4. **التواصل:** قد نستخدم بريدك الإلكتروني لإرسال تحديثات مهمة حول المنصة وإشعارات الأمان أو (بموافقتك) النشرات الإخبارية وأبرز الأبحاث.

5. **الامتثال القانوني:** قد نعالج البيانات كما يقتضي القانون، بما في ذلك الاستجابة للطلبات القانونية وحماية حقوقنا.

**ما لا نفعله:**
- لا نبيع البيانات الشخصية لأطراف ثالثة أبداً
- لا نستخدم بياناتك للإعلانات المستهدفة
- لا نشارك سلوك المستخدم الفردي مع أطراف خارجية
- لا ننشئ ملفات تعريف لأغراض التسويق`
    },
    {
      id: "rights",
      icon: Shield,
      titleEn: "User Rights & GDPR Compliance",
      titleAr: "حقوق المستخدم والامتثال للائحة حماية البيانات",
      contentEn: `YETO is committed to protecting your privacy rights in accordance with international data protection standards, including the General Data Protection Regulation (GDPR).

**Your Rights Include:**

1. **Right to Access:** You can request a copy of all personal data we hold about you. We will provide this within 30 days of your request.

2. **Right to Rectification:** If any of your personal data is inaccurate or incomplete, you have the right to have it corrected.

3. **Right to Erasure ("Right to be Forgotten"):** You can request deletion of your personal data. We will comply unless we have a legal obligation to retain it.

4. **Right to Data Portability:** You can request your data in a structured, commonly used, machine-readable format.

5. **Right to Object:** You can object to processing of your personal data for certain purposes, including direct marketing.

6. **Right to Restrict Processing:** You can request that we limit how we use your data while we address any concerns you raise.

7. **Right to Withdraw Consent:** Where processing is based on consent, you can withdraw it at any time.

**Exercising Your Rights:**
To exercise any of these rights, contact our Data Protection Officer at privacy@yeto.org. We will respond within 30 days and may ask for identity verification.

**Legal Basis for Processing:**
- **Consent:** For optional features and communications
- **Contract:** To provide services you've subscribed to
- **Legitimate Interest:** For platform security and improvement
- **Legal Obligation:** For compliance with applicable laws`,
      contentAr: `يلتزم يتو بحماية حقوق خصوصيتك وفقاً لمعايير حماية البيانات الدولية، بما في ذلك اللائحة العامة لحماية البيانات (GDPR).

**حقوقك تشمل:**

1. **حق الوصول:** يمكنك طلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك. سنقدمها خلال 30 يوماً من طلبك.

2. **حق التصحيح:** إذا كانت أي من بياناتك الشخصية غير دقيقة أو غير كاملة، فلديك الحق في تصحيحها.

3. **حق المحو ("الحق في النسيان"):** يمكنك طلب حذف بياناتك الشخصية. سنمتثل ما لم يكن لدينا التزام قانوني بالاحتفاظ بها.

4. **حق نقل البيانات:** يمكنك طلب بياناتك بتنسيق منظم وشائع الاستخدام وقابل للقراءة آلياً.

5. **حق الاعتراض:** يمكنك الاعتراض على معالجة بياناتك الشخصية لأغراض معينة، بما في ذلك التسويق المباشر.

6. **حق تقييد المعالجة:** يمكنك طلب تقييد كيفية استخدامنا لبياناتك أثناء معالجة أي مخاوف تثيرها.

7. **حق سحب الموافقة:** حيث تستند المعالجة إلى الموافقة، يمكنك سحبها في أي وقت.

**ممارسة حقوقك:**
لممارسة أي من هذه الحقوق، اتصل بمسؤول حماية البيانات لدينا على privacy@yeto.org. سنرد خلال 30 يوماً وقد نطلب التحقق من الهوية.

**الأساس القانوني للمعالجة:**
- **الموافقة:** للميزات والاتصالات الاختيارية
- **العقد:** لتقديم الخدمات التي اشتركت فيها
- **المصلحة المشروعة:** لأمن المنصة وتحسينها
- **الالتزام القانوني:** للامتثال للقوانين المعمول بها`
    },
    {
      id: "retention",
      icon: Clock,
      titleEn: "Data Retention Policies",
      titleAr: "سياسات الاحتفاظ بالبيانات",
      contentEn: `We retain data only as long as necessary for the purposes described in this policy or as required by law.

**Retention Periods:**

| Data Type | Retention Period | Justification |
|-----------|-----------------|---------------|
| Account Data | Duration of account + 2 years | Service provision and legal compliance |
| Usage Analytics | 24 months (anonymized) | Platform improvement |
| Economic Data | Indefinite | Historical research value |
| Audit Logs | 7 years | Security and compliance |
| Support Tickets | 3 years after resolution | Quality assurance |
| Research Submissions | Indefinite (with attribution) | Academic integrity |

**Data Deletion:**
- When you delete your account, personal data is removed within 30 days
- Anonymized data may be retained for statistical purposes
- Economic data contributions may be retained with anonymized attribution
- Backup copies are purged within 90 days

**Archival:**
Historical economic data is archived for research purposes. This data is:
- Stored securely with access controls
- Available for academic research under data sharing agreements
- Subject to periodic review for continued relevance`,
      contentAr: `نحتفظ بالبيانات فقط طالما كان ذلك ضرورياً للأغراض الموضحة في هذه السياسة أو كما يقتضي القانون.

**فترات الاحتفاظ:**

| نوع البيانات | فترة الاحتفاظ | المبرر |
|-----------|-----------------|---------------|
| بيانات الحساب | مدة الحساب + سنتان | تقديم الخدمة والامتثال القانوني |
| تحليلات الاستخدام | 24 شهراً (مجهولة الهوية) | تحسين المنصة |
| البيانات الاقتصادية | غير محددة | قيمة البحث التاريخي |
| سجلات التدقيق | 7 سنوات | الأمان والامتثال |
| تذاكر الدعم | 3 سنوات بعد الحل | ضمان الجودة |
| المساهمات البحثية | غير محددة (مع الإسناد) | النزاهة الأكاديمية |

**حذف البيانات:**
- عند حذف حسابك، تتم إزالة البيانات الشخصية خلال 30 يوماً
- قد يتم الاحتفاظ بالبيانات المجهولة الهوية لأغراض إحصائية
- قد يتم الاحتفاظ بمساهمات البيانات الاقتصادية مع إسناد مجهول الهوية
- يتم مسح النسخ الاحتياطية خلال 90 يوماً

**الأرشفة:**
يتم أرشفة البيانات الاقتصادية التاريخية لأغراض البحث. هذه البيانات:
- مخزنة بشكل آمن مع ضوابط الوصول
- متاحة للبحث الأكاديمي بموجب اتفاقيات مشاركة البيانات
- تخضع للمراجعة الدورية للأهمية المستمرة`
    },
    {
      id: "sharing",
      icon: Share2,
      titleEn: "Third-Party Data Sharing",
      titleAr: "مشاركة البيانات مع الأطراف الثالثة",
      contentEn: `We share data with third parties only when necessary and with appropriate safeguards.

**Categories of Recipients:**

1. **Service Providers:**
   - Cloud hosting (secure, GDPR-compliant providers)
   - Authentication services (OAuth providers)
   - Analytics tools (anonymized data only)
   - Email delivery services

2. **Research Partners:**
   - Academic institutions conducting Yemen-related research
   - International organizations (UN agencies, World Bank)
   - Data shared under formal agreements with usage restrictions

3. **Legal Requirements:**
   - Government authorities when legally required
   - Law enforcement with valid legal process
   - Courts in connection with legal proceedings

**Data Sharing Safeguards:**
- All third-party processors sign data processing agreements
- We conduct due diligence on security practices
- Data minimization: we share only what's necessary
- Regular audits of third-party compliance

**International Transfers:**
When data is transferred outside your jurisdiction:
- We use Standard Contractual Clauses (SCCs)
- We verify adequate protection levels
- We implement additional technical safeguards

**No Sale of Data:**
We do not sell, rent, or trade personal data to any third party for their marketing purposes.`,
      contentAr: `نشارك البيانات مع أطراف ثالثة فقط عند الضرورة ومع الضمانات المناسبة.

**فئات المستلمين:**

1. **مقدمو الخدمات:**
   - الاستضافة السحابية (مزودون آمنون ومتوافقون مع GDPR)
   - خدمات المصادقة (مزودو OAuth)
   - أدوات التحليل (بيانات مجهولة الهوية فقط)
   - خدمات توصيل البريد الإلكتروني

2. **الشركاء البحثيون:**
   - المؤسسات الأكاديمية التي تجري أبحاثاً متعلقة باليمن
   - المنظمات الدولية (وكالات الأمم المتحدة، البنك الدولي)
   - البيانات المشتركة بموجب اتفاقيات رسمية مع قيود الاستخدام

3. **المتطلبات القانونية:**
   - السلطات الحكومية عند الاقتضاء قانونياً
   - جهات إنفاذ القانون بإجراءات قانونية صالحة
   - المحاكم فيما يتعلق بالإجراءات القانونية

**ضمانات مشاركة البيانات:**
- يوقع جميع معالجي الطرف الثالث اتفاقيات معالجة البيانات
- نجري العناية الواجبة بشأن ممارسات الأمان
- تقليل البيانات: نشارك فقط ما هو ضروري
- عمليات تدقيق منتظمة لامتثال الطرف الثالث

**التحويلات الدولية:**
عند نقل البيانات خارج نطاق اختصاصك:
- نستخدم البنود التعاقدية القياسية (SCCs)
- نتحقق من مستويات الحماية الكافية
- ننفذ ضمانات تقنية إضافية

**عدم بيع البيانات:**
لا نبيع أو نؤجر أو نتاجر بالبيانات الشخصية لأي طرف ثالث لأغراضهم التسويقية.`
    },
    {
      id: "security",
      icon: Lock,
      titleEn: "Data Security Measures",
      titleAr: "تدابير أمن البيانات",
      contentEn: `We implement comprehensive security measures to protect your data.

**Technical Safeguards:**
- **Encryption:** All data is encrypted in transit (TLS 1.3) and at rest (AES-256)
- **Access Controls:** Role-based access with principle of least privilege
- **Authentication:** Multi-factor authentication for administrative access
- **Monitoring:** 24/7 security monitoring and intrusion detection
- **Backups:** Regular encrypted backups with tested recovery procedures

**Organizational Measures:**
- Security awareness training for all staff
- Background checks for employees with data access
- Incident response procedures and team
- Regular security audits and penetration testing
- Vendor security assessments

**Incident Response:**
In the event of a data breach:
1. We will contain and assess the incident within 24 hours
2. Affected users will be notified within 72 hours
3. Relevant authorities will be informed as required
4. We will provide guidance on protective measures
5. Post-incident review and improvements will be implemented

**Reporting Security Issues:**
If you discover a security vulnerability, please report it to security@yeto.org. We operate a responsible disclosure program and will acknowledge your report within 48 hours.`,
      contentAr: `ننفذ تدابير أمنية شاملة لحماية بياناتك.

**الضمانات التقنية:**
- **التشفير:** جميع البيانات مشفرة أثناء النقل (TLS 1.3) وفي حالة السكون (AES-256)
- **ضوابط الوصول:** الوصول القائم على الأدوار مع مبدأ الحد الأدنى من الامتيازات
- **المصادقة:** المصادقة متعددة العوامل للوصول الإداري
- **المراقبة:** مراقبة أمنية على مدار الساعة وكشف التسلل
- **النسخ الاحتياطية:** نسخ احتياطية مشفرة منتظمة مع إجراءات استرداد مختبرة

**التدابير التنظيمية:**
- تدريب التوعية الأمنية لجميع الموظفين
- فحوصات خلفية للموظفين الذين لديهم إمكانية الوصول إلى البيانات
- إجراءات وفريق الاستجابة للحوادث
- عمليات تدقيق أمنية منتظمة واختبار الاختراق
- تقييمات أمان الموردين

**الاستجابة للحوادث:**
في حالة حدوث خرق للبيانات:
1. سنحتوي الحادث ونقيمه خلال 24 ساعة
2. سيتم إخطار المستخدمين المتأثرين خلال 72 ساعة
3. سيتم إبلاغ السلطات المعنية حسب الاقتضاء
4. سنقدم إرشادات حول التدابير الوقائية
5. سيتم تنفيذ مراجعة ما بعد الحادث والتحسينات

**الإبلاغ عن مشكلات الأمان:**
إذا اكتشفت ثغرة أمنية، يرجى الإبلاغ عنها إلى security@yeto.org. نحن نعمل ببرنامج إفصاح مسؤول وسنقر باستلام تقريرك خلال 48 ساعة.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2e6b4f] to-[#0a5030] text-white py-16">
        <div className="container max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-3 rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isArabic ? "سياسة البيانات" : "Data Policy"}
              </h1>
              <p className="text-white/80 mt-1">
                {isArabic 
                  ? "كيف نجمع بياناتك ونستخدمها ونحميها"
                  : "How we collect, use, and protect your data"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge className="bg-white/20 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              {isArabic ? "متوافق مع GDPR" : "GDPR Compliant"}
            </Badge>
            <Badge className="bg-white/20 text-white border-0">
              <Lock className="h-3 w-3 mr-1" />
              {isArabic ? "تشفير AES-256" : "AES-256 Encrypted"}
            </Badge>
            <Badge className="bg-white/20 text-white border-0">
              <FileText className="h-3 w-3 mr-1" />
              {isArabic ? "آخر تحديث: يناير 2026" : "Last Updated: January 2026"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="container max-w-5xl py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {isArabic ? "جدول المحتويات" : "Table of Contents"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <section.icon className="h-4 w-4 text-[#2e6b4f]" />
                  <span className="text-sm">
                    {isArabic ? section.titleAr : section.titleEn}
                  </span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.id} id={section.id} className="scroll-mt-24">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2e6b4f]/10 p-2 rounded-lg">
                    <section.icon className="h-5 w-5 text-[#2e6b4f]" />
                  </div>
                  <CardTitle>
                    {isArabic ? section.titleAr : section.titleEn}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                    {isArabic ? section.contentAr : section.contentEn}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-8 bg-gradient-to-br from-[#2e6b4f]/5 to-[#2e6b4f]/10 border-[#2e6b4f]/20">
          <CardContent className="py-8">
            <div className="text-center">
              <Mail className="h-10 w-10 text-[#2e6b4f] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isArabic ? "أسئلة حول بياناتك؟" : "Questions About Your Data?"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {isArabic 
                  ? "فريق حماية البيانات لدينا هنا للمساعدة"
                  : "Our Data Protection team is here to help"}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="mailto:privacy@yeto.org"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2e6b4f] text-white rounded-lg hover:bg-[#0a5030] transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  privacy@yeto.org
                </a>
                <a 
                  href="mailto:security@yeto.org"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#2e6b4f] text-[#2e6b4f] rounded-lg hover:bg-[#2e6b4f]/10 transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  security@yeto.org
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

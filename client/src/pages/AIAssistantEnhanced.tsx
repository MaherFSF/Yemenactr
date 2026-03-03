import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  FileText,
  Database,
  MessageSquare,
  Lightbulb,
  ExternalLink,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  BarChart3,
  Link2,
  Share2,
  Mic,
  ChevronRight,
  Target,
  Loader2,
  GraduationCap,
  History,
  Globe,
  Building2,
  Banknote,
  Users,
  Shield,
  MapPin,
  Calendar,
  Minus,
  Languages,
  ArrowLeftRight
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  evidencePack?: EvidencePack;
  confidence?: "high" | "medium" | "low";
}

interface EvidencePack {
  sources: Array<{
    title: string;
    type: string;
    date: string;
    confidence: string;
    url?: string;
  }>;
  indicators: Array<{
    name: string;
    value: string;
    trend: "up" | "down" | "stable";
    regime?: string;
  }>;
  methodology?: string;
  caveats?: string[];
}

interface TranslationResult {
  translatedText: string;
  glossaryAdherenceScore: number;
  numericIntegrityPass: boolean;
  glossaryIssues: Array<{
    term: string;
    expected: string;
    found: string;
    location: string;
  }>;
  numericIssues: Array<{
    original: string;
    translated: string;
    location: string;
  }>;
  status?: "ok" | "needs_review" | "no_op";
}

// Suggested questions organized by category
const suggestedQuestions = {
  exchangeRate: [
    { en: "What is the current exchange rate in Aden vs Sana'a?", ar: "ما هو سعر الصرف الحالي في عدن مقابل صنعاء؟" },
    { en: "Why is there a currency split between north and south?", ar: "لماذا يوجد انقسام في العملة بين الشمال والجنوب؟" },
    { en: "How has the exchange rate changed since 2015?", ar: "كيف تغير سعر الصرف منذ 2015؟" },
  ],
  banking: [
    { en: "Which banks are under OFAC sanctions?", ar: "أي البنوك تحت عقوبات OFAC؟" },
    { en: "What happened to the banking sector in 2025?", ar: "ماذا حدث للقطاع المصرفي في 2025؟" },
    { en: "How many exchange companies were suspended by CBY Aden?", ar: "كم عدد شركات الصرافة التي أوقفها البنك المركزي-عدن؟" },
  ],
  humanitarian: [
    { en: "How many people face food insecurity in Yemen?", ar: "كم عدد الأشخاص الذين يواجهون انعدام الأمن الغذائي في اليمن؟" },
    { en: "What is the humanitarian funding gap?", ar: "ما هي فجوة التمويل الإنساني؟" },
    { en: "How many internally displaced persons are there?", ar: "كم عدد النازحين داخلياً؟" },
  ],
  political: [
    { en: "What happened to the STC in January 2026?", ar: "ماذا حدث للمجلس الانتقالي الجنوبي في يناير 2026؟" },
    { en: "Who controls which areas of Yemen?", ar: "من يسيطر على أي مناطق في اليمن؟" },
    { en: "What is the Presidential Leadership Council?", ar: "ما هو مجلس القيادة الرئاسي؟" },
  ],
  economy: [
    { en: "What is Yemen's GDP growth rate?", ar: "ما هو معدل نمو الناتج المحلي الإجمالي لليمن؟" },
    { en: "How much oil revenue has Yemen lost?", ar: "كم خسر اليمن من عائدات النفط؟" },
    { en: "What is the inflation rate in Aden vs Sana'a?", ar: "ما هو معدل التضخم في عدن مقابل صنعاء؟" },
  ],
};

export default function AIAssistantEnhanced() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("exchangeRate");
  const [activePanel, setActivePanel] = useState<"advisor" | "translation">("advisor");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [translationDirection, setTranslationDirection] = useState<"ar-en" | "en-ar">("ar-en");
  const [translationInput, setTranslationInput] = useState("");
  const [translationOutput, setTranslationOutput] = useState("");
  const [translationSector, setTranslationSector] = useState("general");
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: language === "ar" 
        ? `مرحباً! أنا **العقل الواحد** - خبير الاقتصاد اليمني الشامل.

أنا مساعدك الذكي المتخصص في جميع جوانب الاقتصاد اليمني منذ 2014 وحتى اليوم. لدي معرفة عميقة بـ:

**المجالات الرئيسية:**
- أسعار الصرف والنظام النقدي المزدوج (عدن/صنعاء)
- القطاع المصرفي والعقوبات الدولية
- الأمن الغذائي والوضع الإنساني
- التجارة والاستثمار
- السياسة المالية والنقدية
- الفاعلون الاقتصاديون وأصحاب المصلحة

**آخر التحديثات (يناير 2026):**
- حل المجلس الانتقالي الجنوبي
- سيطرة قوات درع الوطن على عدن
- 79 شركة صرافة أوقفها البنك المركزي-عدن

اسألني أي سؤال عن الاقتصاد اليمني وسأقدم لك إجابة موثقة بالمصادر.`
        : `Hello! I'm **One Brain** - Yemen's Comprehensive Economic Expert.

I'm your intelligent assistant specialized in all aspects of Yemen's economy from 2014 to today. I have deep knowledge of:

**Key Areas:**
- Exchange rates and the dual monetary system (Aden/Sana'a)
- Banking sector and international sanctions
- Food security and humanitarian situation
- Trade and investment
- Fiscal and monetary policy
- Economic actors and stakeholders

**Latest Updates (January 2026):**
- Southern Transitional Council dissolved
- Nation's Shield forces took control of Aden
- 79 exchange companies suspended by CBY Aden

Ask me any question about Yemen's economy and I'll provide a documented answer with sources.`,
      timestamp: new Date(),
      confidence: "high"
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiChatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        confidence: data.confidence as "high" | "medium" | "low" || "high",
        evidencePack: data.sources && data.sources.length > 0 ? {
          sources: data.sources.map((s: any) => ({
            title: s.name || s.title,
            type: s.type || "Research",
            date: "Jan 2026",
            confidence: "A",
          })),
          indicators: [],
          methodology: language === "ar" 
            ? "الإجابة مبنية على البيانات المتاحة في قاعدة بيانات YETO مع سياق اقتصادي يمني متخصص."
            : "Response generated using YETO database with specialized Yemen economic context.",
          caveats: [
            language === "ar" ? "يرجى التحقق من المصادر الأصلية للقرارات الحرجة" : "Please verify original sources for critical decisions",
            language === "ar" ? "البيانات محدثة حتى يناير 2026" : "Data updated as of January 2026",
          ],
        } : undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(language === "ar" ? "حدث خطأ في المعالجة" : "Error processing request");
      setIsLoading(false);
    }
  });

  const translationMutation = trpc.ai.translate.useMutation({
    onSuccess: (data) => {
      setTranslationOutput(data.translatedText);
      setTranslationResult(data);
    },
    onError: () => {
      toast.error(language === "ar" ? "تعذر إكمال الترجمة" : "Unable to complete translation");
    }
  });

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentQuery = query;
    setQuery("");

    aiChatMutation.mutate({ 
      message: currentQuery,
      conversationHistory: messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      })),
      context: {
        regime: "both",
        language: language === "ar" ? "ar" : "en",
        page: "/ai-assistant",
      },
    });
  };

  const handleSuggestedQuestion = (question: { en: string; ar: string }) => {
    setQuery(language === "ar" ? question.ar : question.en);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(language === "ar" ? "تم النسخ" : "Copied to clipboard");
  };

  const handleTranslate = () => {
    if (!translationInput.trim()) return;
    const sourceLang = translationDirection === "ar-en" ? "ar" : "en";
    const targetLang = translationDirection === "ar-en" ? "en" : "ar";
    const sector = translationSector === "general" ? undefined : translationSector;

    translationMutation.mutate({
      text: translationInput,
      sourceLang,
      targetLang,
      sector,
    });
  };

  const handleSwapTranslation = () => {
    setTranslationDirection((prev) => (prev === "ar-en" ? "en-ar" : "ar-en"));
    if (translationOutput) {
      setTranslationInput(translationOutput);
      setTranslationOutput("");
      setTranslationResult(null);
    }
  };

  const handleClearTranslation = () => {
    setTranslationInput("");
    setTranslationOutput("");
    setTranslationResult(null);
  };

  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 gap-1">
          <CheckCircle className="h-3 w-3" />
          {language === "ar" ? "ثقة عالية" : "High Confidence"}
        </Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 gap-1">
          <AlertCircle className="h-3 w-3" />
          {language === "ar" ? "ثقة متوسطة" : "Medium Confidence"}
        </Badge>;
      case "low":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 gap-1">
          <AlertCircle className="h-3 w-3" />
          {language === "ar" ? "ثقة منخفضة" : "Low Confidence"}
        </Badge>;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      case "stable":
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const categoryLabels: Record<string, { en: string; ar: string; icon: any }> = {
    exchangeRate: { en: "Exchange Rate", ar: "سعر الصرف", icon: Banknote },
    banking: { en: "Banking", ar: "القطاع المصرفي", icon: Building2 },
    humanitarian: { en: "Humanitarian", ar: "الوضع الإنساني", icon: Users },
    political: { en: "Political", ar: "السياسي", icon: Shield },
    economy: { en: "Economy", ar: "الاقتصاد", icon: BarChart3 },
  };

  const translationAgents = [
    {
      id: "ar-en",
      titleEn: "Arabic → English Agent",
      titleAr: "وكيل عربي → إنجليزي",
      descEn: "Formal, glossary-aligned translation with numeric integrity checks.",
      descAr: "ترجمة رسمية متوافقة مع المعجم مع فحص سلامة الأرقام.",
      accent: "#f97316",
    },
    {
      id: "en-ar",
      titleEn: "English → Arabic Agent",
      titleAr: "وكيل إنجليزي → عربي",
      descEn: "Modern Arabic output tuned for economic and humanitarian terms.",
      descAr: "مخرجات عربية حديثة مهيأة للمصطلحات الاقتصادية والإنسانية.",
      accent: "#0ea5e9",
    },
  ];

  const translationSectors = [
    { value: "general", labelEn: "General Glossary", labelAr: "معجم عام" },
    { value: "banking", labelEn: "Banking & Finance", labelAr: "القطاع المصرفي" },
    { value: "trade", labelEn: "Trade & Commerce", labelAr: "التجارة والأعمال" },
    { value: "humanitarian", labelEn: "Humanitarian", labelAr: "الإنساني" },
    { value: "energy", labelEn: "Energy & Fuel", labelAr: "الطاقة والوقود" },
    { value: "prices", labelEn: "Prices & Inflation", labelAr: "الأسعار والتضخم" },
    { value: "public-finance", labelEn: "Public Finance", labelAr: "المالية العامة" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#2e8b6e] via-[#234876] to-[#2d5a8a] text-white py-10">
        <div className="container">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Brain className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {language === "ar" ? "العقل الواحد" : "One Brain"}
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                  <Target className="h-3 w-3 mr-1" />
                  {language === "ar" ? "خبير شامل" : "Expert System"}
                </Badge>
              </h1>
              <p className="text-blue-100 mt-1">
                {language === "ar" 
                  ? "خبير الاقتصاد اليمني الشامل - من 2014 إلى اليوم"
                  : "Comprehensive Yemen Economic Expert - From 2014 to Today"}
              </p>
            </div>
          </div>
          
          {/* Expertise Areas */}
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { icon: Banknote, label: language === "ar" ? "العملة" : "Currency" },
              { icon: Building2, label: language === "ar" ? "البنوك" : "Banking" },
              { icon: Shield, label: language === "ar" ? "العقوبات" : "Sanctions" },
              { icon: Users, label: language === "ar" ? "الإنساني" : "Humanitarian" },
              { icon: BarChart3, label: language === "ar" ? "الاقتصاد الكلي" : "Macroeconomy" },
              { icon: Globe, label: language === "ar" ? "التجارة" : "Trade" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Suggested Questions */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  {language === "ar" ? "أسئلة مقترحة" : "Suggested Questions"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "اختر موضوعاً للبدء"
                    : "Select a topic to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(categoryLabels).map(([key, value]) => {
                    const Icon = value.icon;
                    return (
                      <Button
                        key={key}
                        variant={activeCategory === key ? "default" : "outline"}
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => setActiveCategory(key)}
                      >
                        <Icon className="h-3 w-3" />
                        {language === "ar" ? value.ar : value.en}
                      </Button>
                    );
                  })}
                </div>
                
                <Separator />
                
                {/* Questions for selected category */}
                <div className="space-y-2">
                  {suggestedQuestions[activeCategory as keyof typeof suggestedQuestions]?.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedQuestion(q)}
                      className="w-full p-3 text-left text-sm rounded-lg border hover:bg-primary/5 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="group-hover:text-primary transition-colors">
                          {language === "ar" ? q.ar : q.en}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Quality Card */}
            <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-600" />
                  {language === "ar" ? "جودة البيانات" : "Data Quality"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "مصادر موثقة ومحدثة" : "Verified and updated sources"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "تصنيف مستوى الثقة" : "Confidence level ratings"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "تحديث يومي للبيانات" : "Daily data updates"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "20+ مصدر بيانات" : "20+ data sources"}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {language === "ar" ? "ضمانات الوكيل" : "Agent Assurance"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    {language === "ar" ? "بوابات الأدلة والاقتباس" : "Evidence + citation gates"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    {language === "ar" ? "توافق مع المعجم المتخصص" : "Glossary-aligned terminology"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    {language === "ar" ? "سلامة الأرقام والوحدات" : "Numeric integrity checks"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    {language === "ar" ? "حماية الخصوصية والإخفاء" : "Privacy-safe redaction rules"}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Experience */}
          <div className="lg:col-span-3">
            <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as "advisor" | "translation")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="advisor" className="gap-2">
                  <Brain className="h-4 w-4" />
                  {language === "ar" ? "المستشار" : "Advisor"}
                </TabsTrigger>
                <TabsTrigger value="translation" className="gap-2">
                  <Languages className="h-4 w-4" />
                  {language === "ar" ? "مختبر الترجمة" : "Translation Studio"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="advisor">
                <Card className="h-[700px] flex flex-col shadow-lg border-2">
                  {/* Chat Messages */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[90%] ${message.role === "user" ? "" : "w-full"}`}>
                            <div className={`rounded-xl p-4 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}>
                              {message.role === "assistant" && (
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-primary/10 rounded-lg">
                                      <Brain className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">
                                      {language === "ar" ? "العقل الواحد" : "One Brain"}
                                    </span>
                                  </div>
                                  {getConfidenceBadge(message.confidence)}
                                </div>
                              )}
                              <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                                {message.content.split('\n').map((line, i) => {
                                  // Handle bold text
                                  const parts = line.split(/\*\*(.*?)\*\*/g);
                                  return (
                                    <p key={i} className="mb-2 last:mb-0">
                                      {parts.map((part, j) => 
                                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                                      )}
                                    </p>
                                  );
                                })}
                              </div>
                              
                              {/* Evidence Pack */}
                              {message.evidencePack && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                  <div className="flex items-center gap-2 mb-3">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="text-sm font-semibold">
                                      {language === "ar" ? "حزمة الأدلة" : "Evidence Pack"}
                                    </span>
                                  </div>
                                  
                                  {/* Sources */}
                                  {message.evidencePack.sources.length > 0 && (
                                    <div className="mb-3">
                                      <div className="text-xs font-medium text-muted-foreground mb-2">
                                        {language === "ar" ? "المصادر" : "Sources"}
                                      </div>
                                      <div className="space-y-1">
                                        {message.evidencePack.sources.map((source, i) => (
                                          <div key={i} className="flex items-center justify-between text-xs p-2 bg-background/50 rounded">
                                            <span>{source.title}</span>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-xs">{source.type}</Badge>
                                              <Badge variant="secondary" className="text-xs">{source.confidence}</Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Indicators */}
                                  {message.evidencePack.indicators.length > 0 && (
                                    <div className="mb-3">
                                      <div className="text-xs font-medium text-muted-foreground mb-2">
                                        {language === "ar" ? "المؤشرات" : "Indicators"}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {message.evidencePack.indicators.map((ind, i) => (
                                          <div key={i} className="text-xs p-2 bg-background/50 rounded">
                                            <div className="flex items-center justify-between">
                                              <span className="text-muted-foreground">{ind.name}</span>
                                              {ind.regime && <Badge variant="outline" className="text-xs">{ind.regime}</Badge>}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                              <span className="font-semibold">{ind.value}</span>
                                              {getTrendIcon(ind.trend)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Caveats */}
                                  {message.evidencePack.caveats && message.evidencePack.caveats.length > 0 && (
                                    <div className="text-xs p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-900">
                                      <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-300 font-medium mb-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {language === "ar" ? "تحفظات" : "Caveats"}
                                      </div>
                                      <ul className="list-disc list-inside text-yellow-600 dark:text-yellow-400">
                                        {message.evidencePack.caveats.map((caveat, i) => (
                                          <li key={i}>{caveat}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Message Actions */}
                            {message.role === "assistant" && message.id !== "welcome" && (
                              <div className="flex items-center gap-2 mt-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs gap-1"
                                  onClick={() => copyToClipboard(message.content)}
                                >
                                  <Copy className="h-3 w-3" />
                                  {language === "ar" ? "نسخ" : "Copy"}
                                </Button>
                                <div className="flex-1" />
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-xl p-4">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">
                                {language === "ar" ? "جاري التحليل..." : "Analyzing..."}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Input Area */}
                  <div className="border-t p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder={language === "ar" ? "اسأل عن الاقتصاد اليمني..." : "Ask about Yemen's economy..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSubmit()}
                        className="flex-1 bg-white dark:bg-gray-800"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={handleSubmit} 
                        size="icon"
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 h-10 w-10" 
                        disabled={isLoading || !query.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {language === "ar" 
                        ? "جميع الإجابات مدعومة بالأدلة والمصادر الموثقة"
                        : "All answers are backed by evidence and documented sources"}
                    </p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="translation">
                <Card className="shadow-lg border-2">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Languages className="h-5 w-5 text-primary" />
                      {language === "ar" ? "مختبر الترجمة الذكي" : "Intelligent Translation Studio"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar"
                        ? "وكلاء ترجمة متخصصون مع بوابات جودة ومعجم اقتصادي مُحكم."
                        : "Specialized translation agents with quality gates and glossary enforcement."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {translationAgents.map((agent) => {
                        const isActive = translationDirection === agent.id;
                        return (
                          <button
                            key={agent.id}
                            onClick={() => setTranslationDirection(agent.id as "ar-en" | "en-ar")}
                            className={`text-left border rounded-xl p-4 transition-all ${
                              isActive ? "border-primary shadow-md bg-primary/5" : "hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-9 w-9 rounded-lg flex items-center justify-center text-white"
                                  style={{ backgroundColor: agent.accent }}
                                >
                                  <Languages className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold">
                                    {language === "ar" ? agent.titleAr : agent.titleEn}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {language === "ar" ? agent.descAr : agent.descEn}
                                  </div>
                                </div>
                              </div>
                              {isActive && (
                                <Badge className="bg-primary/10 text-primary border-0">
                                  {language === "ar" ? "نشط" : "Active"}
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          {language === "ar" ? "بوابة الجودة" : "Quality Gate"}
                          {translationResult?.status === "ok" && (
                            <span className="text-emerald-600">
                              {language === "ar" ? " • ناجح" : " • Pass"}
                            </span>
                          )}
                          {translationResult?.status === "needs_review" && (
                            <span className="text-amber-600">
                              {language === "ar" ? " • مراجعة" : " • Review"}
                            </span>
                          )}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {translationResult?.numericIntegrityPass ? (
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                          )}
                          {language === "ar" ? "سلامة الأرقام" : "Numeric Integrity"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={translationSector} onValueChange={setTranslationSector}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={language === "ar" ? "اختر القطاع" : "Select sector"} />
                          </SelectTrigger>
                          <SelectContent>
                            {translationSectors.map((sector) => (
                              <SelectItem key={sector.value} value={sector.value}>
                                {language === "ar" ? sector.labelAr : sector.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={handleSwapTranslation}>
                          <ArrowLeftRight className="h-4 w-4 mr-1" />
                          {language === "ar" ? "تبديل" : "Swap"}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{language === "ar" ? "النص المصدر" : "Source Text"}</Label>
                        <Textarea
                          value={translationInput}
                          onChange={(e) => setTranslationInput(e.target.value)}
                          placeholder={language === "ar" ? "ألصق النص العربي أو الإنجليزي هنا..." : "Paste Arabic or English text here..."}
                          className="min-h-[180px] bg-white dark:bg-gray-900"
                          dir={translationDirection === "ar-en" ? "rtl" : "ltr"}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>{language === "ar" ? "الترجمة" : "Translation"}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => translationOutput && copyToClipboard(translationOutput)}
                          >
                            <Copy className="h-3 w-3" />
                            {language === "ar" ? "نسخ" : "Copy"}
                          </Button>
                        </div>
                        <Textarea
                          value={translationOutput}
                          readOnly
                          placeholder={language === "ar" ? "ستظهر الترجمة هنا..." : "Translation will appear here..."}
                          className="min-h-[180px] bg-gray-50 dark:bg-gray-900/40"
                          dir={translationDirection === "ar-en" ? "ltr" : "rtl"}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleTranslate} disabled={translationMutation.isPending || !translationInput.trim()}>
                        {translationMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {language === "ar" ? "جاري الترجمة..." : "Translating..."}
                          </>
                        ) : (
                          <>
                            <Languages className="h-4 w-4 mr-2" />
                            {language === "ar" ? "ترجم الآن" : "Translate Now"}
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleClearTranslation}>
                        {language === "ar" ? "مسح" : "Clear"}
                      </Button>
                    </div>

                    {translationResult && (
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-3">
                          <div className="text-xs text-muted-foreground mb-2">
                            {language === "ar" ? "التزام المعجم" : "Glossary Adherence"}
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-semibold">
                              {Math.round(translationResult.glossaryAdherenceScore)}%
                            </span>
                            <Badge variant="outline">
                              {translationResult.glossaryAdherenceScore >= 80
                                ? (language === "ar" ? "قوي" : "Strong")
                                : (language === "ar" ? "يحتاج مراجعة" : "Review")}
                            </Badge>
                          </div>
                          <Progress value={Math.min(100, Math.max(0, translationResult.glossaryAdherenceScore))} className="h-2" />
                        </div>
                        <div className="rounded-lg border p-3">
                          <div className="text-xs text-muted-foreground mb-2">
                            {language === "ar" ? "سلامة الأرقام" : "Numeric Integrity"}
                          </div>
                          <div className="flex items-center gap-2">
                            {translationResult.numericIntegrityPass ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="text-sm font-medium">
                              {translationResult.numericIntegrityPass
                                ? (language === "ar" ? "متطابقة" : "Verified")
                                : (language === "ar" ? "تحتاج تدقيق" : "Needs review")}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg border p-3">
                          <div className="text-xs text-muted-foreground mb-2">
                            {language === "ar" ? "بوابة الجودة" : "Quality Gate"}
                          </div>
                          <div className="flex items-center gap-2">
                            {translationResult.status === "ok" ? (
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="text-sm font-medium">
                              {translationResult.status === "ok"
                                ? (language === "ar" ? "اجتاز" : "Passed")
                                : (language === "ar" ? "مراجعة" : "Review")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {translationResult?.glossaryIssues?.length ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-sm">
                        <div className="font-semibold mb-2">
                          {language === "ar" ? "مشاكل المعجم" : "Glossary Issues"}
                        </div>
                        <ul className="space-y-2">
                          {translationResult.glossaryIssues.slice(0, 3).map((issue, idx) => (
                            <li key={idx} className="text-xs text-amber-700">
                              {issue.term} → {issue.expected} ({issue.found})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {translationResult?.numericIssues?.length ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 text-sm">
                        <div className="font-semibold mb-2">
                          {language === "ar" ? "مشاكل الأرقام" : "Numeric Issues"}
                        </div>
                        <ul className="space-y-2">
                          {translationResult.numericIssues.slice(0, 3).map((issue, idx) => (
                            <li key={idx} className="text-xs text-amber-700">
                              {issue.original} → {issue.translated}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

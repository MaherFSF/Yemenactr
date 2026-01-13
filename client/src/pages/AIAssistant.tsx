import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Send,
  Sparkles,
  TrendingUp,
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
  ChevronRight
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

export default function AIAssistant() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: language === "ar" 
        ? "مرحباً! أنا \"العقل الواحد\" - مساعدك الذكي للبيانات الاقتصادية اليمنية. يمكنني مساعدتك في:\n\n• تحليل البيانات الاقتصادية وتقديم رؤى موثقة\n• الإجابة على الأسئلة مع ذكر المصادر والمراجع\n• مقارنة المؤشرات بين الأنظمة المختلفة (عدن/صنعاء)\n• إنشاء تقارير مخصصة\n\nكيف يمكنني مساعدتك اليوم؟"
        : "Hello! I'm \"One Brain\" - your intelligent assistant for Yemen economic data. I can help you with:\n\n• Analyzing economic data and providing documented insights\n• Answering questions with sources and references\n• Comparing indicators between different regimes (Aden/Sana'a)\n• Creating custom reports\n\nHow can I help you today?",
      timestamp: new Date(),
      confidence: "high"
    }
  ]);

  const suggestedQuestions = [
    {
      en: "What is the current exchange rate spread between Aden and Sana'a?",
      ar: "ما هي الفجوة الحالية في سعر الصرف بين عدن وصنعاء؟",
      category: "currency"
    },
    {
      en: "How many people are facing acute food insecurity (IPC 3+)?",
      ar: "كم عدد الأشخاص الذين يواجهون انعدام الأمن الغذائي الحاد (IPC 3+)؟",
      category: "humanitarian"
    },
    {
      en: "What is the trend in humanitarian funding over the past 3 years?",
      ar: "ما هو اتجاه التمويل الإنساني خلال السنوات الثلاث الماضية؟",
      category: "aid"
    },
    {
      en: "Compare fuel prices between IRG and DFA controlled areas",
      ar: "قارن أسعار الوقود بين مناطق الشرعية ومناطق الأمر الواقع",
      category: "energy"
    },
    {
      en: "What are the main challenges facing Yemen's banking sector?",
      ar: "ما هي التحديات الرئيسية التي تواجه القطاع المصرفي اليمني؟",
      category: "banking"
    },
    {
      en: "Show me the timeline of major economic events since 2019",
      ar: "أظهر لي الجدول الزمني للأحداث الاقتصادية الرئيسية منذ 2019",
      category: "timeline"
    },
  ];

  const capabilities = [
    {
      icon: Database,
      titleEn: "Data Retrieval",
      titleAr: "استرجاع البيانات",
      descEn: "Access verified economic datasets with full provenance",
      descAr: "الوصول إلى مجموعات البيانات الاقتصادية الموثقة مع تتبع المصدر الكامل"
    },
    {
      icon: TrendingUp,
      titleEn: "Trend Analysis",
      titleAr: "تحليل الاتجاهات",
      descEn: "Identify patterns and forecast economic indicators",
      descAr: "تحديد الأنماط والتنبؤ بالمؤشرات الاقتصادية"
    },
    {
      icon: BarChart3,
      titleEn: "Regime Comparison",
      titleAr: "مقارنة الأنظمة",
      descEn: "Compare data between IRG and DFA controlled areas",
      descAr: "مقارنة البيانات بين مناطق الشرعية ومناطق الأمر الواقع"
    },
    {
      icon: FileText,
      titleEn: "Evidence Packs",
      titleAr: "حزم الأدلة",
      descEn: "Every answer includes sources, confidence levels, and caveats",
      descAr: "كل إجابة تتضمن المصادر ومستويات الثقة والتحفظات"
    },
    {
      icon: Lightbulb,
      titleEn: "Policy Insights",
      titleAr: "رؤى السياسات",
      descEn: "Get AI-powered analysis and policy recommendations",
      descAr: "احصل على تحليلات وتوصيات سياسية مدعومة بالذكاء الاصطناعي"
    },
    {
      icon: Link2,
      titleEn: "Cross-Reference",
      titleAr: "الربط المتقاطع",
      descEn: "Link indicators to events and understand causality",
      descAr: "ربط المؤشرات بالأحداث وفهم العلاقات السببية"
    },
  ];

  // Simulated RAG response with evidence pack
  const generateResponse = (userQuery: string): Message => {
    // This would be replaced with actual RAG/LLM integration
    const sampleEvidencePack: EvidencePack = {
      sources: [
        { title: "Central Bank of Yemen - Aden Monthly Report", type: "Official", date: "Dec 2024", confidence: "A" },
        { title: "Market Survey - Exchange Bureaus", type: "Field Data", date: "Dec 2024", confidence: "B" },
        { title: "Sana'a Center Economic Analysis", type: "Research", date: "Nov 2024", confidence: "A" },
      ],
      indicators: [
        { name: "Exchange Rate (Aden)", value: "2,320 YER/$", trend: "up", regime: "IRG" },
        { name: "Exchange Rate (Sana'a)", value: "562 YER/$", trend: "stable", regime: "DFA" },
        { name: "North-South Spread", value: "313%", trend: "up" },
      ],
      methodology: "Exchange rates are collected from official CBY sources and verified against market surveys from 50+ exchange bureaus across both territories.",
      caveats: [
        "Sana'a rates reflect old banknote values only",
        "Black market rates may vary by 5-10%",
        "Data as of December 2024"
      ]
    };

    const responseContent = language === "ar"
      ? `بناءً على تحليل البيانات المتاحة:\n\n**الفجوة الحالية في سعر الصرف:**\n\nسعر الصرف في عدن (السوق الموازي): 2,320 ريال/دولار\nسعر الصرف في صنعاء (السوق الموازي): 562 ريال/دولار\n\n**الفجوة: 313%**\n\nهذه الفجوة الكبيرة ناتجة عن انقسام النظام النقدي منذ 2019، حيث تحظر سلطات صنعاء الأوراق النقدية الجديدة المطبوعة بعد 2016.\n\n📊 انظر حزمة الأدلة أدناه للمصادر والتفاصيل الكاملة.`
      : `Based on available data analysis:\n\n**Current Exchange Rate Spread:**\n\nAden Rate (Parallel Market): 2,320 YER/$\nSana'a Rate (Parallel Market): 562 YER/$\n\n**Spread: 313%**\n\nThis significant divergence results from the monetary system split since 2019, where Sana'a authorities ban new banknotes printed after 2016.\n\n📊 See the evidence pack below for sources and full details.`;

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: responseContent,
      timestamp: new Date(),
      evidencePack: sampleEvidencePack,
      confidence: "high"
    };
  };

  const aiChatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        confidence: data.confidence as "high" | "medium" | "low",
        evidencePack: data.sources.length > 0 ? {
          sources: data.sources.map(s => ({
            title: s.name,
            type: s.type,
            date: "Dec 2024",
            confidence: "A",
          })),
          indicators: [],
          methodology: "Response generated using RAG retrieval from YETO database with Yemen-specific context.",
          caveats: [
            language === "ar" ? "الإجابة مبنية على البيانات المتاحة في قاعدة بيانات YETO" : "Answer based on data available in YETO database",
            language === "ar" ? "يرجى التحقق من المصادر الأصلية للقرارات الحرجة" : "Please verify original sources for critical decisions",
          ],
        } : undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast.error(language === "ar" ? "حدث خطأ في معالجة طلبك" : "Error processing your request");
      console.error("AI Chat error:", error);
    },
  });

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");
    setIsLoading(true);

    try {
      await aiChatMutation.mutateAsync({
        message: currentQuery,
        conversationHistory: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
        context: {
          regime: "both",
        },
      });
    } catch (error) {
      // Error handled in onError callback
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          {language === "ar" ? "ثقة عالية" : "High Confidence"}
        </Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          {language === "ar" ? "ثقة متوسطة" : "Medium Confidence"}
        </Badge>;
      case "low":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          {language === "ar" ? "ثقة منخفضة" : "Low Confidence"}
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Matching Mockup Design */}
      <section className="bg-[#1e3a5f] text-white relative overflow-hidden">
        <div className="container py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {language === "ar" 
                  ? "مساعد الذكاء الاقتصادي"
                  : "Economic Intelligence Assistant"}
              </h1>
              <p className="text-white/70 text-sm">
                {language === "ar" ? "المرصد اليمني" : "Yemen Observatory"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Download className="h-4 w-4" />
                {language === "ar" ? "تصدير المحادثة" : "Export Conversation"}
              </Button>
              <Button variant="default" className="bg-teal-600 hover:bg-teal-700 gap-2">
                <Share2 className="h-4 w-4" />
                {language === "ar" ? "مشاركة التحليل" : "Share Analysis"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {language === "ar" ? "المحادثة" : "Chat"}
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <Clock className="h-4 w-4" />
                  {language === "ar" ? "السجل" : "History"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat">
                {/* Chat Messages */}
                <Card className="h-[550px] flex flex-col shadow-lg border-2">
                  <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[90%] ${message.role === "user" ? "" : "w-full"}`}>
                          <div className={`rounded-lg p-4 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}>
                            {message.role === "assistant" && (
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Brain className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {language === "ar" ? "العقل الواحد" : "One Brain"}
                                  </span>
                                </div>
                                {getConfidenceBadge(message.confidence)}
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            
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
                                
                                {/* Indicators */}
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
                                          {ind.trend === "up" && <TrendingUp className="h-3 w-3 text-red-500" />}
                                          {ind.trend === "down" && <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Caveats */}
                                {message.evidencePack.caveats && (
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
                          {message.role === "assistant" && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                                <Copy className="h-3 w-3" />
                                {language === "ar" ? "نسخ" : "Copy"}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                                <Download className="h-3 w-3" />
                                {language === "ar" ? "تصدير" : "Export"}
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
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 animate-pulse" />
                            <span className="text-sm">
                              {language === "ar" ? "جاري التحليل..." : "Analyzing..."}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <div className="border-t p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex gap-2 items-center">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Mic className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder={language === "ar" ? "اسأل عن اقتصاد اليمن..." : "Ask about Yemen's economy..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                        className="flex-1 bg-white dark:bg-gray-800"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        size="icon"
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 h-10 w-10" 
                        disabled={isLoading}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>{language === "ar" ? "سجل المحادثات" : "Conversation History"}</CardTitle>
                    <CardDescription>
                      {language === "ar" ? "المحادثات السابقة والتقارير المحفوظة" : "Previous conversations and saved reports"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{language === "ar" ? "لا توجد محادثات محفوظة" : "No saved conversations yet"}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Suggested Questions */}
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  {language === "ar" ? "أسئلة مقترحة" : "Suggested Questions"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "انقر على سؤال للبدء" : "Click a question to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(language === "ar" ? question.ar : question.en)}
                      className="p-4 text-left border-2 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all text-sm group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="group-hover:text-primary transition-colors leading-relaxed">
                          {language === "ar" ? question.ar : question.en}
                        </span>
                        <Badge variant="secondary" className="text-xs flex-shrink-0 bg-primary/10 text-primary">
                          {question.category}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Suggested Questions (Matching Mockup) */}
          <div className="space-y-6">
            <Card className="shadow-md bg-gray-50 dark:bg-gray-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  {language === "ar" ? "أسئلة مقترحة" : "Suggested Questions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => setQuery(language === "ar" ? "كيف يؤثر عدم استقرار العملة على الناتج المحلي الإجمالي؟" : "How does currency instability affect GDP?")}
                  className="w-full p-4 text-left rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="text-sm">
                        {language === "ar" ? "كيف يؤثر عدم استقرار العملة على الناتج المحلي الإجمالي؟" : "How does currency instability affect GDP?"}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
                
                <button
                  onClick={() => setQuery(language === "ar" ? "قارن تعافي اليمن مع الدول المجاورة" : "Compare Yemen's recovery to regional peers")}
                  className="w-full p-4 text-left rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm">
                        {language === "ar" ? "قارن تعافي اليمن مع الدول المجاورة" : "Compare Yemen's recovery to regional peers"}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
                
                <button
                  onClick={() => setQuery(language === "ar" ? "ما هي توصيات السياسة المالية؟" : "What are the fiscal policy recommendations?")}
                  className="w-full p-4 text-left rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      <span className="text-sm">
                        {language === "ar" ? "ما هي توصيات السياسة المالية؟" : "What are the fiscal policy recommendations?"}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-primary/5 dark:from-emerald-950/30 dark:to-primary/10 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  {language === "ar" ? "حزم الأدلة" : "Evidence Packs"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === "ar"
                    ? "كل إجابة تتضمن حزمة أدلة كاملة مع:"
                    : "Every answer includes a complete evidence pack with:"}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "المصادر الأصلية" : "Original sources"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "مستويات الثقة" : "Confidence levels"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "المؤشرات ذات الصلة" : "Related indicators"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "التحفظات والقيود" : "Caveats and limitations"}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  {language === "ar" ? "نصائح للاستخدام" : "Usage Tips"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {language === "ar"
                        ? "كن محدداً في أسئلتك للحصول على إجابات أدق"
                        : "Be specific in your questions for more precise answers"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {language === "ar"
                        ? "حدد النظام (عدن/صنعاء) عند المقارنة"
                        : "Specify the regime (Aden/Sana'a) when comparing"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {language === "ar"
                        ? "راجع حزمة الأدلة للتحقق من المصادر"
                        : "Review the evidence pack to verify sources"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {language === "ar"
                        ? "يمكنك تصدير الإجابات كتقارير PDF"
                        : "You can export answers as PDF reports"}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

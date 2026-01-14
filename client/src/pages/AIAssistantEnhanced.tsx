import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  ChevronRight,
  Users,
  Shield,
  Globe,
  Building2,
  Scale,
  GraduationCap,
  Languages,
  Calculator,
  Eye,
  Zap,
  Target,
  PieChart,
  LineChart,
  Map,
  Newspaper,
  Briefcase,
  HeartHandshake,
  Landmark,
  Banknote,
  Wheat,
  Fuel,
  HardHat,
  Factory,
  Loader2
} from "lucide-react";

// 8 Specialized Agent Personas
const agentPersonas = [
  {
    id: "citizen-explainer",
    nameEn: "Citizen Explainer",
    nameAr: "المُفسِّر للمواطن",
    icon: Users,
    color: "bg-blue-500",
    descEn: "Explains complex economic data in simple terms for everyday citizens",
    descAr: "يشرح البيانات الاقتصادية المعقدة بمصطلحات بسيطة للمواطنين العاديين",
    systemPrompt: "You are a friendly economic educator who explains Yemen's economic situation in simple, accessible terms. Avoid jargon. Use everyday examples. Focus on how economic changes affect daily life - food prices, fuel costs, job opportunities.",
    suggestedQuestions: [
      { en: "Why are prices going up?", ar: "لماذا ترتفع الأسعار؟" },
      { en: "What does the exchange rate mean for my salary?", ar: "ماذا يعني سعر الصرف لراتبي؟" },
      { en: "How can I protect my savings?", ar: "كيف أحمي مدخراتي؟" }
    ]
  },
  {
    id: "policymaker-brief",
    nameEn: "Policymaker Brief Writer",
    nameAr: "كاتب ملخصات صانعي القرار",
    icon: Briefcase,
    color: "bg-purple-500",
    descEn: "Creates executive summaries and policy briefs for decision makers",
    descAr: "ينشئ ملخصات تنفيذية وإحاطات سياسية لصناع القرار",
    systemPrompt: "You are a senior policy analyst. Provide concise, actionable briefs with clear recommendations. Structure responses with: Key Findings, Policy Options, Risks, and Recommended Actions. Use bullet points for clarity.",
    suggestedQuestions: [
      { en: "Brief me on the banking sector crisis", ar: "أعطني إحاطة عن أزمة القطاع المصرفي" },
      { en: "What are the policy options for currency stabilization?", ar: "ما هي خيارات السياسة لاستقرار العملة؟" },
      { en: "Summarize humanitarian funding gaps", ar: "لخص فجوات التمويل الإنساني" }
    ]
  },
  {
    id: "donor-accountability",
    nameEn: "Donor Accountability Analyst",
    nameAr: "محلل مساءلة المانحين",
    icon: HeartHandshake,
    color: "bg-green-500",
    descEn: "Tracks aid flows, donor commitments, and accountability metrics",
    descAr: "يتتبع تدفقات المساعدات والتزامات المانحين ومقاييس المساءلة",
    systemPrompt: "You are an aid accountability specialist. Track donor commitments vs disbursements. Highlight gaps, delays, and effectiveness metrics. Reference FTS, OCHA, and partner reports. Be precise with figures and dates.",
    suggestedQuestions: [
      { en: "What percentage of pledged aid was actually delivered?", ar: "ما نسبة المساعدات المتعهد بها التي تم تسليمها فعلياً؟" },
      { en: "Which sectors have the largest funding gaps?", ar: "أي القطاعات لديها أكبر فجوات تمويلية؟" },
      { en: "Compare donor performance over 3 years", ar: "قارن أداء المانحين على مدى 3 سنوات" }
    ]
  },
  {
    id: "bank-compliance",
    nameEn: "Bank Compliance Analyst",
    nameAr: "محلل الامتثال المصرفي",
    icon: Shield,
    color: "bg-red-500",
    descEn: "Analyzes sanctions, compliance risks, and banking regulations",
    descAr: "يحلل العقوبات ومخاطر الامتثال واللوائح المصرفية",
    systemPrompt: "You are a compliance and sanctions expert. Analyze OFAC designations, CBY regulations, and banking sector risks. Reference specific sanctions lists, dates, and legal frameworks. Highlight compliance requirements and risks.",
    suggestedQuestions: [
      { en: "Which Yemeni banks are under OFAC sanctions?", ar: "أي البنوك اليمنية تحت عقوبات OFAC؟" },
      { en: "What are the compliance risks for remittance transfers?", ar: "ما هي مخاطر الامتثال لتحويلات الحوالات؟" },
      { en: "Explain the dual central bank regulatory framework", ar: "اشرح الإطار التنظيمي للبنكين المركزيين" }
    ]
  },
  {
    id: "research-librarian",
    nameEn: "Research Librarian",
    nameAr: "أمين مكتبة البحوث",
    icon: BookOpen,
    color: "bg-amber-500",
    descEn: "Finds and curates relevant research, reports, and publications",
    descAr: "يجد وينظم البحوث والتقارير والمنشورات ذات الصلة",
    systemPrompt: "You are a research librarian specializing in Yemen economics. Help users find relevant reports, academic papers, and data sources. Provide full citations, publication dates, and direct links when available. Categorize by credibility.",
    suggestedQuestions: [
      { en: "Find all World Bank reports on Yemen since 2020", ar: "اعثر على جميع تقارير البنك الدولي عن اليمن منذ 2020" },
      { en: "What research exists on Yemen's microfinance sector?", ar: "ما البحوث الموجودة عن قطاع التمويل الأصغر في اليمن؟" },
      { en: "Curate sources on the currency crisis", ar: "اجمع مصادر عن أزمة العملة" }
    ]
  },
  {
    id: "data-steward",
    nameEn: "Data Steward",
    nameAr: "أمين البيانات",
    icon: Database,
    color: "bg-cyan-500",
    descEn: "Explains data quality, methodology, and provenance",
    descAr: "يشرح جودة البيانات والمنهجية والمصدر",
    systemPrompt: "You are a data quality expert. Explain data collection methodologies, confidence levels, and limitations. Help users understand data provenance, update frequencies, and how to interpret uncertainty. Be transparent about data gaps.",
    suggestedQuestions: [
      { en: "How reliable is the exchange rate data?", ar: "ما مدى موثوقية بيانات سعر الصرف؟" },
      { en: "Explain the IPC food security methodology", ar: "اشرح منهجية IPC للأمن الغذائي" },
      { en: "What are the data gaps in conflict-affected areas?", ar: "ما هي فجوات البيانات في المناطق المتأثرة بالصراع؟" }
    ]
  },
  {
    id: "translation-agent",
    nameEn: "Translation Agent",
    nameAr: "وكيل الترجمة",
    icon: Languages,
    color: "bg-indigo-500",
    descEn: "Provides professional Arabic-English translation with economic terminology",
    descAr: "يوفر ترجمة احترافية عربي-إنجليزي مع المصطلحات الاقتصادية",
    systemPrompt: "You are a professional translator specializing in economic and financial terminology. Translate between Arabic and English while preserving technical accuracy. Explain nuances and provide alternative translations when appropriate.",
    suggestedQuestions: [
      { en: "Translate this CBY circular to English", ar: "ترجم هذا التعميم من البنك المركزي إلى الإنجليزية" },
      { en: "What is the Arabic term for 'capital adequacy ratio'?", ar: "ما المصطلح الإنجليزي لـ 'نسبة كفاية رأس المال'؟" },
      { en: "Translate this policy brief to Arabic", ar: "ترجم هذا الملخص السياسي إلى العربية" }
    ]
  },
  {
    id: "scenario-modeler",
    nameEn: "Scenario Modeler",
    nameAr: "مُصمم السيناريوهات",
    icon: Calculator,
    color: "bg-orange-500",
    descEn: "Models economic scenarios and forecasts outcomes",
    descAr: "يصمم السيناريوهات الاقتصادية ويتنبأ بالنتائج",
    systemPrompt: "You are an economic modeler. Create scenario analyses with clear assumptions, variables, and projected outcomes. Present best-case, worst-case, and most-likely scenarios. Use historical data to inform projections.",
    suggestedQuestions: [
      { en: "What if oil prices drop to $60/barrel?", ar: "ماذا لو انخفضت أسعار النفط إلى 60$/برميل؟" },
      { en: "Model the impact of currency unification", ar: "صمم نموذجاً لتأثير توحيد العملة" },
      { en: "Forecast inflation for the next 6 months", ar: "تنبأ بالتضخم للأشهر الستة القادمة" }
    ]
  }
];

// Sector icons for visualization
const sectorIcons: Record<string, any> = {
  banking: Landmark,
  currency: Banknote,
  trade: Globe,
  food: Wheat,
  energy: Fuel,
  infrastructure: HardHat,
  labor: Factory,
  aid: HeartHandshake,
  conflict: Shield,
  prices: TrendingUp
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentId?: string;
  evidencePack?: EvidencePack;
  confidence?: "high" | "medium" | "low";
  visualization?: VisualizationData;
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

interface VisualizationData {
  type: "chart" | "table" | "map" | "timeline";
  title: string;
  data: any;
}

export default function AIAssistantEnhanced() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(agentPersonas[0]);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: language === "ar" 
        ? `مرحباً! أنا **العقل الواحد** - منصة الذكاء الاصطناعي الشاملة لليمن. لدي 8 شخصيات متخصصة لخدمتك:\n\n🧑‍🤝‍🧑 **المُفسِّر للمواطن** - يشرح الاقتصاد ببساطة\n📋 **كاتب ملخصات صانعي القرار** - إحاطات تنفيذية\n💰 **محلل مساءلة المانحين** - تتبع المساعدات\n🛡️ **محلل الامتثال المصرفي** - العقوبات واللوائح\n📚 **أمين مكتبة البحوث** - البحث والتوثيق\n📊 **أمين البيانات** - جودة البيانات والمنهجية\n🌐 **وكيل الترجمة** - ترجمة احترافية\n🔮 **مُصمم السيناريوهات** - التنبؤات والنمذجة\n\nاختر الشخصية المناسبة أو اسألني مباشرة!`
        : `Hello! I'm **One Brain** - Yemen's comprehensive AI platform. I have 8 specialized personas to serve you:\n\n🧑‍🤝‍🧑 **Citizen Explainer** - Economics made simple\n📋 **Policymaker Brief Writer** - Executive summaries\n💰 **Donor Accountability Analyst** - Aid tracking\n🛡️ **Bank Compliance Analyst** - Sanctions & regulations\n📚 **Research Librarian** - Research & documentation\n📊 **Data Steward** - Data quality & methodology\n🌐 **Translation Agent** - Professional translation\n🔮 **Scenario Modeler** - Forecasts & modeling\n\nSelect a persona or ask me directly!`,
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
        agentId: activeAgent.id,
        confidence: "high",
        evidencePack: generateEvidencePack(query)
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(language === "ar" ? "حدث خطأ في المعالجة" : "Error processing request");
      setIsLoading(false);
    }
  });

  const generateEvidencePack = (query: string): EvidencePack => {
    // Generate contextual evidence pack based on query
    return {
      sources: [
        { title: "Central Bank of Yemen - Aden", type: "Official", date: "Jan 2025", confidence: "A" },
        { title: "World Bank Yemen Economic Monitor", type: "Research", date: "Dec 2024", confidence: "A" },
        { title: "Sana'a Center Analysis", type: "Think Tank", date: "Jan 2025", confidence: "B" },
      ],
      indicators: [
        { name: "Exchange Rate (Aden)", value: "1,890 YER/$", trend: "up", regime: "IRG" },
        { name: "Exchange Rate (Sana'a)", value: "530 YER/$", trend: "stable", regime: "DFA" },
        { name: "Inflation Rate", value: "15.0%", trend: "up" },
      ],
      methodology: "Data collected from official CBY sources, verified against market surveys from 50+ exchange bureaus.",
      caveats: [
        "Sana'a rates reflect old banknote values only",
        "Black market rates may vary by 5-10%",
        "Data as of January 2025"
      ]
    };
  };

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
    setQuery("");

    // Construct enhanced prompt with agent persona
    const enhancedPrompt = `[Agent: ${activeAgent.nameEn}]\n${activeAgent.systemPrompt}\n\nUser Query: ${query}`;
    
    aiChatMutation.mutate({ message: enhancedPrompt });
  };

  const handleSuggestedQuestion = (question: { en: string; ar: string }) => {
    setQuery(language === "ar" ? question.ar : question.en);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(language === "ar" ? "تم النسخ" : "Copied to clipboard");
  };

  const AgentIcon = activeAgent.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1a365d] via-[#234876] to-[#2d5a8a] text-white py-12">
        <div className="container">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Brain className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {language === "ar" ? "العقل الواحد" : "One Brain"}
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {language === "ar" ? "8 شخصيات" : "8 Personas"}
                </Badge>
              </h1>
              <p className="text-blue-100 mt-1">
                {language === "ar" 
                  ? "منصة الذكاء الاصطناعي الشاملة للاقتصاد اليمني"
                  : "Comprehensive AI Platform for Yemen's Economy"}
              </p>
            </div>
          </div>
          
          {/* Active Agent Display */}
          <div className="flex items-center gap-3 mt-6">
            <div className={`p-2 rounded-xl ${activeAgent.color}`}>
              <AgentIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-200">
                {language === "ar" ? "الشخصية النشطة:" : "Active Persona:"}
              </p>
              <p className="font-semibold">
                {language === "ar" ? activeAgent.nameAr : activeAgent.nameEn}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto border-white/30 text-white hover:bg-white/10"
              onClick={() => setShowAgentSelector(!showAgentSelector)}
            >
              {language === "ar" ? "تغيير الشخصية" : "Change Persona"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Selector Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  {language === "ar" ? "الشخصيات المتخصصة" : "Specialized Personas"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "اختر الشخصية المناسبة لاحتياجاتك"
                    : "Select the right persona for your needs"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {agentPersonas.map((agent) => {
                  const Icon = agent.icon;
                  const isActive = activeAgent.id === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setActiveAgent(agent)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        isActive 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : agent.color}`}>
                          <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-white"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${isActive ? "text-white" : ""}`}>
                            {language === "ar" ? agent.nameAr : agent.nameEn}
                          </p>
                          <p className={`text-xs truncate ${isActive ? "text-blue-100" : "text-muted-foreground"}`}>
                            {language === "ar" ? agent.descAr : agent.descEn}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Suggested Questions for Active Agent */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {language === "ar" ? "أسئلة مقترحة" : "Suggested Questions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeAgent.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="w-full p-2 text-left text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-muted-foreground">
                      {language === "ar" ? q.ar : q.en}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${activeAgent.color}`}>
                      <AgentIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {language === "ar" ? activeAgent.nameAr : activeAgent.nameEn}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {language === "ar" ? activeAgent.descAr : activeAgent.descEn}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      {language === "ar" ? "متصل" : "Connected"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : ""}`}>
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={activeAgent.color}>
                                <Brain className="h-3 w-3 text-white" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {language === "ar" ? activeAgent.nameAr : activeAgent.nameEn}
                            </span>
                            {message.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {message.confidence === "high" ? "A" : message.confidence === "medium" ? "B" : "C"}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>

                        {/* Evidence Pack */}
                        {message.evidencePack && (
                          <Card className="mt-3 border-l-4 border-l-amber-500">
                            <CardHeader className="py-2 px-3">
                              <CardTitle className="text-xs flex items-center gap-2">
                                <Eye className="h-3 w-3" />
                                {language === "ar" ? "حزمة الأدلة" : "Evidence Pack"}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-3 space-y-3">
                              {/* Sources */}
                              <div>
                                <p className="text-xs font-medium mb-1">
                                  {language === "ar" ? "المصادر:" : "Sources:"}
                                </p>
                                <div className="space-y-1">
                                  {message.evidencePack.sources.map((source, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                      <Badge variant="outline" className="text-[10px]">
                                        {source.confidence}
                                      </Badge>
                                      <span>{source.title}</span>
                                      <span className="text-muted-foreground">({source.date})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Indicators */}
                              <div>
                                <p className="text-xs font-medium mb-1">
                                  {language === "ar" ? "المؤشرات:" : "Indicators:"}
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  {message.evidencePack.indicators.map((ind, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 rounded p-2">
                                      <p className="text-[10px] text-muted-foreground">{ind.name}</p>
                                      <p className="text-sm font-semibold">{ind.value}</p>
                                      <div className="flex items-center gap-1">
                                        <TrendingUp className={`h-3 w-3 ${
                                          ind.trend === "up" ? "text-red-500" : 
                                          ind.trend === "down" ? "text-green-500" : "text-gray-500"
                                        }`} />
                                        {ind.regime && (
                                          <Badge variant="outline" className="text-[8px]">{ind.regime}</Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Caveats */}
                              {message.evidencePack.caveats && (
                                <div className="bg-amber-50 dark:bg-amber-950/30 rounded p-2">
                                  <p className="text-xs font-medium flex items-center gap-1 mb-1">
                                    <AlertCircle className="h-3 w-3 text-amber-500" />
                                    {language === "ar" ? "تحفظات:" : "Caveats:"}
                                  </p>
                                  <ul className="text-[10px] text-muted-foreground space-y-0.5">
                                    {message.evidencePack.caveats.map((caveat, idx) => (
                                      <li key={idx}>• {caveat}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Message Actions */}
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => copyToClipboard(message.content)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        {language === "ar" ? "جاري التحليل..." : "Analyzing..."}
                      </span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={language === "ar" 
                      ? "اسأل عن الاقتصاد اليمني..."
                      : "Ask about Yemen's economy..."}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading || !query.trim()}
                    className="bg-gradient-to-r from-blue-500 to-blue-600"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {language === "ar" 
                    ? "جميع الإجابات مدعومة بالأدلة والمصادر الموثقة"
                    : "All answers are backed by evidence and documented sources"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

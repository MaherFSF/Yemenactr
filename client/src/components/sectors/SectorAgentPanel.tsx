/**
 * SectorAgentPanel - "Ask the Sector Analyst" interface
 * Provides evidence-based conversational AI for each sector
 * Rules:
 * - Agents cannot invent numbers
 * - All claims must cite evidence pack IDs
 * - If evidence insufficient: respond with gaps + recommended sources
 */

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Database,
  FileText,
  TrendingUp,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import EvidencePackButton from "@/components/EvidencePackButton";
import { ConfidenceRating } from "@/components/ConfidenceRating";

interface SectorAgentPanelProps {
  sectorCode: string;
  sectorName: string;
  regime?: 'both' | 'aden_irg' | 'sanaa_dfa';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  evidencePacks?: number[];
  citations?: Citation[];
  confidence?: string;
  dataGaps?: DataGap[];
  chartData?: ChartData;
}

interface Citation {
  evidencePackId: number;
  sourceTitle: string;
  sourcePublisher: string;
  retrievalDate: string;
  snippet?: string;
}

interface DataGap {
  description: string;
  recommendedSources: string[];
}

interface ChartData {
  indicatorCode: string;
  indicatorName: string;
  values: Array<{ date: string; value: number; confidence: string }>;
  asOfDate: string;
}

const SECTOR_AGENT_INFO: Record<string, {
  nameEn: string;
  nameAr: string;
  capabilities: string[];
  exampleQuestionsEn: string[];
  exampleQuestionsAr: string[];
}> = {
  'currency': {
    nameEn: 'Currency & FX Analyst',
    nameAr: 'محلل العملة والصرف',
    capabilities: ['Exchange rate analysis', 'Currency flow tracking', 'Remittance monitoring', 'Reserve estimates'],
    exampleQuestionsEn: [
      'What is the current YER/USD exchange rate in Aden vs Sanaa?',
      'How has the black market spread changed in the last 6 months?',
      'What are the latest estimates of foreign reserves?'
    ],
    exampleQuestionsAr: [
      'ما هو سعر صرف الريال اليمني مقابل الدولار في عدن وصنعاء؟',
      'كيف تغير فارق السوق السوداء في الأشهر الستة الماضية؟',
      'ما هي آخر تقديرات الاحتياطيات الأجنبية؟'
    ]
  },
  'banking': {
    nameEn: 'Banking & Finance Analyst',
    nameAr: 'محلل البنوك والمالية',
    capabilities: ['Banking sector health', 'Credit conditions', 'NPL tracking', 'Mobile money analysis'],
    exampleQuestionsEn: [
      'What is the current NPL ratio in Yemen\'s banking sector?',
      'How has mobile money adoption changed?',
      'Which banks have relocated since the split?'
    ],
    exampleQuestionsAr: [
      'ما هي نسبة القروض المتعثرة الحالية في القطاع المصرفي اليمني؟',
      'كيف تغير استخدام المال الإلكتروني؟',
      'أي بنوك انتقلت منذ الانقسام؟'
    ]
  },
  'trade': {
    nameEn: 'Trade & Commerce Analyst',
    nameAr: 'محلل التجارة',
    capabilities: ['Import/export analysis', 'Port operations', 'Trade finance', 'Commodity flows'],
    exampleQuestionsEn: [
      'What are the latest import volumes through Aden port?',
      'How has fuel import changed in Q1 2024?',
      'What is Yemen\'s main export commodity?'
    ],
    exampleQuestionsAr: [
      'ما هي أحدث أحجام الواردات عبر ميناء عدن؟',
      'كيف تغيرت واردات الوقود في الربع الأول من 2024؟',
      'ما هي السلعة التصديرية الرئيسية لليمن؟'
    ]
  },
  'prices': {
    nameEn: 'Prices & Inflation Analyst',
    nameAr: 'محلل الأسعار والتضخم',
    capabilities: ['CPI tracking', 'Food basket costs', 'Regional price divergence', 'Purchasing power'],
    exampleQuestionsEn: [
      'What is the current inflation rate?',
      'How much does the food basket cost in different regions?',
      'What is driving price increases?'
    ],
    exampleQuestionsAr: [
      'ما هو معدل التضخم الحالي؟',
      'كم تكلفة السلة الغذائية في المناطق المختلفة؟',
      'ما الذي يدفع زيادة الأسعار؟'
    ]
  },
  'macro': {
    nameEn: 'Macroeconomy Analyst',
    nameAr: 'محلل الاقتصاد الكلي',
    capabilities: ['GDP estimates', 'Fiscal analysis', 'Budget tracking', 'Debt monitoring'],
    exampleQuestionsEn: [
      'What is Yemen\'s current GDP estimate?',
      'How is the government financing the deficit?',
      'What are the main revenue sources?'
    ],
    exampleQuestionsAr: [
      'ما هو تقدير الناتج المحلي الإجمالي الحالي لليمن؟',
      'كيف تمول الحكومة العجز؟',
      'ما هي مصادر الإيرادات الرئيسية؟'
    ]
  },
  'energy': {
    nameEn: 'Energy & Fuel Analyst',
    nameAr: 'محلل الطاقة والوقود',
    capabilities: ['Fuel supply tracking', 'Electricity monitoring', 'Solar adoption', 'Energy access'],
    exampleQuestionsEn: [
      'What is the current fuel price?',
      'How many hours of electricity per day?',
      'What percentage of households have solar?'
    ],
    exampleQuestionsAr: [
      'ما هو سعر الوقود الحالي؟',
      'كم ساعة كهرباء في اليوم؟',
      'ما النسبة المئوية للأسر التي لديها طاقة شمسية؟'
    ]
  },
  'humanitarian': {
    nameEn: 'Humanitarian Economy Analyst',
    nameAr: 'محلل الاقتصاد الإنساني',
    capabilities: ['Aid flow tracking', 'Beneficiary monitoring', 'Funding gap analysis', 'Access constraints'],
    exampleQuestionsEn: [
      'How much aid has been disbursed this year?',
      'What are the current funding gaps?',
      'Which sectors are most underfunded?'
    ],
    exampleQuestionsAr: [
      'كم من المساعدات تم صرفها هذا العام؟',
      'ما هي فجوات التمويل الحالية؟',
      'أي القطاعات الأقل تمويلاً؟'
    ]
  },
  'labor': {
    nameEn: 'Labor & Employment Analyst',
    nameAr: 'محلل العمل والتوظيف',
    capabilities: ['Unemployment tracking', 'Wage analysis', 'Skills gap assessment', 'Labor force participation'],
    exampleQuestionsEn: [
      'What is the current unemployment rate?',
      'How do public sector wages compare to private?',
      'What are the main employment barriers for women?'
    ],
    exampleQuestionsAr: [
      'ما هو معدل البطالة الحالي؟',
      'كيف تقارن أجور القطاع العام بالقطاع الخاص؟',
      'ما هي حواجز التوظيف الرئيسية للنساء؟'
    ]
  },
  'food-security': {
    nameEn: 'Food Security Analyst',
    nameAr: 'محلل الأمن الغذائي',
    capabilities: ['Food prices', 'Availability monitoring', 'IPC classification', 'Agricultural production'],
    exampleQuestionsEn: [
      'What is the current IPC classification?',
      'How have wheat prices changed?',
      'What percentage of food is imported?'
    ],
    exampleQuestionsAr: [
      'ما هو التصنيف الحالي لمراحل التصنيف المتكامل للأمن الغذائي؟',
      'كيف تغيرت أسعار القمح؟',
      'ما النسبة المئوية للغذاء المستورد؟'
    ]
  }
};

export function SectorAgentPanel({ sectorCode, sectorName, regime = 'both' }: SectorAgentPanelProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const agentInfo = SECTOR_AGENT_INFO[sectorCode] || {
    nameEn: 'Sector Analyst',
    nameAr: 'محلل القطاع',
    capabilities: [],
    exampleQuestionsEn: [],
    exampleQuestionsAr: []
  };

  // Mutation for sending chat messages
  const chatMutation = trpc.sectorAgents.chat.useMutation({
    onSuccess: (data) => {
      if (data.success && data.response) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response.content,
          timestamp: new Date(),
          evidencePacks: data.response.evidencePackIds,
          citations: data.response.citations,
          confidence: data.response.confidenceGrade,
          dataGaps: data.response.dataGaps,
          chartData: data.response.chartData
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isArabic 
          ? `عذراً، حدث خطأ: ${error.message}`
          : `Sorry, an error occurred: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    chatMutation.mutate({
      sectorCode,
      query: input,
      language,
      regime
    });
  };

  const handleExampleQuestion = (question: string) => {
    setInput(question);
    setIsExpanded(true);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="sticky top-4">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {isArabic ? 'اسأل محلل القطاع' : 'Ask the Sector Analyst'}
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm">
                {isArabic ? agentInfo.nameAr : agentInfo.nameEn}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Agent Capabilities */}
          {messages.length === 0 && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {isArabic ? 'القدرات' : 'Capabilities'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {agentInfo.capabilities.map((cap, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Example Questions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  {isArabic ? 'أمثلة على الأسئلة' : 'Example Questions'}
                </h4>
                <div className="space-y-2">
                  {(isArabic ? agentInfo.exampleQuestionsAr : agentInfo.exampleQuestionsEn).map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start text-xs h-auto py-2 px-3"
                      onClick={() => handleExampleQuestion(question)}
                    >
                      <TrendingUp className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="line-clamp-2">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Evidence Rules Notice */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    {isArabic 
                      ? 'جميع الإجابات مدعومة بالأدلة. إذا كانت البيانات غير كافية، سيشير المحلل إلى الفجوات والمصادر الموصى بها.'
                      : 'All answers are evidence-backed. If data is insufficient, the analyst will indicate gaps and recommended sources.'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <ScrollArea ref={scrollAreaRef} className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Confidence Rating */}
                      {message.confidence && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <ConfidenceRating grade={message.confidence as any} size="sm" />
                        </div>
                      )}

                      {/* Citations */}
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                          <p className="text-xs font-semibold flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {isArabic ? 'المصادر:' : 'Sources:'}
                          </p>
                          {message.citations.map((citation, idx) => (
                            <div key={idx} className="text-xs">
                              <EvidencePackButton evidencePackId={citation.evidencePackId}>
                                <span className="underline cursor-pointer hover:text-primary">
                                  [{idx + 1}] {citation.sourceTitle} - {citation.sourcePublisher}
                                </span>
                              </EvidencePackButton>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Data Gaps */}
                      {message.dataGaps && message.dataGaps.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs font-semibold flex items-center gap-1 text-orange-500">
                            <AlertCircle className="h-3 w-3" />
                            {isArabic ? 'فجوات البيانات:' : 'Data Gaps:'}
                          </p>
                          {message.dataGaps.map((gap, idx) => (
                            <div key={idx} className="text-xs mt-1">
                              <p>{gap.description}</p>
                              {gap.recommendedSources.length > 0 && (
                                <p className="text-muted-foreground mt-0.5">
                                  {isArabic ? 'مصادر موصى بها:' : 'Recommended:'} {gap.recommendedSources.join(', ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Chart Data */}
                      {message.chartData && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {message.chartData.indicatorName}
                            </span>
                            <span className="text-muted-foreground">
                              {isArabic ? 'كما في:' : 'As of:'} {message.chartData.asOfDate}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {message.chartData.values.length} {isArabic ? 'نقاط بيانات' : 'data points'}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString(isArabic ? 'ar' : 'en')}
                      </p>
                    </div>
                  </div>
                ))}

                {chatMutation.isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg p-3 bg-muted">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">
                          {isArabic ? 'يفكر المحلل...' : 'Analyst is thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isArabic ? 'اسأل عن هذا القطاع...' : 'Ask about this sector...'}
              disabled={chatMutation.isLoading}
              className="flex-1"
              dir={isArabic ? 'rtl' : 'ltr'}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || chatMutation.isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default SectorAgentPanel;

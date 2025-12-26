import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Send,
  Sparkles,
  TrendingUp,
  FileText,
  Database,
  MessageSquare,
  Lightbulb
} from "lucide-react";

export default function AIAssistant() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    {
      role: "assistant",
      content: language === "ar" 
        ? "مرحباً! أنا \"العقل الواحد\" - مساعدك الذكي للبيانات الاقتصادية اليمنية. يمكنني مساعدتك في تحليل البيانات، الإجابة على الأسئلة، وتقديم رؤى حول الاقتصاد اليمني. كيف يمكنني مساعدتك اليوم؟"
        : "Hello! I'm \"One Brain\" - your intelligent assistant for Yemen economic data. I can help you analyze data, answer questions, and provide insights about the Yemeni economy. How can I help you today?"
    }
  ]);

  const suggestedQuestions = [
    {
      en: "What is the current liquidity ratio in Aden's banking sector?",
      ar: "ما هي نسبة السيولة الحالية في القطاع المصرفي في عدن؟"
    },
    {
      en: "Compare poverty rates between Aden and Sana'a governorates",
      ar: "قارن معدلات الفقر بين محافظتي عدن وصنعاء"
    },
    {
      en: "Show me the trend of import volumes over the last 6 months",
      ar: "أظهر لي اتجاه أحجام الاستيراد خلال الأشهر الستة الماضية"
    },
    {
      en: "Which banks are currently under international sanctions?",
      ar: "ما هي البنوك الخاضعة حالياً للعقوبات الدولية؟"
    },
  ];

  const capabilities = [
    {
      icon: Database,
      titleEn: "Data Analysis",
      titleAr: "تحليل البيانات",
      descEn: "Query and analyze economic datasets with natural language",
      descAr: "استعلام وتحليل مجموعات البيانات الاقتصادية باللغة الطبيعية"
    },
    {
      icon: TrendingUp,
      titleEn: "Trend Identification",
      titleAr: "تحديد الاتجاهات",
      descEn: "Identify patterns and trends in economic indicators",
      descAr: "تحديد الأنماط والاتجاهات في المؤشرات الاقتصادية"
    },
    {
      icon: FileText,
      titleEn: "Report Generation",
      titleAr: "إنشاء التقارير",
      descEn: "Generate custom reports based on your queries",
      descAr: "إنشاء تقارير مخصصة بناءً على استفساراتك"
    },
    {
      icon: Lightbulb,
      titleEn: "Insights & Recommendations",
      titleAr: "رؤى وتوصيات",
      descEn: "Get AI-powered insights and policy recommendations",
      descAr: "احصل على رؤى وتوصيات سياسية مدعومة بالذكاء الاصطناعي"
    },
  ];

  const handleSendMessage = () => {
    if (!query.trim()) return;

    // Add user message
    setMessages([...messages, { role: "user", content: query }]);
    
    // Simulate AI response (will be replaced with actual AI integration)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: language === "ar"
          ? "أنا أعمل على تحليل استفسارك وجمع البيانات ذات الصلة من مستودعنا. سأقدم لك إجابة شاملة مع المصادر والمراجع قريباً."
          : "I'm analyzing your query and gathering relevant data from our repository. I'll provide you with a comprehensive answer with sources and references shortly."
      }]);
    }, 1000);

    setQuery("");
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-900/20 via-primary/10 to-purple-900/20 border-b">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
              <Badge variant="outline" className="text-sm gap-1">
                <Sparkles className="h-3 w-3" />
                {language === "ar" ? "مساعد الذكاء الاصطناعي" : "AI Assistant"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" 
                ? "العقل الواحد - المساعد الذكي"
                : "One Brain - AI Assistant"}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {language === "ar"
                ? "اطرح أسئلتك حول الاقتصاد اليمني واحصل على إجابات ذكية مدعومة بالبيانات الموثقة"
                : "Ask questions about Yemen's economy and get intelligent answers backed by verified data"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chat Messages */}
            <Card className="h-[500px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {language === "ar" ? "المحادثة" : "Conversation"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {language === "ar" ? "العقل الواحد" : "One Brain"}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={language === "ar" ? "اطرح سؤالاً..." : "Ask a question..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} className="gap-2">
                    <Send className="h-4 w-4" />
                    {language === "ar" ? "إرسال" : "Send"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Suggested Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "أسئلة مقترحة" : "Suggested Questions"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "جرب هذه الأسئلة للبدء"
                    : "Try these questions to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(language === "ar" ? question.ar : question.en)}
                      className="p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                    >
                      {language === "ar" ? question.ar : question.en}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Capabilities */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "القدرات" : "Capabilities"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {capabilities.map((capability, index) => {
                    const Icon = capability.icon;
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium mb-1">
                            {language === "ar" ? capability.titleAr : capability.titleEn}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === "ar" ? capability.descAr : capability.descEn}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "نصائح للاستخدام" : "Usage Tips"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {language === "ar"
                        ? "كن محدداً في أسئلتك للحصول على إجابات أفضل"
                        : "Be specific in your questions for better answers"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {language === "ar"
                        ? "يمكنك طلب المقارنات بين الأنظمة المختلفة"
                        : "You can request comparisons between different regimes"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {language === "ar"
                        ? "اطلب المصادر والمراجع لأي بيانات"
                        : "Ask for sources and references for any data"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {language === "ar"
                        ? "يمكنك طلب تصدير النتائج كتقرير"
                        : "You can request to export results as a report"}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  {language === "ar" ? "ميزة جديدة" : "New Feature"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {language === "ar"
                    ? "الآن يمكنك طلب تحليلات متقدمة وتوصيات سياسية مدعومة بالذكاء الاصطناعي!"
                    : "Now you can request advanced analytics and AI-powered policy recommendations!"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

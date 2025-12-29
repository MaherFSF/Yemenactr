import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  BookOpen, 
  FileText, 
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Lightbulb,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    title: string;
    year: number;
    organization?: string;
    url?: string;
  }>;
  timestamp: Date;
}

const suggestedQuestions = [
  "What are the main findings on Yemen's banking sector split?",
  "How has food security changed since 2015?",
  "What do IMF reports say about Yemen's exchange rate?",
  "Summarize research on humanitarian aid effectiveness",
  "What are the key challenges for economic recovery?",
  "Compare World Bank and UNDP assessments of poverty",
];

export default function ResearchAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch recent publications for context
  const { data: recentPubs } = trpc.research.getRecent.useQuery({ limit: 50 });

  // AI query mutation
  const askMutation = trpc.ai.askResearch.useMutation({
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error("Failed to get response: " + error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    askMutation.mutate({ question });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/research-portal">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Research Portal
                </Button>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-emerald-400" />
                <h1 className="text-xl font-bold text-white">Research Assistant</h1>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">AI-Powered</Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages([])}
              className="border-white/20 text-white/70"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container py-6 flex gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea ref={scrollRef} className="flex-1 pr-4">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="p-4 rounded-full bg-emerald-500/10 mb-6">
                  <Sparkles className="h-12 w-12 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Ask me about Yemen economic research
                </h2>
                <p className="text-white/60 max-w-md mb-8">
                  I can help you find, summarize, and analyze research publications from World Bank, IMF, UN agencies, and think tanks.
                </p>

                {/* Suggested Questions */}
                <div className="w-full max-w-2xl">
                  <p className="text-sm text-white/40 mb-4 flex items-center justify-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Try asking:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubmit(question)}
                        className="p-3 text-left text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white/80"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-emerald-600 text-white rounded-2xl rounded-br-sm"
                          : "bg-white/5 border border-white/10 text-white rounded-2xl rounded-bl-sm"
                      } p-4`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                          <Bot className="h-4 w-4" />
                          <span className="text-sm font-medium">Research Assistant</span>
                        </div>
                      )}
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Sources:
                          </p>
                          <div className="space-y-2">
                            {message.sources.map((source, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <FileText className="h-3 w-3 text-white/40" />
                                <span className="text-white/70">{source.title}</span>
                                <span className="text-white/40">({source.year})</span>
                                {source.url && (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:text-emerald-300"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions for assistant messages */}
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(message.content)}
                            className="text-white/40 hover:text-white h-7 px-2"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/40 hover:text-emerald-400 h-7 px-2"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/40 hover:text-red-400 h-7 px-2"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm p-4">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Bot className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">Analyzing research...</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="pt-4 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(input);
              }}
              className="flex gap-3"
            >
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask about Yemen economic research..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-white/40 mt-2 text-center">
              AI responses are based on indexed research publications. Always verify with original sources.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-72 hidden lg:block space-y-6">
          {/* Quick Stats */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Publications indexed</span>
                <span className="text-white font-medium">{recentPubs?.length || 0}+</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Organizations</span>
                <span className="text-white font-medium">15+</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Years covered</span>
                <span className="text-white font-medium">2010-2025</span>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-400" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/60">
              <p>• Ask specific questions for better answers</p>
              <p>• Request summaries of specific topics</p>
              <p>• Compare findings across organizations</p>
              <p>• Ask for data trends over time periods</p>
            </CardContent>
          </Card>

          {/* Recent Topics */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Popular Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Exchange Rate", "Food Security", "Banking Split", "Humanitarian Aid", "Inflation"].map((topic) => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="border-white/20 text-white/60 hover:bg-white/10 cursor-pointer"
                    onClick={() => setInput(`Tell me about ${topic.toLowerCase()} in Yemen`)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

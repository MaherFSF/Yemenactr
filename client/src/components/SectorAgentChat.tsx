/**
 * SectorAgentChat - Interactive AI Agent Chat Component
 * 
 * Provides real-time conversation with sector-specific AI agents
 * Features: streaming responses, source citations, confidence ratings, export
 */

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Send,
  Loader2,
  Copy,
  Download,
  RotateCcw,
  Zap,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';
import { Streamdown } from 'streamdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    type: 'research' | 'data' | 'news' | 'policy';
    confidence: 'high' | 'medium' | 'low';
  }>;
  confidence?: 'high' | 'medium' | 'low';
}

interface SectorAgentChatProps {
  sectorId: string;
  sectorName: string;
  sectorNameAr: string;
  agentPersona?: string; // e.g., 'policymaker_brief', 'citizen_explainer'
}

export function SectorAgentChat({
  sectorId,
  sectorName,
  sectorNameAr,
  agentPersona = 'citizen_explainer',
}: SectorAgentChatProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // tRPC mutation for agent chat
  const agentChatMutation = trpc.sectors.agentChat.useMutation({
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: typeof response.content === 'string' ? response.content : JSON.stringify(response.content),
        timestamp: new Date(),
        sources: response.sources,
        confidence: response.confidence,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      setError(error.message || 'Failed to get response from agent');
      setIsLoading(false);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    // Send to agent
    agentChatMutation.mutate({
      sectorId,
      message: input,
      conversationHistory: messages,
      agentPersona: agentPersona as any,
      language,
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleExportConversation = () => {
    const text = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sectorId}-agent-chat-${Date.now()}.txt`;
    a.click();
  };

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full flex flex-col border-2 border-[#2C3424]/20">
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-[#2C3424]/5 to-[#C9A961]/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#C9A961]" />
              {isArabic ? sectorNameAr : sectorName} Agent
            </CardTitle>
            <CardDescription>
              {isArabic
                ? 'تحدث مع وكيل متخصص في هذا القطاع'
                : 'Chat with a specialized sector expert'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportConversation}
              disabled={messages.length === 0}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="w-12 h-12 text-[#C9A961]/30 mb-4" />
              <p className="text-sm text-gray-500">
                {isArabic
                  ? 'ابدأ محادثة مع الوكيل المتخصص'
                  : 'Start a conversation with the sector expert'}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#2C3424] text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Streamdown>{message.content}</Streamdown>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">
                      {isArabic ? 'المصادر' : 'Sources'}:
                    </p>
                    {message.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-xs text-blue-600 hover:underline"
                      >
                        <Eye className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{source.title}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Confidence */}
                {message.confidence && (
                  <div className="mt-2 flex gap-2">
                    <Badge className={`text-xs ${getConfidenceColor(message.confidence)}`}>
                      {message.confidence === 'high'
                        ? isArabic
                          ? 'عالي'
                          : 'High'
                        : message.confidence === 'medium'
                          ? isArabic
                            ? 'متوسط'
                            : 'Medium'
                          : isArabic
                            ? 'منخفض'
                            : 'Low'}{' '}
                      Confidence
                    </Badge>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="bg-gray-100 rounded-lg rounded-bl-none p-4 max-w-xs lg:max-w-md">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-3 justify-start">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs lg:max-w-md">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <CardContent className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder={
              isArabic
                ? 'اسأل الوكيل المتخصص...'
                : 'Ask the sector expert...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#2C3424] hover:bg-[#2C3424]/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

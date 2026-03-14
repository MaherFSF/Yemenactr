/**
 * SectorAgentChat - Interactive AI Agent Chat Component
 * 
 * Provides real-time conversation with sector-specific AI agents
 * Features: streaming responses, source citations, confidence ratings, export
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Loader2,
  Download,
  RotateCcw,
  Zap,
  BookOpen,
  AlertCircle,
  Eye,
  Sparkles,
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
    type: string;
    confidence: string;
  }>;
  confidence?: 'high' | 'medium' | 'low';
  isStreaming?: boolean;
}

interface SectorAgentChatProps {
  sectorId: string;
  sectorName: string;
  sectorNameAr: string;
  agentPersona?: string;
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
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStreamingChat = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    setError(null);

    // Create placeholder for assistant message
    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/agent-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectorId,
          message: userMessage,
          conversationHistory: messages.filter(m => !m.isStreaming).map(m => ({
            role: m.role,
            content: m.content,
          })),
          agentPersona,
          language,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to agent');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let meta: { confidence?: string; sources?: any[] } = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'meta') {
                meta = { confidence: data.confidence, sources: data.sources };
                // Update message with metadata
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, confidence: data.confidence, sources: data.sources }
                    : m
                ));
              } else if (data.type === 'token') {
                fullContent += data.content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: fullContent }
                    : m
                ));
              } else if (data.type === 'done') {
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, isStreaming: false }
                    : m
                ));
              } else if (data.type === 'error') {
                throw new Error(data.content);
              }
            } catch (e) {
              // Skip malformed JSON
              if (e instanceof Error && e.message !== 'Failed to connect to agent') {
                // Only skip parse errors, not our thrown errors
                if (!(e instanceof SyntaxError)) throw e;
              }
            }
          }
        }
      }

      // Ensure streaming is marked as done
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, isStreaming: false, confidence: meta.confidence as any, sources: meta.sources }
          : m
      ));
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      setError(err.message || 'Failed to get response');
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [sectorId, messages, agentPersona, language]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const msg = input;
    setInput('');
    
    await handleStreamingChat(msg);
  };

  const handleClearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setIsLoading(false);
  };

  const handleExportConversation = () => {
    const text = messages
      .filter(m => !m.isStreaming || m.content)
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
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
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const suggestedQuestions = isArabic ? [
    'ما هي أحدث المؤشرات الاقتصادية؟',
    'كيف تغيرت البيانات منذ 2015؟',
    'ما هي التوقعات المستقبلية؟',
  ] : [
    `What are the latest ${sectorName.toLowerCase()} indicators?`,
    `How has ${sectorName.toLowerCase()} changed since 2015?`,
    `What are the key trends and risks?`,
  ];

  return (
    <Card className="h-full flex flex-col border-2 border-[#2C3424]/20">
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-[#2C3424]/5 to-[#C9A961]/5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-[#C9A961]" />
              {isArabic ? sectorNameAr : sectorName} {isArabic ? 'وكيل' : 'Agent'}
              <Badge variant="outline" className="text-xs font-normal ml-1">
                <Sparkles className="w-3 h-3 mr-1" />
                {isArabic ? 'بث مباشر' : 'Streaming'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {isArabic
                ? 'تحدث مع وكيل متخصص - إجابات فورية مع بيانات حقيقية'
                : 'Chat with a specialized expert - real-time responses with live data'}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleClearChat} disabled={messages.length === 0}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportConversation} disabled={messages.length === 0}>
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="w-10 h-10 text-[#C9A961]/30 mb-3" />
              <p className="text-sm text-gray-500 mb-4">
                {isArabic
                  ? 'ابدأ محادثة مع الوكيل المتخصص'
                  : 'Start a conversation with the sector expert'}
              </p>
              {/* Suggested questions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#C9A961]/30 text-[#C9A961] hover:bg-[#C9A961]/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#2C3424] text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                    <Streamdown>{message.content || (message.isStreaming ? '' : 'No response')}</Streamdown>
                    {message.isStreaming && !message.content && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">{isArabic ? 'جارٍ التحليل...' : 'Analyzing data...'}</span>
                      </div>
                    )}
                    {message.isStreaming && message.content && (
                      <span className="inline-block w-1.5 h-4 bg-[#C9A961] animate-pulse ml-0.5 align-text-bottom" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && !message.isStreaming && (
                  <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500">
                      {isArabic ? 'المصادر' : 'Sources'}:
                    </p>
                    {message.sources.slice(0, 3).map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Eye className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{source.title}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Confidence */}
                {message.confidence && !message.isStreaming && (
                  <div className="mt-2 flex gap-2">
                    <Badge className={`text-xs ${getConfidenceColor(message.confidence)}`}>
                      {message.confidence === 'high'
                        ? isArabic ? 'ثقة عالية' : 'High Confidence'
                        : message.confidence === 'medium'
                          ? isArabic ? 'ثقة متوسطة' : 'Medium Confidence'
                          : isArabic ? 'ثقة منخفضة' : 'Low Confidence'}
                    </Badge>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-1.5 opacity-60">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {error && (
            <div className="flex gap-3 justify-start">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 max-w-xs lg:max-w-md">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <CardContent className="border-t p-3">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder={isArabic ? 'اسأل الوكيل المتخصص...' : 'Ask the sector expert...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
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

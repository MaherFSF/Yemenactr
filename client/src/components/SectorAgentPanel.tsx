/**
 * Sector Agent Panel - Persistent "Ask the Analyst" on sector pages
 * 
 * Features:
 * - Auto-selects agent by sectorCode
 * - Shows capabilities + example questions
 * - Evidence-only responses with citation links
 * - Gap recommendations when evidence < 95%
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  Send,
  Sparkles,
  AlertCircle,
  FileText,
  TrendingUp,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface SectorAgentPanelProps {
  sectorCode: string;
  sectorName: string;
  sectorNameAr?: string;
}

export function SectorAgentPanel({ sectorCode, sectorName, sectorNameAr }: SectorAgentPanelProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    citations?: any[];
    evidenceCoverage?: number;
  }>>([]);

  // Get sector context pack
  const { data: contextPackData } = trpc.oneBrain.getSectorContextPack.useQuery(
    { sectorCode },
    { enabled: !!sectorCode }
  );
  const contextPack = contextPackData?.pack;

  // Agent mutation
  const askAgentMutation = trpc.oneBrain.askSectorAgent.useMutation();

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsAsking(true);
    const userMessage = question.trim();
    setQuestion('');

    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await askAgentMutation.mutateAsync({
        sectorCode,
        question: userMessage,
        language,
        includeContext: true
      });

      if (response.success && response.answer) {
        // Add assistant response
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: response.answer.text,
          citations: response.answer.citations || [],
          evidenceCoverage: response.answer.evidenceCoverage
        }]);

        // Check evidence coverage
        if (response.answer.evidenceCoverage && response.answer.evidenceCoverage < 95) {
          toast.warning(`Evidence coverage: ${response.answer.evidenceCoverage.toFixed(1)}% - Consider adding more sources`);
        }
      } else {
        toast.error(response.error || 'Failed to get answer');
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: 'Insufficient evidence to answer this question. Please check the data gaps panel.',
          evidenceCoverage: 0
        }]);
      }
    } catch (error) {
      toast.error(`Agent error: ${error}`);
      setConversation(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsAsking(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-blue-600" />
          {isArabic ? 'اسأل محلل القطاع' : 'Ask the Sector Analyst'}
        </CardTitle>
        <CardDescription>
          {isArabic 
            ? `محلل قطاع ${sectorNameAr || sectorName} - إجابات مدعومة بالأدلة فقط`
            : `${sectorName} Sector Analyst - Evidence-only answers`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Agent Capabilities */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {isArabic ? 'القدرات' : 'Capabilities'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="mr-1 h-3 w-3" />
              {isArabic ? 'تحليل الاتجاهات' : 'Trend Analysis'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <FileText className="mr-1 h-3 w-3" />
              {isArabic ? 'بحث الوثائق' : 'Document Search'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              {isArabic ? 'اكتشاف الفجوات' : 'Gap Detection'}
            </Badge>
          </div>
        </div>

        {/* Example Questions */}
        {contextPack?.exampleQuestions && contextPack.exampleQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {isArabic ? 'أمثلة على الأسئلة' : 'Example Questions'}
            </p>
            <div className="space-y-1">
              {contextPack.exampleQuestions.slice(0, 3).map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left text-xs p-2 hover:bg-muted rounded-md transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation History */}
        {conversation.length > 0 && (
          <ScrollArea className="h-[300px] border rounded-md p-4">
            <div className="space-y-4">
              {conversation.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    
                    {/* Evidence coverage indicator */}
                    {msg.role === 'assistant' && msg.evidenceCoverage !== undefined && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                        {msg.evidenceCoverage >= 95 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Evidence: {msg.evidenceCoverage.toFixed(0)}%
                          </Badge>
                        ) : msg.evidenceCoverage >= 70 ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Evidence: {msg.evidenceCoverage.toFixed(0)}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Evidence: {msg.evidenceCoverage.toFixed(0)}% - Insufficient
                          </Badge>
                        )}
                        
                        {msg.citations && msg.citations.length > 0 && (
                          <span>{msg.citations.length} citations</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="space-y-2">
          <Textarea
            placeholder={isArabic ? 'اسأل سؤالاً عن هذا القطاع...' : 'Ask a question about this sector...'}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            className="min-h-[80px]"
            disabled={isAsking}
          />
          
          <Button
            onClick={handleAsk}
            disabled={!question.trim() || isAsking}
            className="w-full"
          >
            {isAsking ? (
              <>
                <Bot className="mr-2 h-4 w-4 animate-pulse" />
                {isArabic ? 'التحليل...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {isArabic ? 'إرسال' : 'Send'}
              </>
            )}
          </Button>
        </div>

        {/* Context Pack Info */}
        {contextPack && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Context: {contextPack.topIndicators.length} indicators, {contextPack.recentDocuments.length} docs
            </p>
            {contextPack.activeContradictions.length > 0 && (
              <p className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-3 w-3" />
                {contextPack.activeContradictions.length} active contradictions
              </p>
            )}
            {contextPack.openGaps.length > 0 && (
              <p className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-3 w-3" />
                {contextPack.openGaps.length} data gaps
              </p>
            )}
            <p className="text-[10px]">
              Pack valid until: {contextPack.validUntil.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

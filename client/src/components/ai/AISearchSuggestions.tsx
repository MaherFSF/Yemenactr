/**
 * AI-Powered Search Suggestions
 * Provides intelligent search suggestions based on context and user history
 */

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';

interface Suggestion {
  id: string;
  text: string;
  textAr: string;
  type: 'trending' | 'recent' | 'ai' | 'popular';
  href: string;
  category?: string;
}

// Smart suggestions based on current context
const smartSuggestions: Suggestion[] = [
  {
    id: '1',
    text: 'Exchange rate trends 2024-2025',
    textAr: 'اتجاهات سعر الصرف 2024-2025',
    type: 'trending',
    href: '/search?q=exchange+rate+trends',
    category: 'Currency'
  },
  {
    id: '2',
    text: 'CBY Aden latest circulars',
    textAr: 'أحدث تعميمات البنك المركزي عدن',
    type: 'trending',
    href: '/search?q=cby+aden+circulars',
    category: 'Banking'
  },
  {
    id: '3',
    text: 'Humanitarian aid funding 2025',
    textAr: 'تمويل المساعدات الإنسانية 2025',
    type: 'ai',
    href: '/search?q=humanitarian+aid+2025',
    category: 'Aid'
  },
  {
    id: '4',
    text: 'Food security indicators',
    textAr: 'مؤشرات الأمن الغذائي',
    type: 'popular',
    href: '/search?q=food+security',
    category: 'Food'
  },
  {
    id: '5',
    text: 'Fuel prices Aden vs Sanaa',
    textAr: 'أسعار الوقود عدن مقابل صنعاء',
    type: 'ai',
    href: '/search?q=fuel+prices+comparison',
    category: 'Energy'
  },
  {
    id: '6',
    text: 'GDP growth projections',
    textAr: 'توقعات نمو الناتج المحلي',
    type: 'popular',
    href: '/search?q=gdp+growth',
    category: 'Economy'
  }
];

const typeIcons = {
  trending: TrendingUp,
  recent: Clock,
  ai: Sparkles,
  popular: Search
};

const typeLabels = {
  trending: { en: 'Trending', ar: 'رائج' },
  recent: { en: 'Recent', ar: 'حديث' },
  ai: { en: 'AI Suggested', ar: 'اقتراح ذكي' },
  popular: { en: 'Popular', ar: 'شائع' }
};

interface AISearchSuggestionsProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showSuggestions?: boolean;
}

export function AISearchSuggestions({
  placeholder,
  onSearch,
  className,
  showSuggestions = true
}: AISearchSuggestionsProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const isRTL = language === 'ar';

  useEffect(() => {
    if (query.length > 0) {
      // Filter suggestions based on query
      const filtered = smartSuggestions.filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase()) ||
        s.textAr.includes(query)
      );
      setFilteredSuggestions(filtered.slice(0, 4));
    } else {
      // Show default suggestions when no query
      setFilteredSuggestions(smartSuggestions.slice(0, 4));
    }
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
    setIsFocused(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query.trim());
    }
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (isRTL ? 'ابحث في البيانات والتقارير...' : 'Search data, reports, indicators...')}
          className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} h-11`}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className={`absolute ${isRTL ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 h-8 w-8 p-0`}
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
                {query ? (isRTL ? 'نتائج البحث' : 'Search results') : (isRTL ? 'اقتراحات' : 'Suggestions')}
              </div>
              {filteredSuggestions.map((suggestion, index) => {
                const Icon = typeIcons[suggestion.type];
                return (
                  <motion.button
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSearch(isRTL ? suggestion.textAr : suggestion.text)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        {isRTL ? suggestion.textAr : suggestion.text}
                      </div>
                      {suggestion.category && (
                        <div className="text-xs text-muted-foreground">
                          {suggestion.category}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {typeLabels[suggestion.type][language]}
                    </Badge>
                  </motion.button>
                );
              })}
              
              {query && (
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left mt-1 border-t border-border pt-3"
                >
                  <Search className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {isRTL ? `البحث عن "${query}"` : `Search for "${query}"`}
                  </span>
                  <ArrowRight className={`h-4 w-4 ml-auto ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AISearchSuggestions;

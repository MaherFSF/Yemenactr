/**
 * SourceMixDisclosure Component
 * Shows the source mix for any data display with tier badges and freshness indicators
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Info,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Shield,
} from 'lucide-react';

interface SourceInfo {
  sourceId: string;
  name: string;
  publisher: string;
  tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'UNKNOWN';
  lastFetch?: string;
  freshnessSla?: number;
  isStale?: boolean;
  url?: string;
  confidenceRating?: string;
}

interface SourceMixDisclosureProps {
  sources: SourceInfo[];
  asOfDate?: string;
  compact?: boolean;
  showTierLegend?: boolean;
  className?: string;
}

// Tier badge colors
const tierColors: Record<string, string> = {
  T0: 'bg-emerald-500 text-white',
  T1: 'bg-blue-500 text-white',
  T2: 'bg-amber-500 text-white',
  T3: 'bg-orange-500 text-white',
  T4: 'bg-red-500 text-white',
  UNKNOWN: 'bg-gray-500 text-white',
};

// Tier descriptions
const tierDescriptions: Record<string, string> = {
  T0: 'Official Government/Central Bank',
  T1: 'International Organizations (UN, WB, IMF)',
  T2: 'Academic/Research Institutions',
  T3: 'Media/News Sources',
  T4: 'Unverified Sources',
  UNKNOWN: 'Not yet classified',
};

export function SourceMixDisclosure({
  sources,
  asOfDate,
  compact = false,
  showTierLegend = false,
  className = '',
}: SourceMixDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate source mix statistics
  const tierCounts: Record<string, number> = {};
  let staleCount = 0;
  
  for (const source of sources) {
    tierCounts[source.tier] = (tierCounts[source.tier] || 0) + 1;
    if (source.isStale) staleCount++;
  }
  
  // Get primary tier (most common)
  const primaryTier = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNKNOWN';
  
  // Calculate overall freshness
  const hasStaleData = staleCount > 0;
  const freshnessPercent = sources.length > 0 
    ? Math.round(((sources.length - staleCount) / sources.length) * 100) 
    : 100;
  
  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className={`h-6 px-2 text-xs ${className}`}>
            <Database className="h-3 w-3 mr-1" />
            {sources.length} sources
            <Badge className={`ml-1 h-4 text-[10px] ${tierColors[primaryTier]}`}>
              {primaryTier}
            </Badge>
            {hasStaleData && (
              <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <SourceMixDetails 
            sources={sources} 
            asOfDate={asOfDate}
            tierCounts={tierCounts}
            freshnessPercent={freshnessPercent}
          />
        </PopoverContent>
      </Popover>
    );
  }
  
  return (
    <div className={`border rounded-lg p-3 bg-muted/30 ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Source Mix</span>
          <div className="flex gap-1">
            {Object.entries(tierCounts).map(([tier, count]) => (
              <Tooltip key={tier}>
                <TooltipTrigger>
                  <Badge className={`text-[10px] ${tierColors[tier]}`}>
                    {tier}: {count}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tierDescriptions[tier]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {asOfDate && (
            <span className="text-xs text-muted-foreground">
              As of {asOfDate}
            </span>
          )}
          <div className={`flex items-center gap-1 text-xs ${hasStaleData ? 'text-amber-600' : 'text-green-600'}`}>
            {hasStaleData ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <CheckCircle className="h-3 w-3" />
            )}
            {freshnessPercent}% fresh
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t">
          <SourceMixDetails 
            sources={sources} 
            asOfDate={asOfDate}
            tierCounts={tierCounts}
            freshnessPercent={freshnessPercent}
            showTierLegend={showTierLegend}
          />
        </div>
      )}
    </div>
  );
}

function SourceMixDetails({
  sources,
  asOfDate,
  tierCounts,
  freshnessPercent,
  showTierLegend = false,
}: {
  sources: SourceInfo[];
  asOfDate?: string;
  tierCounts: Record<string, number>;
  freshnessPercent: number;
  showTierLegend?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Data Sources</span>
        <span className="font-medium">{sources.length} total</span>
      </div>
      
      {/* Freshness bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Data Freshness</span>
          <span className={freshnessPercent >= 90 ? 'text-green-600' : freshnessPercent >= 70 ? 'text-amber-600' : 'text-red-600'}>
            {freshnessPercent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${freshnessPercent >= 90 ? 'bg-green-500' : freshnessPercent >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${freshnessPercent}%` }}
          />
        </div>
      </div>
      
      {/* Source list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sources.map((source) => (
          <div 
            key={source.sourceId}
            className="flex items-center justify-between text-xs p-2 bg-background rounded"
          >
            <div className="flex items-center gap-2">
              <Badge className={`text-[10px] ${tierColors[source.tier]}`}>
                {source.tier}
              </Badge>
              <div>
                <div className="font-medium">{source.name}</div>
                <div className="text-muted-foreground">{source.publisher}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {source.isStale ? (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data is stale (last fetch: {source.lastFetch || 'unknown'})</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data is fresh (last fetch: {source.lastFetch || 'unknown'})</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Tier legend */}
      {showTierLegend && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">Tier Classification</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(tierDescriptions).map(([tier, desc]) => (
              <div key={tier} className="flex items-center gap-1">
                <Badge className={`text-[10px] ${tierColors[tier]}`}>{tier}</Badge>
                <span className="text-muted-foreground truncate">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export a simple inline version for use in cards
export function SourceBadge({ 
  tier, 
  sourceName,
  lastFetch,
  isStale,
}: { 
  tier: string; 
  sourceName: string;
  lastFetch?: string;
  isStale?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1">
          <Badge className={`text-[10px] ${tierColors[tier] || tierColors.UNKNOWN}`}>
            {tier}
          </Badge>
          {isStale && <AlertTriangle className="h-3 w-3 text-amber-500" />}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{sourceName}</p>
        <p className="text-xs text-muted-foreground">
          {tierDescriptions[tier] || 'Unknown tier'}
        </p>
        {lastFetch && (
          <p className="text-xs">Last updated: {lastFetch}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export default SourceMixDisclosure;

import { cn } from '@/lib/utils';

interface YetoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  animated?: boolean;
}

export function YetoLogo({ 
  className = '', 
  size = 'md', 
  variant = 'full',
  animated = false 
}: YetoLogoProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (variant === 'badge') {
    return (
      <div 
        className={cn(
          sizeClasses[size],
          'rounded-full border-2 border-[#C0A030]/40 flex items-center justify-center',
          'bg-gradient-to-br from-[#4C583E]/60 to-[#768064]/60 backdrop-blur-sm',
          animated && 'animate-pulse',
          className
        )}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-3/4 h-3/4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="#C0A030" 
            strokeWidth="1.5" 
            strokeDasharray="4 2"
            className={animated ? 'animate-spin' : ''}
            style={{ animationDuration: '20s' }}
          />
          
          {/* Inner decorative ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            stroke="#C0A030" 
            strokeWidth="0.5" 
            opacity="0.5"
          />
          
          {/* YETO text */}
          <text 
            x="50" 
            y="48" 
            textAnchor="middle" 
            fill="#C0A030" 
            fontSize="18" 
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
          >
            YETO
          </text>
          
          {/* Decorative line under text */}
          <line 
            x1="30" 
            y1="56" 
            x2="70" 
            y2="56" 
            stroke="#C0A030" 
            strokeWidth="1"
            opacity="0.6"
          />
          
          {/* Small decorative elements */}
          <circle cx="50" cy="65" r="2" fill="#4C583E" />
          <circle cx="42" cy="65" r="1" fill="#C0A030" opacity="0.5" />
          <circle cx="58" cy="65" r="1" fill="#C0A030" opacity="0.5" />
          
          {/* Corner accents */}
          <path d="M20 30 L20 20 L30 20" stroke="#C0A030" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M70 20 L80 20 L80 30" stroke="#C0A030" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M80 70 L80 80 L70 80" stroke="#C0A030" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M30 80 L20 80 L20 70" stroke="#C0A030" strokeWidth="1" fill="none" opacity="0.4" />
        </svg>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={cn(sizeClasses[size], className)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hexagonal background */}
        <path 
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
          fill="#4C583E"
          stroke="#C0A030"
          strokeWidth="2"
        />
        
        {/* Inner hexagon */}
        <path 
          d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z" 
          fill="none"
          stroke="#C0A030"
          strokeWidth="0.5"
          opacity="0.5"
        />
        
        {/* YETO text */}
        <text 
          x="50" 
          y="55" 
          textAnchor="middle" 
          fill="#C0A030" 
          fontSize="20" 
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          YETO
        </text>
        
        {/* Decorative dot */}
        <circle cx="50" cy="70" r="3" fill="#4C583E" />
      </svg>
    );
  }

  // Full logo with text
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg 
        viewBox="0 0 50 50" 
        className={cn(
          size === 'sm' ? 'w-8 h-8' : 
          size === 'md' ? 'w-10 h-10' : 
          size === 'lg' ? 'w-12 h-12' : 'w-14 h-14'
        )}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield shape */}
        <path 
          d="M25 2 L45 10 L45 30 Q45 45 25 48 Q5 45 5 30 L5 10 Z" 
          fill="#4C583E"
          stroke="#C0A030"
          strokeWidth="1.5"
        />
        
        {/* Inner accent */}
        <path 
          d="M25 8 L40 14 L40 28 Q40 40 25 42 Q10 40 10 28 L10 14 Z" 
          fill="none"
          stroke="#C0A030"
          strokeWidth="0.5"
          opacity="0.4"
        />
        
        {/* Y symbol */}
        <path 
          d="M18 15 L25 25 L32 15 M25 25 L25 35" 
          stroke="#C0A030"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Dot */}
        <circle cx="25" cy="38" r="2" fill="#4C583E" />
      </svg>
      
      <div className="flex flex-col">
        <span className={cn('font-bold text-[#4C583E]', textSizes[size])}>
          YETO
        </span>
        <span className="text-xs text-gray-500 -mt-1">
          Yemen Economic Observatory
        </span>
      </div>
    </div>
  );
}

export default YetoLogo;

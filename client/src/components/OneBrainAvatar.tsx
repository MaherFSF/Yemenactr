import React from 'react';

interface OneBrainAvatarProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * One Brain AI Avatar - A unique, professional avatar for YETO's AI assistant
 * Features: Brain icon with circuit patterns in YETO brand colors (Navy/Green/Gold)
 */
export function OneBrainAvatar({ size = 64, className = '', animated = true }: OneBrainAvatarProps) {
  const animationClass = animated ? 'animate-pulse-slow' : '';
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={animationClass}
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#768064" />
            <stop offset="50%" stopColor="#1a4a6e" />
            <stop offset="100%" stopColor="#768064" />
          </linearGradient>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4C583E" />
            <stop offset="100%" stopColor="#15a060" />
          </linearGradient>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#e0c050" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main circle background */}
        <circle cx="50" cy="50" r="48" fill="url(#bgGradient)" stroke="#C9A227" strokeWidth="2"/>
        
        {/* Brain outline - stylized */}
        <g transform="translate(20, 22) scale(0.6)" filter="url(#glow)">
          {/* Left hemisphere */}
          <path
            d="M35 10 C20 10, 10 25, 10 45 C10 65, 20 80, 35 85 C40 86, 45 85, 50 82"
            fill="none"
            stroke="url(#brainGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Right hemisphere */}
          <path
            d="M65 10 C80 10, 90 25, 90 45 C90 65, 80 80, 65 85 C60 86, 55 85, 50 82"
            fill="none"
            stroke="url(#brainGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Brain folds left */}
          <path
            d="M25 30 Q35 25, 45 30 M20 50 Q35 45, 48 50 M25 70 Q35 65, 45 70"
            fill="none"
            stroke="url(#brainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Brain folds right */}
          <path
            d="M75 30 Q65 25, 55 30 M80 50 Q65 45, 52 50 M75 70 Q65 65, 55 70"
            fill="none"
            stroke="url(#brainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Center connection */}
          <path
            d="M50 15 L50 82"
            fill="none"
            stroke="url(#brainGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 4"
          />
        </g>
        
        {/* Circuit nodes - representing data/intelligence */}
        <g fill="url(#circuitGradient)">
          <circle cx="50" cy="20" r="4" />
          <circle cx="25" cy="35" r="3" />
          <circle cx="75" cy="35" r="3" />
          <circle cx="20" cy="55" r="3" />
          <circle cx="80" cy="55" r="3" />
          <circle cx="30" cy="75" r="3" />
          <circle cx="70" cy="75" r="3" />
          <circle cx="50" cy="85" r="4" />
        </g>
        
        {/* Circuit lines connecting nodes */}
        <g stroke="url(#circuitGradient)" strokeWidth="1.5" fill="none" opacity="0.7">
          <line x1="50" y1="20" x2="25" y2="35" />
          <line x1="50" y1="20" x2="75" y2="35" />
          <line x1="25" y1="35" x2="20" y2="55" />
          <line x1="75" y1="35" x2="80" y2="55" />
          <line x1="20" y1="55" x2="30" y2="75" />
          <line x1="80" y1="55" x2="70" y2="75" />
          <line x1="30" y1="75" x2="50" y2="85" />
          <line x1="70" y1="75" x2="50" y2="85" />
        </g>
        
        {/* "1" indicator for "One Brain" */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#C9A227"
          fontSize="24"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          1
        </text>
      </svg>
      
      {/* Pulsing ring effect */}
      {animated && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-[#4C583E] animate-ping opacity-20"
          style={{ animationDuration: '2s' }}
        />
      )}
    </div>
  );
}

/**
 * Compact version for chat messages
 */
export function OneBrainAvatarSmall({ className = '' }: { className?: string }) {
  return <OneBrainAvatar size={40} className={className} animated={false} />;
}

/**
 * Large version for hero sections
 */
export function OneBrainAvatarLarge({ className = '' }: { className?: string }) {
  return <OneBrainAvatar size={120} className={className} animated={true} />;
}

export default OneBrainAvatar;

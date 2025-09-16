
import React from 'react';

interface GemSymbolProps {
  className?: string;
}

export const GemSymbol: React.FC<GemSymbolProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7dd3fc', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" stroke="url(#gemGradient)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 8.5L12 12L22 8.5" stroke="url(#gemGradient)" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="url(#gemGradient)" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
};

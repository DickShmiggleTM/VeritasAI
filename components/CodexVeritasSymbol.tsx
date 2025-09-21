import React from 'react';

interface CodexVeritasSymbolProps {
  size?: number;
}

export const CodexVeritasSymbol: React.FC<CodexVeritasSymbolProps> = ({ size = 40 }) => (
  <svg 
    width={size}
    height={size}
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-codex-teal"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <path d="M12 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19.0711 4.92896L16.2426 7.75738" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7.75738 16.2426L4.92896 19.0711" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19.0711 19.0711L16.2426 16.2426" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7.75738 7.75738L4.92896 4.92896" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

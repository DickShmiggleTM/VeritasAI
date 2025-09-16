
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-2 border-violet-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-t-2 border-violet-400 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-sky-500/30 rounded-full"></div>
        <div className="absolute inset-2 border-b-2 border-sky-400 rounded-full animate-spin [animation-direction:reverse]"></div>
      </div>
      <p className="mt-4 text-slate-400 font-serif tracking-wider">Consulting the digital oracle...</p>
    </div>
  );
};

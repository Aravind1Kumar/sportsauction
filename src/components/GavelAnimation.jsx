import React from 'react';

export default function GavelAnimation({ isStriking, callOutText }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Animated Gavel Icon */}
        <svg 
          className={`w-12 h-12 text-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)] transition-transform duration-300 ${
            isStriking ? 'rotate-[-45deg] scale-110' : 'rotate-0'
          }`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Gavel Head */}
          <path d="m14 13-7.5 7.5c-.8.8-2 .8-2.8 0l-1.4-1.4c-.8-.8-.8-2 0-2.8L9.8 8.8" />
          <path d="m16 16 6-6" />
          <path d="m8 8 6-6" />
          <path d="m9 7 8 8" />
          <path d="m21 11-8-8" />
        </svg>

        {/* Sound Waves / Shockwave effect on strike */}
        {isStriking && (
          <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-75 pointer-events-none" />
        )}
      </div>

      {callOutText && (
        <span className="text-xs font-black tracking-wider uppercase text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-700/50 mt-1 animate-pulse">
          {callOutText}
        </span>
      )}
    </div>
  );
}

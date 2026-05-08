
'use client';

import { cn } from "@/lib/utils";

export function TurfistaLogo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative h-10 w-10 bg-[#1AFF73] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(26,255,115,0.4)] transition-transform group-hover:scale-105">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-black"
        >
          <path 
            d="M12 2L4 5V11C4 16.1 7.4 20.9 12 22C16.6 20.9 20 16.1 20 11V5L12 2Z" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinejoin="round"
          />
          <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      {!iconOnly && (
        <div className="flex flex-col -space-y-1">
          <span className="font-headline text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
            TURFISTA
          </span>
          <span className="text-[#1AFF73] text-[8px] font-black tracking-[0.2em] uppercase">
            PLAY. BOOK. DOMINATE.
          </span>
        </div>
      )}
    </div>
  );
}

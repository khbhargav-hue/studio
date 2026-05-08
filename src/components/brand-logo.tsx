
'use client';

import { cn } from "@/lib/utils";

export function TurfistaLogo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative h-10 w-10 bg-[#1AFF73] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(26,255,115,0.3)]">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-black"
        >
          <path 
            d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" 
            stroke="currentColor" 
            strokeWidth="2.5"
          />
          <path d="M3 12H21" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

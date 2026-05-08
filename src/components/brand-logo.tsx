
'use client';

import { cn } from "@/lib/utils";

export function TurfistaLogo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(26,255,115,0.3)] group-hover:shadow-[0_0_30px_rgba(26,255,115,0.5)] transition-all duration-500">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-background"
        >
          <path 
            d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6Z" 
            stroke="currentColor" 
            strokeWidth="2.5"
          />
          <path d="M3 12H21" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-accent rounded-full border-2 border-background" />
      </div>
      {!iconOnly && (
        <span className="font-headline text-2xl font-black tracking-tighter text-white uppercase italic leading-none group-hover:text-primary transition-colors">
          TURFISTA<span className="text-primary group-hover:text-white transition-colors">.</span>
        </span>
      )}
    </div>
  );
}

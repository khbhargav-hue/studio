'use client';

import { cn } from "@/lib/utils";

export function TurfistaLogo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 group cursor-pointer", className)}>
      <div className="relative h-8 w-8 bg-primary rounded-md flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-transform group-hover:scale-110">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-black"
        >
          <path 
            d="M12 2L4 5V11C4 16.1 7.4 20.9 12 22C16.6 20.9 20 16.1 20 11V5L12 2Z" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinejoin="round"
          />
          <path d="M12 6V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 12H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      {!iconOnly && (
        <div className="flex items-baseline gap-0">
          <span className="font-headline text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
            TURF
          </span>
          <span className="font-headline text-2xl font-black tracking-tighter text-primary uppercase italic leading-none drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
            ISTA
          </span>
        </div>
      )}
    </div>
  );
}
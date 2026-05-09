
'use client';

import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function TurfistaLogo({ className, iconOnly = false, size = "md" }: { className?: string; iconOnly?: boolean; size?: "sm" | "md" | "lg" | "xl" }) {
  const db = useFirestore();
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);
  const { data: branding } = useDoc(brandingRef);

  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
    xl: "h-20"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-5xl"
  };

  if (branding?.logoUrl) {
    return (
      <div className={cn("flex items-center group cursor-pointer", className)}>
        <img 
          src={branding.logoUrl} 
          alt="Logo" 
          className={cn(
            "object-contain transition-transform group-hover:scale-105", 
            sizeClasses[size],
            "drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]"
          )} 
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 group cursor-pointer", className)}>
      <div className={cn(
        "relative bg-primary rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
        size === "xl" ? "h-16 w-16" : "h-10 w-10"
      )}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className={cn("text-black", size === "xl" ? "h-10 w-10" : "h-6 w-6")}
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
        <div className="flex items-baseline gap-0 select-none">
          <span className={cn(
            "font-headline font-black tracking-tighter text-white uppercase italic leading-none",
            textSizes[size]
          )}>
            TURF
          </span>
          <span className={cn(
            "font-headline font-black tracking-tighter text-primary uppercase italic leading-none drop-shadow-[0_0_20px_rgba(57,255,20,0.6)]",
            textSizes[size]
          )}>
            ISTA
          </span>
        </div>
      )}
    </div>
  );
}

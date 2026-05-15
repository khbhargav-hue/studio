
'use client';

import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Image from "next/image";

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
    sm: "text-[20px]",
    md: "text-[24px]",
    lg: "text-[32px]",
    xl: "text-[48px]"
  };

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className={cn(
        "bg-primary rounded-[8px] flex items-center justify-center overflow-hidden",
        size === "sm" ? "h-8 w-8" : "h-10 w-10"
      )}>
        {branding?.logoUrl ? (
          <img 
            src={branding.logoUrl} 
            alt="Logo" 
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-background h-6 w-6"
          >
            <path 
              d="M12 2L4 5V11C4 16.1 7.4 20.9 12 22C16.6 20.9 20 16.1 20 11V5L12 2Z" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {!iconOnly && (
        <div className={cn("font-bold tracking-tight text-foreground uppercase italic", textSizes[size])}>
          TURF<span className="text-primary">ISTA</span>
        </div>
      )}
    </div>
  );
}

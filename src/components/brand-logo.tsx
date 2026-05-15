'use client';

import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * TurfistaLogo
 * Central logo component that fetches branding from Firestore.
 * Ensures the brand identity is permanent and consistent globally.
 */
export function TurfistaLogo({ className, iconOnly = false, size = "md" }: { className?: string; iconOnly?: boolean; size?: "sm" | "md" | "lg" | "xl" }) {
  const db = useFirestore();
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const { data: branding } = useDoc(brandingRef);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  const textSizes = {
    sm: "text-[20px]",
    md: "text-[24px]",
    lg: "text-[32px]",
    xl: "text-[48px]"
  };

  // Cloudinary Optimization for Logo
  const logoSrc = branding?.logoUrl 
    ? (branding.logoUrl.includes('cloudinary.com') 
        ? branding.logoUrl.replace('/upload/', '/upload/f_auto,q_auto,w_200/') 
        : branding.logoUrl)
    : null;

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className={cn(
        "bg-primary rounded-[10px] flex items-center justify-center overflow-hidden transition-all",
        sizeClasses[size]
      )}>
        {logoSrc ? (
          <img 
            src={logoSrc} 
            alt="Turfista Logo" 
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-black h-3/5 w-3/5"
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
        <div className={cn("font-black tracking-tighter text-foreground uppercase italic", textSizes[size])}>
          TURF<span className="text-primary">ISTA</span>
        </div>
      )}
    </div>
  );
}

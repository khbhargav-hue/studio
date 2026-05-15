'use client';

import { useState, useEffect } from "react";
import { X, ExternalLink, Zap } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where, limit, doc, updateDoc, increment } from "firebase/firestore";
import { cn } from "@/lib/utils";

export function HeroBannerAd() {
  const db = useFirestore();
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('turfista_hero_ad_dismissed');
    if (dismissed) setIsDismissed(true);
  }, []);

  const adsQuery = collection(db, "ads");
  const bannerQuery = query(adsQuery, where("placement", "==", "hero_banner"), where("isActive", "==", true), limit(1));
  const { data: ads } = useCollection(bannerQuery);

  const ad = ads?.[0] as any;

  if (!ad || isDismissed || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('turfista_hero_ad_dismissed', 'true');
  };

  const handleClick = () => {
    if (!db) return;
    const adRef = doc(db, "ads", ad.id);
    updateDoc(adRef, { clickCount: increment(1) });
    window.open(ad.targetUrl, '_blank');
  };

  return (
    <div className="w-full bg-[#111] border-b border-[#222] py-3 px-4 relative group animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div 
          className="flex-1 flex items-center gap-4 cursor-pointer"
          onClick={handleClick}
        >
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
            <p className="text-[12px] font-black uppercase italic text-white truncate">
              {ad.title}
            </p>
            <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest truncate">
              {ad.description || "Check out the latest sports gear and coaching batches in Mysuru."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden md:block text-[9px] font-black text-[#444] uppercase tracking-[0.2em]">Sponsored</span>
          <button 
            onClick={handleDismiss}
            className="h-8 w-8 flex items-center justify-center text-[#444] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

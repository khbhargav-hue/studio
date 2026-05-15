'use client';

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase";

interface AdCardProps {
  ad: {
    id: string;
    title: string;
    imageUrl: string;
    targetUrl: string;
    description?: string;
  };
}

export function ListingAdCard({ ad }: AdCardProps) {
  const db = useFirestore();

  const handleAdClick = () => {
    if (!db) return;
    const adRef = doc(db, "ads", ad.id);
    updateDoc(adRef, { clickCount: increment(1) });
    window.open(ad.targetUrl, '_blank');
  };

  const displayImage = ad.imageUrl.includes('cloudinary.com') 
    ? ad.imageUrl.replace('/upload/', '/upload/f_webp,w_800,q_75/') 
    : ad.imageUrl;

  return (
    <div className="group relative bg-[#111111] border border-[#222222] rounded-[16px] overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[16/10] w-full bg-[#1A1A1A] overflow-hidden">
        <Image
          src={displayImage}
          alt={ad.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-[4px] border border-white/10">
          <span className="text-[10px] font-black text-[#888] uppercase tracking-widest">Sponsored</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-[16px] font-bold text-[#F5F5F5] uppercase italic tracking-tighter mb-2">
          {ad.title}
        </h3>
        <p className="text-[13px] text-[#888] leading-relaxed italic mb-6 line-clamp-2">
          {ad.description || "Local sports equipment and premium gear available at exclusive rates for Turfista athletes."}
        </p>
        
        <Button 
          onClick={handleAdClick}
          className="mt-auto w-full h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[11px] font-black uppercase tracking-widest rounded-[10px]"
        >
          Learn More <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

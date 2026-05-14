'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Turf } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import * as gtag from "@/lib/gtag";
import { cn } from "@/lib/utils";

interface TurfCardProps {
  turf: Turf
}

export function TurfCard({ turf }: TurfCardProps) {
  const db = useFirestore();
  const [isThrottled, setIsThrottled] = useState(false);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    if (!db || !turf.id) return;
    gtag.event({ action: 'generate_lead', category: 'Booking', label: turf.name, value: 1 });

    if (isThrottled) return;
    setIsThrottled(true);
    setTimeout(() => setIsThrottled(false), 5000);

    const leadData = {
      turfId: turf.id,
      turfName: turf.name,
      area: turf.area,
      sportType: turf.sports?.[0] || 'Unknown',
      timestamp: serverTimestamp(),
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 150) : 'Unknown',
    };

    addDoc(collection(db, "leads"), leadData);
    setDoc(doc(db, "turfs", turf.id), { whatsappClicks: increment(1) }, { merge: true });
    setDoc(doc(db, "analytics", "stats"), { totalWhatsAppClicks: increment(1) }, { merge: true });
  };

  // Cloudinary Optimization Flag Injector
  const displayImage = turf.imageUrl 
    ? turf.imageUrl.includes('cloudinary.com') 
      ? turf.imageUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/') 
      : turf.imageUrl
    : "https://picsum.photos/seed/turf-placeholder/800/600";

  const whatsappUrl = `https://wa.me/${turf.whatsapp}?text=${encodeURIComponent(`Hi! I want to book ${turf.name}`)}`;

  return (
    <div className={cn(
      "flat-card flex flex-col group h-full",
      turf.isPremium && "border-primary/40 ring-1 ring-primary/10 bg-gradient-to-b from-card to-card"
    )}>
      <div className="relative aspect-[16/10] w-full rounded-[14px] overflow-hidden mb-6 bg-surface shadow-2xl">
        <Image
          src={displayImage}
          alt={`Book ${turf.name} - ${turf.sports?.join(', ')} turf in ${turf.area}`}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {turf.isPremium && (
          <div className="absolute top-4 left-4 bg-primary text-background label-caps px-4 py-1.5 rounded-[8px] font-black shadow-2xl">
            Featured
          </div>
        )}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 border border-border">
          <span className="text-[14px] font-bold">{turf.rating || 4.5}</span>
          <Star className="h-3.5 w-3.5 text-primary fill-current" />
        </div>
      </div>

      <CardContent className="p-0 flex-1 flex flex-col space-y-5">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {turf.sports?.slice(0, 3).map((s) => (
              <span key={s} className="label-caps text-[10px] bg-white/5 text-muted-foreground px-3 py-1 rounded-[6px] border border-border">
                {s}
              </span>
            ))}
          </div>
          <Link href={`/turf/${turf.id}`}>
            <h3 className="text-[20px] font-bold hover:text-primary mb-1 line-clamp-1 transition-colors uppercase tracking-tight">
              {turf.name}
            </h3>
          </Link>
          <div className="flex items-center text-muted-foreground text-[14px] gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{turf.area}, Mysuru</span>
          </div>
        </div>

        <div className="pt-5 border-t border-white/5 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[24px] font-black text-primary">₹{turf.pricePerHour}</span>
            <span className="text-muted text-[11px] font-bold uppercase tracking-widest">/ hr</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted tracking-widest bg-white/5 px-3 py-1 rounded-full">
            <Zap className="h-3 w-3 text-primary" /> Verified
          </div>
        </div>

        <Button 
          asChild 
          onClick={handleWhatsAppClick}
          className="whatsapp-btn w-full h-[54px] mt-4 shadow-xl shadow-green-500/10 hover:scale-[1.02] transition-all text-base font-bold"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" /> BOOK ON WHATSAPP
          </a>
        </Button>
      </CardContent>
    </div>
  );
}

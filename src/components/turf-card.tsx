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

  const displayImage = turf.imageUrl || "https://picsum.photos/seed/turf-placeholder/800/600";
  const whatsappUrl = `https://wa.me/${turf.whatsapp}?text=${encodeURIComponent(`Hi! I want to book ${turf.name}`)}`;

  return (
    <div className={cn(
      "flat-card flex flex-col group",
      turf.isPremium && "border-primary/50 ring-1 ring-primary/10"
    )}>
      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-6 bg-surface">
        <Image
          src={displayImage}
          alt={turf.name}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {turf.isPremium && (
          <div className="absolute top-3 left-3 bg-primary text-black label-caps px-3 py-1 rounded-[6px] font-bold shadow-2xl">
            Featured
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md px-3 py-1 rounded-[6px] flex items-center gap-1.5 border border-border">
          <span className="text-[13px] font-bold">{turf.rating || 4.5}</span>
          <Star className="h-3 w-3 text-primary fill-current" />
        </div>
      </div>

      <CardContent className="p-0 flex-1 flex flex-col space-y-4">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {turf.sports?.slice(0, 2).map((s) => (
              <span key={s} className="label-caps text-[9px] bg-surface text-muted px-2 py-0.5 rounded-[4px] border border-border">
                {s}
              </span>
            ))}
          </div>
          <Link href={`/turf/${turf.id}`}>
            <h3 className="text-[18px] font-bold hover:text-primary mb-1 line-clamp-1 transition-colors uppercase italic tracking-tight">
              {turf.name}
            </h3>
          </Link>
          <div className="flex items-center text-muted text-[13px] gap-1 font-medium">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{turf.area}, Mysuru</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-[20px] font-black text-primary italic">₹{turf.pricePerHour}</span>
            <span className="text-muted text-[11px] label-caps">/ hr</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-muted">
            <Zap className="h-3 w-3 text-primary" /> Instant
          </div>
        </div>

        <Button 
          asChild 
          onClick={handleWhatsAppClick}
          className="whatsapp-btn w-full h-[48px] mt-4 shadow-xl shadow-green-500/10 hover:scale-[1.02] transition-all"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" /> BOOK NOW
          </a>
        </Button>
      </CardContent>
    </div>
  );
}
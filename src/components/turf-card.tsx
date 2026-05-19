
'use client';

import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Clock, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Turf } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TurfCardProps {
  turf: Turf;
}

export function TurfCard({ turf }: TurfCardProps) {
  const whatsappUrl = `https://wa.me/${turf.whatsapp}?text=${encodeURIComponent(`Hi! I found ${turf.name} on Turfista and want to ask availability.`)}`;
  const displayImage = turf.imageUrl || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=75";

  return (
    <div className="group bg-card border border-border flex flex-col h-full hover:border-primary/40 transition-all duration-200">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <Image
          src={displayImage}
          alt={turf.name}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {turf.isPremium && (
            <div className="bg-primary text-black text-[8px] font-black uppercase px-2 py-0.5 tracking-widest">
              Elite
            </div>
          )}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-[10px] font-black text-white rounded-[4px] backdrop-blur-sm">
          ★ {turf.rating || 4.5}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/turf/${turf.id}`}>
          <h3 className="text-base font-black uppercase italic tracking-tighter hover:text-primary mb-1 truncate transition-colors">
            {turf.name}
          </h3>
        </Link>
        
        <div className="flex items-center text-[#888] text-[11px] gap-1 mb-4 font-bold uppercase tracking-tight italic">
          <MapPin className="h-3 w-3 text-primary" />
          <span>{turf.area}</span>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#444]">
            <Clock className="h-3 w-3 text-primary" />
            <span>{turf.openTime} — {turf.closeTime}</span>
          </div>
          <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest bg-white/5 px-2 py-1 w-fit border border-white/5">
            {turf.sports?.slice(0, 2).join(" • ")}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-border">
          <p className="text-[10px] font-black uppercase text-[#444] tracking-widest italic">
            Price may vary • Ask before booking
          </p>
          <Button 
            asChild 
            className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-none shadow-2xl shadow-primary/10 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" /> Ask availability
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

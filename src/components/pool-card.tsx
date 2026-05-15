
'use client';

import Image from "next/image";
import { 
  Star, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Navigation,
  Waves,
  UserCheck,
  Users2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pool } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PoolCardProps {
  pool: Pool;
}

export function PoolCard({ pool }: PoolCardProps) {
  const displayImage = pool.imageUrl || `https://picsum.photos/seed/${pool.id}/800/600`;
  const whatsappUrl = `https://wa.me/${pool.whatsapp}?text=${encodeURIComponent(`Hi! I want to book a session at ${pool.name}.`)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pool.address || `${pool.name} ${pool.area}`)}`;

  return (
    <div className="group relative bg-[#111111] border border-[#222222] rounded-[16px] overflow-hidden transition-all duration-150 ease-in-out hover:border-[#AAFF00]/30 flex flex-col h-full">
      {/* 1. Image & Badges */}
      <div className="relative aspect-[16/10] w-full bg-[#1A1A1A] overflow-hidden">
        <Image
          src={displayImage}
          alt={pool.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        
        {/* Top-Left: Type Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {pool.poolTypes?.slice(0, 2).map((t) => (
            <div key={t} className="bg-[#AAFF00] text-[#0A0A0A] text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-[6px]">
              {t}
            </div>
          ))}
        </div>

        {/* Bottom-Right: Rating */}
        <div className="absolute bottom-3 right-3 bg-[#0A0A0A]/80 backdrop-blur-md px-2 py-1 rounded-[6px] flex items-center gap-1 border border-[#222222]">
          <span className="text-[12px] font-bold text-[#F5F5F5]">★{pool.rating || 4.2}</span>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-[18px] font-bold text-[#F5F5F5] uppercase italic tracking-tighter mb-1 line-clamp-1">
          {pool.name}
        </h3>
        
        <div className="flex items-center text-[#888888] text-[13px] gap-1 mb-4 italic">
          <MapPin className="h-3 w-3 text-[#AAFF00]" />
          <span>{pool.area}, Mysuru</span>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight text-white/60">
            <UserCheck className="h-3.5 w-3.5 text-[#AAFF00]" />
            <span>{pool.coachingAvailable ? "Coaching Available" : "No Coaching"}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight text-white/60">
            <Users2 className="h-3.5 w-3.5 text-[#AAFF00]" />
            <span>{pool.genderPolicy}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight text-white/60">
            <Clock className="h-3.5 w-3.5 text-[#AAFF00]" />
            <span>{pool.openTime}–{pool.closeTime}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight text-white/60">
            <Waves className="h-3.5 w-3.5 text-[#AAFF00]" />
            <span>{pool.poolTypes.join(", ")}</span>
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="mt-auto pt-5 border-t border-[#222222] flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-black text-[#AAFF00] italic">₹{pool.entryFee}</span>
              <span className="text-[#888888] text-[10px] font-bold uppercase">/ {pool.feeType || 'session'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#AAFF00]">
            <div className="h-1.5 w-1.5 bg-[#AAFF00] rounded-full animate-pulse" />
            Open Now
          </div>
        </div>

        {/* Action Buttons Quad */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <Button 
            asChild 
            className="bg-[#25D366] text-white hover:bg-[#20ba5a] text-[10px] font-black uppercase h-[44px] rounded-[10px]"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
            </a>
          </Button>
          <Button 
            asChild
            variant="outline"
            className="border-[#222222] text-[#888888] hover:border-[#888888] text-[10px] font-black uppercase h-[44px] rounded-[10px]"
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4 mr-2" /> Directions
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

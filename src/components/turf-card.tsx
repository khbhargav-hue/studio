'use client';

import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  MapPin, 
  MessageCircle, 
  Calendar, 
  Navigation, 
  Heart,
  Clock,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Turf } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TurfCardProps {
  turf: Turf;
}

export function TurfCard({ turf }: TurfCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Cloudinary Optimization Flag Injector
  const displayImage = turf.imageUrl 
    ? (turf.imageUrl.includes('cloudinary.com') 
        ? turf.imageUrl.replace('/upload/', '/upload/f_webp,w_800,q_75/') 
        : turf.imageUrl)
    : "https://picsum.photos/seed/turf-placeholder/800/600";

  const whatsappUrl = `https://wa.me/${turf.whatsapp}?text=${encodeURIComponent(`Hi! I want to book ${turf.name} at ${turf.area}.`)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(turf.address || `${turf.name} ${turf.area}`)}`;

  return (
    <div className="group relative bg-[#111111] border border-[#222222] rounded-[16px] overflow-hidden transition-all duration-150 ease-in-out hover:border-[#AAFF00]/30 flex flex-col h-full">
      {/* 1. Image & Badges Overlay */}
      <div className="relative aspect-[16/10] w-full bg-[#1A1A1A] overflow-hidden">
        <Image
          src={displayImage}
          alt={turf.name}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Top-Left: Sport Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {turf.sports?.slice(0, 1).map((s) => (
            <div key={s} className="bg-[#AAFF00] text-[#0A0A0A] text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-[6px]">
              {s}
            </div>
          ))}
        </div>

        {/* Top-Right: Featured Badge */}
        {turf.isPremium && (
          <div className="absolute top-3 right-3 bg-[#AAFF00] text-[#0A0A0A] text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-[6px] animate-pulse">
            FEATURED
          </div>
        )}

        {/* Bottom-Right: Rating */}
        <div className="absolute bottom-3 right-3 bg-[#0A0A0A]/80 backdrop-blur-md px-2 py-1 rounded-[6px] flex items-center gap-1 border border-[#222222]">
          <span className="text-[12px] font-bold text-[#F5F5F5]">★{turf.rating || 4.5}</span>
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <Link href={`/turf/${turf.id}`} className="flex-1">
            <h3 className="text-[16px] font-semibold text-[#F5F5F5] hover:text-[#AAFF00] transition-colors line-clamp-1">
              {turf.name}
            </h3>
          </Link>
          <button 
            onClick={() => setIsSaved(!isSaved)}
            className="text-[#888888] hover:text-[#FF4444] transition-colors p-1"
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-[#FF4444] text-[#FF4444]")} />
          </button>
        </div>

        <div className="flex items-center text-[#888888] text-[13px] gap-1 mb-4">
          <MapPin className="h-3 w-3 text-[#AAFF00]" />
          <span>{turf.area}, Mysuru</span>
        </div>

        {/* Sport Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {turf.sports?.map((s) => (
            <span key={s} className="text-[10px] font-bold uppercase tracking-tight text-[#AAFF00] bg-[#AAFF00]/5 px-2 py-0.5 rounded-[4px] border border-[#AAFF00]/20">
              {s}
            </span>
          ))}
        </div>

        {/* Metadata Stack */}
        <div className="grid grid-cols-2 gap-y-2 mb-4 text-[12px] text-[#888888]">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{turf.openTime}–{turf.closeTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3" />
            <span>Max {turf.maxPlayers}</span>
          </div>
          <div className="col-span-2 text-[#F5F5F5]">
            <span className="opacity-60">Pitch:</span> {turf.pitchSizes?.join(', ') || 'Standard'}
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="mt-auto pt-4 border-t border-[#222222] flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-black text-[#AAFF00]">₹{turf.pricePerHour}</span>
              <span className="text-[#888888] text-[10px] font-bold uppercase">/hr</span>
            </div>
            {turf.peakHourPrice > 0 && (
              <span className="text-[10px] text-[#888888]">₹{turf.peakHourPrice} peak</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#AAFF00]">
            <div className="h-1.5 w-1.5 bg-[#AAFF00] rounded-full animate-pulse" />
            Available Today
          </div>
        </div>

        {/* 3. Action Buttons Quad */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            asChild 
            className="bg-[#25D366] text-white hover:bg-[#20ba5a] text-[11px] font-black uppercase h-[40px] rounded-[10px]"
            title="Book via WhatsApp"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
            </a>
          </Button>
          <Button 
            asChild
            variant="secondary"
            className="bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#222] text-[11px] font-black uppercase h-[40px] rounded-[10px]"
            title="Check availability slots"
          >
            <Link href={`/turf/${turf.id}#slots`}>
              <Calendar className="h-3.5 w-3.5 mr-1" /> Slots
            </Link>
          </Button>
          <Button 
            asChild
            variant="outline"
            className="border-[#222222] text-[#888888] hover:border-[#888888] text-[11px] font-black uppercase h-[40px] rounded-[10px]"
            title="Get directions on Google Maps"
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-3.5 w-3.5 mr-1" /> Directions
            </a>
          </Button>
          <Button 
            asChild
            variant="outline"
            className="border-[#F5F5F5]/20 text-[#F5F5F5] hover:border-[#F5F5F5] text-[11px] font-black uppercase h-[40px] rounded-[10px]"
            title="Rate this arena"
          >
            <Link href={`/turf/${turf.id}#reviews`}>
              <Star className="h-3.5 w-3.5 mr-1" /> Rate
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

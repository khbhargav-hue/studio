'use client';

import Link from "next/link";
import { MapPin, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TurfCardProps {
  turf: any;
}

const ERROR_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%231A1A1A'/%3E%3Ctext x='50%25' y='50%25' fill='%23444' text-anchor='middle' font-size='40'%3E⚽%3C/text%3E%3C/svg%3E";

const optimizeUrl = (url: string) => {
  if (!url) return url;
  return url.includes('cloudinary.com') ? `${url}?w=400&q=60&f=webp` : url;
};

export function TurfCard({ turf }: TurfCardProps) {
  const phone = turf.contactNumber?.replace(/\D/g, "") || "";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`Hi! I want to book ${turf.name}`)}`;
  const displayImage = optimizeUrl(turf.imageUrl || "");
  
  const price = turf.courtPricing?.["5A Side"] || turf.pricePerHour || "Call";
  const amenitiesList = Array.isArray(turf.amenities) ? turf.amenities.join(" · ") : "";
  const coachingList = Array.isArray(turf.coachingServices) ? turf.coachingServices.join(", ") : "";

  return (
    <div className="group bg-[#111] border border-[#222] rounded-[12px] overflow-hidden flex flex-col h-full transition-all duration-200 hover:border-primary/40">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <img
          src={displayImage}
          alt={turf.name}
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.target as any).src = ERROR_IMAGE }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {turf.isPremium && (
          <div className="absolute top-2 left-2 bg-primary text-black text-[8px] font-black uppercase px-2 py-0.5 tracking-widest">
            Elite
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-[10px] font-black text-white rounded-[4px] backdrop-blur-sm">
          ★ {turf.rating || 4.5}
        </div>
      </div>

      <div className="p-[14px] flex-1 flex flex-col">
        <Link href={`/turf/${turf.id}`}>
          <h3 className="text-[15px] font-bold text-white mb-1 truncate hover:text-primary transition-colors uppercase italic tracking-tighter">
            {turf.name}
          </h3>
        </Link>
        
        <div className="flex items-center text-[#888] text-[13px] gap-1 mb-3 italic">
          <MapPin className="h-3 w-3 text-primary" />
          <span>{turf.area}</span>
        </div>

        <div className="space-y-2 mb-4">
          {amenitiesList && (
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 w-fit border border-white/5 rounded-[4px]">
              {amenitiesList}
            </p>
          )}
          {coachingList && (
            <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.1em] italic">
              Coaching: {coachingList}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Pricing</span>
            <span className="text-[15px] font-black text-primary italic leading-none">
              {typeof price === 'number' ? `₹${price}/hr` : price}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[13px] text-yellow-500 font-black italic">
             ★ {turf.rating || "4.5"}
          </div>
        </div>
      </div>

      <button
        onClick={() => window.open(whatsappUrl, "_blank")}
        className="w-full bg-[#25D366] text-white py-[14px] text-[14px] font-black uppercase tracking-widest transition-all active:scale-[0.98] hover:bg-[#20ba5a] flex items-center justify-center gap-2"
      >
        <MessageCircle className="h-4 w-4" /> Book on WhatsApp
      </button>
    </div>
  );
}


"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, MessageCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Turf } from "@/lib/types"
import { useFirestore } from "@/firebase"
import { doc, setDoc, increment } from "firebase/firestore"
import { useMemo } from "react"

interface TurfCardProps {
  turf: Turf
}

export function TurfCard({ turf }: TurfCardProps) {
  const db = useFirestore()

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    if (db && turf.id) {
      const turfRef = doc(db, "turfs", turf.id)
      const statsRef = doc(db, "analytics", "stats")
      
      setDoc(turfRef, { whatsappClicks: increment(1) }, { merge: true }).catch(() => {});
      setDoc(statsRef, { totalWhatsAppClicks: increment(1) }, { merge: true }).catch(() => {});
    }
  }

  const pricingDetails = useMemo(() => {
    const pricing = turf.courtPricing || {};
    const halfKey = Object.keys(pricing).find(k => k.toLowerCase().includes('half'));
    const fullKey = Object.keys(pricing).find(k => k.toLowerCase().includes('full'));
    
    return {
      half: halfKey ? pricing[halfKey] : null,
      full: fullKey ? pricing[fullKey] : null,
      default: turf.pricePerHour
    };
  }, [turf.courtPricing, turf.pricePerHour]);

  const message = `Hi, I found ${turf.name} in ${turf.area} on Turfista and would like to inquire about booking a slot for ${turf.sportTypes?.[0] || 'a game'}.`
  const whatsappUrl = `https://wa.me/${turf.whatsappNumber}?text=${encodeURIComponent(message)}`

  // Use uploaded mainImage with Cloudinary optimization params, then fallbacks
  const rawImage = turf.mainImage || (turf.galleryImages && turf.galleryImages[0]) || "https://picsum.photos/seed/turf-placeholder/800/600";
  
  // Apply Cloudinary optimization if applicable
  const displayImage = rawImage.includes('cloudinary.com') 
    ? rawImage.replace('/upload/', '/upload/f_auto,q_auto,w_800/') 
    : rawImage;

  return (
    <Card className="group relative overflow-hidden border-none bg-secondary/40 glass-card rounded-2xl flex flex-col h-full hover:scale-[1.02] transition-all duration-500 shadow-2xl">
      <Link href={`/turf/${turf.id}`} className="block relative aspect-[16/10] overflow-hidden rounded-t-2xl" aria-label={`View details for ${turf.name}`}>
        <Image
          src={displayImage}
          alt={`Exterior view of ${turf.name} sports turf in ${turf.area}, Mysuru`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute left-4 top-4">
          <Badge className="bg-primary text-black font-black px-3 py-1 text-[10px] rounded-md shadow-[0_0_15px_rgba(57,255,20,0.3)] border-none">
            {turf.rating || 4.5} <Star className="ml-1 h-3 w-3 fill-current" />
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
          {(turf.sportTypes || []).slice(0, 3).map((sport) => (
            <Badge key={sport} variant="secondary" className="bg-black/80 border-white/5 text-[8px] font-black uppercase tracking-widest text-primary px-2 py-0.5">
              {sport}
            </Badge>
          ))}
        </div>
      </Link>

      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="mb-6">
          <Link href={`/turf/${turf.id}`}>
            <h3 className="text-2xl mb-1 group-hover:text-primary transition-colors italic">
              {turf.name}
            </h3>
            <div className="flex items-center text-white/40 text-[9px] font-black uppercase tracking-[0.2em] gap-1.5">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{turf.area}, MYSURU</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
            <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mb-1">Standard</p>
            <p className="text-lg font-black text-white">
              ₹{pricingDetails.half || pricingDetails.default}
              <span className="text-[10px] text-white/30 font-medium ml-1">/HR</span>
            </p>
          </div>
          <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 group-hover:bg-primary/10 transition-colors">
            <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest mb-1">Premier</p>
            <p className="text-lg font-black text-primary">
              {pricingDetails.full ? `₹${pricingDetails.full}` : '₹' + (pricingDetails.default + 400)}
              <span className="text-[10px] text-primary/40 font-medium ml-1">/HR</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-auto">
          <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
            <Clock className="h-3 w-3 text-primary" />
            <span>{turf.openingHours?.includes('24') ? '24/7 ACCESS' : 'TIMED ENTRY'}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          asChild 
          onClick={handleWhatsAppClick}
          aria-label={`Book ${turf.name} via WhatsApp`}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_20px_-5px_rgba(57,255,20,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(57,255,20,0.5)] hover:scale-[1.02] border-none"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Quick Book
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

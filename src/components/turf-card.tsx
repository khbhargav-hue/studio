
"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, MessageCircle, Clock, Maximize, Trophy, IndianRupee } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Turf } from "@/lib/types"
import { useFirestore } from "@/firebase"
import { doc, updateDoc, increment } from "firebase/firestore"
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
      
      updateDoc(turfRef, { whatsappClicks: increment(1) }).catch(() => {});
      updateDoc(statsRef, { totalWhatsAppClicks: increment(1) }).catch(() => {});
    }
  }

  const pricingDetails = useMemo(() => {
    const pricing = turf.courtPricing || {};
    // Find keys that contain 'Half' or 'Full'
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

  return (
    <Card className="group relative overflow-hidden border-none bg-[#121212] transition-all duration-300 hover:ring-2 hover:ring-primary/40 rounded-[2rem] flex flex-col h-full">
      <Link href={`/turf/${turf.id}`} className="block relative aspect-[16/10] overflow-hidden">
        {turf.images?.[0] ? (
          <Image
            src={turf.images[0]}
            alt={turf.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-primary opacity-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute left-4 top-4">
          <Badge className="bg-primary text-primary-foreground font-black px-2.5 py-1 text-[10px] rounded-lg">
            {turf.rating || 4.5} <Star className="ml-1 h-3 w-3 fill-current" />
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
          {(turf.sportTypes || []).slice(0, 3).map((sport) => (
            <Badge key={sport} variant="secondary" className="bg-black/60 backdrop-blur-md border-white/5 text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5">
              {sport}
            </Badge>
          ))}
        </div>
      </Link>

      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <Link href={`/turf/${turf.id}`}>
            <h3 className="font-headline text-xl font-bold group-hover:text-primary transition-colors line-clamp-1 leading-tight mb-1">
              {turf.name}
            </h3>
            <div className="flex items-center text-white/40 text-[10px] font-bold uppercase tracking-widest gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{turf.area}</span>
            </div>
          </Link>
        </div>

        {/* Dynamic Pricing Breakdown */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <p className="text-[8px] text-white/30 font-black uppercase tracking-tighter mb-0.5">Half Court</p>
            <p className="text-sm font-black text-white">
              {pricingDetails.half ? `₹${pricingDetails.half}` : `₹${pricingDetails.default}`}
              <span className="text-[9px] text-white/40 font-normal ml-1">/hr</span>
            </p>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/5">
            <p className="text-[8px] text-white/30 font-black uppercase tracking-tighter mb-0.5">Full Court</p>
            <p className="text-sm font-black text-primary">
              {pricingDetails.full ? `₹${pricingDetails.full}` : 'N/A'}
              {pricingDetails.full && <span className="text-[9px] text-primary/60 font-normal ml-1">/hr</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto">
          <Badge variant="outline" className="border-white/5 text-white/40 text-[9px] py-0 px-2 h-6 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {turf.openingHours?.includes('24') ? '24/7' : turf.openingHours || 'N/A'}
          </Badge>
          {(turf.courtTypes || []).slice(0, 1).map(court => (
            <Badge key={court} variant="outline" className="border-white/5 text-white/40 text-[9px] py-0 px-2 h-6 flex items-center gap-1">
              <Maximize className="h-2.5 w-2.5" />
              {court}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button 
          asChild 
          onClick={handleWhatsAppClick}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-lg shadow-primary/10"
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

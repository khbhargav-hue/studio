
"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, MessageCircle, Clock, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Turf } from "@/lib/types"
import { useFirestore } from "@/firebase"
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useMemo } from "react"

interface TurfCardProps {
  turf: Turf
}

export function TurfCard({ turf }: TurfCardProps) {
  const db = useFirestore()

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    if (!db || !turf.id) return

    // Track lead information
    const leadData = {
      turfId: turf.id,
      turfName: turf.name,
      area: turf.area,
      sportType: turf.sportTypes?.[0] || 'Unknown',
      timestamp: serverTimestamp(),
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    }

    // Fire and forget - don't block the user experience
    addDoc(collection(db, "leads"), leadData).catch(console.error)
    
    const turfRef = doc(db, "turfs", turf.id)
    const statsRef = doc(db, "analytics", "stats")
    
    setDoc(turfRef, { whatsappClicks: increment(1) }, { merge: true }).catch(() => {});
    setDoc(statsRef, { totalWhatsAppClicks: increment(1) }, { merge: true }).catch(() => {});
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

  const message = `Hi, I found ${turf.name} in ${turf.area} on Turfista and would like to inquire about booking a slot.`
  const whatsappUrl = `https://wa.me/${turf.whatsappNumber}?text=${encodeURIComponent(message)}`

  const rawImage = turf.mainImage || (turf.galleryImages && turf.galleryImages[0]) || "https://picsum.photos/seed/turf-placeholder/800/600";
  const displayImage = rawImage.includes('cloudinary.com') 
    ? rawImage.replace('/upload/', '/upload/f_auto,q_auto,w_800/') 
    : rawImage;

  return (
    <Card className="group relative overflow-hidden border-none bg-secondary/40 glass-card rounded-[2.5rem] flex flex-col h-full hover:scale-[1.03] transition-all duration-700 shadow-2xl">
      <Link href={`/turf/${turf.id}`} className="block relative aspect-[14/11] overflow-hidden rounded-t-[2.5rem]">
        <Image
          src={displayImage}
          alt={turf.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        
        <div className="absolute left-6 top-6">
          <Badge className="bg-primary text-black font-black px-4 py-1.5 text-[10px] rounded-xl shadow-2xl border-none">
            {turf.rating || 4.5} <Star className="ml-1.5 h-3.5 w-3.5 fill-current" />
          </Badge>
        </div>

        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
          {turf.isPopular && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] font-black uppercase tracking-widest px-3 py-1 backdrop-blur-md">
              <Zap className="h-3 w-3 mr-1 fill-current" /> Featured
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-8 flex-1 flex flex-col">
        <div className="mb-8">
          <Link href={`/turf/${turf.id}`}>
            <h3 className="text-3xl mb-2 group-hover:text-primary transition-colors italic font-black uppercase tracking-tighter leading-none">
              {turf.name}
            </h3>
            <div className="flex items-center text-white/30 text-[10px] font-black uppercase tracking-widest gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>{turf.area}, MYSURU</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Base Price</p>
            <p className="text-2xl font-black italic text-white leading-none">
              ₹{pricingDetails.half || pricingDetails.default}
            </p>
          </div>
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 group-hover:bg-primary/10 transition-colors">
            <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest mb-1">Peak Rate</p>
            <p className="text-2xl font-black italic text-primary leading-none">
              ₹{pricingDetails.full ? pricingDetails.full : (pricingDetails.default + 400)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-auto">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>{turf.openingHours || 'Schedule in portal'}</span>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0">
        <Button 
          asChild 
          onClick={handleWhatsAppClick}
          className="w-full h-16 bg-primary hover:bg-primary/90 text-black font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:shadow-primary/20 hover:scale-[1.02] border-none"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-3 h-5 w-5" />
            Book Now
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

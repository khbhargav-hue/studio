
"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  Loader2,
  Zap,
  IndianRupee,
  Navigation
} from "lucide-react"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { doc, increment, setDoc } from "firebase/firestore"
import { useEffect, useMemo, useRef, useState } from "react"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { motion, AnimatePresence } from "framer-motion"

export default function TurfDetail() {
  const { id } = useParams()
  const router = useRouter()
  const db = useFirestore()
  const hasIncremented = useRef(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "turfs", id as string)
  }, [db, id])

  const { data: turf, loading } = useDoc(turfDocRef)

  useEffect(() => {
    if (db && id && !hasIncremented.current) {
      hasIncremented.current = true;
      const statsRef = doc(db, "analytics", "stats")
      const turfRef = doc(db, "turfs", id as string)
      
      setDoc(turfRef, { views: increment(1) }, { merge: true }).catch(() => {});
      setDoc(statsRef, { totalViews: increment(1) }, { merge: true }).catch(() => {});
    }
  }, [db, id])

  const handleWhatsAppClick = () => {
    if (db && id) {
      const turfRef = doc(db, "turfs", id as string)
      const statsRef = doc(db, "analytics", "stats")
      setDoc(turfRef, { whatsappClicks: increment(1) }, { merge: true }).catch(() => {});
      setDoc(statsRef, { totalWhatsAppClicks: increment(1) }, { merge: true }).catch(() => {});
    }
  }

  const allImages = useMemo(() => {
    if (!turf) return [];
    const images = [];
    if (turf.mainImage) images.push(turf.mainImage);
    if (turf.galleryImages && turf.galleryImages.length > 0) {
      images.push(...turf.galleryImages);
    }
    return images.length > 0 ? images : ["https://picsum.photos/seed/turf-placeholder/1200/800"];
  }, [turf]);

  const minPrice = useMemo(() => {
    if (turf?.courtPricing && Object.keys(turf.courtPricing).length > 0) {
      return Math.min(...Object.values(turf.courtPricing));
    }
    return turf?.pricePerHour || 0;
  }, [turf?.courtPricing, turf?.pricePerHour]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!turf) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="glass-card p-16 rounded-3xl text-center">
            <Zap className="h-20 w-20 text-primary opacity-20 mx-auto mb-6" />
            <h1 className="text-4xl mb-4">ARENA <span className="text-primary">OFFLINE</span></h1>
            <p className="text-white/40 mb-8 font-medium">This pitch is currently not in the rotation.</p>
            <Button onClick={() => router.push("/")} className="bg-primary text-black font-black uppercase tracking-widest h-14 px-10 rounded-xl">Back to HQ</Button>
          </div>
        </div>
      </div>
    )
  }

  const whatsappUrl = `https://wa.me/${turf.whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in booking ${turf.name} in ${turf.area}.`)}`
  const googleMapsUrl = turf.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(turf.location + ' ' + turf.name + ' Mysuru')}`

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <div className="flex-1 pb-32 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-12 hover:bg-white/5 rounded-xl font-black text-xs uppercase tracking-widest text-white/40 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> BACK TO DISCOVERY
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              {/* Cinematic Gallery Section */}
              <section className="space-y-6">
                <motion.div 
                  layoutId="main-image"
                  className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden glass-card p-2 border-white/5 shadow-2xl group cursor-zoom-in"
                  onClick={() => setSelectedImage(selectedImage || allImages[0])}
                >
                  <Image 
                    src={selectedImage || allImages[0]} 
                    alt={turf.name} 
                    fill 
                    className="object-cover rounded-[2rem] grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" 
                    priority 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-10">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">View in High Definition</span>
                  </div>
                </motion.div>

                {allImages.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {allImages.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setSelectedImage(img)}
                        className={cn(
                          "relative h-24 w-32 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300",
                          (selectedImage || allImages[0]) === img ? "border-primary shadow-[0_0_15px_rgba(57,255,20,0.4)]" : "border-white/5 opacity-40 hover:opacity-100"
                        )}
                      >
                        <Image src={img} alt={`${turf.name} gallery ${idx}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Information Section */}
              <section className="glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                <div className="flex flex-wrap items-center gap-6 mb-12">
                  <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Verified Sports Arena</span>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl">
                    <Star className="h-4 w-4 text-primary fill-current" />
                    <span className="text-xs font-black text-white/60">{turf.rating} Quality Score</span>
                  </div>
                </div>
                
                <h1 className="text-6xl md:text-9xl mb-12 tracking-tighter italic leading-[0.9] uppercase font-black">
                  {turf.name.split(' ').map((word: string, i: number) => (
                    <span key={i} className={i === 0 ? "text-white" : "text-primary drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]"}>
                      {word}<br />
                    </span>
                  ))}
                </h1>
                
                <div className="flex items-center gap-4 text-white/40 mb-16">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-lg">{turf.area}, MYSURU</span>
                </div>

                <div className="space-y-24">
                  <div className="max-w-3xl">
                    <h3 className="text-sm text-primary/60 font-black uppercase tracking-[0.4em] mb-8">Executive Summary</h3>
                    <p className="text-white/70 leading-relaxed text-2xl font-medium italic whitespace-pre-wrap border-l-8 border-primary/20 pl-10">
                      {turf.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Integrated Amenities</h3>
                      <div className="grid gap-5">
                        {(turf.amenities || []).map((item: string) => (
                          <div key={item} className="flex items-center gap-5 text-white/60 font-black uppercase tracking-[0.2em] text-xs">
                            <div className="h-3 w-3 bg-primary rounded-full shadow-[0_0_15px_rgba(57,255,20,0.8)]" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-10">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Operations Window</h3>
                      <div className="glass-card p-10 rounded-3xl border-white/5 bg-white/5">
                        <p className="text-[9px] font-black text-white/20 mb-3 uppercase tracking-[0.5em]">Live Schedule</p>
                        <p className="text-4xl font-black italic uppercase text-white leading-none">{turf.openingHours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <aside className="sticky top-32 space-y-10">
                <Card className="glass-card rounded-[2.5rem] p-12 border-primary/10 shadow-[0_0_100px_rgba(57,255,20,0.05)]">
                  <div className="text-center mb-12">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.6em] mb-6">Starting Intensity Rate</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-8xl font-black text-primary italic leading-none drop-shadow-[0_0_30px_rgba(57,255,20,0.4)]">₹{minPrice}</span>
                      <span className="text-white/20 font-black mt-10 text-xs uppercase tracking-[0.3em]">/ HR</span>
                    </div>
                  </div>

                  {turf.courtPricing && Object.keys(turf.courtPricing).length > 0 && (
                    <div className="space-y-4 mb-12">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40 mb-8">Unit Price Breakdown</p>
                      {Object.entries(turf.courtPricing).map(([type, price]) => (
                        <div key={type} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{type}</span>
                          <span className="font-black text-primary italic text-xl">₹{price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-5">
                    <Button 
                      asChild 
                      className="w-full h-24 text-2xl font-black bg-primary hover:bg-primary/90 text-black rounded-[1.5rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all border-none" 
                      onClick={handleWhatsAppClick}
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-4 h-8 w-8" />
                        SECURE SLOT
                      </a>
                    </Button>
                    
                    <Button variant="outline" asChild className="w-full h-16 border-white/10 hover:bg-white/5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest">
                      <a href={`tel:${turf.contactNumber}`}>
                        <Phone className="mr-3 h-4 w-4" /> CONTACT MANAGER
                      </a>
                    </Button>
                  </div>

                  <div className="pt-12 mt-12 border-t border-white/5">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mb-8">Arena Coordinates</h4>
                    <div className="glass-card p-10 rounded-3xl bg-white/5 relative group cursor-pointer overflow-hidden" onClick={() => window.open(googleMapsUrl, '_blank')}>
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <Navigation className="h-24 w-24 text-primary" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">{turf.area}</p>
                        <p className="text-base font-medium text-white/40 leading-relaxed mb-8 italic">{turf.location}</p>
                        <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
                          <Navigation className="h-4 w-4" />
                          LAUNCH NAVIGATION
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

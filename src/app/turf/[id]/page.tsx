"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TurfCard } from "@/components/turf-card"
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Star, 
  CheckCircle2, 
  Loader2,
  GraduationCap,
  ShieldCheck,
  Zap,
  TrendingUp,
  Trophy,
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
import { Separator } from "@/components/ui/separator"
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase"
import { doc, increment, setDoc, query, collection, limit } from "firebase/firestore"
import { useEffect, useMemo, useRef } from "react"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function TurfDetail() {
  const { id } = useParams()
  const router = useRouter()
  const db = useFirestore()
  const hasIncremented = useRef(false)

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "turfs", id as string)
  }, [db, id])

  const { data: turf, loading } = useDoc(turfDocRef)

  const relatedQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), limit(10))
  }, [db])

  const { data: allTurfs } = useCollection(relatedQuery)

  const relatedTurfs = useMemo(() => {
    if (!allTurfs || !turf) return []
    return allTurfs
      .filter(t => t.id !== turf.id && (t.area === turf.area || t.sportTypes?.some((s: string) => turf.sportTypes?.includes(s))))
      .slice(0, 4)
  }, [allTurfs, turf])

  useEffect(() => {
    if (db && id && !hasIncremented.current) {
      hasIncremented.current = true;
      const statsRef = doc(db, "analytics", "stats")
      const turfRef = doc(db, "turfs", id as string)
      
      setDoc(turfRef, { views: increment(1) }, { merge: true })
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: turfRef.path,
            operation: 'write',
            requestResourceData: { views: 'increment' }
          }));
        });

      setDoc(statsRef, { totalViews: increment(1) }, { merge: true })
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: statsRef.path,
            operation: 'write',
            requestResourceData: { totalViews: 'increment' }
          }));
        });
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
            <h1 className="text-4xl mb-4">PITCH <span className="text-primary">MISSING</span></h1>
            <p className="text-white/40 mb-8 font-medium">This arena has been decommissioned or moved.</p>
            <Button onClick={() => router.push("/")} className="bg-primary text-black font-black uppercase tracking-widest h-14 px-10 rounded-xl">Back to Base</Button>
          </div>
        </div>
      </div>
    )
  }

  const message = `Hi, I found ${turf.name} in ${turf.area} on Turfista and would like to inquire about booking a slot.`
  const whatsappUrl = `https://wa.me/${turf.whatsappNumber}?text=${encodeURIComponent(message)}`
  const googleMapsUrl = turf.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(turf.location + ' ' + turf.name + ' Mysuru')}`

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      
      <div className="flex-1 pb-20 pt-10">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-8 hover:bg-white/5 rounded-xl font-black text-xs uppercase tracking-widest text-white/60"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> RE-SEARCH
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <section className="relative rounded-3xl overflow-hidden glass-card p-2 border-white/10 shadow-2xl">
                <Carousel className="w-full">
                  <CarouselContent>
                    {(turf.images || []).map((img: string, idx: number) => (
                      <CarouselItem key={idx}>
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden">
                          <Image src={img} alt={turf.name} fill className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" priority={idx === 0} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-8 bg-black/80 hover:bg-primary hover:text-black border-none" />
                  <CarouselNext className="right-8 bg-black/80 hover:bg-primary hover:text-black border-none" />
                </Carousel>
              </section>

              <section className="glass-card rounded-3xl p-10 md:p-16 relative overflow-hidden">
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <Badge className="bg-primary text-black font-black px-5 py-1.5 text-xs rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.4)]">VERIFIED PITCH</Badge>
                  <Badge variant="outline" className="border-white/10 text-white/40 px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] bg-white/5">
                    <Star className="h-3 w-3 text-primary mr-2 fill-current" />
                    {turf.rating} SCORE
                  </Badge>
                </div>
                
                <h1 className="text-6xl md:text-8xl mb-8 tracking-tighter italic">
                  {turf.name.split(' ').map((word: string, i: number) => (
                    <span key={i} className={i === 0 ? "text-white" : "text-primary drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]"}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                
                <div className="flex items-center gap-3 text-white/40 mb-12">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-black uppercase tracking-widest text-sm">{turf.area}, MYSURU</span>
                </div>

                <div className="space-y-20">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-3xl text-white mb-8 flex items-center gap-4">
                      <div className="h-10 w-2 bg-primary rounded-full" />
                      ARENA INTEL
                    </h3>
                    <p className="text-white/70 leading-relaxed text-xl font-medium italic whitespace-pre-wrap border-l-4 border-white/5 pl-8">
                      {turf.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <h3 className="text-2xl text-primary italic">AMENITIES</h3>
                      <div className="grid gap-4">
                        {(turf.amenities || []).map((item: string) => (
                          <div key={item} className="flex items-center gap-4 text-white/60 font-black uppercase tracking-widest text-[10px] group">
                            <div className="h-2 w-2 bg-primary rounded-full shadow-[0_0_10px_rgba(57,255,20,1)]" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-8">
                      <h3 className="text-2xl text-primary italic">OPERATIONS</h3>
                      <div className="glass-card p-8 rounded-2xl border-white/5 bg-white/5">
                        <p className="text-[10px] font-black text-white/40 mb-2 uppercase tracking-[0.4em]">Active Hours</p>
                        <p className="text-3xl font-black italic uppercase text-white">{turf.openingHours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <aside className="sticky top-32 glass-card rounded-3xl p-10 space-y-10 border-primary/10 shadow-[0_0_50px_rgba(57,255,20,0.05)]">
                <div className="text-center">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.5em] mb-4">Starting Rate</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-7xl font-black text-primary italic leading-none drop-shadow-[0_0_15px_rgba(57,255,20,0.4)]">₹{minPrice}</span>
                    <span className="text-white/40 font-black mt-8 text-sm uppercase tracking-widest">/ HR</span>
                  </div>
                </div>

                {turf.courtPricing && Object.keys(turf.courtPricing).length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60 mb-6">UNIT COSTING</p>
                    {Object.entries(turf.courtPricing).map(([type, price]) => (
                      <div key={type} className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all group">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">{type}</span>
                        <span className="font-black text-primary italic">₹{price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <Button 
                    asChild 
                    className="w-full h-20 text-xl font-black bg-primary hover:bg-primary/90 text-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" 
                    onClick={handleWhatsAppClick}
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-3 h-7 w-7" />
                      BOOK SLOT
                    </a>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full h-16 border-white/10 hover:bg-white/5 rounded-xl font-black text-xs uppercase tracking-widest">
                    <a href={`tel:${turf.contactNumber}`}>
                      <Phone className="mr-3 h-4 w-4" /> CALL MANAGER
                    </a>
                  </Button>
                </div>

                <div className="pt-10 border-t border-white/5">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">PITCH COORDINATES</h4>
                  <div className="glass-card p-8 rounded-2xl bg-white/5 relative group cursor-pointer overflow-hidden" onClick={() => window.open(googleMapsUrl, '_blank')}>
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                      <Navigation className="h-20 w-20 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2">{turf.area}</p>
                      <p className="text-sm font-medium text-white/60 leading-relaxed mb-6 italic">{turf.location}</p>
                      <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest">
                        <Navigation className="h-3 w-3" />
                        NAVIGATE VIA MAPS
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  Loader2,
  Zap,
  IndianRupee,
  Navigation,
  Trophy,
  Clock,
  ShieldCheck
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { doc, increment, setDoc } from "firebase/firestore"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function TurfDetail() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const db = useFirestore()
  const hasIncremented = useRef(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isThrottled, setIsThrottled] = useState(false)

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "turfs", id)
  }, [db, id])

  const { data: turf, loading } = useDoc(turfDocRef)

  useEffect(() => {
    if (db && id && turf && !hasIncremented.current) {
      // Robust view counting with local storage to prevent session spam
      const viewedKey = `turf_viewed_${id}`;
      const alreadyViewed = localStorage.getItem(viewedKey);
      
      if (!alreadyViewed) {
        hasIncremented.current = true;
        const statsRef = doc(db, "analytics", "stats")
        const turfRef = doc(db, "turfs", id)
        
        setDoc(turfRef, { views: increment(1) }, { merge: true }).catch(() => {});
        setDoc(statsRef, { totalViews: increment(1) }, { merge: true }).catch(() => {});
        
        // Mark as viewed for this browser session to prevent double counting
        localStorage.setItem(viewedKey, Date.now().toString());
      }
    }
  }, [db, id, turf])

  const handleWhatsAppClick = () => {
    if (db && id && !isThrottled) {
      setIsThrottled(true)
      setTimeout(() => setIsThrottled(false), 5000)

      const turfRef = doc(db, "turfs", id)
      const statsRef = doc(db, "analytics", "stats")
      setDoc(turfRef, { whatsappClicks: increment(1) }, { merge: true }).catch(() => {});
      setDoc(statsRef, { totalWhatsAppClicks: increment(1) }, { merge: true }).catch(() => {});
    }
  }

  const allImages = useMemo(() => {
    if (!turf) return [];
    const images: string[] = [];
    if (turf?.mainImage) images.push(turf.mainImage);
    if (turf?.galleryImages && Array.isArray(turf.galleryImages)) {
      images.push(...turf.galleryImages.filter(img => typeof img === 'string'));
    }
    return images.length > 0 ? images : ["https://picsum.photos/seed/turf-placeholder/1200/800"];
  }, [turf]);

  const minPrice = useMemo(() => {
    if (turf?.courtPricing && typeof turf.courtPricing === 'object' && Object.keys(turf.courtPricing).length > 0) {
      return Math.min(...Object.values(turf.courtPricing as Record<string, number>));
    }
    return turf?.pricePerHour || 0;
  }, [turf?.courtPricing, turf?.pricePerHour]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em]">Syncing Arena Intel...</p>
      </div>
    )
  }

  if (!turf) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="glass-card p-16 rounded-[3rem] text-center border-white/5 max-w-lg">
            <Zap className="h-16 w-16 text-primary opacity-20 mx-auto mb-8" />
            <h1 className="text-4xl mb-4 font-black italic tracking-tighter uppercase">ARENA <span className="text-primary">NOT FOUND</span></h1>
            <p className="text-white/40 mb-10 font-medium leading-relaxed">The requested pitch is either unavailable or has been removed from our active rotation.</p>
            <Button onClick={() => router.push("/")} className="bg-primary text-black font-black uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">Back to Discovery</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const name = turf?.name || "Premium Arena";
  const area = turf?.area || "Mysuru";
  const location = turf?.location || "Mysuru, Karnataka";
  const description = turf?.description || "Experience top-tier sports at Turfista. This venue features professional-grade surfaces and excellent facilities for football and cricket enthusiasts.";
  const openingHours = turf?.openingHours || "Check schedule via manager";
  const amenities = Array.isArray(turf?.amenities) ? turf.amenities : [];
  const courtPricing = (turf?.courtPricing && typeof turf.courtPricing === 'object') ? turf.courtPricing as Record<string, number> : {};
  const contactNumber = turf?.contactNumber || "";
  const whatsappNumber = turf?.whatsappNumber || "";
  
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in booking ${name} in ${area}. Found you on Turfista!`)}`
  const googleMapsUrl = turf?.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(location + ' ' + name + ' Mysuru')}`

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pb-32 pt-24">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-12 hover:bg-white/5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group h-12"
          >
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> BACK TO DISCOVERY
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              {/* cinematic visual gallery */}
              <section className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden glass-card p-2 border-white/5 shadow-2xl group"
                >
                  <Image 
                    src={selectedImage || allImages[0]} 
                    alt={name} 
                    fill 
                    className="object-cover rounded-[2rem] grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" 
                    priority 
                  />
                </motion.div>

                {allImages.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {allImages.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setSelectedImage(img)}
                        className={cn(
                          "relative h-24 w-40 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300",
                          (selectedImage || allImages[0]) === img ? "border-primary shadow-[0_0_15px_rgba(57,255,20,0.3)]" : "border-white/5 opacity-40 hover:opacity-100"
                        )}
                      >
                        <Image src={img} alt={`${name} gallery photo ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* information grid */}
              <section className="glass-card rounded-[3.5rem] p-10 md:p-20 relative overflow-hidden border-white/5 shadow-2xl">
                <div className="flex flex-wrap items-center gap-6 mb-12">
                  <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Verified Partner</span>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                    <Star className="h-3 w-3 text-primary fill-current" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{turf?.rating || 4.5} Quality Rating</span>
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl mb-12 tracking-tighter italic leading-[0.9] uppercase font-black">
                  {(name || "").split(' ').map((word, i) => (
                    <span key={i} className={cn("block", i === 0 ? "text-white" : "text-primary drop-shadow-[0_0_20px_rgba(57,255,20,0.4)]")}>
                      {word}
                    </span>
                  ))}
                </h1>
                
                <div className="flex items-center gap-4 text-white/40 mb-16">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-black uppercase tracking-[0.2em] text-lg italic">{area}, MYSURU</span>
                </div>

                <div className="space-y-24">
                  <article className="max-w-3xl">
                    <h3 className="text-[10px] text-primary/60 font-black uppercase tracking-[0.5em] mb-8 flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      Arena Description
                    </h3>
                    <p className="text-white/70 leading-relaxed text-xl md:text-2xl font-medium italic whitespace-pre-wrap border-l-4 border-primary/20 pl-8">
                      {description}
                    </p>
                  </article>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                      <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        Key Amenities
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {amenities.length > 0 ? (
                          amenities.map((item) => (
                            <div key={item} className="flex items-center gap-4 text-white/60 font-bold uppercase tracking-widest text-xs">
                              <div className="h-2 w-2 bg-primary rounded-full shadow-[0_0_10px_rgba(57,255,20,0.8)]" />
                              {item}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-white/20 uppercase tracking-widest italic">Standard facilities available</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-10">
                      <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Timings
                      </h3>
                      <div className="glass-card p-10 rounded-3xl border-white/5 bg-white/5">
                        <p className="text-[9px] font-black text-white/20 mb-3 uppercase tracking-[0.5em]">Active Status</p>
                        <p className="text-3xl font-black italic uppercase text-white leading-tight">{openingHours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <aside className="sticky top-32 space-y-10">
                <div className="glass-card rounded-[3rem] p-10 border-primary/10 shadow-[0_0_80px_rgba(57,255,20,0.05)] bg-black/40 backdrop-blur-2xl">
                  <div className="text-center mb-12">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.6em] mb-6">Starting Intensity</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-7xl font-black text-primary italic leading-none drop-shadow-[0_0_30px_rgba(57,255,20,0.4)]">₹{minPrice}</span>
                      <span className="text-white/20 font-black mt-8 text-[10px] uppercase tracking-[0.3em]">/ HR</span>
                    </div>
                  </div>

                  {Object.keys(courtPricing).length > 0 && (
                    <div className="space-y-4 mb-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40 mb-8">Format Pricing</p>
                      {Object.entries(courtPricing).map(([type, price]) => (
                        <div key={type} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">{type}</span>
                          <span className="font-black text-primary italic text-lg">₹{price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-white/30 font-medium italic mb-10 text-center">
                    * Prices may vary. Please confirm with the turf owner.
                  </p>

                  <div className="space-y-4">
                    <Button 
                      asChild 
                      className="w-full h-20 text-xl font-black bg-primary hover:bg-primary/90 text-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all border-none" 
                      onClick={handleWhatsAppClick}
                      disabled={isThrottled}
                    >
                      <a href={isThrottled ? "#" : whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-3 h-6 w-6" />
                        INSTANT BOOK
                      </a>
                    </Button>
                    
                    <Button variant="outline" asChild className="w-full h-14 border-white/10 hover:bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em]">
                      <a href={`tel:${contactNumber}`}>
                        <Phone className="mr-3 h-4 w-4" /> CONTACT ARENA
                      </a>
                    </Button>
                  </div>

                  <div className="pt-12 mt-12 border-t border-white/5">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mb-8">Navigation</h4>
                    <div 
                      className="glass-card p-10 rounded-3xl bg-white/5 relative group cursor-pointer overflow-hidden hover:border-primary/20 transition-all" 
                      onClick={() => window.open(googleMapsUrl, '_blank')}
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        <Navigation className="h-20 w-20 text-primary" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">{area}</p>
                        <p className="text-sm font-medium text-white/40 leading-relaxed mb-8 italic line-clamp-2">{location}</p>
                        <div className="flex items-center gap-3 text-primary font-black text-[9px] uppercase tracking-[0.4em] group-hover:translate-x-2 transition-transform">
                          <Navigation className="h-4 w-4" />
                          LAUNCH MAPS
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

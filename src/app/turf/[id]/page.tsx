"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ArrowRight,
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
  ShieldCheck,
  Share2
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { doc, increment, setDoc, addDoc, serverTimestamp, collection } from "firebase/firestore"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import * as gtag from "@/lib/gtag"

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
      const viewedKey = `turf_viewed_${id}`;
      const alreadyViewed = localStorage.getItem(viewedKey);
      
      if (!alreadyViewed) {
        hasIncremented.current = true;
        const statsRef = doc(db, "analytics", "stats")
        const turfRef = doc(db, "turfs", id)
        
        setDoc(turfRef, { views: increment(1) }, { merge: true }).catch(() => {});
        setDoc(statsRef, { totalViews: increment(1) }, { merge: true }).catch(() => {});
        
        localStorage.setItem(viewedKey, Date.now().toString());

        // Track GA view
        gtag.event({
          action: 'view_item',
          category: 'Engagement',
          label: turf.name,
          value: 1
        })
      }
    }
  }, [db, id, turf])

  const handleWhatsAppClick = async () => {
    if (db && id && !isThrottled) {
      // Track GA conversion
      gtag.event({
        action: 'generate_lead',
        category: 'Booking',
        label: turf?.name || id,
        value: 1
      })

      setIsThrottled(true)
      setTimeout(() => setIsThrottled(false), 5000)

      const leadData = {
        turfId: id,
        turfName: turf?.name || 'Unknown',
        area: turf?.area || 'Unknown',
        sportType: turf?.sportTypes?.[0] || 'Unknown',
        timestamp: serverTimestamp(),
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 150) : 'Unknown',
      };

      try {
        await addDoc(collection(db, "leads"), leadData);
        const turfRef = doc(db, "turfs", id)
        const statsRef = doc(db, "analytics", "stats")
        setDoc(turfRef, { whatsappClicks: increment(1) }, { merge: true }).catch(() => {});
        setDoc(statsRef, { totalWhatsAppClicks: increment(1) }, { merge: true }).catch(() => {});
      } catch (err) {}
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

  // Schema.org Structured Data
  const structuredData = useMemo(() => {
    if (!turf) return null;
    return {
      "@context": "https://schema.org",
      "@type": "SportsActivityLocation",
      "name": turf.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": turf.location,
        "addressLocality": "Mysuru",
        "addressRegion": "KA",
        "addressCountry": "IN"
      },
      "telephone": turf.contactNumber,
      "image": turf.mainImage,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": turf.rating || 4.5,
        "reviewCount": turf.reviewCount || 10
      }
    };
  }, [turf]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em]">Fetching Venue Data...</p>
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
            <p className="text-white/40 mb-10 font-medium">The pitch you are looking for is currently offline.</p>
            <Button onClick={() => router.push("/")} className="bg-primary text-black font-black uppercase tracking-widest h-14 px-10 rounded-2xl">Back to Discovery</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const { name, area, location, description, openingHours, amenities, courtPricing, contactNumber, whatsappNumber } = turf;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in booking ${name} in ${area}. Found you on Turfista!`)}`;
  const googleMapsUrl = turf.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(location + ' ' + name + ' Mysuru')}`;

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      {/* Schema.org */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      <main className="flex-1 pb-32 pt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="hover:bg-white/5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group h-12"
            >
              <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> BACK
            </Button>
            <Button variant="outline" className="h-12 border-white/5 bg-white/5 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
              <Share2 className="h-4 w-4 mr-2" /> Share Pitch
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
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
                  <div className="absolute bottom-10 left-10 flex items-center gap-3">
                    <Badge className="bg-primary text-black font-black px-4 py-1.5 text-xs rounded-xl shadow-2xl border-none">
                      {turf.rating || 4.5} <Star className="ml-1 h-3 w-3 fill-current" />
                    </Badge>
                    <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl">
                      {turf.reviewCount || 0} REVIEWS
                    </Badge>
                  </div>
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
                        <Image src={img} alt={`${name} ${idx}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="glass-card rounded-[3.5rem] p-10 md:p-16 border-white/5 shadow-2xl bg-[#080808]">
                <div className="flex flex-wrap items-center gap-6 mb-12">
                  <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Verified Arena</span>
                  </div>
                  <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">{openingHours.toLowerCase().includes('open') ? 'Operational' : 'Restricted'}</span>
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-7xl mb-12 tracking-tighter italic leading-tight uppercase font-black text-white">
                  {name}
                </h1>
                
                <div className="flex items-center gap-4 text-white/40 mb-16">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="font-black uppercase tracking-[0.2em] text-lg italic">{area}, MYSURU</span>
                </div>

                <div className="space-y-16">
                  <article>
                    <h3 className="text-[10px] text-primary/60 font-black uppercase tracking-[0.5em] mb-8">About this Pitch</h3>
                    <p className="text-white/60 leading-relaxed text-lg md:text-xl font-medium italic border-l-2 border-primary/20 pl-6">
                      {description}
                    </p>
                  </article>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                      <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em]">Amenities</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {amenities.map((item: string) => (
                          <div key={item} className="flex items-center gap-4 text-white/60 font-bold uppercase tracking-widest text-xs">
                            <div className="h-1 w-1 bg-primary rounded-full shadow-[0_0_5px_rgba(57,255,20,1)]" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-8">
                      <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em]">Availability</h3>
                      <div className="glass-card p-8 rounded-3xl border-white/5 bg-white/5">
                        <Clock className="h-5 w-5 text-primary mb-4" />
                        <p className="text-2xl font-black italic uppercase text-white">{openingHours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <aside className="sticky top-32 space-y-8">
                <div className="glass-card rounded-[3rem] p-10 border-primary/10 bg-[#0a0a0a]">
                  <div className="text-center mb-10">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.6em] mb-4">Starts at</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-6xl font-black text-primary italic">₹{minPrice}</span>
                      <span className="text-white/20 font-black mt-6 text-[10px] uppercase tracking-widest">/ HR</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-10">
                    {courtPricing && Object.entries(courtPricing).map(([type, price]) => (
                      <div key={type} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{type}</span>
                        <span className="font-black text-primary italic text-lg">₹{price}</span>
                      </div>
                    ))}
                    <p className="text-[9px] text-white/20 font-medium italic mt-4 text-center">
                      Prices may vary. Please confirm with the turf owner.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      asChild 
                      className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 text-black rounded-2xl shadow-xl shadow-primary/20 transition-all" 
                      onClick={handleWhatsAppClick}
                      disabled={isThrottled}
                    >
                      <a href={isThrottled ? "#" : whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Book Now
                      </a>
                    </Button>
                    
                    <Button variant="outline" asChild className="w-full h-14 border-white/10 hover:bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                      <a href={`tel:${contactNumber}`}>
                        <Phone className="mr-2 h-4 w-4" /> Contact Manager
                      </a>
                    </Button>
                  </div>

                  <div className="pt-10 mt-10 border-t border-white/5">
                    <div 
                      className="glass-card p-8 rounded-3xl bg-white/5 cursor-pointer hover:border-primary/20 transition-all" 
                      onClick={() => window.open(googleMapsUrl, '_blank')}
                    >
                      <Navigation className="h-5 w-5 text-primary mb-4" />
                      <p className="text-sm font-medium text-white/40 mb-4 italic line-clamp-2">{location}</p>
                      <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.4em]">
                        NAVIGATE TO ARENA <ArrowRight className="h-3 w-3" />
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

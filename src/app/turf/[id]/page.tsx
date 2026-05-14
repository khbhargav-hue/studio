
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
  Loader2,
  Zap,
  Share2,
  Clock,
  Navigation,
  CheckCircle2,
  Star
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { doc, increment, setDoc, addDoc, serverTimestamp, collection } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import * as gtag from "@/lib/gtag"
import { ReviewSection } from "@/components/review-section"

export default function TurfDetail() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const db = useFirestore()
  const hasIncremented = useRef(false)
  const [isThrottled, setIsThrottled] = useState(false)

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "turfs", id)
  }, [db, id])

  const { data: turf, loading } = useDoc(turfDocRef)

  useEffect(() => {
    if (db && id && turf && !hasIncremented.current) {
      hasIncremented.current = true;
      const statsRef = doc(db, "analytics", "stats")
      const turfRef = doc(db, "turfs", id)
      setDoc(turfRef, { views: increment(1) }, { merge: true });
      setDoc(statsRef, { totalViews: increment(1) }, { merge: true });
      gtag.event({ action: 'view_item', category: 'Engagement', label: turf.name, value: 1 });
    }
  }, [db, id, turf])

  const handleWhatsAppClick = async () => {
    if (db && id && !isThrottled && turf) {
      gtag.event({ action: 'generate_lead', category: 'Booking', label: turf.name, value: 1 });
      setIsThrottled(true)
      setTimeout(() => setIsThrottled(false), 5000)
      const leadData = {
        turfId: id,
        turfName: turf.name,
        area: turf.area,
        sportType: turf.sports?.[0] || 'Unknown',
        timestamp: serverTimestamp(),
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 150) : 'Unknown',
      };
      addDoc(collection(db, "leads"), leadData);
      setDoc(doc(db, "turfs", id), { whatsappClicks: increment(1) }, { merge: true });
      setDoc(doc(db, "analytics", "stats"), { totalWhatsAppClicks: increment(1) }, { merge: true });
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
  }

  if (!turf) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Zap className="h-16 w-16 text-primary/20 mb-8" />
          <h1 className="text-4xl font-bold uppercase italic">Arena Offline</h1>
          <p className="text-muted mt-4">This listing could not be retrieved from the network.</p>
          <Button onClick={() => router.push("/")} className="btn-primary mt-10 h-14 px-10">Back to Discovery</Button>
        </div>
        <Footer />
      </div>
    )
  }

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": turf.name,
    "description": turf.description,
    "image": turf.imageUrl,
    "priceRange": turf.pricePerHour > 0 ? `₹${turf.pricePerHour}/hr` : "On Request",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": turf.address,
      "addressLocality": turf.area,
      "addressRegion": "Mysuru, Karnataka",
      "postalCode": turf.pincode,
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": turf.lat,
      "longitude": turf.lng
    }
  };

  const amenities = Object.entries(turf.amenities || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      <main className="flex-1 pt-24 pb-32 max-w-7xl mx-auto w-full px-4">
        <div className="flex items-center justify-between mb-10">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group font-black text-[11px] uppercase tracking-widest text-muted hover:text-foreground h-12 px-6">
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1" /> BACK TO CIRCUIT
          </Button>
          <Button variant="outline" onClick={() => navigator.share({ title: turf.name, url: window.location.href })} className="border-border text-[11px] font-black uppercase tracking-widest h-12 px-8">
            <Share2 className="h-4 w-4 mr-3" /> SHARE ARENA
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-16">
            <section className="relative aspect-video rounded-[32px] overflow-hidden bg-surface border border-border shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
              <Image 
                src={turf.imageUrl || "https://picsum.photos/seed/turf/1200/800"} 
                alt={`${turf.name} - Sports Arena in ${turf.area}, Mysuru`} 
                fill 
                className="object-cover" 
                priority 
              />
              {turf.isPremium && (
                <div className="absolute top-8 left-8 bg-primary text-background label-caps px-6 py-2 rounded-xl font-black shadow-2xl">Elite Featured Arena</div>
              )}
            </section>

            <section className="bg-card p-10 md:p-16 rounded-[40px] border border-border space-y-12 relative overflow-hidden">
              <div className="flex flex-wrap gap-3 relative z-10">
                {turf.sports?.map((s: string) => (
                  <Badge key={s} className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[11px]">{s}</Badge>
                ))}
                <div className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[11px] font-bold text-primary">
                  <Star className="h-3.5 w-3.5 fill-current" /> {turf.rating || 4.5} ({turf.reviewCount || 0} reviews)
                </div>
              </div>
              
              <div className="relative z-10">
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase italic leading-none mb-8">{turf.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground font-medium bg-white/5 w-fit px-6 py-3 rounded-2xl border border-white/5">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="text-xl italic font-bold tracking-tight uppercase">{turf.address || turf.area}, MYSURU</span>
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                <h3 className="label-caps text-primary/60 text-xs font-black">The Arena Strategy</h3>
                <p className="text-2xl leading-relaxed italic text-foreground/90 border-l-4 border-primary/30 pl-10 font-medium">
                  {turf.description || "Premium sporting facility optimized for high-intensity community matches and professional training sessions."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                <div className="space-y-8">
                  <h3 className="label-caps text-primary/60 text-xs font-black">Elite Facilities</h3>
                  <div className="grid grid-cols-1 gap-5">
                    {amenities.length > 0 ? amenities.map(a => (
                      <div key={a} className="flex items-center gap-4 text-[14px] font-bold text-foreground/80 uppercase tracking-widest bg-white/5 p-4 rounded-2xl border border-white/5 transition-all hover:border-primary/20">
                        <CheckCircle2 className="h-5 w-5 text-primary" /> {a}
                      </div>
                    )) : <p className="text-muted italic">Basic amenities available at venue.</p>}
                  </div>
                </div>
                <div className="space-y-8">
                  <h3 className="label-caps text-primary/60 text-xs font-black">Intelligence Deck</h3>
                  <div className="bg-surface p-10 rounded-[32px] border border-border space-y-6">
                    {[
                      { l: "Format", v: turf.pitchType },
                      { l: "Max Squad", v: `${turf.maxPlayers} Players` },
                      { l: "Dimensions", v: turf.dimensions || "Standard" },
                      { l: "Check-in", v: `${turf.checkInMinutes} Min Buff` }
                    ].map(item => (
                      <div key={item.l} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                        <span className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">{item.l}</span>
                        <span className="font-bold text-lg">{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* REVIEW SECTION */}
            <ReviewSection 
              turfId={id} 
              currentRating={turf.rating || 0} 
              reviewCount={turf.reviewCount || 0} 
            />
          </div>

          <div className="lg:col-span-4">
            <aside className="sticky top-28 space-y-8">
              <Card className="bg-card border-border p-12 rounded-[40px] text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Zap className="h-32 w-32 text-primary" />
                </div>
                
                <div className="mb-12 relative z-10">
                  <p className="label-caps text-muted-foreground font-bold mb-4">Starting At</p>
                  <div className="flex items-center justify-center gap-2">
                    {turf.pricePerHour > 0 ? (
                      <>
                        <span className="text-7xl font-black text-primary italic tracking-tighter shadow-primary/20">₹{turf.pricePerHour}</span>
                        <span className="text-muted-foreground font-black text-sm uppercase mt-10">/ HR</span>
                      </>
                    ) : (
                      <span className="text-3xl font-black text-primary italic tracking-tighter">ASK BEFORE BOOKING</span>
                    )}
                  </div>
                  {turf.pricePerHour > 0 && turf.peakHourPrice > 0 && (
                    <p className="text-[11px] font-black text-muted-foreground/60 uppercase mt-4 tracking-widest">
                      Peak Rate: ₹{turf.peakHourPrice} (from {turf.peakHoursStart})
                    </p>
                  )}
                </div>

                <div className="space-y-5 relative z-10">
                  <Button asChild className="btn-primary w-full h-20 text-xl font-black rounded-[20px] shadow-2xl shadow-primary/10" onClick={handleWhatsAppClick}>
                    <a href={`https://wa.me/${turf.whatsapp}?text=Hi, I'm interested in booking ${turf.name}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-7 w-7 mr-3" /> BOOK ARENA
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="w-full h-16 border-border text-[12px] font-black uppercase tracking-widest rounded-[20px] hover:bg-white/5">
                    <a href={`tel:${turf.whatsapp}`}><Phone className="h-4 w-4 mr-3" /> DIRECT SIGNAL</a>
                  </Button>
                </div>

                <div className="mt-12 pt-12 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-muted-foreground tracking-widest mb-6">
                    <span>OPERATIONAL CYCLE</span>
                    <span className="text-primary flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" /> {turf.isActive ? 'ACTIVE' : 'OFFLINE'}</span>
                  </div>
                  <div className="bg-surface p-8 rounded-[24px] border border-border flex items-center gap-6">
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold uppercase italic leading-none">{turf.openTime} - {turf.closeTime}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase mt-2 tracking-widest">Daily Cycle</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-10 rounded-[32px] cursor-pointer hover:border-primary/40 transition-all group overflow-hidden" onClick={() => window.open(turf.googleMapsUrl || `https://maps.google.com/?q=${turf.name}`, '_blank')}>
                <div className="flex items-center gap-4 mb-6">
                  <Navigation className="h-6 w-6 text-primary" />
                  <h4 className="text-sm font-black uppercase tracking-widest">Launch Navigation</h4>
                </div>
                <p className="text-[14px] font-bold text-muted-foreground uppercase leading-relaxed italic">{turf.address || turf.area}, MYSURU</p>
                <div className="flex items-center gap-3 text-primary font-black text-[11px] uppercase tracking-[0.2em] mt-8 group-hover:translate-x-2 transition-transform">
                  GPS COORDINATES ACTIVE <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

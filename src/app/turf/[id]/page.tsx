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
  MessageCircle, 
  Loader2,
  Zap,
  Share2,
  Clock,
  Navigation,
  Star,
  Calendar,
  ShieldCheck,
  Car,
  Droplets,
  ZapIcon,
  Coffee,
  Bath,
  CircleDot,
  Gift,
  Phone,
  AlertCircle
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { doc, increment, setDoc, addDoc, serverTimestamp, collection, updateDoc } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import * as gtag from "@/lib/gtag"
import { ReviewSection } from "@/components/review-section"
import { Switch } from "@/components/ui/switch"
import { REWARD_POINTS } from "@/lib/rewards"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const AMENITY_ICONS: Record<string, any> = {
  parking: Car,
  changingRooms: Bath,
  showers: Bath,
  drinkingWater: Droplets,
  floodlights: ZapIcon,
  firstAid: ShieldCheck,
  cafeteria: Coffee,
  washrooms: Bath,
  ballProvided: CircleDot,
  metalStudsOk: CircleDot,
};

export default function TurfDetail() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const hasIncremented = useRef(false)
  const [isThrottled, setIsThrottled] = useState(false)
  const [addInsurance, setAddInsurance] = useState(false)

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

      // Grant Reward Points for Booking Attempt
      if (user) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, {
          rewardPoints: increment(REWARD_POINTS.BOOKING),
          updatedAt: serverTimestamp()
        });
      }
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0A0A0A]"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
  }

  if (!turf) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Zap className="h-16 w-16 text-primary/20 mb-8" />
          <h1 className="text-4xl font-bold uppercase italic">Arena Offline</h1>
          <p className="text-[#888888] mt-4 font-medium italic">This circuit node could not be retrieved from the network.</p>
          <Button onClick={() => router.push("/")} className="bg-primary text-black mt-10 h-14 px-10 rounded-[10px] font-black uppercase tracking-widest">Return to Roster</Button>
        </div>
        <Footer />
      </div>
    )
  }

  const galleryImages = turf.images && turf.images.length > 0 
    ? turf.images 
    : [turf.imageUrl || "https://picsum.photos/seed/turf/1200/800"];

  const whatsappUrl = `https://wa.me/${turf.whatsapp}?text=${encodeURIComponent(`Hi, I want to check availability at ${turf.name}.`)}`;
  const phoneUrl = `tel:${turf.phone || turf.whatsapp}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-40 max-w-7xl mx-auto w-full px-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-[10px] group font-black text-[10px] uppercase tracking-widest text-[#888888] hover:text-[#F5F5F5] h-12 px-2">
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> BACK TO CIRCUIT
          </Button>
          <Button variant="outline" onClick={() => navigator.share({ title: turf.name, url: window.location.href })} className="border-[#222222] text-[10px] font-black uppercase tracking-widest h-12 px-6 rounded-[10px] hidden md:flex">
            <Share2 className="h-4 w-4 mr-3" /> SHARE
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            
            {/* 1. Swipeable Gallery */}
            <section className="relative rounded-[16px] overflow-hidden bg-[#111111] border border-[#222222]">
              <Carousel className="w-full">
                <CarouselContent>
                  {galleryImages.map((img: string, idx: number) => (
                    <CarouselItem key={idx}>
                      <div className="relative aspect-[16/10] md:aspect-[16/9] w-full">
                        <Image 
                          src={img.includes('cloudinary.com') ? img.replace('/upload/', '/upload/f_webp,w_1200,q_75/') : img}
                          alt={`${turf.name} View ${idx + 1}`}
                          fill
                          className="object-cover"
                          priority={idx === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {galleryImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 bg-black/50 border-white/10" />
                    <CarouselNext className="right-4 bg-black/50 border-white/10" />
                  </>
                )}
              </Carousel>
              {turf.isPremium && (
                <div className="absolute top-4 left-4 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-[6px]">ELITE FEATURED</div>
              )}
            </section>

            {/* 2. Header & Amenities */}
            <section className="bg-[#111111] p-6 md:p-12 rounded-[16px] border border-[#222222] space-y-8">
              <div className="flex flex-wrap gap-2">
                {turf.sports?.map((s: string) => (
                  <Badge key={s} className="bg-primary/10 text-primary border-none px-4 py-1 rounded-[6px] font-black uppercase tracking-widest text-[10px]">{s}</Badge>
                ))}
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-[6px] bg-white/5 border border-white/5 text-[10px] font-black text-primary uppercase tracking-widest">
                  <Star className="h-3 w-3 fill-current" /> {turf.rating || 4.5}
                </div>
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-[6px] bg-primary/20 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                  <Gift className="h-3 w-3" /> EARN 50 COINS
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-4">{turf.name}</h1>
                <div className="flex items-center gap-2 text-[#888888] font-bold bg-[#1A1A1A] w-fit px-4 py-2 rounded-[10px] border border-[#222222]">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-[11px] uppercase tracking-widest">{turf.address || turf.area}, MYSURU</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">ARENA STRATEGY</h3>
                <p className="text-lg leading-relaxed italic text-[#F5F5F5]/80 border-l-2 border-primary/30 pl-6 font-medium">
                  {turf.description || "Elite sporting facility optimized for high-intensity community matches and professional training sessions in Mysuru."}
                </p>
              </div>

              <div className="pt-8 border-t border-[#222222]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-6">FACILITY INTEL</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(turf.amenities || {}).map(([key, val]) => {
                    if (!val) return null;
                    const Icon = AMENITY_ICONS[key] || CircleDot;
                    return (
                      <div key={key} className="flex flex-col items-center justify-center gap-2.5 p-4 bg-[#1A1A1A] border border-[#222222] rounded-[12px] text-center min-h-[80px]">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#888888] leading-tight">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* 3. Pitch & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-[#111111] p-6 md:p-8 rounded-[16px] border border-[#222222] space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">PITCH SPEC</h3>
                <div className="space-y-4">
                  {[
                    { label: "Surface", value: turf.pitchType || "Artificial Turf" },
                    { label: "Formats", value: turf.pitchSizes?.join(", ") || "5-a-side" },
                    { label: "Squad Limit", value: `${turf.maxPlayers} Athletes` }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-[#222222] last:border-0 last:pb-0">
                      <span className="text-[#444] font-black uppercase text-[10px] tracking-widest">{item.label}</span>
                      <span className="font-bold text-sm uppercase italic">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#111111] p-6 md:p-8 rounded-[16px] border border-[#222222] space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">REGULATIONS</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="rules" className="border-none">
                    <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest hover:no-underline pt-0 pb-4">View Operational Rules</AccordionTrigger>
                    <AccordionContent className="text-[#888888] text-xs leading-relaxed space-y-3 pt-2 italic">
                      {turf.rules && turf.rules.length > 0 ? turf.rules.map((rule: string, i: number) => (
                        <p key={i} className="flex gap-2"><span>●</span> {rule}</p>
                      )) : (
                        <>
                          <p className="flex gap-2"><span>●</span> Arrive 15 mins prior to slot.</p>
                          <p className="flex gap-2"><span>●</span> No metal studs allowed.</p>
                          <p className="flex gap-2"><span>●</span> Maintain arena hygiene.</p>
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="pt-6 border-t border-[#222222]">
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-[12px]">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Match Insurance</p>
                        <p className="text-[9px] text-[#444] font-bold uppercase">From ₹15 / player</p>
                      </div>
                    </div>
                    <Switch checked={addInsurance} onCheckedChange={setAddInsurance} />
                  </div>
                </div>
              </section>
            </div>

            <ReviewSection 
              turfId={id} 
              currentRating={turf.rating || 0} 
              reviewCount={turf.reviewCount || 0} 
            />

          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-4">
            <aside className="sticky top-28 space-y-6 hidden lg:block">
              <div className="bg-[#111111] border border-[#222222] p-10 rounded-[16px] text-center space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#444]">HOURLY BASE RATE</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-black text-primary italic tracking-tighter">
                      {turf.pricePerHour > 0 ? `₹${turf.pricePerHour}` : "Ask"}
                    </span>
                    {turf.pricePerHour > 0 && <span className="text-[#888888] font-black text-xs uppercase tracking-widest">/ HR</span>}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.1em] bg-primary/5 py-2 px-4 rounded-full mt-4">
                    <AlertCircle className="h-3 w-3" /> Price may vary. Confirm before booking.
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full h-16 bg-[#25D366] text-white hover:bg-[#20ba5a] text-lg font-black uppercase rounded-[12px] active:scale-[0.98] transition-all" onClick={handleWhatsAppClick}>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-6 w-6 mr-3" /> Ask availability
                    </a>
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild variant="outline" className="h-14 border-[#222] bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#222] text-[10px] font-black uppercase tracking-widest rounded-[12px]">
                      <a href={phoneUrl}><Phone className="h-4 w-4 mr-2" /> Call Now</a>
                    </Button>
                    <Button variant="secondary" className="h-14 bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#222] text-[10px] font-black uppercase tracking-widest rounded-[12px]">
                      <Calendar className="h-4 w-4 mr-2" /> Check Slots
                    </Button>
                  </div>
                </div>

                <div className="pt-8 border-t border-[#222222] text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#444] uppercase tracking-widest">Circuit Status</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", turf.isActive ? "text-primary" : "text-destructive")}>
                      {turf.isActive ? "● Node Active" : "Offline"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-[12px] border border-[#222222]">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-black uppercase italic leading-none">{turf.openTime} — {turf.closeTime}</p>
                      <p className="text-[9px] text-[#444] font-black uppercase mt-1.5 tracking-widest">Daily Window</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => window.open(turf.googleMapsUrl || `https://maps.google.com/?q=${turf.name}`, '_blank')}
                className="w-full bg-[#111111] border border-[#222222] p-6 rounded-[16px] text-left hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Navigation className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Launch Navigation</span>
                </div>
                <p className="text-[13px] font-bold text-[#888] uppercase leading-snug italic line-clamp-2">{turf.address || turf.area}, MYSURU</p>
                <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.3em] mt-6 group-hover:translate-x-1 transition-transform">
                  GPS GUIDANCE ACTIVE <ArrowLeft className="h-3 w-3 rotate-180" />
                </div>
              </button>
            </aside>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Conversion Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-[#222]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-[#444] uppercase tracking-widest mb-1">Confirm Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary italic leading-none">
                {turf.pricePerHour > 0 ? `₹${turf.pricePerHour}` : "Ask"}
              </span>
              {turf.pricePerHour > 0 && <span className="text-[9px] text-[#888] font-black uppercase tracking-widest">/hr</span>}
            </div>
          </div>
          <div className="flex-1 flex gap-2">
             <Button asChild variant="outline" className="w-12 h-14 border-[#222] bg-[#1A1A1A] p-0 rounded-[12px]">
               <a href={phoneUrl}><Phone className="h-5 w-5" /></a>
             </Button>
             <Button asChild className="flex-1 h-14 bg-[#25D366] text-white font-black uppercase text-[11px] tracking-widest px-6 rounded-[12px] shadow-2xl shadow-[#25D366]/10 active:scale-[0.98] transition-all" onClick={handleWhatsAppClick}>
               <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                 <MessageCircle className="h-5 w-5" /> Ask availability
               </a>
             </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
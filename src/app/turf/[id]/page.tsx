
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
  Star,
  Calendar,
  ShieldCheck,
  ChevronDown,
  Car,
  Droplets,
  ZapIcon,
  FirstAid,
  Coffee,
  Bath,
  CircleDot
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { doc, increment, setDoc, addDoc, serverTimestamp, collection } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import * as gtag from "@/lib/gtag"
import { ReviewSection } from "@/components/review-section"
import { Switch } from "@/components/ui/switch"
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
      setDoc(doc(db, "analytics", "stats"), { totalWhatsAppClicks: increment(1) }, { merge: true });
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0A0A0A]"><Loader2 className="h-10 w-10 animate-spin text-[#AAFF00]" /></div>
  }

  if (!turf) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Zap className="h-16 w-16 text-[#AAFF00]/20 mb-8" />
          <h1 className="text-4xl font-bold uppercase italic">Arena Offline</h1>
          <p className="text-[#888888] mt-4">This listing could not be retrieved from the network.</p>
          <Button onClick={() => router.push("/")} className="bg-[#AAFF00] text-black mt-10 h-14 px-10 rounded-[10px] font-black uppercase tracking-widest">Back to Discovery</Button>
        </div>
        <Footer />
      </div>
    )
  }

  const galleryImages = turf.images && turf.images.length > 0 
    ? turf.images 
    : [turf.imageUrl || "https://picsum.photos/seed/turf/1200/800"];

  const whatsappUrl = `https://wa.me/${turf.whatsapp}?text=${encodeURIComponent(`Hi! I want to book ${turf.name} at ${turf.area}.`)}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#AAFF00] selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 max-w-7xl mx-auto w-full px-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-[10px] group font-black text-[11px] uppercase tracking-widest text-[#888888] hover:text-[#F5F5F5] h-12 px-6">
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> BACK TO CIRCUIT
          </Button>
          <Button variant="outline" onClick={() => navigator.share({ title: turf.name, url: window.location.href })} className="border-[#222222] text-[11px] font-black uppercase tracking-widest h-12 px-8 rounded-[10px]">
            <Share2 className="h-4 w-4 mr-3" /> SHARE
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. Hero Gallery */}
            <section className="relative rounded-[16px] overflow-hidden bg-[#111111] border border-[#222222]">
              <Carousel className="w-full">
                <CarouselContent>
                  {galleryImages.map((img: string, idx: number) => (
                    <CarouselItem key={idx}>
                      <div className="relative aspect-[16/9] w-full">
                        <Image 
                          src={img.includes('cloudinary.com') ? img.replace('/upload/', '/upload/f_webp,w_1200,q_75/') : img}
                          alt={`${turf.name} - View ${idx + 1}`}
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
                    <CarouselPrevious className="left-4 bg-black/50 border-white/10 hover:bg-black/80" />
                    <CarouselNext className="right-4 bg-black/50 border-white/10 hover:bg-black/80" />
                  </>
                )}
              </Carousel>
              {turf.isPremium && (
                <div className="absolute top-6 left-6 bg-[#AAFF00] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-[6px]">Elite Featured Arena</div>
              )}
            </section>

            {/* 2. Header & Strategy */}
            <section className="bg-[#111111] p-8 md:p-12 rounded-[16px] border border-[#222222] space-y-8">
              <div className="flex flex-wrap gap-2">
                {turf.sports?.map((s: string) => (
                  <Badge key={s} className="bg-[#AAFF00]/10 text-[#AAFF00] border-none px-4 py-1 rounded-[6px] font-bold uppercase tracking-widest text-[10px]">{s}</Badge>
                ))}
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-[6px] bg-white/5 border border-white/5 text-[10px] font-bold text-[#AAFF00]">
                  <Star className="h-3 w-3 fill-current" /> {turf.rating || 4.5} ({turf.reviewCount || 0} reviews)
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl md:text-6xl font-[800] tracking-tighter uppercase italic leading-none mb-6">{turf.name}</h1>
                <div className="flex items-center gap-2 text-[#888888] font-medium bg-[#1A1A1A] w-fit px-4 py-2 rounded-[10px] border border-[#222222]">
                  <MapPin className="h-4 w-4 text-[#AAFF00]" />
                  <span className="text-sm font-bold tracking-tight uppercase">{turf.address || turf.area}, MYSURU</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#AAFF00]/60">The Arena Strategy</h3>
                <p className="text-lg leading-relaxed italic text-[#F5F5F5]/80 border-l-2 border-[#AAFF00]/30 pl-8 font-medium">
                  {turf.description || "Premium sporting facility optimized for high-intensity community matches and professional training sessions."}
                </p>
              </div>

              {/* Amenities Grid */}
              <div className="pt-8 border-t border-[#222222]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#AAFF00]/60 mb-6">Elite Facilities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(turf.amenities || {}).map(([key, val]) => {
                    if (!val) return null;
                    const Icon = AMENITY_ICONS[key] || CircleDot;
                    return (
                      <div key={key} className="flex flex-col items-center justify-center gap-3 p-4 bg-[#1A1A1A] border border-[#222222] rounded-[10px] text-center">
                        <Icon className="h-5 w-5 text-[#AAFF00]" />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-[#888888]">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* 3. Operational Deck */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-[#111111] p-8 rounded-[16px] border border-[#222222] space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#AAFF00]/60">Pitch Intel</h3>
                <div className="space-y-4">
                  {[
                    { label: "Surface Type", value: turf.pitchType || "Artificial Turf" },
                    { label: "Available Formats", value: turf.pitchSizes?.join(", ") || "5-a-side" },
                    { label: "Dimensions", value: turf.dimensions || "Standard" },
                    { label: "Max Players", value: `${turf.maxPlayers} Athlete Limit` }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-[#222222] last:border-0 last:pb-0">
                      <span className="text-[#888888] font-bold uppercase text-[10px] tracking-widest">{item.label}</span>
                      <span className="font-bold text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#111111] p-8 rounded-[16px] border border-[#222222] space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#AAFF00]/60">Regulations</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="rules" className="border-none">
                    <AccordionTrigger className="text-[11px] font-bold uppercase tracking-widest hover:no-underline pt-0 pb-4">View Arena Rules</AccordionTrigger>
                    <AccordionContent className="text-[#888888] text-xs leading-relaxed space-y-2 pt-2">
                      {turf.rules && turf.rules.length > 0 ? turf.rules.map((rule: string, i: number) => (
                        <p key={i}>• {rule}</p>
                      )) : (
                        <>
                          <p>• Arrive 15 minutes prior to slot.</p>
                          <p>• No metal studs allowed.</p>
                          <p>• Respect other players and staff.</p>
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Insurance Upsell */}
                <div className="pt-6 border-t border-[#222222]">
                  <div className="flex items-center justify-between p-4 bg-[#AAFF00]/5 border border-[#AAFF00]/10 rounded-[10px]">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#AAFF00]" />
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-[#AAFF00]">Add Match Insurance</p>
                        <p className="text-[9px] text-[#888888] uppercase tracking-tighter">Starts from ₹15/player</p>
                      </div>
                    </div>
                    <Switch checked={addInsurance} onCheckedChange={setAddInsurance} />
                  </div>
                </div>
              </section>
            </div>

            {/* 4. Feedback Circuit */}
            <ReviewSection 
              turfId={id} 
              currentRating={turf.rating || 0} 
              reviewCount={turf.reviewCount || 0} 
            />

          </div>

          {/* Sticky Sidebar (Right - Desktop) */}
          <div className="lg:col-span-4">
            <aside className="sticky top-28 space-y-6">
              
              {/* Booking Card */}
              <div className="bg-[#111111] border border-[#222222] p-10 rounded-[16px] text-center space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#888888]">Hourly Rate</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-black text-[#AAFF00] italic tracking-tighter">₹{turf.pricePerHour}</span>
                    <span className="text-[#888888] font-black text-xs uppercase">/ HR</span>
                  </div>
                  {turf.peakHourPrice > 0 && (
                    <div className="text-[10px] font-bold text-[#888888]/60 uppercase tracking-widest pt-2">
                      Peak Rate: ₹{turf.peakHourPrice} (Starts {turf.peakHoursStart})
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full h-16 bg-[#25D366] text-white hover:bg-[#20ba5a] text-lg font-black uppercase rounded-[10px]" onClick={handleWhatsAppClick}>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-6 w-6 mr-3" /> WhatsApp
                    </a>
                  </Button>
                  <Button variant="secondary" className="w-full h-14 bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#222] text-xs font-black uppercase tracking-widest rounded-[10px]">
                    <Calendar className="h-4 w-4 mr-3" /> Check Slots
                  </Button>
                </div>

                <div className="pt-8 border-t border-[#222222] text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Operational Cycle</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", turf.isActive ? "text-[#AAFF00]" : "text-[#FF4444]")}>
                      {turf.isActive ? "● Active Now" : "Offline"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-[10px] border border-[#222222]">
                    <Clock className="h-5 w-5 text-[#AAFF00]" />
                    <div className="text-left">
                      <p className="text-sm font-bold uppercase italic leading-none">{turf.openTime} — {turf.closeTime}</p>
                      <p className="text-[9px] text-[#888888] font-bold uppercase mt-1 tracking-widest">Daily Window</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Card */}
              <button 
                onClick={() => window.open(turf.googleMapsUrl || `https://maps.google.com/?q=${turf.name}`, '_blank')}
                className="w-full bg-[#111111] border border-[#222222] p-6 rounded-[16px] text-left hover:border-[#AAFF00]/40 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Navigation className="h-5 w-5 text-[#AAFF00]" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Launch Navigation</span>
                </div>
                <p className="text-sm font-bold text-[#888888] uppercase leading-snug italic line-clamp-2">{turf.address || turf.area}, MYSURU</p>
                <div className="flex items-center gap-2 text-[#AAFF00] font-black text-[9px] uppercase tracking-[0.2em] mt-6 group-hover:translate-x-1 transition-transform">
                  Directions active <ArrowLeft className="h-3 w-3 rotate-180" />
                </div>
              </button>

            </aside>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Bar */}
      <div className="md:hidden fixed bottom-24 left-0 right-0 z-40 px-4">
        <div className="bg-[#111111]/95 backdrop-blur-xl border border-white/5 rounded-[16px] p-4 flex items-center justify-between shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
          <div>
            <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-black text-[#AAFF00] italic">₹{turf.pricePerHour}<span className="text-[10px] text-[#888888] uppercase ml-1">/hr</span></p>
          </div>
          <Button asChild className="h-12 bg-[#25D366] text-white font-black uppercase text-[11px] px-8 rounded-[10px]" onClick={handleWhatsAppClick}>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Book WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

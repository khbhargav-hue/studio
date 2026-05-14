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
  ShieldCheck, 
  Share2,
  Clock,
  Navigation,
  CheckCircle2,
  IndianRupee,
  Users
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { doc, increment, setDoc, addDoc, serverTimestamp, collection } from "firebase/firestore"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
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
          <p className="text-muted mt-4">This listing could not be retrieved.</p>
          <Button onClick={() => router.push("/")} className="btn-primary mt-10">Back to Discovery</Button>
        </div>
        <Footer />
      </div>
    )
  }

  const amenities = Object.entries(turf.amenities || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 max-w-7xl mx-auto w-full px-4">
        <div className="flex items-center justify-between mb-10">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group font-black text-[10px] uppercase tracking-widest text-muted">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1" /> Back
          </Button>
          <Button variant="outline" className="border-border text-[10px] font-black uppercase tracking-widest h-11 px-6">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="relative aspect-video rounded-[24px] overflow-hidden bg-surface border border-border shadow-2xl">
              <Image src={selectedImage || turf.imageUrl} alt={turf.name} fill className="object-cover" priority />
              {turf.isPremium && (
                <div className="absolute top-6 left-6 bg-primary text-black label-caps px-4 py-1.5 rounded-lg font-black">Featured Arena</div>
              )}
            </section>

            <section className="bg-card p-10 md:p-14 rounded-[32px] border border-border space-y-12">
              <div className="flex flex-wrap gap-4">
                {turf.sports?.map((s: string) => (
                  <Badge key={s} className="bg-primary/10 text-primary border-none label-caps px-4 py-1.5">{s}</Badge>
                ))}
              </div>
              
              <div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase italic leading-none">{turf.name}</h1>
                <div className="flex items-center gap-2 text-muted mt-6 font-medium">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-lg">{turf.address || turf.area}</span>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="label-caps text-primary/60">The Arena Narrative</h3>
                <p className="text-xl leading-relaxed italic text-foreground/80 border-l-2 border-primary/20 pl-8">{turf.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="label-caps text-primary/60">Premium Facilities</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {amenities.map(a => (
                      <div key={a} className="flex items-center gap-3 text-sm font-semibold text-foreground/70 uppercase tracking-widest">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> {a}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="label-caps text-primary/60">Pitch Intelligence</h3>
                  <div className="bg-surface p-6 rounded-2xl border border-border space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted font-black uppercase">Format</span>
                      <span className="font-bold">{turf.pitchType}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted font-black uppercase">Max Squad</span>
                      <span className="font-bold">{turf.maxPlayers} Players</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted font-black uppercase">Dimensions</span>
                      <span className="font-bold">{turf.dimensions || "Standard"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <aside className="sticky top-24 space-y-6">
              <Card className="bg-card border-border p-10 rounded-[32px] text-center">
                <div className="mb-10">
                  <p className="label-caps text-muted mb-2">Starting at</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-6xl font-bold text-primary italic tracking-tighter">₹{turf.pricePerHour}</span>
                    <span className="text-muted font-black text-xs uppercase mt-6">/ HR</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button asChild className="btn-primary w-full h-16 text-lg" onClick={handleWhatsAppClick}>
                    <a href={`https://wa.me/${turf.whatsapp}?text=Hi, I'm interested in booking ${turf.name}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-6 w-6 mr-2" /> Book Node
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="w-full h-14 border-border label-caps">
                    <a href={`tel:${turf.whatsapp}`}><Phone className="h-4 w-4 mr-2" /> Direct Signal</a>
                  </Button>
                </div>

                <div className="mt-10 pt-10 border-t border-border">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted tracking-widest mb-6">
                    <span>Opening Cycle</span>
                    <span className="text-primary">{turf.isActive ? 'Active' : 'Offline'}</span>
                  </div>
                  <div className="bg-surface p-6 rounded-2xl border border-border flex items-center gap-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-bold uppercase">{turf.openTime} - {turf.closeTime}</p>
                      <p className="text-[10px] text-muted font-black uppercase mt-1">Daily Operations</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-6 rounded-[24px] cursor-pointer hover:border-primary/20 transition-all" onClick={() => window.open(turf.googleMapsUrl || `https://maps.google.com/?q=${turf.name}`, '_blank')}>
                <Navigation className="h-5 w-5 text-primary mb-4" />
                <p className="text-sm font-bold text-muted uppercase line-clamp-2 italic">{turf.address || turf.area}</p>
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mt-4">Navigate to Grid <ArrowLeft className="h-3 w-3 rotate-180" /></div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
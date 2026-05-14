
"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { 
  Zap, 
  Trophy, 
  Loader2, 
  ArrowRight, 
  Star, 
  Users, 
  ShieldCheck, 
  Calendar,
} from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const SPORT_FILTERS = ["All", "Football", "Cricket", "Pickleball"]

const FEATURE_CHIPS = [
  { label: "Top Arenas", icon: Trophy },
  { label: "Easy Booking", icon: Calendar },
  { label: "Secure Payments", icon: ShieldCheck },
  { label: "Play & Connect", icon: Users }
]

export default function Home() {
  const db = useFirestore()
  const [activeFilter, setActiveFilter] = useState("All")
  
  // PRIMARY SOURCE OF TRUTH: Firestore settings/branding
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "settings", "branding")
  }, [db])

  const { data: branding, loading: brandingLoading } = useDoc(brandingRef)

  // PRIMARY SOURCE OF TRUTH: Firestore turfs collection
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), orderBy("name", "asc"))
  }, [db])

  const { data: turfs, loading: turfsLoading } = useCollection(turfsQuery)

  const filteredTurfs = useMemo(() => {
    if (!turfs) return []
    if (activeFilter === "All") return turfs
    return turfs.filter(t => t.sportTypes?.includes(activeFilter as any))
  }, [turfs, activeFilter])

  const challengeCategories = useMemo(() => {
    if (branding?.challenges && Array.isArray(branding.challenges) && branding.challenges.length > 0) {
      return branding.challenges.map((c: any) => ({
        name: c.name || "Sport",
        sub: c.sub || "Challenge",
        image: c.imageUrl || "https://picsum.photos/seed/sport/400/400",
        buttonText: c.buttonText || "JOIN NOW"
      }))
    }
    return []
  }, [branding])

  if (brandingLoading || turfsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
           <Loader2 className="h-14 w-14 animate-spin text-primary" />
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Syncing City Grid...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* CINEMATIC HERO SECTION */}
      <section className="relative min-h-[90vh] md:min-h-screen pt-32 pb-20 px-4 overflow-hidden flex items-center">
        
        {/* CINEMATIC COMPOSITION LAYER */}
        <div className="absolute top-0 right-0 w-full md:w-[60%] h-full pointer-events-none z-0">
          <div className="relative w-full h-full flex items-center justify-center md:justify-end">
            
            {/* AMBIENT BACKGROUND GLOW */}
            <div className="absolute top-1/2 left-1/2 md:left-2/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[800px] md:h-[800px] bg-primary/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
            
            {/* THE NEON RING (HALO) */}
            <div className="absolute top-1/2 md:top-[45%] left-1/2 md:left-2/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1.2, ease: "easeOut" }}
                 className="relative w-[320px] h-[320px] md:w-[580px] md:h-[580px] rounded-full border-[1px] border-primary/20 shadow-[0_0_80px_rgba(57,255,20,0.15)] flex items-center justify-center"
               >
                 {/* INTENSE NEON CORE RING */}
                 <div className="absolute inset-0 rounded-full border-[6px] border-primary opacity-80 blur-[2px]" />
                 <div className="absolute inset-0 rounded-full border-[12px] border-primary/40 blur-[15px]" />
                 <div className="absolute inset-0 rounded-full border-[30px] border-primary/10 blur-[40px]" />
                 
                 {/* RING SMOKE EFFECT (CSS RADIALLY GRADIENT) */}
                 <div className="absolute inset-[-40px] md:inset-[-80px] rounded-full opacity-30 mix-blend-screen bg-[radial-gradient(circle,transparent_50%,rgba(57,255,20,0.15)_70%,transparent_100%)]" />
               </motion.div>
            </div>

            {/* ATHLETE IMAGE - SEAMLESS BLENDING */}
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="relative w-full h-full max-h-[85vh] flex items-center justify-center md:justify-end z-10 mr-0 md:mr-[5%]"
            >
              {branding?.heroImageUrl && (
                <div className="relative w-full h-full max-w-[450px] md:max-w-[750px] flex items-end justify-center">
                  <Image 
                    src={branding.heroImageUrl} 
                    alt="Turfista Hero Athlete" 
                    width={1000} 
                    height={1000} 
                    className="w-full h-full object-contain object-bottom contrast-[1.1] drop-shadow-[0_20px_100px_rgba(0,0,0,0.8)]"
                    priority
                  />
                  {/* SOFT BOTTOM FADE BLENDING */}
                  <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-background via-background/40 to-transparent z-20" />
                </div>
              )}
            </motion.div>

            {/* GROUND GLOW */}
            <div className="absolute bottom-0 right-0 w-full h-[20%] bg-[radial-gradient(ellipse_at_bottom,rgba(57,255,20,0.15)_0%,transparent_70%)] z-10 opacity-60" />
          </div>
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-[110px] font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
              <span className="text-white">{branding?.heroHeadingWhite || "PLAY"}</span> <span className="text-primary text-neon">{branding?.heroHeadingNeon || "MORE."}</span><br />
              <span className="text-primary text-neon">{branding?.heroHeading2White || "BOOK"}</span> <span className="text-white">{branding?.heroHeading2Neon || "EASY."}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/40 font-medium max-w-xl leading-relaxed mb-12">
              {branding?.heroDescription || "Find elite arenas, build your squad and challenge the best in Mysuru."}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
              <Button asChild size="lg" className="btn-neon-glow w-full sm:w-auto h-18 px-12 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-2xl">
                <Link href="#turfs">
                  <Zap className="mr-3 h-5 w-5 fill-current" /> BOOK A TURF
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-18 px-12 border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-2xl">
                <Link href="/teams">
                  <Users className="mr-3 h-5 w-5" /> CREATE TEAM
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              {FEATURE_CHIPS.map((chip, idx) => (
                <div key={idx} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <chip.icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{chip.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {challengeCategories.length > 0 && (
        <section className="px-4 py-24 bg-black/50 border-t border-white/5">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-16">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-1 w-8 bg-primary rounded-full" />
                  <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">CHALLENGES</h2>
                </div>
                <p className="text-white/30 font-bold uppercase tracking-widest text-sm">Compete. Win. Earn Respect.</p>
              </div>
              <Link href="/challenges" className="hidden md:flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[11px] hover:translate-x-2 transition-transform">
                VIEW ALL CHALLENGES <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {challengeCategories.map((cat, idx) => (
                <motion.div 
                  key={cat.name + idx}
                  whileHover={{ y: -10 }}
                  className="glass-card rounded-[2.5rem] p-8 text-center group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative aspect-square mb-8 p-4">
                    <Image 
                      src={cat.image} 
                      alt={cat.name} 
                      fill 
                      className="object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" 
                    />
                  </div>
                  
                  <h3 className="text-2xl font-black text-primary italic uppercase tracking-tighter mb-1">{cat.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-8">{cat.sub}</p>
                  
                  <Button asChild variant="ghost" className="w-full h-14 rounded-2xl bg-white/5 hover:bg-primary hover:text-black border border-white/5 transition-all font-black uppercase tracking-widest text-[10px]">
                    <Link href="/challenges">{cat.buttonText}</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="turfs" className="px-4 py-24 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">FIND THE PERFECT TURF</h2>
              </div>
              <p className="text-white/30 font-bold uppercase tracking-widest text-sm">Top-rated arenas across Mysuru</p>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2">
              {SPORT_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "h-12 px-8 shrink-0 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                    activeFilter === filter 
                      ? "bg-primary text-black shadow-[0_0_20px_rgba(57,255,20,0.4)] scale-105" 
                      : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {(filteredTurfs && filteredTurfs.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-48 glass-card rounded-[5rem] border-dashed border-white/10 max-w-4xl mx-auto flex flex-col items-center gap-10">
              <Star className="h-20 w-20 text-white/5" />
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white/10 uppercase italic tracking-widest">Inventory Empty</h3>
                <p className="text-white/20 max-w-xs mx-auto text-sm font-medium uppercase tracking-widest italic leading-relaxed">No arenas published in this category yet. Connect via the Studio to deploy new nodes.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

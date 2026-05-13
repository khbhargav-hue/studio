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
  Target, 
  Wind, 
  ShieldCheck, 
  Calendar,
  MousePointerClick
} from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, where, limit } from "firebase/firestore"
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

const CHALLENGE_CATEGORIES = [
  { name: "Football", sub: "5v5 Challenge", icon: Zap, image: "https://picsum.photos/seed/ball1/400/400" },
  { name: "Cricket", sub: "Match Challenge", icon: Target, image: "https://picsum.photos/seed/bat1/400/400" },
  { name: "Badminton", sub: "Doubles Challenge", icon: Wind, image: "https://picsum.photos/seed/shuttle1/400/400" },
  { name: "Pickleball", sub: "Dink Challenge", icon: Star, image: "https://picsum.photos/seed/paddle1/400/400" }
]

export default function Home() {
  const db = useFirestore()
  const [activeFilter, setActiveFilter] = useState("All")
  
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), orderBy("name", "asc"))
  }, [db])

  const { data: turfs, loading } = useCollection(turfsQuery)

  const filteredTurfs = useMemo(() => {
    if (!turfs) return []
    if (activeFilter === "All") return turfs
    return turfs.filter(t => t.sportTypes?.includes(activeFilter as any))
  }, [turfs, activeFilter])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Redesigned Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-30" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-full h-full hidden md:block">
              <div className="relative w-full h-full flex items-center justify-center">
                 <div className="w-[500px] h-[500px] border-2 border-primary/30 rounded-full halo-effect" />
                 <div className="absolute inset-0 flex items-center justify-center translate-x-10 translate-y-10">
                    <Image 
                      src="https://picsum.photos/seed/athlete/800/800" 
                      alt="Athlete" 
                      width={600} 
                      height={600} 
                      className="object-contain grayscale-[0.5] contrast-125"
                      priority
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-[110px] font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
              <span className="text-white">PLAY</span> <span className="text-primary text-neon">MORE.</span><br />
              <span className="text-primary text-neon">BOOK</span> <span className="text-white">EASY.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/40 font-medium max-w-xl leading-relaxed mb-12">
              Find elite arenas, build your squad and challenge the best in Mysuru.
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

            {/* Feature Chips */}
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

      {/* Challenges Hub */}
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
            {CHALLENGE_CATEGORIES.map((cat, idx) => (
              <motion.div 
                key={cat.name}
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
                  <Link href="/challenges">JOIN NOW</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Discovery Hub */}
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

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">Synchronizing Arena Intel...</p>
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-48 glass-card rounded-[5rem] border-dashed border-white/10 max-w-4xl mx-auto flex flex-col items-center gap-10">
              <Star className="h-20 w-20 text-white/5" />
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white/10 uppercase italic tracking-widest">No Arenas Detected</h3>
                <p className="text-white/20 max-w-xs mx-auto text-sm font-medium uppercase tracking-widest italic leading-relaxed">Try adjusting your sport filters or area selection.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Turfista Section */}
      <section className="px-4 py-24 bg-black/80 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">WHY TURFISTA?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { title: "Verified Arenas", desc: "Best turfs, verified for quality", icon: ShieldCheck },
              { title: "Easy Booking", desc: "Book in seconds, play more", icon: MousePointerClick },
              { title: "Challenge & Win", desc: "Create or join exciting challenges", icon: Trophy },
              { title: "Built for Players", desc: "For athletes. By athletes.", icon: Users }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6 group">
                <div className="h-14 w-14 shrink-0 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-black italic text-white mb-2 uppercase">{item.title}</h4>
                  <p className="text-sm text-white/40 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="glass-card p-12 md:p-24 rounded-[4rem] bg-primary/[0.02] border-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
               <Trophy className="h-96 w-96 text-primary" />
            </div>
            
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none">
                READY TO <span className="text-primary text-neon">PLAY?</span>
              </h2>
              <p className="text-xl text-white/40 font-medium mb-12 max-w-xl leading-relaxed">
                Join thousands of players already playing more with Turfista.
              </p>
              <Button asChild size="lg" className="btn-neon-glow h-20 px-16 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-3xl">
                <Link href="/profile">
                  <Zap className="mr-3 h-6 w-6 fill-current" /> GET STARTED NOW
                </Link>
              </Button>
            </div>

            <div className="relative z-10 w-full md:w-1/3 aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/squad1/800/600" 
                alt="Squad" 
                fill 
                className="object-cover grayscale-[0.3]" 
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Zap, Trophy, Loader2, ArrowRight, Star, Filter, Users } from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, where, limit } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const SPORT_FILTERS = ["All", "Football", "Cricket", "Pickleball"]

export default function Home() {
  const db = useFirestore()
  const [activeFilter, setActiveFilter] = useState("All")
  
  // Queries
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), orderBy("name", "asc"))
  }, [db])

  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), where("isPopular", "==", true), limit(4))
  }, [db])

  const challengesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "challenges"), where("status", "==", "open"), limit(3))
  }, [db])

  const { data: turfs, loading } = useCollection(turfsQuery)
  const { data: featuredTurfs } = useCollection(featuredQuery)
  const { data: openChallenges } = useCollection(challengesQuery)

  const filteredTurfs = useMemo(() => {
    if (!turfs) return []
    if (activeFilter === "All") return turfs
    return turfs.filter(t => t.sportTypes?.includes(activeFilter as any))
  }, [turfs, activeFilter])

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      {/* Compact High-Intensity Hero */}
      <section className="relative pt-24 pb-8 md:pt-40 md:pb-16 px-4 bg-black overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.05)_0%,transparent_60%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 mb-4 bg-primary/10 border border-primary/20 py-1.5 px-4 rounded-full">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,1)]" />
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">LIVE MYSURU CIRCUIT</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
                <span className="text-white">PLAY</span> <span className="text-primary text-neon">MORE.</span><br />
                <span className="text-primary text-neon">BOOK</span> <span className="text-white">EASY.</span>
              </h1>
              <p className="text-base md:text-xl text-white/40 font-medium max-w-md leading-relaxed">
                The elite athlete network in Mysuru. Find elite pitches, build your squad, and dominate the league.
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
               <Button asChild className="btn-neon-glow bg-primary text-black font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl">
                  <Link href="/teams">FORM SQUAD</Link>
               </Button>
            </div>
          </div>

          {/* Sport Filters - High Priority UI */}
          <div className="flex flex-wrap gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2">
            {SPORT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "h-11 md:h-14 px-8 md:px-10 shrink-0 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all",
                  activeFilter === filter 
                    ? "bg-primary text-black shadow-[0_0_25px_rgba(57,255,20,0.5)] scale-105" 
                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Community Feed (Compact) */}
      {openChallenges && openChallenges.length > 0 && (
        <section className="px-4 py-8 bg-[#080808] border-b border-white/5 overflow-hidden">
          <div className="mx-auto max-w-7xl flex items-center gap-8 overflow-x-auto no-scrollbar">
             <div className="shrink-0 flex items-center gap-4 pr-8 border-r border-white/5">
                <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                   <Zap className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary">MATCH</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30">CIRCUIT</p>
                </div>
             </div>
             {openChallenges.map((challenge: any) => (
                <Link key={challenge.id} href="/challenges" className="shrink-0 flex items-center gap-6 bg-white/[0.02] p-4 pr-6 rounded-[1.5rem] border border-white/5 hover:border-primary/40 transition-all group">
                   <div className="text-left">
                      <p className="text-xs font-black italic uppercase leading-none text-white group-hover:text-primary transition-colors">{challenge.teamName}</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2">{challenge.sport} • {challenge.time}</p>
                   </div>
                   <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                      <ArrowRight className="h-3.5 w-3.5" />
                   </div>
                </Link>
             ))}
          </div>
        </section>
      )}

      {/* Monetization/Partner Preparation - Reserved Slot */}
      {/* <div className="px-4 pt-12 max-w-7xl mx-auto w-full">
          <div className="h-24 md:h-32 w-full rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center text-white/10 font-black uppercase tracking-[0.5em] text-[10px]">
             Partner Promotion Node
          </div>
      </div> */}

      {/* Discovery Feed */}
      <section className="px-4 py-16 md:py-24 bg-black">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div className="flex items-center gap-5">
              <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_20px_rgba(57,255,20,0.5)]" />
              <div>
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
                  ARENA <span className="text-white/40">NETWORK</span>
                </h2>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Verified Venues in Mysuru</p>
              </div>
            </div>
            {activeFilter !== "All" && (
               <Button asChild variant="ghost" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/5 rounded-xl">
                  <Link href={`/mysuru/${activeFilter.toLowerCase()}`}>
                    View {activeFilter} Guide <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
               </Button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Scanning Frequencies...</p>
            </div>
          ) : (filteredTurfs.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
              
              {/* Reserved for Future Sponsored Turf Card */}
              {/* <div className="glass-card rounded-[2.5rem] border-dashed border-primary/20 flex items-center justify-center p-12 text-center opacity-40">
                  <Star className="h-8 w-8 text-primary mb-4" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Sponsored Arena Slot</p>
              </div> */}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-white/10">
              <Star className="h-16 w-16 mx-auto mb-8 text-white/5" />
              <h3 className="text-3xl font-black text-white/10 uppercase italic">No Matches Detected</h3>
              <p className="text-white/20 mt-4 text-xs font-bold uppercase tracking-widest">Try resetting your sport filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Elite Partner Spotlight */}
      {featuredTurfs && featuredTurfs.length > 0 && (
         <section className="px-4 py-16 md:py-24 bg-[#050505] border-t border-white/5 overflow-hidden">
            <div className="mx-auto max-w-7xl">
               <div className="glass-card p-12 md:p-20 rounded-[4rem] bg-primary/[0.03] border-primary/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
                  <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                     <Trophy className="h-96 w-96 text-primary" />
                  </div>
                  <div className="relative z-10 text-center md:text-left max-w-xl">
                     <div className="inline-flex items-center gap-3 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] px-6 py-2.5 rounded-full mb-10 border border-primary/20">
                        <Star className="h-3 w-3 fill-current" /> ELITE PARTNER SPOTLIGHT
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-8 leading-none">
                        Experience <br /><span className="text-primary text-neon">{featuredTurfs[0].name}</span>
                     </h2>
                     <p className="text-lg md:text-xl text-white/40 font-medium mb-12 leading-relaxed italic">
                        "The standard-bearer for professional turf surfaces in Mysuru. Night performance lighting and elite joint protection."
                     </p>
                     <Button asChild className="btn-neon-glow h-20 px-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl transition-all">
                        <Link href={`/turf/${featuredTurfs[0].id}`}>CLAIM YOUR SLOT</Link>
                     </Button>
                  </div>
                  <div className="relative z-10 w-full md:w-2/5 aspect-[4/3] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                     <Image 
                        src={featuredTurfs[0].mainImage} 
                        alt={featuredTurfs[0].name}
                        fill
                        className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                     />
                  </div>
               </div>
            </div>
         </section>
      )}

      <Footer />
    </div>
  )
}

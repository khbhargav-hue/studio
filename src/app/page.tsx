
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Zap, Trophy, Loader2, ArrowRight, Star, Filter, Users } from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, where, limit } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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
    return query(collection(db, "challenges"), where("status", "==", "open"), limit(2))
  }, [db])

  const { data: turfs, loading } = useCollection(turfsQuery)
  const { data: featuredTurfs, loading: featuredLoading } = useCollection(featuredQuery)
  const { data: openChallenges } = useCollection(challengesQuery)

  const filteredTurfs = useMemo(() => {
    if (!turfs) return []
    if (activeFilter === "All") return turfs
    return turfs.filter(t => t.sportTypes?.includes(activeFilter as any))
  }, [turfs, activeFilter])

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      {/* Compact High-Visibility Hero */}
      <section className="relative pt-24 pb-8 md:pt-44 md:pb-20 px-4 bg-black overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.03)_0%,transparent_50%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 mb-4 bg-primary/10 border border-primary/20 py-1 px-3 rounded-full">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">MYSURU ARENA NETWORK</span>
              </div>
              <h1 className="text-4xl md:text-8xl text-white font-black italic uppercase tracking-tighter leading-[0.9] mb-4">
                PLAY <span className="text-primary text-neon">MORE.</span><br />
                BOOK <span className="text-primary text-neon">EASY.</span>
              </h1>
              <p className="text-sm md:text-lg text-white/40 font-medium max-w-sm">
                Discover elite arenas and join Mysuru's fastest growing athlete community.
              </p>
            </motion.div>

            {/* Quick Community Stats */}
            <div className="hidden lg:flex gap-6">
               <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/5 flex flex-col items-center justify-center min-w-[140px]">
                  <Users className="h-5 w-5 text-primary mb-2" />
                  <p className="text-2xl font-black italic">50+</p>
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Active Squads</p>
               </div>
               <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/5 flex flex-col items-center justify-center min-w-[140px]">
                  <Trophy className="h-5 w-5 text-primary mb-2" />
                  <p className="text-2xl font-black italic">120+</p>
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Matches Set</p>
               </div>
            </div>
          </div>

          {/* Sport Filters - High Priority UI */}
          <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-2">
            {SPORT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "h-10 md:h-12 px-6 md:px-8 shrink-0 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all",
                  activeFilter === filter 
                    ? "bg-primary text-black shadow-[0_0_20px_rgba(57,255,20,0.4)]" 
                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Immediate Community Feed (Compact) */}
      {openChallenges && openChallenges.length > 0 && (
        <section className="px-4 py-6 bg-[#080808] border-b border-white/5">
          <div className="mx-auto max-w-7xl flex items-center gap-6 overflow-x-auto no-scrollbar">
             <div className="shrink-0 flex items-center gap-3 pr-6 border-r border-white/5">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                   <Zap className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Live<br/>Feed</p>
             </div>
             {openChallenges.map((challenge: any) => (
                <Link key={challenge.id} href="/challenges" className="shrink-0 flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                   <div className="text-left">
                      <p className="text-[10px] font-black italic uppercase leading-none group-hover:text-primary transition-colors">{challenge.teamName}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">{challenge.sport} • {challenge.time}</p>
                   </div>
                   <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
             ))}
          </div>
        </section>
      )}

      {/* Discovery Feed - High Visibility */}
      <section className="px-4 py-12 md:py-24 bg-black">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(57,255,20,0.4)]" />
              <div>
                <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
                  DISCOVER <span className="text-white/40">ARENAS</span>
                </h2>
                <p className="text-[8px] md:text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Found {filteredTurfs.length} Venues in Mysuru</p>
              </div>
            </div>
            {activeFilter !== "All" && (
               <Link href={`/mysuru/${activeFilter.toLowerCase()}`} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">
                  Local {activeFilter} Guide
               </Link>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
          ) : (filteredTurfs.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 glass-card rounded-[3rem] border-dashed border-white/10">
              <Star className="h-12 w-12 mx-auto mb-6 text-white/5" />
              <h3 className="text-xl font-black text-white/10 uppercase italic">No Matches Found</h3>
            </div>
          )}
        </div>
      </section>

      {/* Featured Banners */}
      {featuredTurfs && featuredTurfs.length > 0 && (
         <section className="px-4 py-12 bg-[#050505] border-t border-white/5 overflow-hidden">
            <div className="mx-auto max-w-7xl">
               <div className="glass-card p-12 rounded-[3.5rem] bg-primary/5 border-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                     <Trophy className="h-64 w-64 text-primary" />
                  </div>
                  <div className="relative z-10 text-center md:text-left max-w-lg">
                     <div className="inline-block bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full mb-6">
                        ELITE PARTNER SPOTLIGHT
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-6">
                        Play at <span className="text-primary text-neon">{featuredTurfs[0].name}</span>
                     </h2>
                     <p className="text-white/40 font-medium mb-10 leading-relaxed">
                        Experience tournament-standard floodlights and premium FIFA-certified surfaces at one of Mysuru's most popular venues.
                     </p>
                     <Button asChild className="h-16 px-10 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                        <Link href={`/turf/${featuredTurfs[0].id}`}>RESERVE PITCH NOW</Link>
                     </Button>
                  </div>
                  <div className="relative z-10 w-full md:w-1/3 aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                     <img src={featuredTurfs[0].mainImage} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                  </div>
               </div>
            </div>
         </section>
      )}

      <Footer />
    </div>
  )
}

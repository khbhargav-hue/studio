
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Zap, Trophy, ShieldCheck, Target, Loader2, ArrowRight, Star, SlidersHorizontal } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, where, limit } from "firebase/firestore"
import Link from "next/link"

const PREDEFINED_AREAS = ["Bogadi", "Vijaynagar", "Kuvempunagar", "Srirampura", "Bannimantap"];

export default function Home() {
  const db = useFirestore()
  
  // Queries
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), orderBy("name", "asc"))
  }, [db])

  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), where("isPopular", "==", true), limit(4))
  }, [db])

  const brandingRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "settings", "branding")
  }, [db])

  const { data: turfs, loading } = useCollection(turfsQuery)
  const { data: featuredTurfs, loading: featuredLoading } = useCollection(featuredQuery)
  const { data: branding } = useDoc(brandingRef)

  // Filters State
  const [sportFilter, setSportFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")
  const [sortBy, setSortBy] = useState("price-asc")

  const areas = useMemo(() => {
    if (!turfs) return PREDEFINED_AREAS;
    const uniqueAreas = Array.from(new Set([...PREDEFINED_AREAS, ...turfs.map(t => t.area)]))
      .filter(Boolean)
      .sort();
    return uniqueAreas;
  }, [turfs])

  const filteredTurfs = useMemo(() => {
    if (!turfs) return []
    let result = turfs.filter(turf => {
      const matchesSport = sportFilter === "all" || 
                          turf.sportTypes?.some((s: string) => s.toLowerCase() === sportFilter.toLowerCase())
      const matchesArea = areaFilter === "all" || turf.area === areaFilter
      return matchesSport && matchesArea
    })

    // Sorting
    if (sortBy === "price-asc") result.sort((a, b) => a.pricePerHour - b.pricePerHour)
    if (sortBy === "price-desc") result.sort((a, b) => b.pricePerHour - a.pricePerHour)
    if (sortBy === "rating") result.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    return result
  }, [turfs, sportFilter, areaFilter, sortBy])

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      {/* Redesigned Hero Section */}
      <section className="relative pt-44 pb-32 px-4 bg-black overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.05)_0%,transparent_60%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-10 bg-primary/5 border border-primary/10 py-2 px-5 rounded-full backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-1000">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">
              {branding?.heroBadgeText || "ELITE ARENA NETWORK"}
            </span>
          </div>
          
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <h1 className="text-6xl md:text-9xl text-white font-black italic uppercase tracking-tighter leading-none mb-4">
              PLAY <span className="text-primary text-neon">MORE.</span>
            </h1>
            <h2 className="text-6xl md:text-9xl text-white font-black italic uppercase tracking-tighter leading-none">
              BOOK <span className="text-primary text-neon">EASY.</span>
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-white/40 max-w-lg font-medium mb-16 animate-in fade-in duration-1000 delay-300">
            {branding?.heroDescription || "Discover and book Mysuru’s most premium sports arenas with zero friction."}
          </p>

          {/* Compact Minimal Filters */}
          <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="glass-card p-2 rounded-3xl border-white/5 flex flex-col sm:flex-row items-center gap-2 bg-white/[0.03] backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-3 px-5 py-3 border-r border-white/5 hidden sm:flex">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Filters</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="h-12 bg-white/5 border-none text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-12 bg-white/5 border-none text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                    <SelectValue placeholder="Area" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 bg-white/5 border-none text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center justify-center h-12 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                  <span className="text-[10px] font-black uppercase tracking-widest">{filteredTurfs.length} Venues</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="px-4 py-24 bg-black border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="h-12 w-2 bg-primary rounded-full shadow-[0_0_20px_rgba(57,255,20,0.6)]" />
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  FEATURED <span className="text-primary text-neon">ARENAS</span>
                </h2>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Elite hand-picked venues in Mysuru</p>
              </div>
            </div>
            <Link href="/featured" className="group flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-80 transition-all">
              VIEW ALL <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            </div>
          ) : featuredTurfs && featuredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {featuredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Main Inventory Section */}
      <section className="px-4 py-24 bg-black border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                ALL <span className="text-white/40">PITCERS</span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing database...</p>
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-white/10">
              <Star className="h-16 w-16 mx-auto mb-8 text-white/5" />
              <h3 className="text-3xl font-black text-white/10 uppercase italic">No Venues Found</h3>
              <p className="text-white/20 max-w-xs mx-auto text-sm font-medium mt-4">Refine your filters to discover more arenas.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

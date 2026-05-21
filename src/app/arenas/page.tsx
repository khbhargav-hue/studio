"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { TurfCard } from "@/components/turf-card"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, limit } from "firebase/firestore"
import { Search, MapPin, Database, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { SkeletonCard } from "@/components/Skeleton"

const SPORT_FILTERS = ["All", "Football", "Cricket", "Badminton", "Pickleball", "Swimming"]

export default function ArenasPage() {
  const db = useFirestore()
  const [activeSport, setActiveSport] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), limit(50))
  }, [db])

  const { data: turfs, loading } = useCollection(turfsQuery)

  const filteredTurfs = useMemo(() => {
    if (!turfs) return []
    return turfs.filter((t: any) => {
      const matchesSearch = !searchQuery || 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.area?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesSport = activeSport === "All" || 
        (t.sports && t.sports.includes(activeSport))
        
      return matchesSearch && matchesSport
    })
  }, [turfs, searchQuery, activeSport])

  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 max-w-7xl mx-auto w-full px-4 md:px-8">
        <header className="mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <Database className="h-3 w-3" /> MYSURU ARENA REGISTRY
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
            Find Your <span className="text-primary">Pitch.</span>
          </h1>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
            <Input 
              placeholder="Search by arena name or area (Vijayanagar, Bogadi)..." 
              className="h-14 pl-14 bg-white/5 border-white/5 rounded-xl text-lg italic focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {SPORT_FILTERS.map(s => (
              <button 
                key={s}
                onClick={() => setActiveSport(s)}
                className={cn(
                  "h-14 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0",
                  activeSport === s ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 text-white/40 hover:border-primary/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredTurfs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTurfs.map((turf) => <TurfCard key={turf.id} turf={turf as any} />)}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
            <Zap className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-white/10 uppercase italic">No Arenas Identified</h3>
            <p className="text-white/20 mt-4 max-w-xs mx-auto italic">Try adjusting your filters or area search.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}

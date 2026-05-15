
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { 
  Trophy, 
  Loader2, 
  Search,
  MapPin,
  Activity,
  Zap
} from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

const SPORT_FILTERS = ["All", "Football", "Cricket", "Pickleball", "Badminton"]

export default function Home() {
  const db = useFirestore()
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "settings", "branding")
  }, [db])

  const { data: branding, loading: brandingLoading } = useDoc(brandingRef)

  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), orderBy("name", "asc"))
  }, [db])

  const { data: turfs, loading: turfsLoading } = useCollection(turfsQuery)

  const filteredTurfs = useMemo(() => {
    if (!turfs) return []
    return turfs.filter(t => {
      const matchesSport = activeFilter === "All" || (t.sports && t.sports.includes(activeFilter))
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.area?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSport && matchesSearch
    })
  }, [turfs, activeFilter, searchQuery])

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center px-4 overflow-hidden border-b border-white/5 bg-[#050505]">
        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 label-caps text-primary bg-primary/10 border border-primary/20 px-5 py-2 rounded-full animate-in fade-in slide-in-from-top-4 duration-1000">
            <Activity className="h-3 w-3 animate-pulse" /> INDIA'S TURF NETWORK
          </div>
          
          <h1 className="max-w-5xl mx-auto text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic text-white">
            {branding?.heroHeadingWhite || "Find & Book Your"} <br />
            <span className="text-primary text-neon">{branding?.heroHeadingNeon || "Perfect Turf"}</span>
          </h1>
          
          <p className="text-xl text-white/40 max-w-[600px] mx-auto leading-relaxed font-medium italic">
            {branding?.heroDescription || "The premier discovery and booking platform for the modern athlete. Join Mysuru's elite circuit."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button asChild className="btn-primary w-full sm:w-auto h-20 text-xl px-12 rounded-[1.5rem] shadow-[0_20px_50px_rgba(170,255,0,0.3)]">
              <Link href="#listings">BOOK A TURF</Link>
            </Button>
            <Button asChild variant="outline" className="btn-secondary w-full sm:w-auto h-20 text-xl px-12 rounded-[1.5rem] border-white/10 hover:bg-white/5">
              <Link href="/teams">CREATE TEAM</Link>
            </Button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* LISTINGS SECTION */}
      <section id="listings" className="py-24 px-4 max-w-7xl mx-auto w-full space-y-16">
        <div className="sticky top-[64px] z-30 bg-background/90 backdrop-blur-2xl py-10 border-b border-white/5 flex flex-col md:flex-row items-center gap-8">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by arena name or area (e.g. Bogadi)..." 
              className="bg-white/[0.03] border-white/10 pl-16 h-16 rounded-2xl text-lg italic font-medium focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
            {SPORT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "label-caps px-8 h-16 rounded-2xl border italic font-black transition-all whitespace-nowrap",
                  activeFilter === filter 
                    ? "bg-primary text-black border-primary shadow-[0_10px_30px_rgba(170,255,0,0.2)]" 
                    : "bg-white/5 text-white/30 border-white/5 hover:border-white/20 hover:text-white"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {turfsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-[280px] w-full rounded-[2.5rem] bg-white/5" />
                <Skeleton className="h-8 w-3/4 bg-white/5 rounded-xl" />
                <Skeleton className="h-5 w-1/2 bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredTurfs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredTurfs.map((turf) => (
              <TurfCard key={turf.id} turf={turf as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center glass-card border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
            <Trophy className="h-20 w-20 text-white/5 mx-auto mb-8" />
            <h3 className="text-white/20 text-3xl font-black uppercase italic tracking-widest">No Intelligence Found</h3>
            <p className="text-white/10 mt-4 font-medium italic">Adjust your search filters to scan the circuit again.</p>
            <Button variant="ghost" onClick={() => { setActiveFilter("All"); setSearchQuery(""); }} className="mt-10 text-primary uppercase font-black tracking-widest text-[10px]">REBOOT SCAN</Button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}


"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, MapPin, Zap, Trophy, ShieldCheck, Target } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"

const PREDEFINED_AREAS = ["Bogadi", "Vijaynagar", "Kuvempunagar", "Srirampura", "Bannimantap"];

export default function Home() {
  const db = useFirestore()
  
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), orderBy("name", "asc"))
  }, [db])

  const brandingRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "settings", "branding")
  }, [db])

  const { data: turfs, loading } = useCollection(turfsQuery)
  const { data: branding } = useDoc(brandingRef)

  const [searchQuery, setSearchQuery] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")

  const areas = useMemo(() => {
    if (!turfs) return PREDEFINED_AREAS;
    const uniqueAreas = Array.from(new Set([...PREDEFINED_AREAS, ...turfs.map(t => t.area)]))
      .filter(Boolean)
      .sort();
    return uniqueAreas;
  }, [turfs])

  const filteredTurfs = useMemo(() => {
    if (!turfs) return []
    return turfs.filter(turf => {
      const matchesSearch = 
        turf.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        turf.area?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesSport = sportFilter === "all" || 
                          turf.sportTypes?.some((s: string) => s.toLowerCase() === sportFilter.toLowerCase())
      
      const matchesArea = areaFilter === "all" || turf.area === areaFilter

      return matchesSearch && matchesSport && matchesArea
    })
  }, [turfs, searchQuery, sportFilter, areaFilter])

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      {/* Minimal Premium Hero Section */}
      <section className="relative pt-32 pb-16 px-4 bg-black overflow-hidden" aria-labelledby="hero-heading">
        {/* Subtle Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-6 bg-primary/5 border border-primary/10 py-1.5 px-4 rounded-full backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">
              {branding?.heroBadgeText || "WE CONNECT YOU TO THE BEST TURFS"}
            </span>
          </div>
          
          <div className="mb-6 space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h1 id="hero-heading" className="text-4xl md:text-6xl text-primary font-black italic uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
              {branding?.heroHeading2 || "BOOK EASY."}
            </h1>
            <p className="text-4xl md:text-6xl text-white font-black italic uppercase tracking-tighter">
              {branding?.heroHeading1 || "PLAY MORE."}
            </p>
          </div>
          
          <p className="text-base md:text-lg text-white/40 max-w-xl font-medium mb-10 animate-in fade-in duration-500 delay-200">
            {branding?.heroDescription || "Discover and book Mysuru’s best sports turfs in one place."}
          </p>

          {/* Search/Filter Bar */}
          <div className="w-full max-w-3xl animate-in fade-in zoom-in duration-500 delay-300">
            <div className="glass-card p-2 rounded-2xl border-white/5 flex flex-col md:flex-row gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                <Input 
                  aria-label="Search turfs in Mysuru"
                  placeholder="Find your pitch..." 
                  className="pl-10 h-12 bg-white/5 border-none text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger aria-label="Filter by sport" className="h-12 w-full md:w-36 bg-white/5 border-white/5 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-xl">
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger aria-label="Filter by area" className="h-12 w-full md:w-36 bg-white/5 border-white/5 text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Area" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-xl">
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section - Best Football & Cricket Turfs in Mysuru */}
      <section className="bg-black py-16 px-4 border-t border-white/5" aria-labelledby="seo-title">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-xl">
              <Trophy className="h-3 w-3" />
              Mysuru Sports Directory
            </div>
            <h2 id="seo-title" className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
              Best Football & <span className="text-primary">Cricket Turfs</span> in Mysuru
            </h2>
            <p className="text-white/60 text-lg leading-relaxed font-medium">
              Mysuru is witnessing a sports revolution. From late-night 5-a-side football matches to weekend box cricket tournaments, Turfista is the #1 discovery engine for athletes in <strong>Karnataka</strong>. Whether you are in <strong>Vijaynagar</strong>, <strong>Bogadi</strong>, or <strong>Kuvempunagar</strong>, finding a verified pitch with elite floodlighting has never been easier.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-1">Verified Partners</h4>
                  <p className="text-white/40 text-[11px]">Hand-picked elite sports venues.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-1">Real-time Booking</h4>
                  <p className="text-white/40 text-[11px]">Instant connection via WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 group">
             <img 
               src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop" 
               alt="Sports turf in Mysuru under floodlights" 
               className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
             />
             <div className="absolute inset-0 bg-primary/10 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
          </div>
        </div>
      </section>

      {/* Main Inventory Section */}
      <section className="px-4 py-12 bg-black border-t border-white/5" aria-labelledby="inventory-title">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(57,255,20,0.5)]" />
              <h2 id="inventory-title" className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
                ELITE <span className="text-primary">ARENAS</span>
              </h2>
            </div>
            <div className="hidden md:block">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                {filteredTurfs.length} verified venues in Mysuru
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/20">Syncing Pitches...</p>
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass-card rounded-[2.5rem] border-dashed border-white/10">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-white/5" />
              <h3 className="text-xl font-bold text-white/10 uppercase italic">No Pitches Found</h3>
              <p className="text-white/20 max-w-xs mx-auto text-xs font-medium">Try broadening your search criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

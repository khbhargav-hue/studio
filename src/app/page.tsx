"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, MapPin, Zap } from "lucide-react"
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
      
      {/* Redesigned Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Cinematic Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={branding?.heroImageUrl || "https://picsum.photos/seed/turf-hero/1920/1080"} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50 grayscale-[0.2]"
          />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-8 bg-primary/10 border border-primary/30 py-2 px-6 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
            <Zap className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              {branding?.heroBadgeText || "WE CONNECT YOU TO THE BEST TURFS"}
            </span>
          </div>
          
          <div className="mb-10 space-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <h1 className="text-6xl md:text-9xl text-neon leading-none tracking-tighter">
              BOOK EASY.
            </h1>
            <h1 className="text-6xl md:text-9xl text-white leading-none tracking-tighter">
              PLAY MORE.
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl font-medium mb-12 animate-in fade-in duration-700 delay-300">
            Discover and book Mysuru’s best sports turfs in one place.
          </p>

          {/* Search/Filter Bar */}
          <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-700 delay-500">
            <div className="glass-card p-3 rounded-2xl flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  placeholder="Search name or location..." 
                  className="pl-12 h-14 bg-white/5 border-none text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="h-14 w-full md:w-40 bg-white/5 border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 rounded-xl backdrop-blur-xl">
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-14 w-full md:w-40 bg-white/5 border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Area" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 rounded-xl backdrop-blur-xl">
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

      {/* Main Inventory Section */}
      <section className="px-4 py-20 bg-black">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(57,255,20,0.6)]" />
              <h2 className="text-4xl md:text-5xl">
                ELITE <span className="text-primary">ARENAS</span>
              </h2>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
                Showing {filteredTurfs.length} verified venues
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
              <p className="text-xs font-black uppercase tracking-widest text-primary/40">Syncing Pitches...</p>
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[3rem] border-dashed border-white/10">
              <MapPin className="h-16 w-16 mx-auto mb-6 text-white/10" />
              <h3 className="text-3xl text-white/20 mb-2">No Pitches Found</h3>
              <p className="text-white/30 max-w-xs mx-auto text-sm font-medium">Try broadening your search criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Link as LinkIcon } from "lucide-react"
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
  const [courtFilter, setCourtFilter] = useState("all")

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

      const matchesCourt = courtFilter === "all" || 
                          turf.courtTypes?.some((c: string) => c.toLowerCase().includes(courtFilter.toLowerCase()))

      return matchesSearch && matchesSport && matchesArea && matchesCourt
    })
  }, [turfs, searchQuery, sportFilter, areaFilter, courtFilter])

  // Dynamic branding defaults
  const heroContent = {
    badge: branding?.heroBadgeText || "WE CONNECT YOU TO THE BEST TURFS",
    h1: branding?.heroHeading1 || "PLAY MORE.",
    h2: branding?.heroHeading2 || "BOOK EASY.",
    desc: branding?.heroDescription || "Discover and book Mysuru’s best sports turfs in one place. Football, Cricket, Pickleball and more — all in one platform.",
    image: branding?.heroImageUrl || "https://picsum.photos/seed/turf-hero/1920/1080"
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      {/* Premium Hero Section */}
      <section className="relative h-screen min-h-[850px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms]"
          style={{ backgroundImage: `url('${heroContent.image}')` }}
          data-ai-hint="football stadium night floodlights"
        />
        {/* Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#050505]" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 mb-10 bg-[#1AFF73]/10 backdrop-blur-md border border-[#1AFF73]/30 py-2.5 px-6 rounded-full animate-in fade-in slide-in-from-top-4 duration-1000">
            <LinkIcon className="h-3 w-3 text-[#1AFF73]" />
            <span className="text-[11px] font-black text-[#1AFF73] uppercase tracking-[0.2em]">{heroContent.badge}</span>
          </div>
          
          <h1 className="font-headline text-7xl md:text-[8.5rem] font-black tracking-tighter mb-8 leading-[0.85] uppercase italic animate-in fade-in zoom-in-95 duration-1000">
            <span className="text-white block">{heroContent.h1}</span>
            <span className="text-[#1AFF73] block drop-shadow-[0_0_30px_rgba(26,255,115,0.6)]">{heroContent.h2}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 mb-20 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {heroContent.desc}
          </p>
          
          {/* Floating Search Bar */}
          <div className="mx-auto max-w-6xl w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="bg-[#121212]/80 backdrop-blur-3xl rounded-[2.5rem] p-4 border border-white/5 flex flex-col lg:row md:flex-row gap-2 shadow-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1AFF73]" />
                <Input 
                  placeholder="Search by name or location..." 
                  className="pl-14 h-16 bg-transparent border-none text-white placeholder:text-white/20 text-base focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="h-10 w-px bg-white/5 self-center hidden md:block" />
              
              <div className="w-full md:w-56">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="h-16 bg-transparent border-none text-white focus:ring-0 font-black text-xs uppercase tracking-widest">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-2xl">
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                    <SelectItem value="badminton">Badminton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-10 w-px bg-white/5 self-center hidden md:block" />

              <div className="w-full md:w-56">
                <Select value={courtFilter} onValueChange={setCourtFilter}>
                  <SelectTrigger className="h-16 bg-transparent border-none text-white focus:ring-0 font-black text-xs uppercase tracking-widest">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-2xl">
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="half">Half Court</SelectItem>
                    <SelectItem value="full">Full Court</SelectItem>
                    <SelectItem value="5A">5A Side</SelectItem>
                    <SelectItem value="7A">7A Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-10 w-px bg-white/5 self-center hidden md:block" />

              <div className="w-full md:w-56">
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-16 bg-transparent border-none text-white focus:ring-0 font-black text-xs uppercase tracking-widest">
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-2xl">
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

      {/* Turf Listings */}
      <section className="px-4 py-32 md:px-8 bg-[#050505]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="space-y-4">
              <div className="inline-block bg-[#1AFF73]/10 text-[#1AFF73] text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-xl">
                Elite Collection
              </div>
              <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-white">
                Featured <span className="text-[#1AFF73]">Arenas</span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
              <Loader2 className="h-16 w-16 animate-spin text-[#1AFF73] opacity-20" />
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-48 bg-white/5 rounded-[5rem] border-dashed border-white/10">
              <h3 className="text-4xl font-black mb-4 uppercase italic text-white/10 tracking-widest">No Pitches Found</h3>
              <p className="text-white/30 max-w-sm mx-auto text-xl font-medium">Try adjusting your scouting filters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

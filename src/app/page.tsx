
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, MapPin } from "lucide-react"
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

  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      {/* Compact Utility Hero */}
      <section className="relative pt-32 pb-16 px-4 bg-gradient-to-b from-black to-[#050505] border-b border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 bg-primary/10 border border-primary/20 py-1.5 px-4 rounded-full">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                {branding?.heroBadgeText || "WE CONNECT YOU TO THE BEST TURFS"}
              </span>
            </div>
            
            <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-none uppercase italic text-white">
              Find and Book <span className="text-primary">Mysuru’s Best Turfs</span>
            </h1>
            
            <p className="text-lg text-white/50 max-w-2xl font-medium">
              Football, Cricket, Pickleball and more — all in one platform.
            </p>
          </div>

          {/* Streamlined Search Bar */}
          <div className="mx-auto max-w-6xl w-full">
            <div className="bg-[#121212]/90 backdrop-blur-xl rounded-3xl p-3 border border-white/10 flex flex-col md:flex-row gap-2 shadow-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input 
                  placeholder="Search name or location..." 
                  className="pl-12 h-14 bg-transparent border-none text-white placeholder:text-white/20 focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="h-14 w-full md:w-40 bg-white/5 border-white/5 text-white focus:ring-0 font-bold text-[10px] uppercase tracking-widest rounded-2xl">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-2xl">
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-14 w-full md:w-40 bg-white/5 border-white/5 text-white focus:ring-0 font-bold text-[10px] uppercase tracking-widest rounded-2xl">
                    <SelectValue placeholder="Area" />
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

      {/* Immediate Turf Inventory */}
      <section className="px-4 py-16 md:px-8 bg-[#050505]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-primary rounded-full" />
              <h2 className="font-headline text-3xl font-black tracking-tight uppercase italic text-white">
                Available <span className="text-primary">Arenas</span>
              </h2>
            </div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">
              {filteredTurfs.length} Venues found
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-white/10" />
              <h3 className="text-2xl font-black mb-2 uppercase italic text-white/20">No Venues Found</h3>
              <p className="text-white/30 max-w-xs mx-auto text-sm">Try adjusting your filters to find more pitches.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

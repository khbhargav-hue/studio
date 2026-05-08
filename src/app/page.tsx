
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Zap } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function Home() {
  const db = useFirestore()
  
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), orderBy("name", "asc"))
  }, [db])

  const { data: turfs, loading } = useCollection(turfsQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")
  const [courtFilter, setCourtFilter] = useState("all")

  const areas = useMemo(() => {
    if (!turfs) return []
    const uniqueAreas = Array.from(new Set(turfs.map(t => t.area))).filter(Boolean)
    return uniqueAreas.sort()
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
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Cinematic Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-110"
          style={{ backgroundImage: `url('https://picsum.photos/seed/turf-hero/1920/1080')` }}
          data-ai-hint="stadium floodlight night"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 mb-8 bg-white/5 backdrop-blur-xl border border-white/10 py-2.5 px-6 rounded-2xl">
            <Zap className="h-4 w-4 text-primary fill-current" />
            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.4em]">We connect you to the best turfs</span>
          </div>
          
          <h1 className="font-headline text-6xl md:text-[8rem] font-black tracking-tighter mb-8 leading-[0.8] uppercase italic">
            <span className="text-white block">PLAY MORE.</span>
            <span className="text-primary text-neon block">BOOK EASY.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-muted-foreground/80 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover and book Mysuru’s best sports turfs in one place. Football, Cricket, Pickleball and more — all in one platform.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
             <div className="h-1.5 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(26,255,115,0.5)]" />
             <div className="h-1.5 w-12 bg-white/10 rounded-full" />
             <div className="h-1.5 w-12 bg-white/10 rounded-full" />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-40 px-4 -mt-16 mb-20">
        <div className="mx-auto max-w-7xl glass-card rounded-[2.5rem] p-5 md:p-8 shadow-[0_40px_80px_rgba(0,0,0,0.5)] border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="relative md:col-span-4">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
              <Input 
                placeholder="Search by arena name or area..." 
                className="pl-14 h-16 bg-background/50 border-white/5 focus:border-primary/40 transition-all rounded-[1.25rem] text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="h-16 bg-background/50 border-white/5 rounded-[1.25rem] font-bold">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 rounded-2xl">
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="cricket">Cricket</SelectItem>
                  <SelectItem value="pickleball">Pickleball</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={courtFilter} onValueChange={setCourtFilter}>
                <SelectTrigger className="h-16 bg-background/50 border-white/5 rounded-[1.25rem] font-bold">
                  <SelectValue placeholder="Court Size" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 rounded-2xl">
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="half">Half Court</SelectItem>
                  <SelectItem value="full">Full Court</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="h-16 bg-background/50 border-white/5 rounded-[1.25rem] font-bold">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 rounded-2xl">
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Turf Listings */}
      <section className="px-4 py-8 md:px-8 mb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-lg mb-4">
                Elite Collection
              </div>
              <h2 className="font-headline text-4xl md:text-6xl font-bold tracking-tight uppercase italic leading-none">
                Featured <span className="text-primary text-neon">Arenas</span>
              </h2>
            </div>
            <div className="flex gap-3">
               <Badge 
                 variant="outline" 
                 className="border-white/10 text-[10px] uppercase font-black px-6 py-2.5 rounded-xl hover:bg-primary hover:text-background hover:border-primary cursor-pointer transition-all duration-300" 
                 onClick={() => {
                   setSportFilter("all");
                   setAreaFilter("all");
                   setCourtFilter("all");
                   setSearchQuery("");
                 }}
               >
                 View All
               </Badge>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="h-14 w-14 animate-spin text-primary opacity-30" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scouting Pitches...</span>
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-white/10">
              <Zap className="h-20 w-20 text-muted-foreground/10 mx-auto mb-8" />
              <h3 className="text-3xl font-bold mb-4 uppercase italic">No Pitches Found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto text-lg font-medium">Try adjusting your filters or scouting a different area.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

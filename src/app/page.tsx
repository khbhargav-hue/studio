
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Link as LinkIcon, ShieldCheck, CalendarCheck, Headphones, Lock } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
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
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      {/* Premium Hero Section */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms]"
          style={{ backgroundImage: `url('https://picsum.photos/seed/turf-hero/1920/1080')` }}
          data-ai-hint="football stadium night floodlights"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#050505]" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <div className="inline-flex items-center gap-2 mb-8 bg-[#1AFF73]/10 backdrop-blur-md border border-[#1AFF73]/30 py-2 px-4 rounded-full">
            <LinkIcon className="h-3 w-3 text-[#1AFF73]" />
            <span className="text-[10px] font-bold text-[#1AFF73] uppercase tracking-widest">We connect you to the best turfs</span>
          </div>
          
          <h1 className="font-headline text-6xl md:text-[7.5rem] font-black tracking-tight mb-8 leading-[0.9] uppercase italic">
            <span className="text-white block">PLAY MORE.</span>
            <span className="text-[#1AFF73] block [text-shadow:0_0_30px_rgba(26,255,115,0.4)]">BOOK EASY.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover and book the best sports turfs in Mysuru.<br />
            Football, Cricket, Pickleball and more — all in one place.
          </p>
          
          {/* Floating Search Bar */}
          <div className="mx-auto max-w-6xl w-full">
            <div className="bg-[#121212]/80 backdrop-blur-2xl rounded-[2rem] p-4 border border-white/5 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1AFF73]" />
                <Input 
                  placeholder="Search by name or location..." 
                  className="pl-12 h-14 bg-transparent border-none text-white placeholder:text-white/30 text-sm focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="h-10 w-px bg-white/5 self-center hidden md:block" />
              
              <div className="w-full md:w-48">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="h-14 bg-transparent border-none text-white focus:ring-0 font-bold text-sm">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-xl">
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-10 w-px bg-white/5 self-center hidden md:block" />

              <div className="w-full md:w-48">
                <Select value={courtFilter} onValueChange={setCourtFilter}>
                  <SelectTrigger className="h-14 bg-transparent border-none text-white focus:ring-0 font-bold text-sm">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-xl">
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="half">Half Court</SelectItem>
                    <SelectItem value="full">Full Court</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-10 w-px bg-white/5 self-center hidden md:block" />

              <div className="w-full md:w-48">
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-14 bg-transparent border-none text-white focus:ring-0 font-bold text-sm">
                    <SelectValue placeholder="All Areas" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-xl">
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

        {/* Features Row */}
        <div className="absolute bottom-12 left-0 right-0 z-10 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-8 md:gap-4">
            <div className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-xl bg-[#1AFF73]/5 border border-[#1AFF73]/10 flex items-center justify-center group-hover:bg-[#1AFF73]/10 transition-colors">
                <ShieldCheck className="h-6 w-6 text-[#1AFF73]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">Trusted Turfs</h4>
                <p className="text-[11px] text-white/40">Verified & quality assured</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-xl bg-[#1AFF73]/5 border border-[#1AFF73]/10 flex items-center justify-center group-hover:bg-[#1AFF73]/10 transition-colors">
                <CalendarCheck className="h-6 w-6 text-[#1AFF73]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">Easy Booking</h4>
                <p className="text-[11px] text-white/40">Book in just a few clicks</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-xl bg-[#1AFF73]/5 border border-[#1AFF73]/10 flex items-center justify-center group-hover:bg-[#1AFF73]/10 transition-colors">
                <Headphones className="h-6 w-6 text-[#1AFF73]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">24/7 Support</h4>
                <p className="text-[11px] text-white/40">We're always here to help</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="h-12 w-12 rounded-xl bg-[#1AFF73]/5 border border-[#1AFF73]/10 flex items-center justify-center group-hover:bg-[#1AFF73]/10 transition-colors">
                <Lock className="h-6 w-6 text-[#1AFF73]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white">Secure & Reliable</h4>
                <p className="text-[11px] text-white/40">Safe payments & secure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Turf Listings */}
      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-block bg-[#1AFF73]/10 text-[#1AFF73] text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-lg mb-4">
                Elite Collection
              </div>
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight uppercase italic leading-none text-white">
                Featured <span className="text-[#1AFF73]">Arenas</span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="h-14 w-14 animate-spin text-[#1AFF73] opacity-30" />
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-white/5 rounded-[4rem] border-dashed border-white/10">
              <h3 className="text-3xl font-bold mb-4 uppercase italic text-white/20">No Pitches Found</h3>
              <p className="text-white/40 max-w-sm mx-auto text-lg font-medium">Try adjusting your scouting filters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

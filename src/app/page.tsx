
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { TurfCard } from "@/components/turf-card"
import { Input } from "@/components/ui/input"
import { Search, Trophy, Loader2 } from "lucide-react"
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
import Link from "next/link"

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

  // Dynamically derive areas from Firestore data
  const areas = useMemo(() => {
    if (!turfs) return []
    const uniqueAreas = Array.from(new Set(turfs.map(t => t.area))).filter(Boolean)
    return uniqueAreas.sort()
  }, [turfs])

  // Filter logic for displayed turfs
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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[1px] scale-105 opacity-40"
          style={{ backgroundImage: `url('https://picsum.photos/seed/hero/1920/1080')` }}
          data-ai-hint="sports arena"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <div className="inline-flex items-center gap-2 mb-8 bg-primary/10 border border-primary/20 py-2 px-6 rounded-full backdrop-blur-md">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm font-black text-primary uppercase tracking-[0.3em]">Mysuru Sports Authority</span>
          </div>
          <h1 className="font-headline text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase italic">
            OWN THE <span className="text-primary text-neon">ARENA</span>
          </h1>
          <p className="text-xl md:text-3xl text-muted-foreground mb-10 max-w-3xl mx-auto font-medium leading-tight">
            The premier gateway to Mysuru's elite football, cricket, and pickleball turfs. 
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-40 px-4 -mt-20 mb-12">
        <div className="mx-auto max-w-7xl glass-card rounded-[2.5rem] p-4 md:p-8 shadow-[0_30px_60px_rgba(26,255,115,0.1)] border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="relative md:col-span-4">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
              <Input 
                placeholder="Find by name or location..." 
                className="pl-14 h-16 bg-background/50 border-white/5 focus:border-primary/40 transition-all rounded-2xl text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="h-16 bg-background/50 border-white/5 rounded-2xl font-bold">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="cricket">Cricket</SelectItem>
                  <SelectItem value="pickleball">Pickleball</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={courtFilter} onValueChange={setCourtFilter}>
                <SelectTrigger className="h-16 bg-background/50 border-white/5 rounded-2xl font-bold">
                  <SelectValue placeholder="Court Size" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="half">Half Court</SelectItem>
                  <SelectItem value="full">Full Court</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="h-16 bg-background/50 border-white/5 rounded-2xl font-bold">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
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
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight">Top Rated Venues</h2>
              <p className="text-muted-foreground mt-2 text-lg">Hand-picked premium facilities for professional play.</p>
            </div>
            <div className="hidden md:flex gap-2">
               <Badge 
                 variant="outline" 
                 className="border-white/5 text-[10px] uppercase font-bold px-4 py-1.5 opacity-50 hover:opacity-100 hover:border-primary cursor-pointer transition-all" 
                 onClick={() => {
                   setSportFilter("all");
                   setAreaFilter("all");
                   setCourtFilter("all");
                   setSearchQuery("");
                 }}
               >
                 Reset
               </Badge>
               {["Football", "Cricket", "Pickleball"].map(s => (
                 <Badge 
                  key={s} 
                  variant={sportFilter === s.toLowerCase() ? "default" : "outline"}
                  onClick={() => setSportFilter(s.toLowerCase())}
                  className="border-white/5 text-[10px] uppercase font-bold px-4 py-1.5 cursor-pointer transition-all"
                >
                   {s}
                 </Badge>
               ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-40">
              <Loader2 className="h-14 w-14 animate-spin text-primary opacity-30" />
            </div>
          ) : filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-white/5">
              <Search className="h-20 w-20 text-muted-foreground/10 mx-auto mb-8" />
              <h3 className="text-3xl font-bold mb-4">No results found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto text-lg">Try adjusting your filters or location to find more arenas.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="mt-auto border-t border-white/5 py-24 px-4 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2.5 rounded-2xl">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <span className="font-headline font-black text-4xl tracking-tighter text-neon">TURFISTA</span>
            </div>
            <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
              Experience the pinnacle of sports discovery in Mysuru. Our platform connects dedicated athletes with the finest arenas in the city.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-between py-2">
            <div className="space-y-6 md:text-right">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-primary">Quick Navigation</h4>
              <div className="flex flex-wrap gap-8 text-lg font-bold">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/about" className="hover:text-primary transition-colors">Partner Program</Link>
                <Link href="/admin" className="hover:text-primary transition-colors">Arena Portal</Link>
              </div>
            </div>
            <div className="pt-20 md:text-right">
              <p className="text-muted-foreground text-sm font-medium">© 2024 Turfista Pro. Digital sports infrastructure for Mysuru.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { TurfCard } from "@/components/turf-card"
import { MOCK_TURFS } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Search, Trophy } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")
  const [courtFilter, setCourtFilter] = useState("all")

  const areas = useMemo(() => {
    const uniqueAreas = Array.from(new Set(MOCK_TURFS.map(t => t.area)))
    return uniqueAreas.sort()
  }, [])

  const filteredTurfs = useMemo(() => {
    return MOCK_TURFS.filter(turf => {
      const matchesSearch = turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          turf.area.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesSport = sportFilter === "all" || 
                          turf.sportTypes.some(s => s.toLowerCase() === sportFilter.toLowerCase())
      
      const matchesArea = areaFilter === "all" || turf.area === areaFilter

      const matchesCourt = courtFilter === "all" || 
                          turf.courtTypes.some(c => c.toLowerCase().includes(courtFilter.toLowerCase()))

      return matchesSearch && matchesSport && matchesArea && matchesCourt
    })
  }, [searchQuery, sportFilter, areaFilter, courtFilter])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px] opacity-30"
          style={{ backgroundImage: `url('https://picsum.photos/seed/hero/1920/1080')` }}
          data-ai-hint="sports arena"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/40 py-1.5 px-6 text-xs md:text-sm font-bold tracking-widest uppercase backdrop-blur-md">
            Mysuru's Premium Sports Discovery
          </Badge>
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9]">
            DOMINATE THE <span className="text-primary italic">PITCH</span>
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
            Find and book the highest-rated turfs in Mysuru. From midnight kickoffs to early morning strikes.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-40 px-4 -mt-16 mb-12">
        <div className="mx-auto max-w-6xl glass-card rounded-3xl p-4 md:p-6 shadow-[0_20px_50px_rgba(26,255,115,0.15)] border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="relative md:col-span-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by turf name or area..." 
                className="pl-12 h-14 bg-background/50 border-white/5 focus:border-primary/40 transition-all rounded-2xl text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="h-14 bg-background/50 border-white/5 rounded-2xl">
                  <SelectValue placeholder="Sport Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="cricket">Cricket</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Select value={courtFilter} onValueChange={setCourtFilter}>
                <SelectTrigger className="h-14 bg-background/50 border-white/5 rounded-2xl">
                  <SelectValue placeholder="Court Type" />
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
                <SelectTrigger className="h-14 bg-background/50 border-white/5 rounded-2xl">
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="all">Everywhere in Mysuru</SelectItem>
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
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Venues</h2>
              <p className="text-muted-foreground mt-1">Discover premium sports facilities near you</p>
            </div>
            <Badge variant="outline" className="border-white/10 text-muted-foreground py-1 px-4">
              {filteredTurfs.length} Venues
            </Badge>
          </div>

          {filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 glass-card rounded-[3rem] border-dashed border-white/10">
              <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">No arenas match your filters</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Try broadening your search or choosing different court sizes.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="mt-auto border-t border-white/5 py-16 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <span className="font-headline font-bold text-2xl tracking-tighter text-neon">TURFISTA</span>
            </div>
            <p className="text-muted-foreground max-w-md">The premier digital gateway for sports enthusiasts in Mysuru. Find your field, gather your squad, and make every match legendary.</p>
          </div>
          <div className="flex flex-col md:items-end gap-4">
            <p className="text-sm font-medium">Developed for Mysuru Athletes</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="hover:text-primary transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Contact</span>
            </div>
            <p className="text-muted-foreground text-xs mt-4">© 2024 Turfista. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { TurfCard } from "@/components/turf-card"
import { MOCK_TURFS } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { Search, Filter, MapPin } from "lucide-react"
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

      return matchesSearch && matchesSport && matchesArea
    })
  }, [searchQuery, sportFilter, areaFilter])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px] opacity-40"
          style={{ backgroundImage: `url('https://picsum.photos/seed/hero/1920/1080')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/50 py-1 px-4 text-sm backdrop-blur-md">
            MYSURU'S #1 TURF BOOKING APP
          </Badge>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            ELEVATE YOUR <span className="text-primary italic">GAME</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover and book premium sports turfs in Mysuru. From midnight matches to weekend tournaments.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-40 px-4 -mt-12 mb-8">
        <div className="mx-auto max-w-5xl glass-card rounded-2xl p-4 md:p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by turf name or area..." 
                className="pl-10 h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="h-12 bg-background/50 border-white/10 rounded-xl">
                <SelectValue placeholder="Sport Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
              </SelectContent>
            </Select>

            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="h-12 bg-background/50 border-white/10 rounded-xl">
                <SelectValue placeholder="All Areas" />
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
      </section>

      {/* Turf Listings */}
      <section className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline text-3xl font-bold">Available Turfs</h2>
            <p className="text-sm text-muted-foreground">{filteredTurfs.length} results found</p>
          </div>

          {filteredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-white/10">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No turfs found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="mt-auto border-t border-white/10 py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-primary/20 p-1 rounded">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <span className="font-headline font-bold text-lg tracking-tighter">TURFISTA</span>
        </div>
        <p className="text-muted-foreground text-sm">© 2024 Turfista Mysuru. Premium Sports Discovery Platform.</p>
      </footer>
    </div>
  )
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
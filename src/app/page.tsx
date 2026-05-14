"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { 
  Trophy, 
  Loader2, 
  Search,
  MapPin
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

  // SEO Schema Markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "Turfista Network Mysuru",
    "description": "Premium sports discovery and booking platform in Mysuru.",
    "url": "https://www.turfista.in",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mysuru",
      "addressRegion": "Karnataka",
      "addressCountry": "IN"
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center px-4 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <Image 
            src={branding?.heroImageUrl || "https://picsum.photos/seed/turf-hero/1920/1080"} 
            alt="Hero Background" 
            fill 
            className="object-cover opacity-[0.12] grayscale" 
            priority 
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-8">
          <div className="label-caps text-primary font-bold animate-in fade-in slide-in-from-top-4 duration-1000">India's Turf Network</div>
          <h1 className="max-w-4xl mx-auto text-4xl md:text-7xl font-bold tracking-tight leading-tight">
            {branding?.heroHeadingWhite || "Find & Book Your"} <span className="text-primary">{branding?.heroHeadingNeon || "Perfect Turf"}</span>
          </h1>
          <p className="text-[18px] text-muted max-w-[540px] mx-auto leading-relaxed">
            {branding?.heroDescription || "The premier discovery and booking platform for the modern athlete. Join Mysuru's elite circuit."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild className="btn-primary w-full sm:w-auto h-[60px] text-lg px-10">
              <Link href="#listings">BOOK A TURF</Link>
            </Button>
            <Button asChild variant="outline" className="btn-secondary w-full sm:w-auto h-[60px] text-lg px-10">
              <Link href="/teams">CREATE TEAM</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* LISTINGS SECTION */}
      <section id="listings" className="py-20 px-4 max-w-7xl mx-auto w-full space-y-12">
        <div className="sticky top-[64px] z-30 bg-background/90 backdrop-blur-xl py-8 border-b border-border flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input 
              placeholder="Search by arena name or area (e.g. Bogadi)..." 
              className="bg-surface border-border pl-12 h-[56px] rounded-[12px] text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
            {SPORT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "label-caps px-8 h-[56px] rounded-[12px] border whitespace-nowrap text-[12px] font-bold transition-all",
                  activeFilter === filter 
                    ? "bg-primary text-background border-primary shadow-[0_0_20px_rgba(170,255,0,0.2)]" 
                    : "bg-surface text-muted border-border hover:border-[#333] hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {turfsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[240px] w-full rounded-[20px] bg-white/5" />
                <Skeleton className="h-6 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
              </div>
            ))}
          </div>
        ) : filteredTurfs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredTurfs.map((turf) => (
              <TurfCard key={turf.id} turf={turf as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-border rounded-[32px] bg-surface/30">
            <Trophy className="h-16 w-16 text-border mx-auto mb-6" />
            <h3 className="text-muted text-2xl font-bold">No matching arenas found</h3>
            <p className="text-muted/60 mt-2">Try adjusting your filters or search terms.</p>
            <Button variant="ghost" onClick={() => { setActiveFilter("All"); setSearchQuery(""); }} className="mt-8 text-primary">Clear all filters</Button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

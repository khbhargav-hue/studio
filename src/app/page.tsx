"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { 
  Zap, 
  Trophy, 
  Loader2, 
  ArrowRight, 
  Star, 
  Users, 
  ShieldCheck, 
  Calendar,
  Search,
  MapPin,
  Filter
} from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SPORT_FILTERS = ["All", "Football", "Cricket", "Pickleball"]

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
      const matchesSport = activeFilter === "All" || t.sportTypes?.includes(activeFilter as any)
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.area?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSport && matchesSearch
    })
  }, [turfs, activeFilter, searchQuery])

  if (brandingLoading || turfsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center px-4 overflow-hidden border-b border-border">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/turf-hero/1920/1080" 
            alt="Hero" 
            fill 
            className="object-cover opacity-[0.15]" 
            priority 
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-8">
          <div className="label-caps text-primary font-bold">India's Turf Network</div>
          <h1 className="max-w-4xl mx-auto">
            Find & Book Your <span className="text-primary">Perfect Turf</span>
          </h1>
          <p className="text-[18px] text-muted max-w-[480px] mx-auto leading-relaxed">
            {branding?.heroDescription || "The premier discovery and booking platform for the modern athlete. Join Mysuru's elite circuit."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild className="btn-primary w-full sm:w-auto">
              <Link href="#listings">BOOK A TURF</Link>
            </Button>
            <Button asChild variant="outline" className="btn-secondary w-full sm:w-auto">
              <Link href="/teams">CREATE TEAM</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* LISTINGS SECTION */}
      <section id="listings" className="py-20 px-4 max-w-7xl mx-auto w-full space-y-12">
        {/* Filter Bar */}
        <div className="sticky top-[64px] z-30 bg-background/80 backdrop-blur-md py-6 border-b border-border flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input 
              placeholder="Search by arena name or area..." 
              className="bg-surface border-border pl-12 h-[48px] rounded-[10px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            {SPORT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "label-caps px-6 h-[48px] rounded-[10px] border whitespace-nowrap",
                  activeFilter === filter 
                    ? "bg-primary text-background border-primary" 
                    : "bg-surface text-muted border-border hover:border-[#333]"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredTurfs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTurfs.map((turf) => (
              <TurfCard key={turf.id} turf={turf as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-border rounded-2xl">
            <Trophy className="h-12 w-12 text-border mx-auto mb-4" />
            <h3 className="text-muted italic">No arenas found matching your criteria.</h3>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

"use client"

import { useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Loader2, Star } from "lucide-react"

export default function FeaturedPage() {
  const db = useFirestore()
  
  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null
    // Removed orderBy to avoid composite index requirement
    return query(
      collection(db, "turfs"), 
      where("isPopular", "==", true)
    )
  }, [db])

  const { data: rawTurfs, loading } = useCollection(featuredQuery)

  // Perform sorting on the client side to bypass index requirements for small datasets
  const turfs = useMemo(() => {
    if (!rawTurfs) return null
    return [...rawTurfs].sort((a: any, b: any) => 
      (a.name || "").localeCompare(b.name || "")
    )
  }, [rawTurfs])

  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-6 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-xl">
              <Star className="h-3 w-3 fill-current" />
              Elite Arenas
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none text-white mb-8">
              Featured <span className="text-primary">Venues</span>
            </h1>
            <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto">
              Scouted for quality and performance. These are the top-rated sports arenas in Mysuru right now.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-40">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            </div>
          ) : turfs && turfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {turfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-white/5 rounded-[5rem] border-dashed border-white/10">
              <h3 className="text-3xl font-black text-white/20 uppercase italic tracking-widest">No Featured Arenas Yet</h3>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

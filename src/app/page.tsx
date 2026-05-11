
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TurfCard } from "@/components/turf-card"
import { Zap, Trophy, Loader2, ArrowRight, Star } from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, where, limit } from "firebase/firestore"
import Link from "next/link"

export default function Home() {
  const db = useFirestore()
  
  // Queries
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), orderBy("name", "asc"))
  }, [db])

  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), where("isPopular", "==", true), limit(4))
  }, [db])

  const brandingRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "settings", "branding")
  }, [db])

  const { data: turfs, loading } = useCollection(turfsQuery)
  const { data: featuredTurfs, loading: featuredLoading } = useCollection(featuredQuery)
  const { data: branding } = useDoc(brandingRef)

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      {/* Redesigned Hero Section */}
      <section className="relative pt-44 pb-32 px-4 bg-black overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.05)_0%,transparent_60%)] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-10 bg-primary/5 border border-primary/10 py-2 px-5 rounded-full backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-1000">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">
              {branding?.heroBadgeText || "ELITE ARENA NETWORK"}
            </span>
          </div>
          
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <h1 className="text-6xl md:text-9xl text-white font-black italic uppercase tracking-tighter leading-none mb-4">
              PLAY <span className="text-primary text-neon">MORE.</span>
            </h1>
            <h2 className="text-6xl md:text-9xl text-white font-black italic uppercase tracking-tighter leading-none">
              BOOK <span className="text-primary text-neon">EASY.</span>
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-white/40 max-w-lg font-medium animate-in fade-in duration-1000 delay-300">
            {branding?.heroDescription || "Discover and book Mysuru’s most premium sports arenas with zero friction."}
          </p>
        </div>
      </section>

      {/* Featured Section */}
      <section className="px-4 py-24 bg-black border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="h-12 w-2 bg-primary rounded-full shadow-[0_0_20px_rgba(57,255,20,0.6)]" />
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  FEATURED <span className="text-primary text-neon">ARENAS</span>
                </h2>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2">Elite hand-picked venues in Mysuru</p>
              </div>
            </div>
            <Link href="/featured" className="group flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-80 transition-all">
              VIEW ALL <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            </div>
          ) : featuredTurfs && featuredTurfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {featuredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Main Inventory Section */}
      <section className="px-4 py-24 bg-black border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                ALL <span className="text-white/40">PITCERS</span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing database...</p>
            </div>
          ) : (turfs && turfs.length > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {turfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-white/10">
              <Star className="h-16 w-16 mx-auto mb-8 text-white/5" />
              <h3 className="text-3xl font-black text-white/10 uppercase italic">No Venues Found</h3>
              <p className="text-white/20 max-w-xs mx-auto text-sm font-medium mt-4">We are expanding our network. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

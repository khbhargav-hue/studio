"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  MapPin, 
  MessageCircle, 
  Search, 
  Zap,
  UserCircle
} from "lucide-react"
import { useFirestore } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { SkeletonCard } from "@/components/Skeleton"

export default function PlayersPage() {
  const db = useFirestore()
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!db) return
    
    getDocs(collection(db, "users")).then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setPlayers(data)
      setLoading(false)
    }).catch(err => {
      setLoading(false)
    })
  }, [db])

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const search = searchQuery.toLowerCase()
      const nameMatch = p.displayName?.toLowerCase().includes(search)
      const sportMatch = p.favoriteSport?.toLowerCase().includes(search) || 
                        (Array.isArray(p.favoriteSports) && p.favoriteSports.some((s: string) => s.toLowerCase().includes(search)))
      const areaMatch = p.area?.toLowerCase().includes(search)
      
      return !searchQuery || nameMatch || sportMatch || areaMatch
    })
  }, [players, searchQuery])

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 max-w-5xl mx-auto w-full px-4">
        <header className="mb-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <Zap className="h-3 w-3" /> MYSURU PLAYER CIRCUIT
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
            Find Your <span className="text-primary">Recruits.</span>
          </h1>
          
          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
            <Input 
              placeholder="Search by name, sport, or area (Bogadi, Vijayanagar)..." 
              className="h-14 pl-14 bg-[#111] border-[#222] rounded-xl text-lg italic focus:border-primary/50 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col group hover:border-primary/30 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-[#1A1A1A] border border-[#222] overflow-hidden shrink-0 flex items-center justify-center">
                    {player.photoURL ? (
                      <img src={player.photoURL} alt={player.displayName} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <UserCircle className="h-8 w-8 text-white/10" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">
                      {player.displayName || "Athlete Node"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#888] mt-1 font-medium uppercase tracking-widest italic">
                      <MapPin className="h-3 w-3 text-primary" />
                      {player.area || "Mysuru"}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(player.favoriteSports || [player.favoriteSport || "Football"]).map((s: string) => (
                        <span key={s} className="bg-[#1A1A1A] border border-[#333] px-2 py-0.5 rounded-[4px] text-[9px] font-black text-primary uppercase tracking-widest">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  {player.whatsapp ? (
                    <Button 
                      onClick={() => window.open(`https://wa.me/${player.whatsapp}?text=Hi ${player.displayName}! I found your profile on Turfista.`, '_blank')}
                      className="w-full h-11 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black uppercase tracking-widest text-[11px] rounded-lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" /> Connect on WhatsApp
                    </Button>
                  ) : (
                    <div className="text-center py-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic">
                      Contact Signal Offline
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border border-dashed border-[#222] rounded-2xl bg-[#111]/30">
            <Users className="h-12 w-12 text-white/5 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic text-white/10">No matches found</h3>
            <p className="text-white/20 text-xs mt-2 italic">Try identifying different search parameters.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}

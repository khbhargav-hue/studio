"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  MapPin, 
  Star, 
  MessageCircle, 
  UserPlus, 
  Search, 
  Zap,
  Loader2,
  Activity,
  ShieldCheck,
  Filter
} from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { cn } from "@/lib/utils"

const SPORT_FILTERS = ["All", "Football", "Cricket", "Badminton", "Pickleball", "Basketball"]

export default function PlayersPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [activeSport, setActiveSport] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const playersQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "users"), orderBy("rewardPoints", "desc"))
  }, [db])

  const { data: rawPlayers, loading } = useCollection(playersQuery)

  const players = useMemo(() => {
    if (!rawPlayers) return []
    return rawPlayers.filter((p: any) => {
      const matchesSearch = !searchQuery || 
        p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.area?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesSport = activeSport === "All" || 
        (p.favoriteSports && p.favoriteSports.includes(activeSport)) ||
        p.favoriteSport === activeSport
        
      return matchesSearch && matchesSport && p.uid !== user?.uid
    })
  }, [rawPlayers, searchQuery, activeSport, user])

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4 md:px-8">
        <header className="mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <Activity className="h-3 w-3" /> MYSURU PLAYER CIRCUIT
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            Find Your <span className="text-primary text-neon">Recruits.</span>
          </h1>
          <p className="text-muted text-xl font-medium italic max-w-2xl">
            Identify elite teammates in your area. Real-time discovery for the Mysuru sporting network.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
            <Input 
              placeholder="Identify by name or area (Bogadi, Vijayanagar)..." 
              className="h-16 pl-14 bg-white/5 border-white/5 rounded-2xl text-lg italic focus:border-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {SPORT_FILTERS.map(s => (
              <button 
                key={s}
                onClick={() => setActiveSport(s)}
                className={cn(
                  "h-16 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all shrink-0",
                  activeSport === s ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 text-white/40 hover:border-primary/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-white/5 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : players.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
            <Users className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-white/10 uppercase italic">No Nodes Found</h3>
            <p className="text-white/20 mt-4 max-w-xs mx-auto italic">Adjust your discovery filters or invite friends to join the circuit.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}

function PlayerCard({ player }: { player: any }) {
  const statusColors: Record<string, string> = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    in_match: "bg-primary shadow-[0_0_10px_#AAFF00]",
    offline: "bg-white/20"
  }

  return (
    <div className="group bg-card border border-white/5 rounded-[2rem] p-8 flex flex-col hover:border-primary/30 transition-all duration-300 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Zap className="h-32 w-32 text-primary" />
      </div>

      <div className="relative mb-8 flex justify-center">
        <div className="h-24 w-24 rounded-full border-2 border-primary/20 p-1 group-hover:border-primary/50 transition-colors">
          <div className="h-full w-full rounded-full overflow-hidden bg-white/5">
            <img src={player.photoURL || `https://picsum.photos/seed/${player.uid}/200`} className="h-full w-full object-cover" alt={player.displayName} />
          </div>
        </div>
        <div className={cn("absolute bottom-1 right-1/3 h-4 w-4 rounded-full border-4 border-card z-10", statusColors[player.status] || statusColors.offline)} />
      </div>

      <div className="text-center space-y-1 mb-8">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors truncate">
          {player.displayName || "Athlete Node"}
        </h3>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">{player.area || "Mysuru"} • {player.skillLevel || "Intermediate"}</p>
      </div>

      <div className="space-y-4 mb-10 relative z-10">
        <div className="flex flex-wrap justify-center gap-2">
          {(player.favoriteSports || ["Football"]).slice(0, 2).map((s: string) => (
            <span key={s} className="bg-white/5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white/40 border border-white/5">
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase text-primary/60 tracking-widest italic">
          <Star className="h-3 w-3 fill-current" /> {player.rewardPoints || 100} Coins
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-primary hover:text-black hover:border-primary transition-all">
          <UserPlus className="h-3.5 w-3.5 mr-2" /> Invite
        </Button>
        <Button variant="outline" className="h-12 border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white/10 transition-all">
          <MessageCircle className="h-3.5 w-3.5 mr-2" /> Message
        </Button>
      </div>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  MapPin, 
  MessageCircle, 
  Loader2, 
  Search,
  UserCircle,
  Trophy,
  Activity,
  Zap
} from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, where } from "firebase/firestore"
import { cn } from "@/lib/utils"

const SPORT_CATEGORIES = ["All", "Football", "Cricket", "Swimming", "Badminton", "Pickleball"]

export default function CoachingPage() {
  const db = useFirestore()
  const [activeSport, setActiveSport] = useState("All")

  const coachesQuery = useMemoFirebase(() => {
    if (!db) return null
    let q = query(collection(db, "coaches"), orderBy("rating", "desc"))
    if (activeSport !== "All") {
      q = query(q, where("sport", "==", activeSport))
    }
    return q
  }, [db, activeSport])

  const { data: coaches, loading } = useCollection(coachesQuery)

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">COACHING</div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase italic leading-none">
              Train with <br />the <span className="text-primary">Best</span>
            </h1>
            <p className="text-muted max-w-xl text-lg font-medium italic">
              Find elite coaches for Football, Cricket, and Swimming in Mysuru. Elevate your tactical intelligence.
            </p>
          </div>
        </div>

        {/* Sport Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-12 pb-2">
          {SPORT_CATEGORIES.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={cn(
                "flex-none h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                activeSport === sport 
                  ? "bg-primary text-black border-primary" 
                  : "bg-surface text-muted border-border hover:border-primary/50"
              )}
            >
              {sport}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[320px] bg-card border border-border animate-pulse rounded-[16px]" />
            ))}
          </div>
        ) : coaches && coaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-border rounded-[24px] max-w-2xl mx-auto bg-card/50">
            <Zap className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic text-white/10 tracking-widest">No Coaches Found</h3>
            <p className="text-white/20 font-medium italic mt-2">Expansion in progress. We are onboarding new elite trainers daily.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function CoachCard({ coach }: { coach: any }) {
  const whatsappUrl = `https://wa.me/${coach.whatsapp}?text=${encodeURIComponent(`Hi! I want to book a session with ${coach.name} for ${coach.sport}.`)}`;

  return (
    <div className="bg-card border border-border rounded-[16px] p-8 flex flex-col items-center text-center transition-all hover:border-primary/40 group">
      {/* Coach Photo Circle */}
      <div className="relative mb-6">
        <div className="h-28 w-28 rounded-full border-2 border-primary p-1">
          <div className="h-full w-full rounded-full overflow-hidden bg-surface flex items-center justify-center border border-border">
            {coach.photoUrl ? (
              <img src={coach.photoUrl.includes('cloudinary.com') ? coach.photoUrl.replace('/upload/', '/upload/f_webp,w_300,q_75,c_fill,g_face/') : coach.photoUrl} alt={coach.name} className="h-full w-full object-cover" />
            ) : (
              <UserCircle className="h-16 w-16 text-muted-foreground opacity-20" />
            )}
          </div>
        </div>
        {coach.isAvailable && (
          <div className="absolute bottom-1 right-1 h-4 w-4 bg-primary rounded-full border-4 border-card" title="Available Now" />
        )}
      </div>

      <div className="space-y-2 mb-6">
        <h3 className="text-xl font-bold uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors">
          {coach.name}
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/5 px-2 py-0.5 rounded-[4px] border border-primary/20">
            {coach.sport} Coach
          </span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-white/60">
          <Star className="h-3 w-3 text-primary fill-current" />
          <span>{coach.rating || 4.8}</span>
          <span className="text-white/20 font-black tracking-widest ml-1">({coach.reviewCount || 0} REVIEWS)</span>
        </div>
      </div>

      <div className="w-full flex items-center justify-center gap-2 text-[11px] font-bold text-muted uppercase italic mb-8">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span>{coach.area}, Mysuru</span>
      </div>

      <div className="w-full pt-6 border-t border-border mb-8">
        <div className="flex justify-between items-center px-4">
          <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Session Rate</span>
          <span className="text-lg font-black text-white italic">₹{coach.pricePerSession}</span>
        </div>
      </div>

      <Button asChild className="w-full h-14 bg-[#25D366] text-white hover:bg-[#20ba5a] text-[11px] font-black uppercase tracking-widest rounded-[10px] transition-all">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4 mr-2" /> Book Session
        </a>
      </Button>
    </div>
  )
}


"use client"

import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Trophy, 
  MapPin, 
  Users, 
  Zap, 
  MessageCircle, 
  ShieldCheck, 
  Star,
  Loader2,
  Swords,
  Activity
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"

export default function TeamDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const db = useFirestore()

  const teamRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "teams", id)
  }, [db, id])

  const { data: team, loading } = useDoc(teamRef)

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.5em]">Establishing Link...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-card p-12 rounded-[24px] border border-border text-center max-w-lg">
            <Trophy className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Squad Redacted</h1>
            <p className="text-muted mb-8 font-medium italic">This identity is no longer active on the circuit.</p>
            <Button onClick={() => router.push("/teams")} className="bg-primary text-black h-12 px-8 font-black uppercase tracking-widest text-[11px] rounded-[10px]">Return to Roster</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const initials = team.name ? team.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'FT'

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pb-32 pt-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-12 text-muted hover:text-white font-black text-[11px] uppercase tracking-widest h-10 px-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roster
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-card rounded-[16px] p-8 md:p-16 border border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Trophy className="h-64 w-64 text-primary" />
              </div>

              <div className="flex items-center gap-6 mb-12 relative z-10">
                <div className="h-24 w-24 rounded-full bg-surface border-4 border-primary flex items-center justify-center text-primary font-black text-3xl italic tracking-tighter">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-[6px]">Elite Squad</span>
                    <span className="bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-[6px]">{team.sport}</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
                    {team.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted font-bold text-lg mb-16 relative z-10 uppercase italic">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{team.area}, Mysuru</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {[
                  { label: "Total Wins", val: team.wins || 0, icon: Trophy },
                  { label: "Matches Played", val: team.matchesPlayed || 0, icon: Swords },
                  { label: "Squad Roster", val: team.members?.length || 0, icon: Users }
                ].map((stat, i) => (
                  <div key={i} className="p-8 bg-surface border border-border rounded-[16px] text-center">
                    <p className="text-[10px] font-black text-muted uppercase mb-3 tracking-widest">{stat.label}</p>
                    <div className="flex items-center justify-center gap-3">
                      <stat.icon className="h-6 w-6 text-primary" />
                      <span className="text-4xl font-black italic text-white leading-none">{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 pt-16 border-t border-border space-y-6 relative z-10">
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Tactical Brief</h3>
                <p className="text-xl leading-relaxed italic text-white/80 font-medium border-l-2 border-primary/20 pl-8">
                  {team.description || "High-intensity sports community based in Mysuru. Active across major local circuits and elite tournaments."}
                </p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <aside className="sticky top-28 space-y-6">
              <div className="bg-card border border-border p-10 rounded-[16px] text-center space-y-8">
                <div className="h-20 w-20 bg-primary/5 rounded-[24px] flex items-center justify-center mx-auto border border-primary/20">
                  <Activity className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase text-white mb-2">Join Roster</h3>
                  <p className="text-muted text-sm font-medium leading-relaxed italic">
                    Negotiate terms and join the squad's active roster for the upcoming season.
                  </p>
                </div>
                <Button className="w-full h-16 border border-primary text-primary hover:bg-primary hover:text-black font-black uppercase tracking-widest text-[11px] rounded-[10px] transition-all">
                  Request to Join
                </Button>
                <div className="pt-6 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted">Status</span>
                  <span className="text-primary">● Recruiting</span>
                </div>
              </div>

              <div className="bg-surface border border-border p-6 rounded-[16px] flex items-center gap-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Verified Identity</p>
                  <p className="text-[9px] text-muted uppercase mt-0.5">Captain ID: {team.captain}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

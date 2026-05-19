
"use client"

import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
  Activity,
  UserPlus,
  Share2,
  CheckCircle2
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { doc, updateDoc, arrayUnion, increment, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function TeamDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isJoining, setIsJoining] = useState(false)

  const teamRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "teams", id)
  }, [db, id])

  const { data: team, loading } = useDoc(teamRef)

  const handleJoin = async () => {
    if (!db || !user || !team) return
    if (team.members?.includes(user.uid)) {
      toast({ title: "Already in Squad", description: "You are part of this roster." })
      return
    }

    setIsJoining(true)
    try {
      await updateDoc(doc(db, "teams", id), {
        members: arrayUnion(user.uid),
        updatedAt: serverTimestamp()
      })
      toast({ title: "Welcome to the Squad 🔥", description: "You've been added to the roster." })
    } catch (err) {
      toast({ title: "Recruitment Failed", variant: "destructive" })
    } finally {
      setIsJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.5em]">Establishing Tactical Link...</p>
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
  const isMember = user && team.members?.includes(user.uid)
  const capacity = (team.members?.length || 0) / (team.maxPlayers || 14) * 100

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pb-32 pt-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-12">
          <Button variant="ghost" onClick={() => router.back()} className="text-muted hover:text-white font-black text-[11px] uppercase tracking-widest h-10 px-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Circuit Roster
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-border h-12 w-12" onClick={() => navigator.share({ title: team.name, url: window.location.href })}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-card rounded-[40px] p-8 md:p-16 border border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Trophy className="h-64 w-64 text-primary" />
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-10 mb-16 relative z-10">
                <div className="h-32 w-32 rounded-[32px] bg-surface border-4 border-primary flex items-center justify-center text-primary font-black text-5xl italic tracking-tighter shadow-2xl shadow-primary/20">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                    <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-primary/20">ELITE SQUAD</span>
                    <span className="bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/5">{team.sport}</span>
                    <span className="bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/5">{team.skillLevel}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-white mb-6">
                    {team.name}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-muted font-bold text-xl uppercase italic">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span>{team.area}, MYSURU</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-16">
                {[
                  { label: "Circuit Wins", val: team.wins || 0, icon: Trophy, sub: "Elite Record" },
                  { label: "Matches", val: team.matchesPlayed || 0, icon: Swords, sub: "Total Played" },
                  { label: "Roster Size", val: `${team.members?.length || 0}/${team.maxPlayers || 14}`, icon: Users, sub: "Active Athletes" }
                ].map((stat, i) => (
                  <div key={i} className="p-8 bg-surface border border-border rounded-[24px] group hover:border-primary/40 transition-all">
                    <p className="text-[10px] font-black text-muted uppercase mb-4 tracking-widest">{stat.label}</p>
                    <div className="flex items-end gap-3 mb-2">
                      <span className="text-5xl font-black italic text-white leading-none">{stat.val}</span>
                      <stat.icon className="h-6 w-6 text-primary mb-1" />
                    </div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-10 relative z-10">
                <div className="p-10 bg-surface rounded-[24px] border border-border space-y-6">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">ROSTER PROGRESS</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <p className="text-lg font-black italic text-white">{team.members?.length} ATHLETES RECRUITED</p>
                       <p className="text-sm font-bold text-primary uppercase">{(team.maxPlayers || 14) - (team.members?.length || 0)} SLOTS REMAINING</p>
                    </div>
                    <Progress value={capacity} className="h-2 bg-white/5" />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">TACTICAL INTEL</h3>
                  <p className="text-2xl leading-relaxed italic text-white/80 font-medium border-l-4 border-primary/20 pl-10">
                    {team.description || "High-intensity sports community based in Mysuru. Focused on technical proficiency and local dominance."}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <aside className="sticky top-28 space-y-8">
              <div className="bg-card border border-border p-10 rounded-[32px] text-center space-y-10 shadow-2xl">
                <div className="h-24 w-24 bg-primary/5 rounded-[32px] flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
                  <Activity className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-black italic uppercase text-white mb-3 tracking-tighter">Recruitment</h3>
                  <p className="text-muted text-sm font-medium leading-relaxed italic">
                    Join the squad's active roster and earn 50 Turf Coins upon your first match.
                  </p>
                </div>

                {isMember ? (
                  <div className="p-6 bg-primary/10 rounded-[20px] border border-primary/20 flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <span className="text-sm font-black uppercase text-primary tracking-widest">Roster Member</span>
                  </div>
                ) : (
                  <Button 
                    onClick={handleJoin} 
                    disabled={isJoining || (team.members?.length >= (team.maxPlayers || 14))}
                    className="w-full h-20 bg-primary text-black hover:scale-[1.02] font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-xl shadow-primary/20"
                  >
                    {isJoining ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Request to Join <UserPlus className="ml-3 h-5 w-5" /></>}
                  </Button>
                )}

                <Button asChild variant="outline" className="w-full h-16 border-border text-white hover:bg-surface font-black uppercase tracking-widest text-[11px] rounded-2xl">
                  <a href={`https://wa.me/${team.whatsapp}?text=Hi! I'm interested in joining ${team.name} via Turfista.`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5 mr-3 text-primary" /> WhatsApp Captain
                  </a>
                </Button>

                <div className="pt-8 border-t border-border flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-muted">Roster Status</span>
                  <span className="text-primary flex items-center gap-2">
                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse" /> Recruiting
                  </span>
                </div>
              </div>

              <div className="bg-surface border border-border p-8 rounded-[24px] flex items-center gap-6">
                <ShieldCheck className="h-10 w-10 text-primary opacity-40" />
                <div>
                  <p className="text-[11px] font-black text-white uppercase tracking-widest">Verified Identity</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium mt-1">CAPTAIN ID: {team.captain}</p>
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

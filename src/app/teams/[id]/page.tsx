
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
  User,
  Activity
} from "lucide-react"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { motion } from "framer-motion"

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
      <div className="flex h-screen flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em]">Establishing Squad Link...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="glass-card p-16 rounded-[4rem] text-center border-white/5 max-w-lg shadow-2xl">
            <Trophy className="h-16 w-16 text-primary opacity-20 mx-auto mb-8" />
            <h1 className="text-4xl mb-6 font-black italic tracking-tighter uppercase leading-none">TEAM <span className="text-primary">REDACTED</span></h1>
            <p className="text-white/40 mb-10 font-medium italic">This squad identity has been removed from the network circuits.</p>
            <Button onClick={() => router.push("/teams")} className="btn-primary h-14 px-10 rounded-2xl w-full font-black uppercase text-[10px] tracking-widest">RETURN TO ROSTER</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const whatsappUrl = `https://wa.me/${team.whatsapp}?text=${encodeURIComponent(`Hi ${team.captain}, I saw ${team.teamName} on Turfista! Would love to negotiate a match or join your roster.`)}`

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pb-32 pt-44">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-12 hover:bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] text-white/30 group h-12 px-6"
          >
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> SQUAD ROSTER
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              <section className="glass-card rounded-[4rem] p-12 md:p-20 border-white/5 bg-[#080808] relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Trophy className="h-80 w-80 text-primary" />
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-12 relative z-10">
                  <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-3">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">VERIFIED SQUAD</span>
                  </div>
                  <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-3">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">{team.sport}</span>
                  </div>
                </div>

                <h1 className="text-6xl md:text-9xl mb-10 tracking-tighter italic leading-none uppercase font-black text-white relative z-10 break-words">
                  {team.teamName}
                </h1>

                <div className="flex items-center gap-4 text-white/40 mb-20 relative z-10">
                  <MapPin className="h-7 w-7 text-primary" />
                  <span className="font-black uppercase tracking-[0.3em] text-2xl italic">{team.area}, MYSURU</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-10">
                    <h3 className="text-[11px] text-primary/60 font-black uppercase tracking-[0.6em]">The Operational Stats</h3>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center">
                          <p className="text-4xl font-black italic leading-none text-white">{team.wins || 0}</p>
                          <p className="label-caps text-white/20 text-[9px] mt-3">Wins</p>
                       </div>
                       <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center">
                          <p className="text-4xl font-black italic leading-none text-white">{team.matches || 0}</p>
                          <p className="label-caps text-white/20 text-[9px] mt-3">Matches</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <h3 className="text-[11px] text-primary/60 font-black uppercase tracking-[0.6em] mb-8">Squad Captain</h3>
                      <div className="glass-card p-8 rounded-[3rem] bg-white/5 border-white/10 flex items-center gap-6">
                        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(170,255,0,0.3)]">
                          <User className="h-8 w-8 text-black" />
                        </div>
                        <div>
                          <p className="text-2xl font-black italic uppercase text-white">{team.captain}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mt-1">Lead Strategist</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[11px] text-primary/60 font-black uppercase tracking-[0.6em] mb-8">Preferred Territory</h3>
                      <div className="glass-card p-10 rounded-[3rem] bg-primary/5 border-primary/10 group hover:border-primary/40 transition-all">
                        <Star className="h-8 w-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black italic uppercase text-primary leading-none">{team.turfPreference || "Flexible Arena"}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-4 italic">High-frequency booking zone</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <aside className="sticky top-44 space-y-8">
                <div className="glass-card rounded-[3.5rem] p-12 border-primary/20 bg-[#0a0a0a] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="h-40 w-40 text-primary" />
                  </div>
                  
                  <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(170,255,0,0.2)] border border-primary/20">
                    <Zap className="h-12 w-12 text-primary" />
                  </div>
                  
                  <h3 className="text-3xl font-black italic uppercase text-white mb-4">Challenge Squad</h3>
                  <p className="text-lg font-medium text-white/40 mb-12 leading-relaxed italic px-4">
                    Identify your squad as a rival and negotiate match terms directly with the captain.
                  </p>

                  <div className="space-y-4">
                    <Button asChild className="w-full h-20 text-lg font-black bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(37,211,102,0.2)] hover:scale-[1.02] transition-transform">
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-3 h-7 w-7" />
                        START CHAT
                      </a>
                    </Button>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                      SECURE ATHLETE CONNECTION ACTIVE
                    </p>
                  </div>
                </div>

                <div className="p-8 border border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-6">NETWORK STATUS</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-bold uppercase text-white/20">Roster Status</span>
                         <span className="text-xs font-black text-primary uppercase">Active Recruitment</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-bold uppercase text-white/20">Last Match</span>
                         <span className="text-xs font-black text-white/40 uppercase">3 Days Ago</span>
                      </div>
                   </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

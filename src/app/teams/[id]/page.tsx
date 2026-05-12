
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
  User
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
        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em]">Syncing Team Intel...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="glass-card p-16 rounded-[3rem] text-center border-white/5 max-w-lg">
            <Trophy className="h-16 w-16 text-primary opacity-20 mx-auto mb-8" />
            <h1 className="text-4xl mb-4 font-black italic tracking-tighter uppercase">TEAM <span className="text-primary">NOT FOUND</span></h1>
            <p className="text-white/40 mb-10 font-medium">This squad data has been redacted from the circuit.</p>
            <Button onClick={() => router.push("/teams")} className="bg-primary text-black font-black uppercase tracking-widest h-14 px-10 rounded-2xl">Return to Roster</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const whatsappUrl = `https://wa.me/${team.whatsapp}?text=${encodeURIComponent(`Hi ${team.captain}, saw ${team.teamName} on Turfista! Would love to play a match.`)}`

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pb-32 pt-44">
        <div className="max-w-7xl auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-12 hover:bg-white/5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group h-12"
          >
            <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> BACK TO CIRCUIT
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-16">
              <section className="glass-card rounded-[3.5rem] p-12 md:p-20 border-white/5 bg-[#080808] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Trophy className="h-64 w-64 text-primary" />
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-12 relative z-10">
                  <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Elite Verified Team</span>
                  </div>
                  <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">{team.sport}</span>
                  </div>
                </div>

                <h1 className="text-6xl md:text-8xl mb-10 tracking-tighter italic leading-none uppercase font-black text-white relative z-10">
                  {team.teamName}
                </h1>

                <div className="flex items-center gap-4 text-white/40 mb-20 relative z-10">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span className="font-black uppercase tracking-[0.2em] text-xl italic">{team.area}, MYSURU</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                  <div className="space-y-10">
                    <h3 className="text-[10px] text-primary/60 font-black uppercase tracking-[0.5em]">The Roster</h3>
                    <div className="space-y-4">
                      {team.players && team.players.length > 0 ? (
                        team.players.map((p: string, i: number) => (
                          <div key={i} className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                              {i + 1}
                            </div>
                            <span className="text-lg font-bold uppercase tracking-tight text-white/80">{p}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/20 italic font-medium">Roster currently under recruitment.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <h3 className="text-[10px] text-primary/60 font-black uppercase tracking-[0.5em] mb-6">Captain</h3>
                      <div className="glass-card p-8 rounded-[2.5rem] bg-white/5 border-white/10 flex items-center gap-6">
                        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-7 w-7 text-black" />
                        </div>
                        <div>
                          <p className="text-xl font-black italic uppercase text-white">{team.captain}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mt-1">Lead Strategist</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] text-primary/60 font-black uppercase tracking-[0.5em] mb-6">Turf Preference</h3>
                      <div className="glass-card p-8 rounded-[2.5rem] bg-primary/5 border-primary/10">
                        <Star className="h-6 w-6 text-primary mb-4" />
                        <p className="text-2xl font-black italic uppercase text-primary">{team.turfPreference || "Flexible Arena"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <aside className="sticky top-44">
                <div className="glass-card rounded-[3rem] p-12 border-primary/10 bg-[#0a0a0a] text-center">
                  <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                    <Zap className="h-10 w-10 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-black italic uppercase text-white mb-4">Challenge Squad</h3>
                  <p className="text-sm font-medium text-white/40 mb-10 leading-relaxed italic">
                    Think your team has what it takes? Initiate a match negotiation directly with the captain.
                  </p>

                  <div className="space-y-4">
                    <Button asChild className="w-full h-20 text-xl font-black bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl shadow-xl shadow-[#25D366]/20 transition-all">
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-3 h-6 w-6" />
                        START CHAT
                      </a>
                    </Button>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">
                      Standard WhatsApp rates apply.
                    </p>
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


"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Users, 
  Trophy, 
  MapPin, 
  MessageCircle, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  User,
  Zap,
  Star,
  ChevronRight
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

const SPORT_OPTIONS = ["Football", "Cricket", "Badminton", "Pickleball"]

export default function TeamsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTeam, setNewTeam] = useState({
    teamName: "",
    sport: "Football",
    area: "",
    captain: "",
    whatsapp: "",
    turfPreference: "",
    players: [] as string[],
    newPlayerName: ""
  })

  const teamsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "teams"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: teams, loading } = useCollection(teamsQuery)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !user) return

    setIsCreating(true)
    try {
      await addDoc(collection(db, "teams"), {
        ...newTeam,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        players: newTeam.players.filter(p => p.trim() !== "")
      })
      toast({ title: "Team Formed", description: `${newTeam.teamName} is now live.` })
      setShowCreateDialog(false)
      setNewTeam({ teamName: "", sport: "Football", area: "", captain: "", whatsapp: "", turfPreference: "", players: [], newPlayerName: "" })
    } catch (err) {
      toast({ title: "Creation Failed", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  const addPlayer = () => {
    if (newTeam.newPlayerName.trim()) {
      setNewTeam(prev => ({
        ...prev,
        players: [...prev.players, prev.newPlayerName.trim()],
        newPlayerName: ""
      }))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 md:pt-44 pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 mb-4 md:mb-6 bg-primary/10 border border-primary/20 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] px-4 md:px-5 py-2 rounded-full">
                <Users className="h-3 w-3" />
                SQUAD NETWORK
              </div>
              <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-white">
                ELITE <span className="text-primary">TEAMS</span>
              </h1>
              <p className="text-base md:text-xl text-white/40 font-medium max-w-xl mt-4 md:mt-6">
                Connect with Mysuru's most active sports communities. Build your legacy or find your next rivals.
              </p>
            </motion.div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="h-14 md:h-16 px-8 md:px-10 bg-primary text-black font-black uppercase tracking-widest text-[10px] md:text-xs rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform">
                  <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" /> FORM SQUAD
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10 bg-black/90 text-white rounded-[2.5rem] max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                {!user ? (
                  <div className="p-12 text-center space-y-6">
                    <DialogHeader>
                      <Zap className="h-16 w-16 text-primary mx-auto animate-pulse mb-4" />
                      <DialogTitle className="text-3xl font-black uppercase italic text-center">Identity Required</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/40 text-center">You must sign in via the profile tab to create and manage teams.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTeam} className="p-8 md:p-12 space-y-8">
                    <DialogHeader>
                      <DialogTitle className="text-4xl font-black italic uppercase text-primary">Form Squad</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Team Name</Label>
                        <Input 
                          placeholder="e.g. Mysuru Mavericks" 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newTeam.teamName}
                          onChange={e => setNewTeam({...newTeam, teamName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Sport Discipline</Label>
                        <Select value={newTeam.sport} onValueChange={v => setNewTeam({...newTeam, sport: v})}>
                          <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-white/10 text-white">
                            {SPORT_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Home Zone (Area)</Label>
                        <Input 
                          placeholder="e.g. Kuvempunagar" 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newTeam.area}
                          onChange={e => setNewTeam({...newTeam, area: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Preferred Turf</Label>
                        <Input 
                          placeholder="e.g. KMFC Arena" 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newTeam.turfPreference}
                          onChange={e => setNewTeam({...newTeam, turfPreference: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Captain Name</Label>
                        <Input 
                          placeholder="Lead player..." 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newTeam.captain}
                          onChange={e => setNewTeam({...newTeam, captain: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">WhatsApp Relay</Label>
                        <Input 
                          placeholder="91..." 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newTeam.whatsapp}
                          onChange={e => setNewTeam({...newTeam, whatsapp: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Roster Management</Label>
                      <div className="flex gap-3">
                        <Input 
                          placeholder="Add Player Name" 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newTeam.newPlayerName}
                          onChange={e => setNewTeam({...newTeam, newPlayerName: e.target.value})}
                        />
                        <Button type="button" onClick={addPlayer} className="h-14 px-6 bg-white/5 border border-white/10 rounded-2xl">
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newTeam.players.map((p, i) => (
                          <div key={i} className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-bold uppercase flex items-center gap-2">
                            {p}
                            <button type="button" onClick={() => setNewTeam(prev => ({...prev, players: prev.players.filter((_, idx) => idx !== i)}))} className="text-primary hover:text-white">×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" disabled={isCreating} className="w-full h-16 bg-primary text-black font-black text-xl rounded-2xl shadow-xl hover:scale-[1.01] transition-all">
                      {isCreating ? <Loader2 className="h-6 w-6 animate-spin" /> : "PUBLISH SQUAD"}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Syncing Athlete Database...</p>
            </div>
          ) : teams && teams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              {teams.map((team, idx) => (
                <TeamCard key={team.id} team={team as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[3rem] border-dashed border-white/10 max-w-3xl mx-auto flex flex-col items-center gap-8">
              <Users className="h-12 w-12 md:h-16 md:w-16 text-white/5" />
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white/10 uppercase italic">No Active Squads</h3>
                <p className="text-white/20 mt-4 max-w-xs mx-auto text-xs md:text-sm">Be the first to form a team and dominate the Mysuru circuits.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function TeamCard({ team }: { team: any }) {
  const whatsappUrl = `https://wa.me/${team.whatsapp}?text=${encodeURIComponent(`Hi ${team.captain}, found ${team.teamName} on Turfista! Would love to play a match.`)}`
  
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 bg-[#080808] flex flex-col h-full group"
    >
      <div className="p-8 pb-4 relative">
        <div className="absolute top-8 right-8 h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
          <ShieldCheck className="h-4 w-4 text-primary opacity-40" />
        </div>
        
        <div className="h-16 w-16 md:h-20 md:w-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 border border-primary/20 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
          {team.logoUrl ? (
            <img src={team.logoUrl} className="h-full w-full object-cover rounded-2xl md:rounded-3xl" />
          ) : (
            <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          )}
        </div>
        
        <Link href={`/teams/${team.id}`}>
          <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{team.teamName}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-3 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40">
          <MapPin className="h-3 w-3 text-primary" />
          {team.area}, MYSURU
        </div>
      </div>

      <div className="p-8 pt-4 flex-1 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Sport</p>
            <p className="text-[10px] md:text-xs font-bold text-white uppercase truncate">{team.sport}</p>
          </div>
          <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Roster</p>
            <p className="text-[10px] md:text-xs font-bold text-white uppercase">{team.players?.length || 0} Players</p>
          </div>
        </div>

        <div className="bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20">
          <p className="text-[8px] md:text-[9px] font-black uppercase text-primary/60 tracking-widest mb-1">Turf Preference</p>
          <p className="text-[10px] md:text-xs font-bold text-primary uppercase italic truncate">{team.turfPreference || "Flexible"}</p>
        </div>
      </div>

      <div className="p-8 pt-0 grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-12 md:h-14 rounded-xl md:rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-widest text-[8px] md:text-[9px]">
          <Link href={`/teams/${team.id}`}>VIEW SQUAD</Link>
        </Button>
        <Button asChild className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black uppercase tracking-widest text-[8px] md:text-[9px] border-none shadow-xl shadow-[#25D366]/20">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-1.5 h-3 w-3 md:mr-2 md:h-4 md:w-4" /> CHALLENGE
          </a>
        </Button>
      </div>
    </motion.div>
  )
}

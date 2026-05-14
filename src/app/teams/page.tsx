
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
  Plus, 
  Loader2, 
  ShieldCheck,
  Zap,
  Star
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
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
    players: [] as string[]
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
        captain: user.displayName || "Athlete",
        createdAt: serverTimestamp(),
        wins: 0,
        matches: 0
      })
      toast({ title: "Squad Signal Active", description: "Your team has entered the network." })
      setShowCreateDialog(false)
      setNewTeam({ teamName: "", sport: "Football", area: "", captain: "", whatsapp: "", turfPreference: "", players: [] })
    } catch (err) {
      toast({ title: "Signal Lost", description: "Could not establish squad connection.", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="label-caps text-primary border border-primary/20 bg-primary/10 w-fit px-4 py-1.5 rounded-full">Athlete Intelligence</div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase italic">The <span className="text-primary text-neon">Squad Roster</span></h1>
            <p className="text-muted max-w-xl text-lg font-medium italic">
              Connect with Mysuru's elite sports communities. Build your legacy or identify your next rivals.
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="btn-primary h-[64px] px-10 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-transform">
                <Plus className="h-5 w-5 mr-3" /> FORM NEW SQUAD
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 p-10 rounded-[2.5rem] max-w-lg shadow-2xl">
              {!user ? (
                <div className="text-center py-10 space-y-6">
                  <ShieldCheck className="h-16 w-16 text-primary mx-auto opacity-20" />
                  <h3 className="text-2xl font-bold uppercase italic">Identity Required</h3>
                  <p className="text-muted-foreground font-medium">Identify yourself as an athlete to form a squad.</p>
                  <Button asChild className="btn-primary w-full h-14"><Link href="/profile">VERIFY IDENTITY</Link></Button>
                </div>
              ) : (
                <form onSubmit={handleCreateTeam} className="space-y-8">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Squad <span className="text-primary">Genesis</span></DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="label-caps opacity-40 ml-1">Team Identity</Label>
                      <Input 
                        placeholder="e.g. Mysuru Mavericks"
                        className="bg-surface border-white/5 h-14 rounded-2xl focus:border-primary/50" 
                        value={newTeam.teamName}
                        onChange={e => setNewTeam({...newTeam, teamName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="label-caps opacity-40 ml-1">Sport Discipline</Label>
                        <Select value={newTeam.sport} onValueChange={v => setNewTeam({...newTeam, sport: v})}>
                          <SelectTrigger className="bg-surface border-white/5 h-14 rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-white/10 rounded-xl">
                            {SPORT_OPTIONS.map(opt => <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="label-caps opacity-40 ml-1">Home Zone</Label>
                        <Input 
                          placeholder="e.g. Vijaynagar"
                          className="bg-surface border-white/5 h-14 rounded-2xl"
                          value={newTeam.area}
                          onChange={e => setNewTeam({...newTeam, area: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="label-caps opacity-40 ml-1">Captain Signal (WhatsApp)</Label>
                      <Input 
                        className="bg-surface border-white/5 h-14 rounded-2xl"
                        placeholder="917411..."
                        value={newTeam.whatsapp}
                        onChange={e => setNewTeam({...newTeam, whatsapp: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isCreating} className="btn-primary w-full h-[64px] text-xs font-black uppercase tracking-[0.2em] rounded-2xl">
                    {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : "TRANSMIT SQUAD DATA"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Scanning Network...</p>
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center glass-card rounded-[4rem] border-dashed border-white/10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            <Users className="h-16 w-16 text-white/5" />
            <div>
              <h3 className="text-3xl font-black uppercase italic tracking-widest text-white/10 mb-2">Network Empty</h3>
              <p className="text-white/20 font-medium italic">No squads have identified themselves in this circuit yet.</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function TeamCard({ team }: { team: any }) {
  return (
    <Link href={`/teams/${team.id}`} className="group relative">
      <div className="flat-card flex flex-col h-full bg-[#0d0d0d] border-white/5 hover:border-primary/30 hover:bg-[#111] transition-all overflow-hidden p-8 rounded-[2.5rem]">
        <div className="flex items-center gap-6 mb-8">
          <div className="h-20 w-20 rounded-[1.5rem] border-2 border-primary/20 p-1 flex items-center justify-center bg-black overflow-hidden group-hover:border-primary group-hover:scale-105 transition-all duration-500 shadow-2xl">
            {team.logoUrl ? (
              <img src={team.logoUrl} className="h-full w-full object-cover rounded-[1.2rem]" alt={team.teamName} />
            ) : (
              <Zap className="h-8 w-8 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors line-clamp-1">{team.teamName}</h3>
            <div className="flex items-center gap-2 mt-2">
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               <p className="label-caps text-primary text-[10px] tracking-[0.2em]">{team.sport}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
            <p className="text-2xl font-black italic text-white leading-none">{team.wins || 0}</p>
            <p className="label-caps text-white/20 text-[8px] mt-2 tracking-widest">Wins</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
            <p className="text-2xl font-black italic text-white leading-none">{team.matches || 0}</p>
            <p className="label-caps text-white/20 text-[8px] mt-2 tracking-widest">Matches</p>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center text-white/40 text-[11px] font-bold uppercase tracking-widest gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary/40" />
            <span className="truncate max-w-[120px]">{team.area || "Mysuru"}</span>
          </div>
          <div className="h-10 w-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
             <Star className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

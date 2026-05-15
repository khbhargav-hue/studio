
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Swords,
  ChevronRight
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

const SPORT_OPTIONS = ["Football", "Cricket", "Badminton", "Pickleball", "Swimming"]

export default function TeamsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    sport: "Football",
    area: "",
    description: "",
    maxPlayers: 14,
  })

  const teamsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "teams"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: teams, loading } = useCollection(teamsQuery)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !user) return

    setIsGenerating(true)
    try {
      await addDoc(collection(db, "teams"), {
        ...newTeam,
        createdBy: user.uid,
        captain: user.displayName || "Athlete",
        members: [user.uid],
        wins: 0,
        losses: 0,
        matchesPlayed: 0,
        isOpen: true,
        createdAt: serverTimestamp()
      })
      toast({ title: "Squad Genesis Complete", description: "Your team is now active on the Mysuru circuit." })
      setShowCreateDialog(false)
      setNewTeam({ name: "", sport: "Football", area: "", description: "", maxPlayers: 14 })
    } catch (err) {
      toast({ title: "Transmission Failed", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">TEAMS</div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase italic leading-none">
              Build Your <span className="text-primary">Squad</span> <br />in Mysuru
            </h1>
            <p className="text-muted max-w-xl text-lg font-medium italic">
              Connect with Mysuru's elite sports communities. Build your legacy or identify your next rivals.
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-black h-[56px] px-8 text-[12px] font-black uppercase tracking-widest rounded-[10px] hover:opacity-90 transition-all">
                <Plus className="h-5 w-5 mr-2" /> Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border p-10 rounded-[24px] max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter mb-6">
                  Squad <span className="text-primary">Genesis</span>
                </DialogTitle>
              </DialogHeader>
              {!user ? (
                <div className="text-center py-10 space-y-6">
                  <ShieldCheck className="h-16 w-16 text-primary mx-auto opacity-20" />
                  <p className="text-muted font-medium">Identify yourself as an athlete to form a squad.</p>
                  <Button asChild className="bg-primary text-black w-full h-14 font-black uppercase tracking-widest">
                    <Link href="/profile">Verify Identity</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateTeam} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Team Identity</Label>
                    <Input 
                      placeholder="e.g. Mysuru Mavericks"
                      className="bg-surface border-border h-12 rounded-[10px] focus:border-primary/50" 
                      value={newTeam.name}
                      onChange={e => setNewTeam({...newTeam, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Sport</Label>
                      <Select value={newTeam.sport} onValueChange={v => setNewTeam({...newTeam, sport: v})}>
                        <SelectTrigger className="bg-surface border-border h-12 rounded-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {SPORT_OPTIONS.map(opt => <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Area</Label>
                      <Input 
                        placeholder="e.g. Vijayanagar"
                        className="bg-surface border-border h-12 rounded-[10px]"
                        value={newTeam.area}
                        onChange={e => setNewTeam({...newTeam, area: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Squad Tactical Intel</Label>
                    <Textarea 
                      placeholder="Brief description of your team..."
                      className="bg-surface border-border rounded-[10px] min-h-[100px] italic"
                      value={newTeam.description}
                      onChange={e => setNewTeam({...newTeam, description: e.target.value})}
                    />
                  </div>
                  <Button type="submit" disabled={isCreating} className="bg-primary text-black w-full h-14 text-xs font-black uppercase tracking-widest rounded-[10px]">
                    {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Transmit Squad Data"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[280px] bg-card border border-border animate-pulse rounded-[16px]" />
            ))}
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-border rounded-[24px] max-w-2xl mx-auto">
            <Users className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic text-white/10 tracking-widest">No Squads Active</h3>
            <p className="text-white/20 font-medium italic mt-2">The roster is currently silent. Be the first to form a squad.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function TeamCard({ team }: { team: any }) {
  const initials = team.name ? team.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'FT'
  const freeSlots = Math.max(0, (team.maxPlayers || 14) - (team.members?.length || 0))

  return (
    <div className="bg-card border border-border rounded-[16px] p-8 flex flex-col transition-all hover:border-primary/40 group">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full bg-surface border-2 border-primary flex items-center justify-center text-primary font-black text-xl italic tracking-tighter">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold uppercase italic tracking-tighter text-white truncate group-hover:text-primary transition-colors">
            {team.name || "Untitled Squad"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">{team.sport}</span>
            <span className="text-white/10">•</span>
            <div className="flex items-center text-[10px] font-bold text-muted uppercase tracking-widest">
              <MapPin className="h-3 w-3 mr-1" /> {team.area}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-6 border-y border-border mb-6">
        <div className="text-center">
          <p className="text-[10px] font-black text-muted uppercase mb-1">Squad</p>
          <div className="flex items-center justify-center gap-1 text-white font-bold">
            <Users className="h-3 w-3 text-primary" /> {team.members?.length || 0}
          </div>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-[10px] font-black text-muted uppercase mb-1">Wins</p>
          <div className="flex items-center justify-center gap-1 text-white font-bold">
            <Trophy className="h-3 w-3 text-primary" /> {team.wins || 0}
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-muted uppercase mb-1">Matches</p>
          <div className="flex items-center justify-center gap-1 text-white font-bold">
            <Swords className="h-3 w-3 text-primary" /> {team.matchesPlayed || 0}
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <Button variant="outline" className="w-full h-12 border-primary text-primary hover:bg-primary hover:text-black font-black uppercase tracking-widest text-[11px] rounded-[10px] group-hover:bg-primary group-hover:text-black transition-all">
          Join Team
        </Button>
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest text-center">
          {freeSlots > 0 ? `${freeSlots} slots open` : "Roster Full"}
        </p>
      </div>
    </div>
  )
}

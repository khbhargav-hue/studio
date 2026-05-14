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
  Star,
  ChevronRight,
  ShieldCheck
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
      toast({ title: "Team Formed" })
      setShowCreateDialog(false)
      setNewTeam({ teamName: "", sport: "Football", area: "", captain: "", whatsapp: "", turfPreference: "", players: [], newPlayerName: "" })
    } catch (err) {
      toast({ title: "Creation Failed", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20 max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="label-caps text-primary">Athlete Hub</div>
            <h1>Elite <span className="text-primary">Teams</span></h1>
            <p className="text-muted max-w-xl text-[18px]">
              Connect with Mysuru's most active sports communities. Build your legacy or find your next rivals.
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="btn-primary h-[56px] px-8">
                <Plus className="h-5 w-5" /> FORM SQUAD
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border p-8 rounded-2xl max-w-lg">
              {!user ? (
                <div className="text-center py-10 space-y-4">
                  <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
                  <h3>Identity Required</h3>
                  <p className="text-muted">Please sign in to form a squad.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateTeam} className="space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Form New Squad</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="label-caps opacity-70">Team Name</Label>
                      <Input 
                        className="bg-surface border-border h-12" 
                        value={newTeam.teamName}
                        onChange={e => setNewTeam({...newTeam, teamName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="label-caps opacity-70">Sport</Label>
                        <Select value={newTeam.sport} onValueChange={v => setNewTeam({...newTeam, sport: v})}>
                          <SelectTrigger className="bg-surface border-border h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {SPORT_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="label-caps opacity-70">Home Area</Label>
                        <Input 
                          className="bg-surface border-border h-12"
                          value={newTeam.area}
                          onChange={e => setNewTeam({...newTeam, area: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="label-caps opacity-70">Captain WhatsApp</Label>
                      <Input 
                        className="bg-surface border-border h-12"
                        placeholder="91..."
                        value={newTeam.whatsapp}
                        onChange={e => setNewTeam({...newTeam, whatsapp: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isCreating} className="btn-primary w-full h-[56px]">
                    {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : "PUBLISH SQUAD"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams?.map((team) => (
              <TeamCard key={team.id} team={team as any} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function TeamCard({ team }: { team: any }) {
  const whatsappUrl = `https://wa.me/${team.whatsapp}?text=${encodeURIComponent(`Hi! I'm interested in joining ${team.teamName}`)}`;
  
  return (
    <div className="flat-card flex flex-col group">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-full border-[2px] border-primary p-0.5 flex items-center justify-center bg-surface overflow-hidden">
          {team.logoUrl ? (
            <img src={team.logoUrl} className="h-full w-full object-cover rounded-full" />
          ) : (
            <Users className="h-6 w-6 text-muted" />
          )}
        </div>
        <div>
          <h3 className="text-[18px] line-clamp-1">{team.teamName}</h3>
          <p className="label-caps text-primary text-[10px]">{team.sport}</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex items-center justify-between p-3 bg-surface rounded-[10px] border border-border">
          <div className="text-center flex-1">
            <p className="text-[14px] font-bold">{team.players?.length || 0}</p>
            <p className="label-caps text-muted text-[9px]">Members</p>
          </div>
          <div className="h-8 w-px bg-border mx-2" />
          <div className="text-center flex-1">
            <p className="text-[14px] font-bold">12</p>
            <p className="label-caps text-muted text-[9px]">Matches</p>
          </div>
        </div>
        <div className="flex items-center text-muted text-[13px] gap-1">
          <MapPin className="h-3 w-3" />
          <span>{team.area || "Mysuru"}</span>
        </div>
      </div>

      <Button asChild className="btn-secondary w-full mt-6 h-[48px]">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">JOIN SQUAD</a>
      </Button>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ChevronRight,
  UserPlus,
  Zap,
  Star,
  Search,
  MessageCircle,
  Activity
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import Link from "next/link"
import { cn } from "@/lib/utils"

const SPORT_OPTIONS = ["Football", "Cricket", "Badminton", "Pickleball", "Swimming"]
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"]

export default function TeamsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [skillFilter, setSkillFilter] = useState("all")

  const [newTeam, setNewTeam] = useState({
    name: "",
    sport: "Football",
    area: "",
    description: "",
    maxPlayers: 14,
    type: "Squad (5+)",
    skillLevel: "Intermediate",
    whatsapp: ""
  })

  // Data Feeds
  const teamsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "teams"), orderBy("createdAt", "desc"))
  }, [db])

  const freeAgentsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "users"), orderBy("rewardPoints", "desc"))
  }, [db])

  const { data: teams, loading: teamsLoading } = useCollection(teamsQuery)
  const { data: freeAgents, loading: agentsLoading } = useCollection(freeAgentsQuery)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !user) return

    console.log("TEAM_SAVE_START")
    setIsCreating(true)

    const teamData = {
      ...newTeam,
      createdBy: user.uid,
      captain: user.displayName || "Athlete",
      members: [user.uid],
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      needPlayers: true,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp()
    }

    try {
      const docRef = await addDoc(collection(db, "teams"), teamData)
      console.log("TEAM_SAVE_SUCCESS", docRef.id)
      
      toast({ 
        title: "Your squad is live 🔥", 
        description: "Tactical data published to the circuit." 
      })

      console.log("TEAM_MODAL_CLOSE")
      setShowCreateDialog(false)
      
      // Reset form
      setNewTeam({
        name: "",
        sport: "Football",
        area: "",
        description: "",
        maxPlayers: 14,
        type: "Squad (5+)",
        skillLevel: "Intermediate",
        whatsapp: ""
      })

      // Redirect to team detail page
      router.push(`/teams/${docRef.id}`)
      router.refresh()
      
    } catch (err: any) {
      console.error("TEAM_SAVE_FAIL", err)
      toast({ 
        title: "Deployment Failed", 
        description: err.message || "The circuit is currently unavailable.",
        variant: "destructive" 
      })
      
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'teams',
        operation: 'create',
        requestResourceData: teamData,
        message: err.message
      }))
    } finally {
      setIsCreating(false)
    }
  }

  const filteredTeams = useMemo(() => {
    if (!teams) return []
    return teams.filter((t: any) => {
      const matchesSearch = !searchQuery || t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.area?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSkill = skillFilter === "all" || t.skillLevel === skillFilter
      return matchesSearch && matchesSkill
    })
  }, [teams, searchQuery, skillFilter])

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4 md:px-8">
        {/* Community Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              <Activity className="h-3 w-3" /> MYSURU MATCHMAKING
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase italic leading-none">
              Find Your <br /><span className="text-primary">Squad</span>
            </h1>
            <p className="text-muted max-w-xl text-lg font-medium italic">
              Connect with Mysuru's elite sports communities. Instagram-speed discovery for the modern athlete.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-black h-[64px] px-10 text-[12px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20">
                  <Plus className="h-5 w-5 mr-2" /> Start a Team
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border p-10 rounded-[32px] max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter mb-6">
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
                      <Input placeholder="e.g. Mysuru Mavericks" className="bg-surface h-14" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Sport</Label>
                        <Select value={newTeam.sport} onValueChange={v => setNewTeam({...newTeam, sport: v})}>
                          <SelectTrigger className="bg-surface h-14"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-card">{SPORT_OPTIONS.map(opt => <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Skill Requirement</Label>
                        <Select value={newTeam.skillLevel} onValueChange={v => setNewTeam({...newTeam, skillLevel: v})}>
                          <SelectTrigger className="bg-surface h-14"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-card">{SKILL_LEVELS.map(opt => <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Area</Label>
                        <Input placeholder="e.g. Bogadi" className="bg-surface h-14" value={newTeam.area} onChange={e => setNewTeam({...newTeam, area: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Max Players</Label>
                        <Input type="number" className="bg-surface h-14" value={newTeam.maxPlayers} onChange={e => setNewTeam({...newTeam, maxPlayers: Number(e.target.value)})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Tactical Brief</Label>
                      <Textarea placeholder="Describe your squad's goals..." className="bg-surface min-h-[100px] italic" value={newTeam.description} onChange={e => setNewTeam({...newTeam, description: e.target.value})} />
                    </div>
                    <Button type="submit" disabled={isCreating} className="bg-primary text-black w-full h-16 text-xs font-black uppercase tracking-widest rounded-xl">
                      {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish to Circuit"}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input 
              placeholder="Find teammates near you (Area, Name)..." 
              className="bg-card border-border h-14 pl-12 rounded-2xl" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-full md:w-[200px] h-14 bg-card border-border rounded-2xl">
              <SelectValue placeholder="Skill Level" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="all">All Skills</SelectItem>
              {SKILL_LEVELS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="teams" className="space-y-12">
          <TabsList className="bg-card p-1.5 h-16 rounded-3xl border border-border inline-flex w-full md:w-auto">
            <TabsTrigger value="teams" className="flex-1 md:flex-none px-10 h-full rounded-2xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
              Elite Squads
            </TabsTrigger>
            <TabsTrigger value="players" className="flex-1 md:flex-none px-10 h-full rounded-2xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
              Free Agents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            {teamsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[320px] bg-card border border-border animate-pulse rounded-[24px]" />
                ))}
              </div>
            ) : filteredTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTeams.map((team) => (
                  <TeamCard key={team.id} team={team as any} />
                ))}
              </div>
            ) : (
              <div className="py-40 text-center border border-dashed border-border rounded-[32px] max-w-2xl mx-auto bg-card/20">
                <Users className="h-16 w-16 text-white/5 mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase italic text-white/10 tracking-widest">No Squads Logged</h3>
                <p className="text-white/20 font-medium italic mt-2">The roster is currently silent. Launch your identity first.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="players">
            {agentsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-[200px] bg-card border border-border animate-pulse rounded-[24px]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {freeAgents?.filter(p => p.skillLevel).map((agent: any) => (
                  <Link key={agent.id} href={`/profile?uid=${agent.uid}`} className="bg-card border border-border rounded-[24px] p-6 hover:border-primary transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-full border-2 border-primary p-0.5">
                        <div className="h-full w-full rounded-full overflow-hidden bg-surface">
                          <img src={agent.photoURL || "https://placehold.co/100"} className="h-full w-full object-cover" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase italic group-hover:text-primary transition-colors">{agent.displayName?.split(' ')[0]}</h4>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{agent.level} Athlete</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase italic">
                        <MapPin className="h-3 w-3 text-primary" /> {agent.area || "Mysuru"}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase italic">
                        <Star className="h-3 w-3 text-primary" /> {agent.skillLevel || "Intermediate"}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-6 h-10 border-primary/20 text-primary uppercase font-black text-[9px] tracking-widest rounded-xl hover:bg-primary hover:text-black">
                      Invite to Squad
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}

function TeamCard({ team }: { team: any }) {
  const initials = team.name ? team.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'FT'
  const currentPlayers = team.members?.length || 0
  const maxPlayers = team.maxPlayers || 14
  const progress = (currentPlayers / maxPlayers) * 100
  const slotsLeft = Math.max(0, maxPlayers - currentPlayers)

  return (
    <div className="bg-card border border-border rounded-[32px] p-10 flex flex-col transition-all hover:border-primary/40 group relative overflow-hidden">
      {team.needPlayers && (
        <div className="absolute top-6 right-6">
          <span className="bg-primary text-black text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
            RECRUITING
          </span>
        </div>
      )}

      <div className="flex items-center gap-6 mb-10">
        <div className="h-20 w-20 rounded-[20px] bg-surface border-2 border-primary flex items-center justify-center text-primary font-black text-3xl italic tracking-tighter shadow-2xl shadow-primary/10">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/teams/${team.id}`}>
            <h3 className="text-2xl font-bold uppercase italic tracking-tighter text-white truncate group-hover:text-primary transition-colors">
              {team.name || "Untitled Squad"}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1">
             <Zap className="h-3.5 w-3.5 text-primary" />
             <span className="text-[11px] font-black uppercase text-white/40 tracking-widest">{team.sport} • {team.skillLevel}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Roster Fill</span>
          <span className="text-sm font-black italic text-white">{currentPlayers} / {maxPlayers}</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-white/5" />
        <p className="text-[10px] font-bold text-primary italic uppercase tracking-tight">
          {slotsLeft > 0 ? `Need ${slotsLeft} more players for full roster` : "Squad is at full capacity"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 py-6 border-y border-border mb-10">
        <div className="flex items-center gap-3">
           <MapPin className="h-4 w-4 text-primary" />
           <span className="text-[10px] font-bold uppercase italic text-muted truncate">{team.area}</span>
        </div>
        <div className="flex items-center gap-3 justify-end">
           <Trophy className="h-4 w-4 text-primary" />
           <span className="text-xs font-black italic text-white">{team.wins || 0} Wins</span>
        </div>
      </div>

      <div className="mt-auto flex gap-3">
        <Button asChild className="flex-1 h-14 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] transition-all">
          <Link href={`/teams/${team.id}`}>View Squad</Link>
        </Button>
        <Button variant="outline" className="h-14 w-14 border-border text-white hover:border-primary hover:text-primary rounded-2xl transition-all">
           <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

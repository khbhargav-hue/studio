
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
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
  Calendar, 
  Clock, 
  Plus, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  MapPin,
  Trophy,
  Zap,
  Activity,
  Swords,
  Users
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function ChallengesPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [isPosting, setIsPosting] = useState(false)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    sport: "Football",
    format: "5-a-side",
    turf: "",
    area: "",
    date: "",
    time: "",
    entryFee: "0",
    notes: ""
  })

  const challengesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "challenges"), orderBy("createdAt", "desc"))
  }, [db])

  const myTeamsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "teams"), where("createdBy", "==", user.uid))
  }, [db, user])

  const { data: rawChallenges, loading } = useCollection(challengesQuery)
  const { data: myTeams } = useCollection(myTeamsQuery)

  const challenges = useMemo(() => {
    if (!rawChallenges) return []
    return rawChallenges
  }, [rawChallenges])

  const handlePostChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !user) return
    if (!myTeams || myTeams.length === 0) {
      toast({ title: "Squad Identification Missing", description: "Form a team in the Roster first.", variant: "destructive" })
      return
    }

    setIsPosting(true)
    try {
      const team = myTeams[0]
      await addDoc(collection(db, "challenges"), {
        ...newChallenge,
        teamId: team.id,
        teamName: team.name,
        ownerId: user.uid,
        status: "open",
        createdAt: serverTimestamp()
      })
      toast({ title: "Match Claim Posted", description: "Your challenge is live on the circuit." })
      setShowPostDialog(false)
      setNewChallenge({ title: "", sport: "Football", format: "5-a-side", turf: "", area: "", date: "", time: "", entryFee: "0", notes: "" })
    } catch (err) {
      toast({ title: "Transmission Failed", variant: "destructive" })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">CHALLENGES</div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase italic leading-none">
              Compete & <span className="text-primary">Win</span> <br />in Mysuru
            </h1>
            <p className="text-muted max-w-xl text-lg font-medium italic">
              Identify a rival, negotiate the terms, and hit the pitch. The network is watching.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Syncing Intelligence...</p>
          </div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-border rounded-[24px] max-w-2xl mx-auto">
            <ShieldAlert className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic text-white/10 tracking-widest">No Active Claims</h3>
            <p className="text-white/20 font-medium italic mt-2">The circuit is currently silent. Be the first to issue a match claim.</p>
          </div>
        )}

        {/* FAB Button */}
        <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
          <DialogTrigger asChild>
            <button 
              className="fixed bottom-12 right-12 h-14 w-14 bg-primary text-black rounded-full shadow-[0_20px_50px_rgba(170,255,0,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50 group"
              title="Post Challenge"
            >
              <Plus className="h-6 w-6" />
              <span className="sr-only">Post Challenge</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border p-10 rounded-[24px] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter mb-6">
                Post <span className="text-primary">Match Claim</span>
              </DialogTitle>
            </DialogHeader>
            {!user ? (
              <div className="text-center py-10 space-y-6">
                <ShieldAlert className="h-16 w-16 text-primary mx-auto opacity-20" />
                <p className="text-muted font-medium">Identify yourself to issue a match claim.</p>
                <Button asChild className="bg-primary text-black w-full h-14 font-black uppercase tracking-widest">
                  <Link href="/profile">Verify Identity</Link>
                </Button>
              </div>
            ) : !myTeams || myTeams.length === 0 ? (
              <div className="text-center py-10 space-y-6">
                <Trophy className="h-16 w-16 text-primary mx-auto opacity-20" />
                <p className="text-muted font-medium">An athlete must belong to a squad to issue a claim.</p>
                <Button asChild className="bg-primary text-black w-full h-14 font-black uppercase tracking-widest">
                  <Link href="/teams">Form Elite Squad</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePostChallenge} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Challenge Title</Label>
                  <Input placeholder="e.g. Koramangala Cup #3" className="bg-surface border-border h-12" value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Date</Label>
                    <Input type="date" className="bg-surface border-border h-12" value={newChallenge.date} onChange={e => setNewChallenge({...newChallenge, date: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Time</Label>
                    <Input type="time" className="bg-surface border-border h-12" value={newChallenge.time} onChange={e => setNewChallenge({...newChallenge, time: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Target Arena</Label>
                  <Input placeholder="e.g. Matchbox Mysore" className="bg-surface border-border h-12" value={newChallenge.turf} onChange={e => setNewChallenge({...newChallenge, turf: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Entry Fee (₹)</Label>
                    <Input type="number" placeholder="200" className="bg-surface border-border h-12" value={newChallenge.entryFee} onChange={e => setNewChallenge({...newChallenge, entryFee: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Format</Label>
                    <Input placeholder="5-a-side" className="bg-surface border-border h-12" value={newChallenge.format} onChange={e => setNewChallenge({...newChallenge, format: e.target.value})} required />
                  </div>
                </div>
                <Button type="submit" disabled={isPosting} className="bg-primary text-black w-full h-14 text-xs font-black uppercase tracking-widest">
                  {isPosting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Transmit Claim to Circuit"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: any }) {
  const statusColors = {
    open: "bg-green-500/10 text-green-500",
    active: "bg-yellow-500/10 text-yellow-500",
    closed: "bg-red-500/10 text-red-500",
    completed: "bg-primary/10 text-primary"
  }

  const statusLabel = challenge.status?.toUpperCase() || "OPEN"

  return (
    <div className="bg-card border border-border border-l-4 border-l-primary rounded-[16px] p-8 flex flex-col transition-all hover:bg-surface/50 group">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors">
          {challenge.title || "Match Claim"}
        </h3>
        <div className={cn("text-[9px] font-black px-2 py-0.5 rounded-[4px] tracking-widest", statusColors[challenge.status as keyof typeof statusColors] || statusColors.open)}>
          {statusLabel}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 text-[12px] font-bold text-muted uppercase tracking-widest">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span>{challenge.sport} • {challenge.format}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-bold text-muted uppercase tracking-widest">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>{challenge.date || "Sun 22 Dec"} • {challenge.time || "6:00 PM"}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-bold text-muted uppercase tracking-widest">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{challenge.turf || "Matchbox Mysore"}</span>
        </div>
      </div>

      <div className="py-6 border-y border-border mb-8 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Matchup</span>
          <span className="text-sm font-bold text-white uppercase italic">{challenge.teamName} <span className="text-primary mx-2">VS</span> ???</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Entry Fee</span>
          <span className="text-sm font-bold text-white italic">₹{challenge.entryFee || "200"}/team</span>
        </div>
      </div>

      <Button className="mt-auto bg-transparent border border-primary text-primary hover:bg-primary hover:text-black w-full h-12 text-[11px] font-black uppercase tracking-widest rounded-[10px] transition-all">
        🏆 Accept Challenge
      </Button>
    </div>
  )
}

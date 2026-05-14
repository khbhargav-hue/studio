
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
  Activity
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
    teamName: "",
    sport: "Football",
    turf: "",
    area: "",
    date: "",
    time: "",
    notes: ""
  })

  const challengesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "challenges"), orderBy("createdAt", "desc"))
  }, [db])

  const myTeamsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "teams"), where("ownerId", "==", user.uid))
  }, [db, user])

  const { data: rawChallenges, loading } = useCollection(challengesQuery)
  const { data: myTeams } = useCollection(myTeamsQuery)

  const challenges = useMemo(() => {
    if (!rawChallenges) return []
    return rawChallenges.filter((c: any) => c.status === "open")
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
        teamName: team.teamName,
        ownerId: user.uid,
        status: "open",
        createdAt: serverTimestamp()
      })
      toast({ title: "Match Claim Posted", description: "Your challenge is live on the circuit." })
      setShowPostDialog(false)
      setNewChallenge({ teamName: "", sport: "Football", turf: "", area: "", date: "", time: "", notes: "" })
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 label-caps text-primary bg-primary/10 border border-primary/20 px-5 py-2 rounded-full">
              <Activity className="h-3 w-3 animate-pulse" /> Live Match Circuit
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase italic">Open <span className="text-primary text-neon">Challenges</span></h1>
            <p className="text-muted max-w-xl text-xl font-medium italic">
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
          <div className="py-40 text-center glass-card rounded-[4rem] border-dashed border-white/10 max-w-3xl mx-auto flex flex-col items-center gap-8">
            <ShieldAlert className="h-20 w-20 text-white/5" />
            <div>
              <h3 className="text-3xl font-black uppercase italic text-white/10 tracking-widest mb-2">No Active Claims</h3>
              <p className="text-white/20 font-medium italic">The circuit is currently silent. Be the first to issue a match claim.</p>
            </div>
          </div>
        )}

        {/* FAB Button */}
        <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
          <DialogTrigger asChild>
            <button className="fixed bottom-12 right-12 h-20 w-20 bg-primary text-background rounded-full shadow-[0_20px_50px_rgba(170,255,0,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50">
              <Plus className="h-10 w-10" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 p-10 rounded-[3rem] max-w-lg shadow-2xl">
            {!user ? (
              <div className="text-center py-10 space-y-6">
                <ShieldAlert className="h-16 w-16 text-primary opacity-20 mx-auto" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Athlete Unknown</h3>
                <p className="text-muted-foreground font-medium italic">You must identify yourself to issue a match claim.</p>
                <Button asChild className="btn-primary h-14 w-full"><Link href="/profile">VERIFY IDENTITY</Link></Button>
              </div>
            ) : !myTeams || myTeams.length === 0 ? (
              <div className="text-center py-10 space-y-6">
                <Trophy className="h-16 w-16 text-primary opacity-20 mx-auto" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">No Squad Detected</h3>
                <p className="text-muted-foreground font-medium italic">An athlete must belong to a squad to issue a claim.</p>
                <Button asChild className="btn-primary h-14 w-full"><Link href="/teams">FORM ELITE SQUAD</Link></Button>
              </div>
            ) : (
              <form onSubmit={handlePostChallenge} className="space-y-8">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Post <span className="text-primary">Match Claim</span></DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="label-caps opacity-40 ml-1">Target Date</Label>
                      <Input type="date" className="bg-surface border-white/5 h-14 rounded-2xl font-bold" value={newChallenge.date} onChange={e => setNewChallenge({...newChallenge, date: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="label-caps opacity-40 ml-1">Kick-off Time</Label>
                      <Input type="time" className="bg-surface border-white/5 h-14 rounded-2xl font-bold" value={newChallenge.time} onChange={e => setNewChallenge({...newChallenge, time: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-40 ml-1">Target Arena / Territory</Label>
                    <Input placeholder="e.g. Shine Arena or Vijaynagar" className="bg-surface border-white/5 h-14 rounded-2xl" value={newChallenge.turf} onChange={e => setNewChallenge({...newChallenge, turf: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-40 ml-1">Strategic Intel / Notes</Label>
                    <Textarea className="bg-surface border-white/5 p-6 h-32 rounded-[2rem] text-sm italic" placeholder="Split cost? 5v5 Intensity? Competitive or Friendly?" value={newChallenge.notes} onChange={e => setNewChallenge({...newChallenge, notes: e.target.value})} />
                  </div>
                </div>
                <Button type="submit" disabled={isPosting} className="btn-primary w-full h-[64px] text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl">
                  {isPosting ? <Loader2 className="h-6 w-6 animate-spin" /> : "TRANSMIT CLAIM TO CIRCUIT"}
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
  const whatsappUrl = `https://wa.me/917411322492?text=${encodeURIComponent(`Hi! I'm interested in accepting the ${challenge.sport} match claim from ${challenge.teamName} on ${challenge.date}. Let's play!`)}`
  
  return (
    <div className="flat-card border-l-4 border-l-primary bg-[#080808] p-10 flex flex-col justify-between rounded-[2.5rem] group hover:bg-[#0c0c0c] transition-all">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="label-caps text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-[9px] tracking-[0.3em] font-black">{challenge.sport}</div>
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[9px] font-black text-primary uppercase tracking-widest">LIVE CLAIM</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-3 group-hover:text-primary transition-colors">{challenge.teamName}</h3>
          <div className="flex items-center text-white/30 font-bold uppercase tracking-widest text-[11px] gap-6">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary/40" /> {challenge.date}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary/40" /> {challenge.time}</div>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5">
          <p className="text-sm text-white/50 italic leading-relaxed">"{challenge.notes || "Ready for a high-intensity friendly. Let's hit the pitch."}"</p>
        </div>

        <div className="flex items-center gap-3 text-white/40 font-bold uppercase tracking-widest text-[10px]">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{challenge.turf || "Mysuru Territory"}</span>
        </div>
      </div>

      <Button asChild className="btn-primary w-full mt-10 h-[64px] text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">ACCEPT MATCH CLAIM</a>
      </Button>
    </div>
  )
}

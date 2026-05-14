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
  Zap
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

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
      toast({ title: "Squad Required", description: "Form a team first.", variant: "destructive" })
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
      toast({ title: "Challenge Posted" })
      setShowPostDialog(false)
      setNewChallenge({ teamName: "", sport: "Football", turf: "", area: "", date: "", time: "", notes: "" })
    } catch (err) {
      toast({ title: "Failed to post", variant: "destructive" })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="label-caps text-primary">Match Circuit</div>
            <h1>Open <span className="text-primary">Challenges</span></h1>
            <p className="text-muted max-w-xl text-[18px]">
              Identify a rival, accept the terms, and hit the pitch.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-border rounded-2xl">
            <ShieldAlert className="h-12 w-12 text-border mx-auto mb-4" />
            <h3 className="text-muted italic">No active match claims found.</h3>
          </div>
        )}

        {/* FAB Button */}
        <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
          <DialogTrigger asChild>
            <button className="fixed bottom-8 right-8 h-16 w-16 bg-primary text-background rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50">
              <Plus className="h-8 w-8" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border p-8 rounded-2xl max-w-lg">
            {!user ? (
              <div className="text-center py-10"><h3>Identity Required</h3></div>
            ) : !myTeams || myTeams.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <h3>No Squad Detected</h3>
                <Button asChild className="btn-primary"><Link href="/teams">FORM SQUAD</Link></Button>
              </div>
            ) : (
              <form onSubmit={handlePostChallenge} className="space-y-6">
                <DialogHeader><DialogTitle className="text-2xl font-bold">Post Challenge</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="label-caps opacity-70">Date</Label>
                      <Input type="date" className="bg-surface border-border h-12" value={newChallenge.date} onChange={e => setNewChallenge({...newChallenge, date: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="label-caps opacity-70">Time</Label>
                      <Input type="time" className="bg-surface border-border h-12" value={newChallenge.time} onChange={e => setNewChallenge({...newChallenge, time: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">Target Arena</Label>
                    <Input placeholder="e.g. Shine Arena" className="bg-surface border-border h-12" value={newChallenge.turf} onChange={e => setNewChallenge({...newChallenge, turf: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">Strategy / Notes</Label>
                    <Textarea className="bg-surface border-border p-4 h-24" placeholder="Split turf cost? 5v5? Competitive?" value={newChallenge.notes} onChange={e => setNewChallenge({...newChallenge, notes: e.target.value})} />
                  </div>
                </div>
                <Button type="submit" disabled={isPosting} className="btn-primary w-full h-[56px]">POST MATCH CLAIM</Button>
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
  const whatsappUrl = `https://wa.me/917411322492?text=${encodeURIComponent(`Hi, I'm ready to accept your challenge for ${challenge.sport} on ${challenge.date}!`)}`
  
  return (
    <div className="flat-card border-l-[3px] border-l-primary flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="label-caps text-primary bg-primary/10 px-2 py-0.5 rounded-[4px]">{challenge.sport}</div>
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
        
        <div>
          <h3 className="text-[22px] font-bold mb-2">{challenge.teamName}</h3>
          <div className="flex items-center text-muted text-[13px] gap-4">
            <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {challenge.date}</div>
            <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {challenge.time}</div>
          </div>
        </div>

        <div className="p-4 bg-surface rounded-[10px] border border-border">
          <p className="text-[13px] text-muted italic">"{challenge.notes || "Ready for a friendly match! Let's play."}"</p>
        </div>

        <div className="flex items-center gap-2 text-muted text-[13px]">
          <MapPin className="h-3.5 w-3.5" />
          <span>{challenge.turf || "Mysuru"}</span>
        </div>
      </div>

      <Button asChild className="btn-primary w-full mt-8 h-[48px]">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">ACCEPT MATCH</a>
      </Button>
    </div>
  )
}
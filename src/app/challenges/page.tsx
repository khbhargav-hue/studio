
"use client"

import { useState, useMemo } from "react"
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
  Calendar, 
  Clock, 
  Zap, 
  Trophy, 
  Plus, 
  Loader2, 
  MessageCircle, 
  ArrowRight,
  ShieldAlert,
  MapPin,
  Star
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

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

  // To avoid requiring a composite index in Firestore (status == 'open' AND orderBy createdAt),
  // we query all challenges ordered by date and filter by status on the client.
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
      toast({ title: "No Team Found", description: "You must create a team first.", variant: "destructive" })
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
      toast({ title: "Challenge Issued", description: "Your match request is now public." })
      setShowPostDialog(false)
      setNewChallenge({ teamName: "", sport: "Football", turf: "", area: "", date: "", time: "", notes: "" })
    } catch (err) {
      toast({ title: "Post Failed", variant: "destructive" })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 md:pt-44 pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 mb-4 md:mb-6 bg-primary/10 border border-primary/20 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] px-4 md:px-5 py-2 rounded-full">
                <ShieldAlert className="h-3 w-3" />
                LIVE MATCH FEED
              </div>
              <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-white">
                OPEN <span className="text-primary">CHALLENGES</span>
              </h1>
              <p className="text-base md:text-xl text-white/40 font-medium max-w-xl mt-4 md:mt-6">
                Active match requests across Mysuru. Accept a challenge and hit the pitch.
              </p>
            </motion.div>

            <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
              <DialogTrigger asChild>
                <Button className="h-14 md:h-16 px-8 md:px-10 bg-primary text-black font-black uppercase tracking-widest text-[10px] md:text-xs rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform">
                  <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" /> ISSUE CHALLENGE
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10 bg-black/90 text-white rounded-[2.5rem] max-w-2xl p-0">
                {!user ? (
                  <div className="p-12 text-center space-y-6">
                    <DialogHeader>
                      <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
                      <DialogTitle className="text-3xl font-black uppercase italic text-center">Identity Required</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/40 text-center">Sign in via the profile tab to post challenges.</p>
                  </div>
                ) : !myTeams || myTeams.length === 0 ? (
                  <div className="p-12 text-center space-y-6">
                    <DialogHeader>
                      <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                      <DialogTitle className="text-3xl font-black uppercase italic text-center">No Squad Detected</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/40 mb-8 text-center">You need to form a team before issuing challenges.</p>
                    <div className="flex justify-center">
                      <Button asChild variant="outline" className="h-14 rounded-xl border-primary text-primary">
                        <a href="/teams">Create a Team Now</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePostChallenge} className="p-8 md:p-12 space-y-8">
                    <DialogHeader>
                      <DialogTitle className="text-4xl font-black italic uppercase text-primary">Post Match</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Preferred Date</Label>
                        <Input 
                          type="date" 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newChallenge.date}
                          onChange={e => setNewChallenge({...newChallenge, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Preferred Time</Label>
                        <Input 
                          type="time" 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newChallenge.time}
                          onChange={e => setNewChallenge({...newChallenge, time: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Target Arena (Turf)</Label>
                        <Input 
                          placeholder="e.g. Shine Arena" 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newChallenge.turf}
                          onChange={e => setNewChallenge({...newChallenge, turf: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Area</Label>
                        <Input 
                          placeholder="e.g. Rajiv Nagar" 
                          className="h-14 bg-white/5 border-white/5 rounded-2xl"
                          value={newChallenge.area}
                          onChange={e => setNewChallenge({...newChallenge, area: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Strategy / Notes</Label>
                      <Textarea 
                        placeholder="e.g. Looking for a friendly 5v5 match. Competitive but clean." 
                        className="min-h-[120px] bg-white/5 border-white/5 rounded-2xl p-6 leading-relaxed"
                        value={newChallenge.notes}
                        onChange={e => setNewChallenge({...newChallenge, notes: e.target.value})}
                      />
                    </div>

                    <Button type="submit" disabled={isPosting} className="w-full h-16 bg-primary text-black font-black text-xl rounded-2xl shadow-xl hover:scale-[1.01] transition-all">
                      {isPosting ? <Loader2 className="h-6 w-6 animate-spin" /> : "POST CHALLENGE"}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Monitoring Live Circuits...</p>
            </div>
          ) : challenges && challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {challenges.map((challenge, idx) => (
                <ChallengeCard key={challenge.id} challenge={challenge as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[3rem] md:rounded-[5rem] border-dashed border-white/10 max-w-3xl mx-auto flex flex-col items-center gap-8">
              <Zap className="h-12 w-12 md:h-16 md:w-16 text-white/5" />
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white/10 uppercase italic">Circuit is Quiet</h3>
                <p className="text-white/20 mt-4 max-w-[200px] md:max-w-xs mx-auto text-xs md:text-sm">No match requests found. Post a challenge and wake up the city.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: any }) {
  const whatsappUrl = `https://wa.me/91?text=${encodeURIComponent(`Hi, saw your challenge for ${challenge.sport} on ${challenge.date} via Turfista. My team is ready to play!`)}`
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-white/5 bg-[#0a0a0a] flex flex-col group"
    >
      <div className="p-8 md:p-10 pb-4 md:pb-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="px-4 md:px-5 py-1.5 md:py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">
            LIVE CHALLENGE
          </div>
          <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
        </div>
        
        <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mb-6 text-white truncate">{challenge.teamName}</h3>
        
        <div className="flex flex-wrap gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase text-white/40 tracking-widest">
            <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            {challenge.sport}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase text-white/40 tracking-widest">
            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            {challenge.area}
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 pt-2 md:pt-4 flex-1 space-y-6 md:space-y-8">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 mb-1.5 md:mb-2 opacity-40">
              <Calendar className="h-3 w-3" />
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Date</span>
            </div>
            <p className="text-xs md:text-sm font-bold text-white">{challenge.date}</p>
          </div>
          <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 mb-1.5 md:mb-2 opacity-40">
              <Clock className="h-3 w-3" />
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Time</span>
            </div>
            <p className="text-xs md:text-sm font-bold text-white">{challenge.time}</p>
          </div>
        </div>

        {challenge.notes && (
          <div className="p-4 md:p-6 bg-primary/5 border border-primary/10 rounded-2xl md:rounded-3xl">
            <p className="text-[8px] md:text-[9px] font-black text-primary/60 uppercase tracking-widest mb-2 italic">Notes</p>
            <p className="text-[10px] md:text-xs text-white/60 font-medium leading-relaxed italic truncate">"{challenge.notes}"</p>
          </div>
        )}
      </div>

      <div className="p-8 md:p-10 pt-0">
        <Button asChild className="w-full h-14 md:h-16 bg-primary text-black font-black uppercase tracking-widest text-[10px] md:text-xs rounded-2xl shadow-xl hover:scale-[1.02] transition-transform border-none">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            ACCEPT CHALLENGE <ArrowRight className="ml-2 md:ml-3 h-3 w-3 md:h-4 md:w-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  )
}

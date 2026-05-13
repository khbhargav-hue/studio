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
  ArrowRight,
  ShieldAlert,
  MapPin,
  Target,
  Wind,
  Star
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

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
      toast({ title: "No Squad Found", description: "You must form a team first.", variant: "destructive" })
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
      toast({ title: "Challenge Published", description: "Your match claim is now live." })
      setShowPostDialog(false)
      setNewChallenge({ teamName: "", sport: "Football", turf: "", area: "", date: "", time: "", notes: "" })
    } catch (err) {
      toast({ title: "Signal Lost", variant: "destructive" })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 md:pt-44 pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-3 mb-6 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                <ShieldAlert className="h-4 w-4 animate-pulse" />
                ELITE MATCH CIRCUIT
              </div>
              <h1 className="font-headline text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] text-white">
                OPEN <span className="text-primary text-neon">CHALLENGES</span>
              </h1>
              <p className="text-lg md:text-2xl text-white/40 font-medium max-w-xl mt-8 leading-relaxed italic border-l-2 border-primary/20 pl-8">
                Active match claims across Mysuru. Identify a rival, accept the terms, and hit the pitch.
              </p>
            </motion.div>

            <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
              <DialogTrigger asChild>
                <Button className="btn-neon-glow h-18 md:h-22 px-10 md:px-14 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs md:text-sm rounded-[2rem] shadow-2xl hover:scale-105 transition-all">
                  <Plus className="mr-3 h-5 w-5 md:h-6 md:w-6" /> ISSUE CHALLENGE
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10 bg-black/98 text-white rounded-[3rem] max-w-2xl p-0 overflow-hidden shadow-2xl">
                {!user ? (
                  <div className="p-16 text-center space-y-8">
                    <DialogHeader>
                      <Zap className="h-20 w-20 text-primary mx-auto mb-6 drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]" />
                      <DialogTitle className="text-4xl font-black uppercase italic text-center tracking-tight">Identity Required</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/40 text-lg font-medium leading-relaxed italic">Sign in via the profile hub to issue public match claims.</p>
                  </div>
                ) : !myTeams || myTeams.length === 0 ? (
                  <div className="p-16 text-center space-y-8">
                    <DialogHeader>
                      <Trophy className="h-20 w-20 text-primary mx-auto mb-6 drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]" />
                      <DialogTitle className="text-4xl font-black uppercase italic text-center tracking-tight">No Squad Detected</DialogTitle>
                    </DialogHeader>
                    <p className="text-white/40 mb-10 text-lg font-medium italic leading-relaxed">You must form an elite squad before issuing match claims.</p>
                    <div className="flex justify-center">
                      <Button asChild className="h-16 px-10 bg-primary text-black font-black uppercase rounded-2xl">
                        <Link href="/teams">FORM SQUAD NOW</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePostChallenge} className="p-10 md:p-16 space-y-10">
                    <DialogHeader>
                      <DialogTitle className="text-5xl font-black italic uppercase text-primary tracking-tighter leading-none">Issue Claim</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Preferred Date</Label>
                        <Input 
                          type="date" 
                          className="h-16 bg-white/5 border-white/5 rounded-2xl px-6 focus:border-primary/50 text-base"
                          value={newChallenge.date}
                          onChange={e => setNewChallenge({...newChallenge, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Preferred Time</Label>
                        <Input 
                          type="time" 
                          className="h-16 bg-white/5 border-white/5 rounded-2xl px-6 focus:border-primary/50 text-base"
                          value={newChallenge.time}
                          onChange={e => setNewChallenge({...newChallenge, time: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Target Arena (Turf)</Label>
                        <Input 
                          placeholder="e.g. Shine Arena" 
                          className="h-16 bg-white/5 border-white/5 rounded-2xl px-6 focus:border-primary/50"
                          value={newChallenge.turf}
                          onChange={e => setNewChallenge({...newChallenge, turf: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Home Zone</Label>
                        <Input 
                          placeholder="e.g. Rajiv Nagar" 
                          className="h-16 bg-white/5 border-white/5 rounded-2xl px-6 focus:border-primary/50"
                          value={newChallenge.area}
                          onChange={e => setNewChallenge({...newChallenge, area: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Strategy / Negotiating Terms</Label>
                      <Textarea 
                        placeholder="e.g. Competitive 5v5. Friendly but intense. Split turf cost." 
                        className="min-h-[160px] bg-white/5 border-white/5 rounded-[2rem] p-8 leading-relaxed italic text-lg"
                        value={newChallenge.notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewChallenge({...newChallenge, notes: e.target.value})}
                      />
                    </div>

                    <Button type="submit" disabled={isPosting} className="w-full h-20 bg-primary text-black font-black text-2xl rounded-[2rem] shadow-2xl hover:scale-[1.01] transition-all">
                      {isPosting ? <Loader2 className="h-8 w-8 animate-spin" /> : "PUBLISH CLAIM"}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">Synchronizing Match Feed...</p>
            </div>
          ) : challenges && challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-48 glass-card rounded-[5rem] border-dashed border-white/10 max-w-4xl mx-auto flex flex-col items-center gap-10">
              <ShieldAlert className="h-20 w-20 text-white/5" />
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white/10 uppercase italic tracking-widest">Circuit Inactive</h3>
                <p className="text-white/20 max-w-xs mx-auto text-sm font-medium uppercase tracking-widest italic leading-relaxed">No match claims found. Wake up the city and issue a challenge.</p>
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
  const whatsappUrl = `https://wa.me/91?text=${encodeURIComponent(`Hi, we found your challenge for ${challenge.sport} on ${challenge.date} via Turfista. My squad is ready to dominate!`)}`
  
  // Icon mapping for sports
  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'football': return <Zap className="h-5 w-5" />;
      case 'cricket': return <Target className="h-5 w-5" />;
      case 'badminton': return <Wind className="h-5 w-5" />;
      case 'pickleball': return <Star className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass-card rounded-[3rem] overflow-hidden border-white/5 bg-[#0a0a0a] flex flex-col h-full group"
    >
      <div className="p-10 md:p-14 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
           {getSportIcon(challenge.sport)}
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="px-5 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.4em]">
            ACTIVE CLAIM
          </div>
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(57,255,20,1)]" />
        </div>
        
        <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-10 text-white truncate drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{challenge.teamName}</h3>
        
        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-3 text-[11px] font-black uppercase text-white/40 tracking-widest border border-white/5 px-4 py-2 rounded-xl bg-white/[0.02]">
            <div className="text-primary">{getSportIcon(challenge.sport)}</div>
            {challenge.sport}
          </div>
          <div className="flex items-center gap-3 text-[11px] font-black uppercase text-white/40 tracking-widest border border-white/5 px-4 py-2 rounded-xl bg-white/[0.02]">
            <MapPin className="h-4 w-4 text-primary" />
            {challenge.area}
          </div>
        </div>
      </div>

      <div className="p-10 md:p-14 pt-2 flex-1 space-y-8">
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 transition-colors group-hover:border-white/10">
            <div className="flex items-center gap-3 mb-3 opacity-30">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Date</span>
            </div>
            <p className="text-sm font-black text-white italic">{challenge.date}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 transition-colors group-hover:border-white/10">
            <div className="flex items-center gap-3 mb-3 opacity-30">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Time</span>
            </div>
            <p className="text-sm font-black text-white italic">{challenge.time}</p>
          </div>
        </div>

        {challenge.notes && (
          <div className="p-8 bg-primary/[0.02] border border-primary/10 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
            <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4 italic">Negotiating Terms</p>
            <p className="text-xs md:text-sm text-white/60 font-medium leading-relaxed italic line-clamp-3">"{challenge.notes}"</p>
          </div>
        )}
      </div>

      <div className="p-10 md:p-14 pt-0">
        <Button asChild className="btn-neon-glow w-full h-20 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs rounded-[1.5rem] shadow-2xl transition-all border-none">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            ACCEPT CHALLENGE <ArrowRight className="ml-4 h-4 w-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  )
}
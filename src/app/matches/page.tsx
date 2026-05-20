
"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
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
  Plus, 
  Swords, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Loader2, 
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp, where, doc, updateDoc, increment, deleteDoc, arrayUnion } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function MatchesPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isPosting, setIsPosting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const [newRequest, setNewRequest] = useState({
    game: "Football",
    playersNeeded: 2,
    location: "",
    matchDate: "",
    matchTime: "",
    details: ""
  })

  const matchesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "matches"), where("status", "==", "active"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: requests, loading } = useCollection(matchesQuery)

  useEffect(() => {
    if (requests) {
      console.log("READ_SUCCESS", requests.length, "matches active")
    }
  }, [requests])

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !user) return
    
    console.log("SAVE_START")
    setIsPosting(true)
    try {
      await addDoc(collection(db, "matches"), {
        ...newRequest,
        createdBy: user.uid,
        creatorName: user.displayName || "Athlete",
        creatorPhoto: user.photoURL,
        slotsFilled: 1,
        joinedPlayers: [user.uid],
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log("SAVE_SUCCESS")
      toast({ title: "Match Claim Posted 🔥", description: "The circuit is permanently notified." })
      setShowDialog(false)
      setNewRequest({ game: "Football", playersNeeded: 2, location: "", matchDate: "", matchTime: "", details: "" })
    } catch (err: any) {
      console.log("SAVE_ERROR", err)
      toast({ title: "Transmission Failed", variant: "destructive" })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              <Swords className="h-3 w-3" /> OPEN MATCH CIRCUIT
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white">
              Need <span className="text-primary text-neon">Players?</span>
            </h1>
            <p className="text-muted text-xl font-medium italic max-w-xl">
              Broadcast your open slots. Recruit athletes instantly to fill your roster.
            </p>
          </div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="h-20 px-10 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                <Plus className="h-6 w-6 mr-3" /> POST MATCH CLAIM
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/5 rounded-[2.5rem] p-10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter mb-8">
                  Broadcast <span className="text-primary">Claim</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePost} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Game</Label>
                    <Input className="h-14 bg-white/5" value={newRequest.game} onChange={e => setNewRequest({...newRequest, game: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Need Players</Label>
                    <Input type="number" className="h-14 bg-white/5" value={newRequest.playersNeeded} onChange={e => setNewRequest({...newRequest, playersNeeded: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Arena Location</Label>
                  <Input placeholder="e.g. Matchbox Mysore" className="h-14 bg-white/5" value={newRequest.location} onChange={e => setNewRequest({...newRequest, location: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Match Date</Label>
                    <Input type="date" className="h-14 bg-white/5" value={newRequest.matchDate} onChange={e => setNewRequest({...newRequest, matchDate: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Match Time</Label>
                    <Input type="time" className="h-14 bg-white/5" value={newRequest.matchTime} onChange={e => setNewRequest({...newRequest, matchTime: e.target.value})} required />
                  </div>
                </div>
                <Button type="submit" disabled={isPosting} className="w-full h-16 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl">
                  {isPosting ? <Loader2 className="h-5 w-5 animate-spin" /> : "TRANSMIT TO CIRCUIT"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
             <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((request: any) => (
              <MatchCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.02]">
            <Zap className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-4xl font-black text-white/10 uppercase italic">No Active Claims</h3>
            <p className="text-white/20 mt-4 max-w-sm mx-auto italic text-lg leading-relaxed">The circuit is silent. Be the first to broadcast a permanent open slot and mobilize the community.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}

function MatchCard({ request }: { request: any }) {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const isJoined = user && request.joinedPlayers?.includes(user.uid)
  const isFull = (request.slotsFilled || 0) >= ((request.playersNeeded || 0) + 1)
  const canManage = user && (request.createdBy === user.uid || (user as any).role === "admin")

  const playersJoined = Math.max(0, request.slotsFilled || 0);
  const avatarCount = Math.min(playersJoined, 3);

  const handleJoin = async () => {
    if (!db || !user) {
      toast({ title: "Identification Required", description: "Verify identity to join." })
      return
    }
    if (isJoined || isFull) return

    try {
      const matchRef = doc(db, "matches", request.id)
      await updateDoc(matchRef, {
        slotsFilled: increment(1),
        joinedPlayers: arrayUnion(user.uid),
        updatedAt: serverTimestamp()
      })
      toast({ title: "Slot Secured ⚡", description: "You are now part of the lineup." })
    } catch (err) {
      toast({ title: "Sync Failed", variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    if (!db || !canManage) return
    if (!confirm("Retract this match signal?")) return
    try {
      await deleteDoc(doc(db, "matches", request.id))
      toast({ title: "Signal Redacted" })
    } catch (e) {
      toast({ title: "Redaction Failed", variant: "destructive" })
    }
  }

  return (
    <div className="bg-card border border-white/5 rounded-[2.5rem] p-10 flex flex-col hover:border-primary/40 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-[0.08] transition-opacity">
        <Swords className="h-40 w-40 text-primary" />
      </div>

      <div className="flex justify-between items-start mb-10 relative z-10">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2">URGENT REQUIREMENT</p>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">{request.game || request.sport}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
            <p className="text-xl font-black text-primary leading-none">{Math.max(0, (request.playersNeeded || 0) + 1 - (request.slotsFilled || 1))}</p>
            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Needed</p>
          </div>
          {canManage && (
            <button onClick={handleDelete} className="p-2 text-destructive/40 hover:text-destructive transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 mb-12 relative z-10">
        <div className="flex items-center gap-4 text-white/60 font-bold uppercase italic text-sm">
          <MapPin className="h-5 w-5 text-primary" />
          <span>{request.location}</span>
        </div>
        <div className="flex items-center gap-4 text-white/60 font-bold uppercase italic text-sm">
          <Calendar className="h-5 w-5 text-primary" />
          <span>{request.matchDate || request.date} • {request.matchTime || request.time}</span>
        </div>
        <div className="flex items-center gap-4 text-white/60 font-bold uppercase italic text-sm">
          <Users className="h-5 w-5 text-primary" />
          <span>{playersJoined} Joined Circuit</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 relative z-10">
        <div className="flex -space-x-3">
          {Array.from({ length: avatarCount }).map((_, i) => (
            <div key={i} className="h-10 w-10 rounded-full border-2 border-card bg-white/10 overflow-hidden">
              <img src={`https://picsum.photos/seed/${request.id}-${i}/100`} className="h-full w-full object-cover" alt="Player" />
            </div>
          ))}
          {playersJoined > 3 && (
            <div className="h-10 w-10 rounded-full border-2 border-card bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40">
              +{playersJoined - 3}
            </div>
          )}
        </div>

        {isJoined ? (
          <Button disabled className="h-14 px-8 bg-green-500/10 text-green-500 border border-green-500/20 font-black uppercase tracking-widest text-[10px] rounded-xl">
            <CheckCircle2 className="h-4 w-4 mr-2" /> CLAIMED
          </Button>
        ) : (
          <Button 
            onClick={handleJoin}
            disabled={isFull}
            className={cn(
              "h-14 px-8 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all",
              isFull ? "bg-white/5 text-white/20" : "bg-primary text-black hover:scale-105"
            )}
          >
            {isFull ? "FILLED" : "ACCEPT CLAIM"}
          </Button>
        )}
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
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
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  Swords, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Loader2, 
  Zap,
  Heart,
  Share2,
  MessageCircle,
  MoreVertical,
  Activity,
  UserCircle,
  Trophy,
  Target,
  Trash2
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, increment, arrayUnion, deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const SPORTS = [
  { label: "Football ⚽", value: "Football" },
  { label: "Cricket 🏏", value: "Cricket" },
  { label: "Badminton 🏸", value: "Badminton" },
  { label: "Pickleball 🎾", value: "Pickleball" },
  { label: "Basketball 🏀", value: "Basketball" },
  { label: "Volleyball 🏐", value: "Volleyball" },
  { label: "Table Tennis 🏓", value: "Table Tennis" },
  { label: "Swimming 🏊", value: "Swimming" },
  { label: "Running 🏃", value: "Running" },
  { label: "Other", value: "Other" },
]

const TACTICAL_CHIPS = [
  { label: "Competitive", icon: "🔥" },
  { label: "Friendly", icon: "😎" },
  { label: "Tournament", icon: "🏆" },
  { label: "Beginner", icon: "👶" },
  { label: "Intermediate", icon: "💪" },
  { label: "Advanced", icon: "⚡" },
]

export default function FeedPage() {
  const db = useFirestore()
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const [isPosting, setIsPosting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const initialFormState = {
    game: "Football",
    playersNeeded: 1,
    location: "",
    matchDate: "",
    matchTime: "",
    details: "",
    genderPreference: "Anyone",
    skillLevel: "Intermediate"
  }

  const [newPost, setNewPost] = useState(initialFormState)

  const feedQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "matches"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: posts, loading } = useCollection(feedQuery)

  useEffect(() => {
    if (posts) {
      console.log("READ_SUCCESS", posts.length, "signals active")
    }
  }, [posts])

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !user) {
      toast({ title: "Identification Required", description: "Join the circuit to broadcast signals." })
      return
    }
    
    console.log("SAVE_START")
    setIsPosting(true)

    const watchdogId = setTimeout(() => {
      if (isPosting) {
        setIsPosting(false)
        toast({ 
          title: "Transmission Delayed", 
          description: "Network is slow. Signal may be pending.",
          variant: "destructive"
        })
      }
    }, 10000)

    try {
      const matchData = {
        ...newPost,
        createdBy: user.uid,
        creatorName: user.displayName || "Athlete Node",
        creatorPhoto: user.photoURL,
        joinedPlayers: [user.uid],
        slotsFilled: 1,
        status: "active",
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, "matches"), matchData)
      console.log("SAVE_SUCCESS")

      clearTimeout(watchdogId)
      
      toast({ 
        title: "Match request posted 🚀", 
        description: "Your signal is permanently live on the circuit." 
      })

      setNewPost(initialFormState)
      setShowDialog(false)
      
      router.push('/')
      router.refresh()
      
    } catch (err: any) {
      console.log("SAVE_ERROR", err)
      clearTimeout(watchdogId)
      toast({ 
        title: "Transmission Failed", 
        description: err.message || "Circuit interrupted.",
        variant: "destructive" 
      })
    } finally {
      setIsPosting(false)
    }
  }

  const addChipToDescription = (chip: string) => {
    setNewPost(prev => ({
      ...prev,
      details: prev.details ? `${prev.details} #${chip}` : `#${chip}`
    }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 max-w-2xl mx-auto w-full px-4">
        <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8 flex items-center gap-4 shadow-xl">
          <div className="h-10 w-10 rounded-full bg-white/5 overflow-hidden flex items-center justify-center border border-white/10">
            {user?.photoURL ? (
              <img src={user.photoURL} className="h-full w-full object-cover" alt="Me" />
            ) : (
              <UserCircle className="h-6 w-6 text-white/20" />
            )}
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <button className="flex-1 h-12 bg-white/5 border border-white/5 rounded-full px-6 text-left text-white/40 text-sm font-medium hover:bg-white/10 hover:border-primary/20 transition-all">
                Broadcast a match signal to the circuit...
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/5 rounded-[2rem] p-8 max-w-lg shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase italic text-white tracking-tighter">
                  New <span className="text-primary">Match Signal</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePost} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Game</Label>
                    <Select value={newPost.game} onValueChange={v => setNewPost({...newPost, game: v})}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select Game" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-white/10">
                        {SPORTS.map(s => (
                          <SelectItem key={s.value} value={s.value} className="text-white hover:bg-white/10">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Players Needed</Label>
                    <Input type="number" className="h-12 bg-white/5 border-white/10" value={newPost.playersNeeded} onChange={e => setNewPost({...newPost, playersNeeded: Number(e.target.value)})} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Location / Turf</Label>
                  <Input placeholder="e.g. Bogadi / Matchbox Mysore" className="h-12 bg-white/5 border-white/10" value={newPost.location} onChange={e => setNewPost({...newPost, location: e.target.value})} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Match Date</Label>
                    <Input type="date" className="h-12 bg-white/5 border-white/10" value={newPost.matchDate} onChange={e => setNewPost({...newPost, matchDate: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Match Time</Label>
                    <Input type="time" className="h-12 bg-white/5 border-white/10" value={newPost.matchTime} onChange={e => setNewPost({...newPost, matchTime: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Gender Preference</Label>
                    <Select value={newPost.genderPreference} onValueChange={v => setNewPost({...newPost, genderPreference: v})}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-white/10">
                        {["Anyone", "Men", "Women", "Mixed"].map(g => <SelectItem key={g} value={g} className="text-white hover:bg-white/10">{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Skill Level</Label>
                    <Select value={newPost.skillLevel} onValueChange={v => setNewPost({...newPost, skillLevel: v})}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-white/10">
                        {["Beginner", "Intermediate", "Advanced", "Professional"].map(s => <SelectItem key={s} value={s} className="text-white hover:bg-white/10">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Match Details</Label>
                  <div className="flex flex-wrap gap-2">
                    {TACTICAL_CHIPS.map(chip => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => addChipToDescription(chip.label)}
                        className="px-3 py-1 bg-white/5 hover:bg-primary/20 border border-white/10 rounded-full text-[10px] font-bold text-white/40 hover:text-primary transition-all active:scale-95"
                      >
                        {chip.icon} {chip.label}
                      </button>
                    ))}
                  </div>
                  <Textarea 
                    placeholder={`Examples:\nNeed 1 badminton player this Sunday 7 PM.\nIntermediate level.\nFriendly match.\nBogadi area.`} 
                    className="bg-white/5 border-white/10 italic min-h-[100px]" 
                    value={newPost.details} 
                    onChange={e => setNewPost({...newPost, details: e.target.value})} 
                  />
                </div>

                <Button type="submit" disabled={isPosting} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all">
                  {isPosting ? <Loader2 className="h-5 w-5 animate-spin" /> : "POST MATCH REQUEST 🚀"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Syncing Circuit Signals...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="py-32 text-center bg-card border border-dashed border-white/5 rounded-3xl">
            <Activity className="h-12 w-12 text-white/5 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic text-white/10">Circuit Silent</h3>
            <p className="text-white/20 text-sm mt-2 italic">Be the first to broadcast a permanent match signal in Mysuru.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const isJoined = user && post.joinedPlayers?.includes(user.uid)
  const isFull = (post.slotsFilled || 0) >= ((post.playersNeeded || 0) + 1)
  const [likes, setLikes] = useState(post.likes || 0)

  const canManage = user && (post.createdBy === user.uid || (user as any).role === "admin")

  const createdAt = post.createdAt?.seconds 
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000)) + " ago" 
    : "Recently"

  const handleJoin = async () => {
    if (!db || !user) {
      toast({ title: "Identification Required", description: "Sign in to join matches." })
      return
    }
    if (isJoined || isFull) return

    try {
      await updateDoc(doc(db, "matches", post.id), {
        joinedPlayers: arrayUnion(user.uid),
        slotsFilled: increment(1),
        updatedAt: serverTimestamp()
      })
      toast({ title: "Slot Secured ⚡", description: "You are now part of the roster." })
    } catch (err) {
      toast({ title: "Sync Failed", variant: "destructive" })
    }
  }

  const handleLike = async () => {
    if (!db) return
    setLikes(prev => prev + 1)
    try {
      await updateDoc(doc(db, "matches", post.id), {
        likes: increment(1)
      })
    } catch (e) {}
  }

  const handleShare = async () => {
    const shareData = {
      title: `Turfista Match | ${post.game}`,
      text: `Join ${post.creatorName} for a match of ${post.game} at ${post.location}!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Only log non-abort errors
        if ((err as Error).name !== 'AbortError') {
          console.log('Share failed:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({ 
          title: "Link Copied 🔗", 
          description: "Match signal link copied to clipboard." 
        });
      } catch (err) {
        toast({ 
          title: "Sharing Unavailable", 
          description: "Your browser doesn't support sharing nodes." 
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!db || !canManage) return
    if (!confirm("Are you sure you want to retract this match signal?")) return
    try {
      await deleteDoc(doc(db, "matches", post.id))
      toast({ title: "Signal Retracted" })
    } catch (e) {
      toast({ title: "Redaction Failed", variant: "destructive" })
    }
  }

  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-primary/20 group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden bg-white/5">
              <img src={post.creatorPhoto || `https://picsum.photos/seed/${post.createdBy}/100`} className="h-full w-full object-cover rounded-full" alt="Creator" />
            </div>
            <div>
              <p className="text-sm font-black uppercase italic text-white leading-none">{post.creatorName}</p>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1.5">{createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <button onClick={handleDelete} className="text-destructive/40 hover:text-destructive transition-colors p-2">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button className="text-white/10 hover:text-white transition-colors"><MoreVertical className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">{post.game || post.sport}</span>
            <span className="bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">{post.location?.split('/')[0] || "Mysuru"}</span>
            {post.skillLevel && <span className="bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">{post.skillLevel}</span>}
          </div>
          <p className="text-white/80 text-[15px] leading-relaxed italic font-medium">"{post.details || post.description || "Assembling a squad for a friendly match. Hit the join signal to secure your slot."}"</p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/5 mb-6">
          <div className="flex items-center gap-2.5 text-white/50">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase italic">{post.matchDate || post.date}</span>
          </div>
          <div className="flex items-center gap-2.5 text-white/50">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase italic">{post.matchTime || post.time}</span>
          </div>
          <div className="flex items-center gap-2.5 text-white/50 col-span-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-[10px] font-black uppercase italic truncate">{post.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className="flex items-center gap-2 text-white/30 hover:text-red-500 transition-colors group/btn">
              <Heart className={cn("h-5 w-5", likes > 0 && "fill-red-500 text-red-500")} />
              <span className="text-xs font-black">{likes}</span>
            </button>
            <button className="flex items-center gap-2 text-white/30 hover:text-primary transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-black">{post.comments || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-white/30 hover:text-white transition-colors" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {isJoined ? (
            <Button disabled className="h-10 bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-black uppercase tracking-widest px-6 rounded-lg">JOINED</Button>
          ) : (
            <Button 
              onClick={handleJoin}
              disabled={isFull}
              className={cn(
                "h-10 text-[9px] font-black uppercase tracking-widest px-6 rounded-lg transition-all",
                isFull ? "bg-white/5 text-white/10" : "bg-primary text-black hover:scale-105 shadow-lg shadow-primary/10"
              )}
            >
              {isFull ? "SIGNAL FILLED" : `JOIN (${((post.playersNeeded || 0) + 1) - (post.slotsFilled || 1)} SLOTS)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

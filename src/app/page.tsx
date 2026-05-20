"use client"

import { useState } from "react"
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
  UserCircle
} from "lucide-react"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, increment, arrayUnion } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export default function FeedPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isPosting, setIsPosting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const [newPost, setNewPost] = useState({
    sport: "Football",
    slotsNeeded: 1,
    location: "",
    date: "",
    time: "",
    description: ""
  })

  const feedQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "matchRequests"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: posts, loading } = useCollection(feedQuery)

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !user) {
      toast({ title: "Identification Required", description: "Join the circuit to broadcast signals." })
      return
    }
    
    setIsPosting(true)
    try {
      await addDoc(collection(db, "matchRequests"), {
        ...newPost,
        creatorId: user.uid,
        creatorName: user.displayName || "Athlete Node",
        creatorPhoto: user.photoURL,
        slotsFilled: 1,
        joinedUsers: [user.uid],
        status: "open",
        likes: 0,
        createdAt: serverTimestamp()
      })
      toast({ title: "Signal Transmitted ⚡", description: "Your match request is live on the Mysuru circuit." })
      setShowDialog(false)
      setNewPost({ sport: "Football", slotsNeeded: 1, location: "", date: "", time: "", description: "" })
    } catch (err) {
      toast({ title: "Transmission Failed", variant: "destructive" })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 max-w-2xl mx-auto w-full px-4">
        {/* Post Creation Hub */}
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
            <DialogContent className="bg-card border-white/5 rounded-[2rem] p-8 max-w-lg shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase italic text-white tracking-tighter">
                  New <span className="text-primary">Match Signal</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePost} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Discipline</Label>
                    <Input className="h-12 bg-white/5 border-white/10" value={newPost.sport} onChange={e => setNewPost({...newPost, sport: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Athletes Needed</Label>
                    <Input type="number" className="h-12 bg-white/5 border-white/10" value={newPost.slotsNeeded} onChange={e => setNewPost({...newPost, slotsNeeded: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Arena Location</Label>
                  <Input placeholder="e.g. Bogadi / Matchbox Mysore" className="h-12 bg-white/5 border-white/10" value={newPost.location} onChange={e => setNewPost({...newPost, location: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Tactical Date</Label>
                    <Input type="date" className="h-12 bg-white/5 border-white/10" value={newPost.date} onChange={e => setNewPost({...newPost, date: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Kickoff Time</Label>
                    <Input type="time" className="h-12 bg-white/5 border-white/10" value={newPost.time} onChange={e => setNewPost({...newPost, time: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Briefing</Label>
                  <Textarea placeholder="Describe skill level or match type..." className="bg-white/5 border-white/10 italic min-h-[100px]" value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} />
                </div>
                <Button type="submit" disabled={isPosting} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20">
                  {isPosting ? <Loader2 className="h-5 w-5 animate-spin" /> : "TRANSMIT TO CIRCUIT"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dynamic Feed */}
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
            <p className="text-white/20 text-sm mt-2 italic">Be the first to broadcast a match signal in Mysuru.</p>
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
  
  const isJoined = user && post.joinedUsers?.includes(user.uid)
  const isFull = post.slotsFilled >= (post.slotsNeeded + 1)
  const [likes, setLikes] = useState(post.likes || 0)

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
      await updateDoc(doc(db, "matchRequests", post.id), {
        joinedUsers: arrayUnion(user.uid),
        slotsFilled: increment(1)
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
      await updateDoc(doc(db, "matchRequests", post.id), {
        likes: increment(1)
      })
    } catch (e) {}
  }

  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-primary/20 group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden bg-white/5">
              <img src={post.creatorPhoto || `https://picsum.photos/seed/${post.creatorId}/100`} className="h-full w-full object-cover rounded-full" alt="Creator" />
            </div>
            <div>
              <p className="text-sm font-black uppercase italic text-white leading-none">{post.creatorName}</p>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1.5">{createdAt}</p>
            </div>
          </div>
          <button className="text-white/10 hover:text-white transition-colors"><MoreVertical className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">{post.sport}</span>
            <span className="bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">{post.location?.split('/')[0] || "Mysuru"}</span>
          </div>
          <p className="text-white/80 text-[15px] leading-relaxed italic font-medium">"{post.description || "Assembling a squad for a friendly match. Hit the join signal to secure your slot."}"</p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/5 mb-6">
          <div className="flex items-center gap-2.5 text-white/50">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase italic">{post.date}</span>
          </div>
          <div className="flex items-center gap-2.5 text-white/50">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase italic">{post.time}</span>
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
              <span className="text-xs font-black">2</span>
            </button>
            <button className="flex items-center gap-2 text-white/30 hover:text-white transition-colors" onClick={() => navigator.share({ title: post.sport, url: window.location.href })}>
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
              {isFull ? "SIGNAL FILLED" : `JOIN (${(post.slotsNeeded + 1) - post.slotsFilled} SLOTS)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

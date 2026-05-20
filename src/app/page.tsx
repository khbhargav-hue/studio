
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
  Activity
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
    area: "",
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
    if (!db || !user) return
    setIsPosting(true)
    try {
      await addDoc(collection(db, "matchRequests"), {
        ...newPost,
        creatorId: user.uid,
        creatorName: user.displayName || "Athlete",
        creatorPhoto: user.photoURL,
        slotsFilled: 1,
        joinedUsers: [user.uid],
        status: "open",
        likes: 0,
        createdAt: serverTimestamp()
      })
      toast({ title: "Match Broadcasted 🔥", description: "The circuit is notified." })
      setShowDialog(false)
      setNewPost({ sport: "Football", slotsNeeded: 1, area: "", location: "", date: "", time: "", description: "" })
    } catch (err) {
      toast({ title: "Signal Lost", variant: "destructive" })
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 max-w-2xl mx-auto w-full px-4">
        {/* Post Creation Trigger */}
        <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-white/5 overflow-hidden">
            {user?.photoURL ? <img src={user.photoURL} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-white/20"><Users className="h-5 w-5" /></div>}
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <button className="flex-1 h-12 bg-white/5 border border-white/5 rounded-full px-6 text-left text-white/40 text-sm font-medium hover:bg-white/10 transition-colors">
                Broadcast a match request...
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/5 rounded-[2rem] p-8 max-w-lg">
              <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic italic text-white tracking-tighter">New <span className="text-primary">Match Signal</span></DialogTitle></DialogHeader>
              <form onSubmit={handlePost} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Sport Discipline</Label>
                    <Input className="h-12 bg-white/5 border-white/10" value={newPost.sport} onChange={e => setNewPost({...newPost, sport: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Slots Needed</Label>
                    <Input type="number" className="h-12 bg-white/5 border-white/10" value={newPost.slotsNeeded} onChange={e => setNewPost({...newPost, slotsNeeded: Number(e.target.value)})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Area / Turf Name</Label>
                  <Input placeholder="e.g. Bogadi / Matchbox Mysore" className="h-12 bg-white/5 border-white/10" value={newPost.location} onChange={e => setNewPost({...newPost, location: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Match Date</Label>
                    <Input type="date" className="h-12 bg-white/5 border-white/10" value={newPost.date} onChange={e => setNewPost({...newPost, date: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Start Time</Label>
                    <Input type="time" className="h-12 bg-white/5 border-white/10" value={newPost.time} onChange={e => setNewPost({...newPost, time: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Tactical Brief</Label>
                  <Textarea placeholder="Describe the skill level or match type..." className="bg-white/5 border-white/10 italic" value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} />
                </div>
                <Button type="submit" disabled={isPosting} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl">
                  {isPosting ? <Loader2 className="h-5 w-5 animate-spin" /> : "TRANSMIT SIGNAL"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Feed List */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="py-32 text-center bg-card border border-dashed border-white/5 rounded-3xl">
            <Activity className="h-12 w-12 text-white/5 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic text-white/10">Feed Silent</h3>
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
  const createdAt = post.createdAt?.seconds ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000)) + " ago" : "Just now"

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
      toast({ title: "Slot Secured ⚡", description: "You are now part of the match." })
    } catch (err) {
      toast({ title: "Sync Failed", variant: "destructive" })
    }
  }

  const handleLike = async () => {
    if (!db) return
    try {
      await updateDoc(doc(db, "matchRequests", post.id), {
        likes: increment(1)
      })
    } catch (e) {}
  }

  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-primary/20 p-0.5 overflow-hidden bg-white/5">
              <img src={post.creatorPhoto || `https://picsum.photos/seed/${post.creatorId}/100`} className="h-full w-full object-cover rounded-full" />
            </div>
            <div>
              <p className="text-sm font-black uppercase italic text-white leading-none">{post.creatorName}</p>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1.5">{createdAt}</p>
            </div>
          </div>
          <button className="text-white/20 hover:text-white"><MoreVertical className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">{post.sport}</span>
            <span className="bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">{post.area || "Mysuru"}</span>
          </div>
          <p className="text-white/80 text-[15px] leading-relaxed italic font-medium">"{post.description || "Looking for players to join a friendly match. Hit the join button to secure your slot."}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
          <div className="flex items-center gap-3 text-white/60">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold uppercase italic">{post.date}</span>
          </div>
          <div className="flex items-center gap-3 text-white/60">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold uppercase italic">{post.time}</span>
          </div>
          <div className="flex items-center gap-3 text-white/60 col-span-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold uppercase italic truncate">{post.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className="flex items-center gap-2 text-white/40 hover:text-red-500 transition-colors">
              <Heart className="h-5 w-5" />
              <span className="text-xs font-black">{post.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-black">2</span>
            </button>
            <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {isJoined ? (
            <Button disabled className="h-10 bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-widest px-6 rounded-lg">JOINED</Button>
          ) : (
            <Button 
              onClick={handleJoin}
              disabled={isFull}
              className={cn(
                "h-10 text-[10px] font-black uppercase tracking-widest px-6 rounded-lg transition-all",
                isFull ? "bg-white/5 text-white/20" : "bg-primary text-black hover:scale-105"
              )}
            >
              {isFull ? "FILLED" : `JOIN (${(post.slotsNeeded + 1) - post.slotsFilled} LEFT)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
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
  MapPin, 
  Users, 
  Loader2, 
  Zap,
  Heart,
  Share2,
  UserCircle,
  Trash2,
  MessageCircle,
  MoreHorizontal
} from "lucide-react"
import { useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, addDoc, doc, serverTimestamp, updateDoc, increment, deleteDoc, onSnapshot, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const SPORTS = [
  { label: "Football ⚽", value: "Football" },
  { label: "Cricket 🏏", value: "Cricket" },
  { label: "Pickleball 🎾", value: "Pickleball" },
  { label: "Badminton 🏸", value: "Badminton" },
  { label: "Other", value: "Other" },
]

export default function SocialWallPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const [formData, setFormData] = useState({
    game: "Football",
    location: "",
    description: "",
    playersNeeded: 1
  })

  // Real-time Social Circuit Listener
  useEffect(() => {
    if (!db) return
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [db]);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Identification Required", description: "Sign in to join the circuit.", variant: "destructive" })
      return
    }
    
    setIsPosting(true)
    
    const payload = {
      game: formData.game,
      location: formData.location,
      description: formData.description,
      playersNeeded: Number(formData.playersNeeded),
      likes: 0,
      postedBy: {
        uid: user.uid,
        name: user.displayName || "Athlete Node",
        photoURL: user.photoURL || "",
      },
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "posts"), payload)
      .then(() => {
        setIsPosting(false)
        setShowDialog(false)
        setFormData({ game: "Football", location: "", description: "", playersNeeded: 1 })
        toast({ title: "Signal Broadcasted 🚀" })
      })
      .catch((err) => {
        setIsPosting(false)
        toast({ title: "Broadcast Failed", description: err.message, variant: "destructive" })
      })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32 max-w-2xl mx-auto w-full px-4">
        {/* Post Creation Area */}
        <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white/5 overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} className="h-full w-full object-cover" alt="Me" />
              ) : (
                <UserCircle className="h-6 w-6 text-white/20" />
              )}
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <button className="flex-1 h-12 bg-white/5 border border-white/5 rounded-full px-6 text-left text-white/40 text-sm font-medium hover:bg-white/10 hover:border-primary/20 transition-all">
                  What's happening on the Mysuru circuit?
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/5 rounded-[2rem] p-8 max-w-lg shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase italic text-white tracking-tighter">
                    NEW <span className="text-primary">SIGNAL</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Discipline</Label>
                      <Select value={formData.game} onValueChange={v => setFormData({...formData, game: v})}>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0A] border-white/10">
                          {SPORTS.map(s => <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Needed</Label>
                      <Input type="number" className="h-12 bg-white/5 border-white/10 text-white" value={formData.playersNeeded} onChange={e => setFormData({...formData, playersNeeded: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Location / Turf</Label>
                    <Input placeholder="e.g. Bogadi / Matchbox" className="h-12 bg-white/5 border-white/10 text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</Label>
                    <Textarea placeholder="Share your match details..." className="bg-white/5 border-white/10 italic min-h-[100px] text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <Button onClick={handleSubmit} disabled={isPosting} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20">
                    {isPosting ? <Loader2 className="h-5 w-5 animate-spin" /> : "BROADCAST TO WALL"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Real-time Wall Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Syncing Wall...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <WallCard key={post.id} post={post} currentUser={user} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-card border border-dashed border-white/5 rounded-3xl">
            <Zap className="h-12 w-12 text-white/5 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic text-white/10">Wall Silent</h3>
            <p className="text-white/20 text-sm mt-2 italic">Be the first to broadcast a signal to the Mysuru network.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}

function WallCard({ post, currentUser }: { post: any, currentUser: any }) {
  const db = useFirestore()
  const { toast } = useToast()
  
  const timeAgo = post.createdAt?.seconds 
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000)) + " ago" 
    : "Recently"

  const isOwner = currentUser?.uid === post.postedBy?.uid

  const handleLike = () => {
    if (!db) return
    const postRef = doc(db, "posts", post.id)
    updateDoc(postRef, { likes: increment(1) })
  }

  const handleDelete = () => {
    if (!db || !isOwner) return
    if (!confirm("Retract this signal from the wall?")) return
    deleteDoc(doc(db, "posts", post.id))
      .then(() => toast({ title: "Signal Redacted" }))
      .catch(err => toast({ title: "Redaction Failed", description: err.message, variant: "destructive" }))
  }

  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-primary/20">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden bg-white/5">
              <img src={post.postedBy?.photoURL || `https://picsum.photos/seed/${post.postedBy?.uid}/100`} className="h-full w-full object-cover rounded-full" alt="User" />
            </div>
            <div>
              <p className="text-sm font-black uppercase italic text-white leading-none">{post.postedBy?.name}</p>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1.5">{timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <button onClick={handleDelete} className="p-2 text-destructive/20 hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button className="p-2 text-white/10 hover:text-white transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
              {post.game}
            </span>
            <span className="bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" /> {post.location || "Mysuru"}
            </span>
            {post.playersNeeded > 0 && (
              <span className="bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 flex items-center gap-1">
                <Users className="h-2.5 w-2.5" /> {post.playersNeeded} NEEDED
              </span>
            )}
          </div>
          <p className="text-white/80 text-[15px] leading-relaxed italic font-medium">"{post.description}"</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className="flex items-center gap-2 text-white/30 hover:text-red-500 transition-colors group">
              <Heart className={cn("h-5 w-5", post.likes > 0 && "fill-red-500 text-red-500")} />
              <span className="text-xs font-black">{post.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-white/30 hover:text-primary transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-black">Comment</span>
            </button>
          </div>
          <button className="text-white/30 hover:text-white transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

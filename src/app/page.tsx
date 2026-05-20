
"use client"

import { useState, useEffect, useMemo } from "react"
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
  MoreHorizontal,
  ExternalLink
} from "lucide-react"
import { useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, addDoc, doc, serverTimestamp, updateDoc, increment, deleteDoc, onSnapshot, limit, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const SPORTS_FILTERS = [
  { label: "All", value: "All", icon: "✨" },
  { label: "Football", value: "Football", icon: "⚽" },
  { label: "Cricket", value: "Cricket", icon: "🏏" },
  { label: "Pickleball", value: "Pickleball", icon: "🎾" },
  { label: "Swimming", value: "Swimming", icon: "🏊" },
];

const POST_SPORTS = [
  { label: "Football ⚽", value: "Football" },
  { label: "Cricket 🏏", value: "Cricket" },
  { label: "Pickleball 🎾", value: "Pickleball" },
  { label: "Badminton 🏸", value: "Badminton" },
]

export default function SocialWallPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [posts, setPosts] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [activeFilter, setActiveFilter] = useState("All")

  // Form States
  const [text, setText] = useState("")
  const [sport, setSport] = useState("Football")
  const [location, setLocation] = useState("")
  const [playersNeeded, setPlayersNeeded] = useState(1)

  // Real-time Social Circuit Listener
  useEffect(() => {
    if (!db) return
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // Fetch Sponsorship Intelligence
    getDocs(collection(db, "ads")).then(snap => {
      setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((a: any) => a.isActive));
    });

    return () => unsub();
  }, [db]);

  const handleSubmit = () => {
    if (!user || !db) {
      alert("Please sign in first");
      return
    }
    
    addDoc(collection(db, "posts"), {
      text: text,
      sport: sport,
      location: location,
      playersNeeded: Number(playersNeeded),
      likes: 0,
      postedBy: {
        uid: user.uid,
        name: user.displayName || "Player",
        photo: user.photoURL || ""
      },
      createdAt: serverTimestamp()
    }).then(() => {
      setText("");
      setLocation("");
      setPlayersNeeded(1);
      setShowDialog(false);
      toast({ title: "Signal Broadcasted 🚀" });
    }).catch(err => alert(err.message));
  }

  // Interleave Filtered Posts with Ads Logic
  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") return posts;
    return posts.filter(p => p.sport === activeFilter);
  }, [posts, activeFilter]);

  const feedItems = useMemo(() => {
    const items: any[] = [];
    filteredPosts.forEach((post, index) => {
      items.push({ type: 'post', data: post });
      // Inject ad after every 5 items
      if ((index + 1) % 5 === 0 && ads.length > 0) {
        const adIndex = Math.floor(index / 5) % ads.length;
        items.push({ type: 'ad', data: ads[adIndex] });
      }
    });
    return items;
  }, [filteredPosts, ads]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <main className="flex-1 pt-6 pb-32 max-w-lg mx-auto w-full px-4">
        
        {/* Story-style Sport Filters */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-8 pb-1">
          {SPORTS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "flex-none h-9 px-4 rounded-full text-[13px] font-semibold border transition-all duration-200 active:scale-95 flex items-center gap-2",
                activeFilter === f.value 
                  ? "bg-primary text-black border-primary" 
                  : "bg-[#1A1A1A] text-white/60 border-[#333] hover:border-primary/40"
              )}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Post Creation Area */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#1A1A1A] overflow-hidden flex items-center justify-center border border-[#222] shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} className="h-full w-full object-cover" alt="Me" />
              ) : (
                <UserCircle className="h-5 w-5 text-white/20" />
              )}
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <button className="flex-1 h-10 bg-[#1A1A1A] border border-[#222] rounded-full px-5 text-left text-white/40 text-[13px] font-medium hover:border-primary/20 transition-all">
                  Looking for players in Mysuru...
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A0A0A] border-[#222] rounded-[24px] p-8 max-w-lg shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic text-white tracking-tighter">
                    NEW <span className="text-primary">SIGNAL</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Discipline</Label>
                      <Select value={sport} onValueChange={setSport}>
                        <SelectTrigger className="h-12 bg-[#1A1A1A] border-[#222] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-[#222]">
                          {POST_SPORTS.map(s => <SelectItem key={s.value} value={s.value} className="text-white font-bold">{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Needed</Label>
                      <Input type="number" className="h-12 bg-[#1A1A1A] border-[#222] text-white" value={playersNeeded} onChange={e => setPlayersNeeded(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Area in Mysuru</Label>
                    <Input placeholder="e.g. Bogadi / Vijayanagar" className="h-12 bg-[#1A1A1A] border-[#222] text-white" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Message</Label>
                    <Textarea placeholder="Share your match details..." className="bg-[#1A1A1A] border-[#222] italic min-h-[100px] text-white text-[15px]" value={text} onChange={e => setText(e.target.value)} />
                  </div>
                  <Button onClick={handleSubmit} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20">
                    ⚡ Post to Circuit
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
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Syncing Circuit...</p>
          </div>
        ) : feedItems.length > 0 ? (
          <div className="space-y-3">
            {feedItems.map((item, idx) => (
              item.type === 'post' ? (
                <WallCard key={item.data.id} post={item.data} currentUser={user} />
              ) : (
                <AdBanner key={`ad-${idx}`} ad={item.data} />
              )
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border border-dashed border-[#222] rounded-2xl bg-[#111]/30">
            <Zap className="h-12 w-12 text-white/5 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic text-white/10">No signals detected</h3>
            <p className="text-white/20 text-xs mt-2 italic">Try adjusting your sport filter or broadcast a new plan.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}

function AdBanner({ ad }: { ad: any }) {
  const db = useFirestore();
  
  const handleAdClick = () => {
    if (!db) return;
    updateDoc(doc(db, "ads", ad.id), { clickCount: increment(1) });
    window.open(ad.targetUrl, '_blank');
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden mb-3 relative">
      <div className="absolute top-3 right-4 z-10">
        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Sponsored</span>
      </div>
      <div className="relative w-full h-[120px]" onClick={handleAdClick} style={{ cursor: 'pointer' }}>
        <img src={ad.imageUrl || "https://picsum.photos/seed/ad/800/200"} className="w-full h-full object-cover opacity-60" alt={ad.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
      </div>
      <div className="p-4 pt-0">
        <h3 className="text-base font-black uppercase italic text-white mb-1">{ad.title}</h3>
        <p className="text-[13px] text-white/50 italic mb-4 line-clamp-1">{ad.description || "Local sports equipment and coaching."}</p>
        <Button onClick={handleAdClick} className="w-full h-10 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-lg">
          Learn More <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function WallCard({ post, currentUser }: { post: any, currentUser: any }) {
  const db = useFirestore()
  const { toast } = useToast()
  const [hasLiked, setHasLiked] = useState(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const likedPosts = JSON.parse(localStorage.getItem('turfista_liked_posts') || '[]');
      if (likedPosts.includes(post.id)) {
        setHasLiked(true);
      }
    }
  }, [post.id]);

  const timeAgo = post.createdAt?.seconds 
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000)) + " ago" 
    : "Recently"

  const isOwner = currentUser?.uid === post.postedBy?.uid

  const handleLike = () => {
    if (!db || hasLiked) return
    const postRef = doc(db, "posts", post.id)
    updateDoc(postRef, { likes: increment(1) })
      .then(() => {
        const likedPosts = JSON.parse(localStorage.getItem('turfista_liked_posts') || '[]');
        likedPosts.push(post.id);
        localStorage.setItem('turfista_liked_posts', JSON.stringify(likedPosts));
        setHasLiked(true);
      });
  }

  const handleDelete = () => {
    if (!db || !isOwner) return
    deleteDoc(doc(db, "posts", post.id)).catch(err => alert(err.message));
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this match on Turfista! ${post.sport} in ${post.location}: "${post.text}"`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 mb-3 transition-all hover:border-primary/20">
      {/* Row 1: Avatar + Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#1A1A1A] border border-[#222] p-0.5 overflow-hidden">
            <img src={post.postedBy?.photo || `https://picsum.photos/seed/${post.postedBy?.uid}/100`} className="h-full w-full object-cover rounded-full" alt="User" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold text-white uppercase tracking-tight">{post.postedBy?.name}</p>
              <span className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/20">
                {post.sport}
              </span>
            </div>
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mt-0.5">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isOwner && (
            <button onClick={handleDelete} className="p-2 text-destructive/40 hover:text-destructive transition-colors" title="Retract Signal">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button className="p-2 text-white/20 hover:text-white transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Row 2: Message */}
      <div className="mb-4">
        <p className="text-[#F5F5F5] text-[15px] leading-normal font-medium italic">"{post.text}"</p>
      </div>

      {/* Row 3 & 4: Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-white/40 uppercase italic">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{post.location || "Mysuru"}</span>
        </div>
        {post.playersNeeded > 0 && (
          <div className="flex items-center gap-1.5 text-[12px] font-black text-primary uppercase tracking-tight italic">
            <Users className="h-3.5 w-3.5" />
            <span>{post.playersNeeded} NEEDED</span>
          </div>
        )}
      </div>

      {/* Row 5: Actions */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike} 
            disabled={hasLiked}
            className={cn(
              "flex items-center gap-2 transition-colors group",
              hasLiked ? "text-red-500" : "text-white/40 hover:text-red-500"
            )}
          >
            <Heart className={cn("h-5 w-5", hasLiked && "fill-current")} />
            <span className="text-[13px] font-black">{post.likes || 0}</span>
          </button>
          <button className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors">
            <MessageCircle className="h-5 w-5" />
            <span className="text-[13px] font-black">2</span>
          </button>
        </div>
        <button onClick={handleWhatsAppShare} className="text-white/40 hover:text-[#25D366] transition-colors" title="Share on WhatsApp">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

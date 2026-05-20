"use client"

import { useState, useEffect, useMemo } from "react"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import PostCard from "@/components/PostCard"
import { PostModal } from "@/components/PostModal"
import { 
  Zap,
  UserCircle,
  ExternalLink
} from "lucide-react"
import { useFirestore, useUser } from "@/firebase"
import { getFirestore, collection, query, orderBy, doc, updateDoc, increment, deleteDoc, onSnapshot, limit, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { SkeletonCard } from "@/components/Skeleton"

const SPORTS_FILTERS = [
  { label: "All", value: "All", icon: "✨" },
  { label: "Football", value: "Football", icon: "⚽" },
  { label: "Cricket", value: "Cricket", icon: "🏏" },
  { label: "Pickleball", value: "Pickleball", icon: "🎾" },
  { label: "Swimming", value: "Swimming", icon: "🏊" },
];

export default function SocialWallPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [posts, setPosts] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState("All")
  const [likedPosts, setLikedPosts] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const liked = JSON.parse(localStorage.getItem('turfista_liked_posts') || '[]');
      setLikedPosts(liked);
    }
  }, []);

  // NEW FEED FETCHING LOGIC AS PER TACTICAL REQUEST
  useEffect(() => {
    const db = getFirestore();
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q,
      (snap) => {
        setLoading(false);
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error("Feed error:", err.code);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // SEPARATE FETCH FOR ADS
  useEffect(() => {
    if (!db) return;
    getDocs(collection(db, "ads")).then(snap => {
      setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((a: any) => a.isActive));
    });
  }, [db]);

  const handleDelete = (postId: string) => {
    if (!db) return;
    deleteDoc(doc(db, "posts", postId)).catch(err => {
      // silenced error
    });
  };

  const handleLike = (postId: string) => {
    if (!db || likedPosts.includes(postId)) return;
    
    const postRef = doc(db, "posts", postId);
    updateDoc(postRef, { likes: increment(1) })
      .then(() => {
        const newLiked = [...likedPosts, postId];
        setLikedPosts(newLiked);
        localStorage.setItem('turfista_liked_posts', JSON.stringify(newLiked));
      });
  };

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") return posts;
    return posts.filter(p => p.sport === activeFilter);
  }, [posts, activeFilter]);

  const feedItems = useMemo(() => {
    const items: any[] = [];
    filteredPosts.forEach((post, index) => {
      items.push({ type: 'post', data: post });
      if ((index + 1) % 5 === 0 && ads.length > 0) {
        const adIndex = Math.floor(index / 5) % ads.length;
        items.push({ type: 'ad', data: ads[adIndex] });
      }
    });
    return items;
  }, [filteredPosts, ads]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <main className="flex-1 pt-6 pb-20 max-w-lg mx-auto w-full px-4">
        
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
                <img src={user.photoURL} className="h-full w-full object-cover" alt="Me" loading="lazy" />
              ) : (
                <UserCircle className="h-5 w-5 text-white/20" />
              )}
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 h-10 bg-[#1A1A1A] border border-[#222] rounded-full px-5 text-left text-white/40 text-[13px] font-medium hover:border-primary/20 transition-all"
            >
              Looking for players in Mysuru...
            </button>
          </div>
        </div>

        {/* Real-time Wall Feed */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : feedItems.length > 0 ? (
          <div className="space-y-3">
            {feedItems.map((item, idx) => (
              item.type === 'post' ? (
                <PostCard 
                  key={item.data.id} 
                  post={item.data} 
                  currentUser={user} 
                  onDelete={() => handleDelete(item.data.id)}
                  onLike={() => handleLike(item.data.id)}
                  hasLiked={likedPosts.includes(item.data.id)}
                />
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

      <PostModal isOpen={showModal} onClose={() => setShowModal(false)} />
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
        <img src={ad.imageUrl || "https://picsum.photos/seed/ad/800/200"} className="w-full h-full object-cover opacity-60" alt={ad.title} loading="lazy" />
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

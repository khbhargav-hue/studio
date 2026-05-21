
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { PostModal } from "@/components/PostModal"
import { 
  Zap,
  UserCircle,
  ExternalLink
} from "lucide-react"
import { getAuth } from "firebase/auth"
import { db } from "@/lib/firebase"
import { useUser } from "@/firebase"
import { collection, doc, updateDoc, increment, onSnapshot, getDocs, getDoc, setDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { SkeletonCard } from "@/components/Skeleton"
import PostCard from "@/components/PostCard"

const SPORTS_FILTERS = [
  { label: "All", value: "all", icon: "✨" },
  { label: "Football", value: "Football", icon: "⚽" },
  { label: "Cricket", value: "Cricket", icon: "🏏" },
  { label: "Pickleball", value: "Pickleball", icon: "🎾" },
  { label: "Swimming", value: "Swimming", icon: "🏊" },
];

export default function SocialWallPage() {
  const { user } = useUser()
  
  const [posts, setPosts] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = React.useState(false);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser || !db) return;
    
    getDoc(doc(db, "users", currentUser.uid)).then(snap => {
      if (snap.exists()) {
        setIsAdmin(snap.data().role === "admin");
      } else {
        setDoc(doc(db, "users", currentUser.uid), {
          name: currentUser.displayName || "Player",
          email: currentUser.email,
          role: "user",
          createdAt: serverTimestamp()
        });
      }
    });
  }, [user, db]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const liked = JSON.parse(localStorage.getItem('turfista_liked_posts') || '[]');
      setLikedPosts(liked);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    
    const postsQuery = query(
      collection(db, "posts"), 
      orderBy("createdAt", "desc"), 
      limit(15)
    );

    const unsub = onSnapshot(
      postsQuery,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setPosts(list);
        setLoading(false);
      },
      () => {
        setLoading(false);  
      }
    );
    return () => unsub();
  }, [db]);

  useEffect(() => {
    if (!db) return;
    getDocs(query(collection(db, "ads"), limit(10))).then(snap => {
      setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((a: any) => a.isActive));
    });
  }, [db]);

  const handleLike = (postId: string) => {
    if (likedPosts.includes(postId)) return;
    if (!db) return;
    
    const postRef = doc(db, "posts", postId);
    updateDoc(postRef, { likes: increment(1) })
      .then(() => {
        const newLiked = [...likedPosts, postId];
        setLikedPosts(newLiked);
        localStorage.setItem('turfista_liked_posts', JSON.stringify(newLiked));
      });
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(p => !activeFilter || 
      activeFilter === "all" || 
      p.sport === activeFilter);
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

        <div className="bg-[#111] border border-[#222] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#1A1A1A] overflow-hidden flex items-center justify-center border border-[#222] shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} className="h-full w-full object-cover" alt="Me" loading="lazy" decoding="async" />
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
                  isAdmin={isAdmin}
                  onDelete={() => {}} 
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
  const handleAdClick = () => {
    updateDoc(doc(db, "ads", ad.id), { clickCount: increment(1) });
    window.open(ad.targetUrl, '_blank');
  };

  const displayImage = ad.imageUrl?.includes('cloudinary.com') 
    ? `${ad.imageUrl}?w=400&q=60&f=webp` 
    : (ad.imageUrl || "https://picsum.photos/seed/ad/800/200");

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden mb-3 relative">
      <div className="absolute top-3 right-4 z-10">
        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Sponsored</span>
      </div>
      <div className="relative w-full h-[120px]" onClick={handleAdClick} style={{ cursor: 'pointer' }}>
        <img 
          src={displayImage} 
          className="w-full h-full object-cover opacity-60" 
          alt={ad.title} 
          loading="lazy" 
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%231A1A1A'/%3E%3Ctext x='50%25' y='50%25' fill='%23444' text-anchor='middle' font-size='40'%3E⚽%3C/text%3E%3C/svg%3E";
          }}
        />
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

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { collection, query, where, deleteDoc, doc, orderBy } from "firebase/firestore";
import { UserCircle, LogOut, Settings, LayoutGrid, Zap, Users, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import { SkeletonCard } from "@/components/Skeleton";
import { useToast } from "@/hooks/use-toast";

export default function MePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const myPostsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "posts"),
      where("postedBy.uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: myPosts, loading: postsLoading } = useCollection(myPostsQuery);

  const handleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Identity Verified", description: "Welcome back to the Mysuru circuit." });
    } catch (err: any) {
      toast({ title: "Auth Failed", variant: "destructive" });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = () => {
    if (!auth) return;
    signOut(auth).then(() => {
      router.push("/");
      toast({ title: "Protocol Terminated", description: "Identity node offline." });
    });
  };

  const handleDeletePost = (postId: string) => {
    if (!db) return;
    deleteDoc(doc(db, "posts", postId)).then(() => {
      toast({ title: "Signal Redacted" });
    });
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center">
        <div className="bg-primary/10 p-6 rounded-full mb-8">
          <UserCircle className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Identify Yourself</h1>
        <p className="text-[#888] max-w-xs mb-8 italic">Join the Mysuru athlete circuit to recruit players and visit arenas.</p>
        <Button 
          onClick={handleSignIn} 
          disabled={isSigningIn}
          className="w-full max-w-sm h-14 bg-[#AAFF00] text-[#0A0A0A] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#AAFF00]/10"
        >
          {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in with Google"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] selection:bg-primary selection:text-black">
      <main className="flex-1 pt-12 pb-20 max-w-lg mx-auto w-full px-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative mb-6">
            <div className="h-[72px] w-[72px] rounded-full overflow-hidden border-2 border-primary/20 p-0.5 bg-[#111]">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "Me"} className="h-full w-full object-cover rounded-full" loading="lazy" />
              ) : (
                <UserCircle className="h-full w-full text-white/10" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
          </div>
          
          <h2 className="text-[20px] font-black uppercase italic tracking-tighter text-white mb-1">
            {user.displayName || "Athlete Node"}
          </h2>
          <p className="text-[13px] text-[#888] mb-4 font-medium">{user.email}</p>
          
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] px-3 py-1">
            Verified Athlete
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-[1px] bg-[#222] border border-[#222] rounded-xl overflow-hidden mb-12">
          <div className="bg-[#111] p-4 flex flex-col items-center">
            <span className="text-[18px] font-black italic text-white leading-none">{myPosts?.length || 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#444] mt-2">Posts</span>
          </div>
          <div className="bg-[#111] p-4 flex flex-col items-center">
            <span className="text-[18px] font-black italic text-white leading-none">0</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#444] mt-2">Turfs</span>
          </div>
          <div className="bg-[#111] p-4 flex flex-col items-center">
            <span className="text-[18px] font-black italic text-white leading-none">0</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#444] mt-2">Teams</span>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h3 className="text-[14px] font-black uppercase tracking-widest text-white italic">My Broadcasts</h3>
        </div>

        {/* My Posts Feed */}
        <div className="space-y-3">
          {postsLoading ? (
            [...Array(2)].map((_, i) => <SkeletonCard key={i} />)
          ) : myPosts && myPosts.length > 0 ? (
            myPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUser={user} 
                onDelete={() => handleDeletePost(post.id)}
                onLike={() => {}} 
                hasLiked={false}
              />
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-[#222] rounded-xl bg-[#111]/30">
              <Zap className="h-10 w-10 text-white/5 mx-auto mb-4" />
              <p className="text-[#444] text-[11px] font-black uppercase tracking-widest italic">No active signals</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="mt-12 pt-8 border-t border-[#222]">
          <button 
            onClick={handleSignOut}
            className="w-full h-12 border border-[#FF4444] text-[#FF4444] font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-[#FF4444]/5 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}

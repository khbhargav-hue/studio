'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, query, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserCircle, LogOut, LayoutGrid, Zap, MessageSquare, ChevronRight, Loader2, Chrome, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import { SkeletonCard } from "@/components/Skeleton";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function MePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const myPostsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "posts"),
      where("postedBy.uid", "==", user.uid)
    );
  }, [db, user]);

  const { data: rawMyPosts, loading: postsLoading } = useCollection(myPostsQuery);

  const myPosts = useMemo(() => {
    if (!rawMyPosts) return [];
    return [...rawMyPosts].sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [rawMyPosts]);

  const handleSignIn = () => {
    if (!auth || !db) return;
    setIsSigningIn(true);
    setAuthError(null);
    
    const provider = new GoogleAuthProvider();
    
    setPersistence(auth, browserLocalPersistence)
      .then(() => signInWithPopup(auth, provider))
      .then((result) => {
        toast({ title: "Identity Verified" });
        return setDoc(
          doc(db, "users", result.user.uid),
          {
            name: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            role: "user",
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      })
      .catch((err) => {
        if (err.code === "auth/popup-blocked") {
          alert("Popup blocked. Please open Turfista in Chrome browser and try again.");
          setAuthError("Popup blocked. Open in Chrome browser.");
        } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
          alert("Login failed: " + err.message);
        }
      })
      .finally(() => {
        setIsSigningIn(false);
      });
  };

  const handleSignOut = () => {
    if (!auth) return;
    auth.signOut().then(() => {
      router.push("/");
      toast({ title: "Protocol Terminated" });
    });
  };

  if (userLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#0A0A0A]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center">
        <div className="bg-primary/10 p-6 rounded-full mb-8">
          <UserCircle className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Identify Yourself</h1>
        <p className="text-[#888] max-w-xs mb-8 italic">Join the Mysuru athlete circuit to recruit players and visit arenas.</p>
        
        {authError && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-primary text-xs font-bold uppercase italic max-w-sm w-full mx-auto">
            <AlertCircle className="h-4 w-4" /> {authError}
          </div>
        )}

        <Button 
          onClick={handleSignIn} 
          disabled={isSigningIn}
          className="w-full max-w-sm h-14 bg-[#AAFF00] text-[#0A0A0A] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#AAFF00]/10"
        >
          {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Chrome className="mr-3 h-5 w-5" /> Sign in with Google</>}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] selection:bg-primary selection:text-black">
      <main className="flex-1 pt-12 pb-32 max-w-lg mx-auto w-full px-4">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative mb-6">
            <div className="h-[72px] w-[72px] rounded-full overflow-hidden border-2 border-primary/20 p-0.5 bg-[#111]">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "Me"} className="h-full w-full object-cover rounded-full" />
              ) : (
                <UserCircle className="h-full w-full text-white/10" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
          </div>
          <h2 className="text-[20px] font-black uppercase italic tracking-tighter text-white mb-1">{user.displayName || "Athlete Node"}</h2>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] px-3 py-1">Verified Athlete</Badge>
        </div>

        <div className="space-y-4 mb-12">
          <Link href="/messages" className="flex items-center justify-between p-6 bg-[#111] border border-[#222] rounded-xl hover:border-primary/40 transition-all group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20"><MessageSquare className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-black uppercase italic text-white">Direct Signals</p>
                <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest">Tactical Private Chat</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary transition-all" />
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-6 px-1">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h3 className="text-[14px] font-black uppercase tracking-widest text-white italic">My Broadcasts</h3>
        </div>

        <div className="space-y-3">
          {postsLoading ? (
            [...Array(2)].map((_, i) => <SkeletonCard key={i} />)
          ) : myPosts && myPosts.length > 0 ? (
            myPosts.map(post => <PostCard key={post.id} post={post} currentUser={user} onDelete={() => {}} onLike={() => {}} hasLiked={false} />)
          ) : (
            <div className="py-20 text-center border border-dashed border-[#222] rounded-xl bg-[#111]/30">
              <Zap className="h-10 w-10 text-white/5 mx-auto mb-4" />
              <p className="text-[#444] text-[11px] font-black uppercase tracking-widest italic">No active signals</p>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-[#222]">
          <button onClick={handleSignOut} className="w-full h-12 border border-[#FF4444] text-[#FF4444] font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-[#FF4444]/5 transition-all flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser, useAuth, useCollection, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { query, collection, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  UserCircle, 
  LogOut, 
  Users, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Loader2,
  Mail,
  AlertCircle,
  Activity,
  Star,
  ExternalLink,
  Gift,
  Share2,
  Copy
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { REWARD_POINTS, calculateLevel, getProgressToNextLevel } from "@/lib/rewards";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  useEffect(() => {
    if (user && db && !profile && !userLoading) {
      // Sync auth user to Firestore profile if it doesn't exist
      const ref = doc(db, "users", user.uid);
      setDoc(ref, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        rewardPoints: REWARD_POINTS.SIGNUP,
        referralCode: `TURF-${user.uid.slice(0, 6).toUpperCase()}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  }, [user, db, profile, userLoading]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) await signInWithRedirect(auth, provider);
      else await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      toast({ title: "Session Terminated" });
    }
  };

  const copyReferral = () => {
    const code = profile?.referralCode || '';
    navigator.clipboard.writeText(`Join Turfista with my code ${code} and earn 20 coins! https://turfista.in/login`);
    toast({ title: "Link Copied", description: "Share this to earn 100 Turf Coins." });
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const points = profile?.rewardPoints || 0;
  const level = calculateLevel(points);
  const progress = getProgressToNextLevel(points);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32">
        <div className="mx-auto max-w-xl px-4 space-y-8">
          {!user ? (
            <div className="bg-card border border-border rounded-[16px] p-12 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-[10px] flex items-center justify-center mx-auto mb-8">
                <UserCircle className="h-10 w-10 text-primary opacity-50" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight uppercase mb-4">Athlete Identity</h1>
              <p className="text-muted-foreground text-sm mb-10 leading-relaxed font-medium">Join the Mysuru athlete circuit to form squads and earn Turf Coins.</p>
              <Button onClick={handleGoogleSignIn} disabled={isSigningIn} className="w-full h-12 bg-primary text-black font-bold uppercase tracking-widest">
                {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : "Identify with Google"}
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Profile Header */}
              <section className="bg-card border border-border rounded-[16px] p-8 flex items-center gap-6">
                <div className="h-20 w-20 rounded-[10px] border border-border overflow-hidden bg-subtle shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "Athlete"} className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-full w-full p-4 text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[10px] font-black uppercase tracking-widest mb-1", level.color)}>
                    {level.name} Athlete
                  </div>
                  <h2 className="text-2xl font-bold truncate text-foreground uppercase italic">{user.displayName || "ATHLETE"}</h2>
                  <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider flex items-center gap-2 mt-1">
                    <Mail className="h-3 w-3" /> {user.email}
                  </p>
                </div>
              </section>

              {/* Rewards Hub */}
              <section className="bg-[#111111] border border-primary/20 rounded-[20px] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Gift className="h-32 w-32 text-primary" />
                </div>
                
                <div className="relative z-10 space-y-6">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">CURRENT BALANCE</p>
                        <div className="flex items-center gap-2">
                           <Star className="h-6 w-6 text-primary fill-current" />
                           <span className="text-5xl font-black italic text-white tracking-tighter">{points}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">NEXT LEVEL</p>
                         <p className="text-sm font-bold text-white uppercase italic">
                           {calculateLevel(points + 100).name}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                        <span>XP Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-white/5" />
                   </div>

                   <div className="pt-4 grid grid-cols-2 gap-4">
                      <Button asChild variant="outline" className="h-11 border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest">
                         <Link href="/leaderboard"><Trophy className="mr-2 h-3 w-3" /> Leaderboard</Link>
                      </Button>
                      <Button onClick={copyReferral} className="h-11 bg-primary text-black text-[10px] font-black uppercase tracking-widest">
                         <Share2 className="mr-2 h-3 w-3" /> Invite Friend
                      </Button>
                   </div>
                </div>
              </section>

              <div className="grid gap-3">
                {[
                  { label: "Squad Roster", icon: Users, href: "/teams", sub: "Recruitment & Tactics" },
                  { label: "Circuit Ranking", icon: Trophy, href: "/leaderboard", sub: "View Elite Rankings" },
                  { label: "Arena Guide", icon: Star, href: "/#turfs", sub: "Venue Intelligence" },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-6 bg-card border border-border rounded-[16px] hover:border-primary transition-colors group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-[10px] bg-subtle border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-bold uppercase tracking-tight">{item.label}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full h-12 text-destructive hover:bg-destructive/10 uppercase tracking-widest font-black text-[10px]"
                >
                  <LogOut className="mr-3 h-4 w-4" /> TERMINATE SESSION
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
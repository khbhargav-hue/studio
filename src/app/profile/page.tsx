
'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useAuth, useCollection, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { query, collection, where, doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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
  Activity,
  Star,
  Gift,
  Share2,
  Settings2,
  Save
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { REWARD_POINTS, calculateLevel, getProgressToNextLevel } from "@/lib/rewards";
import { cn } from "@/lib/utils";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"];
const AVAILABILITY = ["Morning", "Evening", "Weekend", "All-Time"];

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  const [formData, setFormData] = useState({
    skillLevel: "Intermediate",
    availability: "Evening",
    favoriteSport: "Football",
    age: "",
    area: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        skillLevel: profile.skillLevel || "Intermediate",
        availability: profile.availability || "Evening",
        favoriteSport: profile.favoriteSport || "Football",
        age: profile.age || "",
        area: profile.area || ""
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user && db && !profile && !userLoading) {
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Identity Updated", description: "Your tactical profile is now live." });
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="bg-card border border-border rounded-[32px] p-12 text-center shadow-2xl">
              <div className="h-24 w-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-inner border border-primary/20">
                <UserCircle className="h-12 w-12 text-primary opacity-50" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-4">Identity Required</h1>
              <p className="text-muted-foreground text-sm mb-12 leading-relaxed font-medium">Join the Mysuru athlete circuit to form squads, find tactical matches, and earn Turf Coins.</p>
              <Button onClick={handleGoogleSignIn} disabled={isSigningIn} className="w-full h-16 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : "Identify with Google"}
              </Button>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Profile Header */}
              <section className="bg-card border border-border rounded-[32px] p-8 flex items-center gap-8 shadow-xl">
                <div className="h-24 w-24 rounded-[24px] border-2 border-primary p-0.5 overflow-hidden bg-surface shrink-0 shadow-2xl">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "Athlete"} className="h-full w-full object-cover rounded-[22px]" />
                  ) : (
                    <UserCircle className="h-full w-full p-4 text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-2 px-3 py-1 rounded-full w-fit bg-white/5", level.color)}>
                    {level.name} ATHLETE
                  </div>
                  <h2 className="text-3xl font-black truncate text-foreground uppercase italic tracking-tighter">{user.displayName || "ATHLETE"}</h2>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mt-2 opacity-50">
                    <Mail className="h-3 w-3" /> {user.email}
                  </p>
                </div>
              </section>

              {/* Rewards Hub */}
              <section className="bg-[#111] border border-primary/20 rounded-[32px] p-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Gift className="h-40 w-40 text-primary" />
                </div>
                
                <div className="relative z-10 space-y-10">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-2">CURRENT BALANCE</p>
                        <div className="flex items-center gap-3">
                           <Star className="h-8 w-8 text-primary fill-current" />
                           <span className="text-6xl font-black italic text-white tracking-tighter">{points}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 opacity-40">NEXT LEVEL</p>
                         <p className="text-base font-black text-white uppercase italic tracking-tight">
                           {calculateLevel(points + 100).name}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted">
                        <span>XP Progress</span>
                        <span className="text-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-white/5" />
                   </div>

                   <div className="pt-6 grid grid-cols-2 gap-4">
                      <Button asChild variant="outline" className="h-14 border-border bg-white/[0.02] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:border-primary transition-all">
                         <Link href="/leaderboard"><Trophy className="mr-2 h-4 w-4 text-primary" /> Rankings</Link>
                      </Button>
                      <Button onClick={copyReferral} className="h-14 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all">
                         <Share2 className="mr-2 h-4 w-4" /> Invite Friend
                      </Button>
                   </div>
                </div>
              </section>

              {/* Tactical Update Form */}
              <section className="bg-card border border-border rounded-[32px] p-10 space-y-10 shadow-xl">
                 <div className="flex items-center gap-3">
                    <Settings2 className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Tactical <span className="text-muted">Identity</span></h3>
                 </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Current Skill</Label>
                          <Select value={formData.skillLevel} onValueChange={v => setFormData({...formData, skillLevel: v})}>
                             <SelectTrigger className="h-14 bg-surface border-border rounded-2xl"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-card">{SKILL_LEVELS.map(l => <SelectItem key={l} value={l} className="font-bold">{l}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Availability</Label>
                          <Select value={formData.availability} onValueChange={v => setFormData({...formData, availability: v})}>
                             <SelectTrigger className="h-14 bg-surface border-border rounded-2xl"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-card">{AVAILABILITY.map(a => <SelectItem key={a} value={a} className="font-bold">{a}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Area in Mysuru</Label>
                          <Input placeholder="e.g. Vijayanagar" className="h-14 bg-surface rounded-2xl" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Age (Optional)</Label>
                          <Input type="number" placeholder="24" className="h-14 bg-surface rounded-2xl" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                       </div>
                    </div>
                    <Button type="submit" disabled={isSaving} className="w-full h-16 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary transition-all">
                       {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Tactical Data</>}
                    </Button>
                 </form>
              </section>

              <div className="grid gap-4">
                {[
                  { label: "Squad Roster", icon: Users, href: "/teams", sub: "Recruitment & Tactics" },
                  { label: "Circuit Ranking", icon: Trophy, href: "/leaderboard", sub: "View Elite Rankings" },
                  { label: "Arena Guide", icon: Star, href: "/#turfs", sub: "Venue Intelligence" },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-8 bg-card border border-border rounded-[24px] hover:border-primary transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-subtle border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all shadow-inner">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xl font-black uppercase italic tracking-tight">{item.label}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>

              <div className="pt-10">
                <Button 
                  onClick={() => signOut(auth!)}
                  variant="ghost"
                  className="w-full h-14 text-destructive hover:bg-destructive/10 uppercase tracking-widest font-black text-[10px] rounded-2xl"
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

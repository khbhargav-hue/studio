'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { 
  UserCircle, 
  LogOut, 
  Users, 
  Trophy, 
  Zap, 
  ChevronRight,
  Loader2,
  Mail,
  Activity,
  Star,
  Gift,
  Share2,
  Settings2,
  Save,
  Clock,
  Swords,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ShieldCheck
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
  const [authError, setAuthError] = useState<React.ReactNode | null>(null);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  const [formData, setFormData] = useState({
    skillLevel: "Intermediate",
    availability: "Evening",
    favoriteSport: "Football",
    bio: "",
    area: "",
    playingStyle: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        skillLevel: profile.skillLevel || "Intermediate",
        availability: profile.availability || "Evening",
        favoriteSport: profile.favoriteSport || "Football",
        bio: profile.bio || "",
        area: profile.area || "",
        playingStyle: profile.playingStyle || ""
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
        status: "online",
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
      toast({ title: "Identity Updated", description: "Your tactical profile is now live on the circuit." });
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) await signInWithRedirect(auth, provider);
      else await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Gracefully handle user cancellation
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        setIsSigningIn(false);
        return;
      }

      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setAuthError(
          <div className="space-y-5 text-left">
            <div className="flex items-center gap-2 text-destructive font-black text-[10px] uppercase tracking-[0.2em]">
              <AlertCircle className="h-4 w-4" /> Auth Signal Blocked
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed italic">
              This host environment (<span className="text-white font-mono">{domain}</span>) is not yet authorized in your Firebase Project.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-[16px] space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary">Resolution Steps:</p>
              <ol className="text-[9px] list-decimal pl-4 space-y-2 uppercase tracking-tight text-white/40">
                <li>Access Firebase Console</li>
                <li>Build {'->'} Authentication {'->'} Settings</li>
                <li>Add <span className="text-white">{domain}</span> to Authorized Domains</li>
              </ol>
              <div className="flex gap-3">
                <Button 
                  size="sm" 
                  className="h-8 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-lg"
                  onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
                >
                  Open Console <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest rounded-lg"
                  onClick={() => setAuthError(null)}
                >
                  <RefreshCw className="ml-1 h-3 w-3" /> Retry
                </Button>
              </div>
            </div>
          </div>
        );
        toast({ 
          title: "Domain Restricted", 
          description: "Update Authorized Domains in Console.",
          variant: "destructive"
        });
      } else {
        console.error("Auth process interrupted:", error);
        toast({ title: "Identification Failed", variant: "destructive" });
      }
    } finally {
      setIsSigningIn(false);
    }
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
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-40">
        <div className="mx-auto max-w-2xl px-4 space-y-12">
          {!user ? (
            <div className="bg-card border border-white/5 rounded-[3rem] p-16 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <ShieldCheck className="h-40 w-40 text-primary" />
              </div>

              <div className="h-32 w-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-primary/20 shadow-inner relative z-10">
                <UserCircle className="h-16 w-16 text-primary" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-6 relative z-10">Identity <span className="text-primary">Required</span></h1>
              <p className="text-white/40 text-lg mb-8 leading-relaxed font-medium italic relative z-10">Join the Mysuru athlete circuit to form squads, find matches, and earn Turf Coins.</p>
              
              {authError && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  {authError}
                </div>
              )}

              {!authError && (
                <Button onClick={handleGoogleSignIn} disabled={isSigningIn} className="w-full h-20 bg-primary text-black font-black uppercase tracking-widest rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                  {isSigningIn ? <Loader2 className="h-6 w-6 animate-spin" /> : "Identify with Google"}
                </Button>
              )}
              
              <div className="mt-8">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Guest Mode Active • Roster Restricted</p>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Profile Header */}
              <section className="bg-card border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl">
                <div className="h-32 w-32 rounded-[2.5rem] border-4 border-primary/20 p-1 overflow-hidden bg-white/5 shrink-0 relative">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "Athlete"} className="h-full w-full object-cover rounded-[2.2rem]" />
                  ) : (
                    <UserCircle className="h-full w-full p-6 text-white/10" />
                  )}
                  <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-card" />
                </div>
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className={cn("text-[10px] font-black uppercase tracking-[0.4em] mb-4 px-4 py-1.5 rounded-full w-fit mx-auto md:mx-0 bg-white/5", level.color)}>
                    {level.name} ATHLETE • CIRCUIT ACTIVE
                  </div>
                  <h2 className="text-5xl font-black truncate text-white uppercase italic tracking-tighter">{user.displayName || "ATHLETE"}</h2>
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-2 mt-4">
                    <Mail className="h-3.5 w-3.5" /> {user.email}
                  </p>
                </div>
              </section>

              {/* Rewards Hub */}
              <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Trophy className="h-64 w-64 text-primary" />
                </div>
                
                <div className="relative z-10 space-y-12">
                   <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8">
                      <div className="text-center md:text-left">
                        <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-4">CURRENT COIN BALANCE</p>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                           <Star className="h-10 w-10 text-primary fill-current shadow-[0_0_20px_rgba(170,255,0,0.4)]" />
                           <span className="text-8xl font-black italic text-white tracking-tighter leading-none">{points}</span>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">NEXT MILESTONE</p>
                         <p className="text-2xl font-black text-white uppercase italic tracking-tight">
                           {calculateLevel(points + 100).name}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
                        <span>XP Progress</span>
                        <span className="text-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-white/5 rounded-full" />
                   </div>
                </div>
              </section>

              {/* Tactical Identity Form */}
              <section className="bg-card border border-white/5 rounded-[3rem] p-12 space-y-12 shadow-2xl">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Settings2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Tactical <span className="text-white/20">Identity</span></h3>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Configure your network signals</p>
                    </div>
                 </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-10">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Combat Bio</Label>
                      <Textarea 
                        placeholder="Tell the network about your playing style, achievements..." 
                        className="h-32 bg-white/5 border-white/10 rounded-[1.5rem] italic text-lg leading-relaxed focus:border-primary/50 text-white" 
                        value={formData.bio} 
                        onChange={e => setFormData({...formData, bio: e.target.value})} 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Current Skill</Label>
                          <Select value={formData.skillLevel} onValueChange={v => setFormData({...formData, skillLevel: v})}>
                             <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-[#0A0A0A] border-white/10">{SKILL_LEVELS.map(l => <SelectItem key={l} value={l} className="font-bold text-white">{l}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Area in Mysuru</Label>
                          <Input placeholder="e.g. Vijayanagar" className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg italic font-bold text-white" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Availability</Label>
                          <Select value={formData.availability} onValueChange={v => setFormData({...formData, availability: v})}>
                             <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-[#0A0A0A] border-white/10">{AVAILABILITY.map(a => <SelectItem key={a} value={a} className="font-bold text-white">{a}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Main Discipline</Label>
                          <Input placeholder="e.g. Football / Box Cricket" className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg italic font-bold text-white" value={formData.favoriteSport} onChange={e => setFormData({...formData, favoriteSport: e.target.value})} />
                       </div>
                    </div>

                    <Button type="submit" disabled={isSaving} className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] hover:bg-primary hover:scale-[1.01] transition-all shadow-2xl">
                       {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="mr-3 h-5 w-5" /> PUBLISH IDENTITY</>}
                    </Button>
                 </form>
              </section>

              <div className="grid gap-4">
                {[
                  { label: "Open Matches", icon: Swords, href: "/matches", sub: "Recruiting Now" },
                  { label: "Player Discovery", icon: Users, href: "/players", sub: "Identify Teammates" },
                  { label: "Circuit Ranking", icon: Trophy, href: "/leaderboard", sub: "Elite Legends" },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-10 bg-card border border-white/5 rounded-[2.5rem] hover:border-primary/40 transition-all group shadow-xl"
                  >
                    <div className="flex items-center gap-8">
                      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                        <item.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-2xl font-black uppercase italic tracking-tight text-white">{item.label}</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mt-1">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-8 w-8 text-white/10 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                  </Link>
                ))}
              </div>

              <div className="pt-20">
                <Button 
                  onClick={() => signOut(auth!)}
                  variant="ghost"
                  className="w-full h-16 text-destructive/40 hover:text-destructive hover:bg-destructive/5 uppercase tracking-[0.5em] font-black text-[10px] rounded-[1.5rem]"
                >
                  <LogOut className="mr-3 h-4 w-4" /> TERMINATE PROTOCOL
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

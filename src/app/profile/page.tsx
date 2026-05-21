'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer"
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
  Loader2,
  Star,
  Save,
  AlertCircle,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateLevel, getProgressToNextLevel } from "@/lib/rewards";
import { cn } from "@/lib/utils";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Pro"];

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState<React.ReactNode | null>(null);
  const [copied, setCopied] = useState(false);
  
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

  const copyHostname = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.hostname);
      setCopied(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Identity Updated" });
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setIsSigningIn(true);
    setAuthError(null);
    
    const provider = new GoogleAuthProvider();
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        const userResult = result.user;
        
        await setDoc(doc(db, "users", userResult.uid), {
          name: userResult.displayName,
          email: userResult.email,
          photoURL: userResult.photoURL,
          role: "user",
          updatedAt: serverTimestamp()
        }, { merge: true });

        toast({ title: "Identity Verified" });
      }
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setAuthError(
          <div className="space-y-4">
            <p className="text-[10px] text-white/50 leading-relaxed italic">Host domain <span className="text-white font-mono">{domain}</span> unauthorized.</p>
            <Button size="sm" variant="outline" className="w-full text-[9px] uppercase font-black" onClick={copyHostname}>
              {copied ? "COPIED" : "COPY HOSTNAME"}
            </Button>
          </div>
        );
      } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (userLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
              <div className="h-32 w-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-primary/20">
                <UserCircle className="h-16 w-16 text-primary" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-6">Identity <span className="text-primary">Required</span></h1>
              <p className="text-white/40 text-lg mb-8 leading-relaxed font-medium italic">Join the Mysuru athlete circuit to form squads and earn Turf Coins.</p>
              
              {authError && <div className="mb-10">{authError}</div>}

              {!authError && (
                <Button onClick={handleGoogleSignIn} disabled={isSigningIn} className="w-full h-20 bg-primary text-black font-black uppercase tracking-widest rounded-[2rem] shadow-xl shadow-primary/20">
                  {isSigningIn ? <Loader2 className="h-6 w-6 animate-spin" /> : "Identify with Google"}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in duration-700">
              <section className="bg-card border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl">
                <div className="h-32 w-32 rounded-[2.5rem] border-4 border-primary/20 p-1 overflow-hidden bg-white/5 shrink-0 relative">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "Athlete"} className="h-full w-full object-cover rounded-[2.2rem]" />
                  ) : (
                    <UserCircle className="h-full w-full p-6 text-white/10" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className={cn("text-[10px] font-black uppercase tracking-[0.4em] mb-4 px-4 py-1.5 rounded-full w-fit mx-auto md:mx-0 bg-white/5", level.color)}>
                    {level.name} ATHLETE
                  </div>
                  <h2 className="text-5xl font-black truncate text-white uppercase italic tracking-tighter">{user.displayName || "ATHLETE"}</h2>
                </div>
              </section>

              <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-12">
                   <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8">
                      <div className="text-center md:text-left">
                        <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-4">TURF COINS</p>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                           <Star className="h-10 w-10 text-primary fill-current" />
                           <span className="text-8xl font-black italic text-white tracking-tighter leading-none">{points}</span>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
                        <span>XP Progress</span>
                        <span className="text-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-white/5" />
                   </div>
                </div>
              </section>

              <section className="bg-card border border-white/5 rounded-[3rem] p-12 space-y-12 shadow-2xl">
                 <form onSubmit={handleUpdateProfile} className="space-y-10">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Combat Bio</Label>
                      <Textarea placeholder="Tell the network about your playing style..." className="h-32 bg-white/5 border-white/10 rounded-[1.5rem] italic text-lg focus:border-primary/50 text-white" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Current Skill</Label>
                          <Select value={formData.skillLevel} onValueChange={v => setFormData({...formData, skillLevel: v})}>
                             <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg font-bold text-white"><SelectValue /></SelectTrigger>
                             <SelectContent className="bg-[#0A0A0A]">{SKILL_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Area in Mysuru</Label>
                          <Input placeholder="e.g. Vijaynagar" className="h-16 bg-white/5 border-white/10 rounded-2xl text-lg italic font-bold text-white" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                       </div>
                    </div>
                    <Button type="submit" disabled={isSaving} className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] hover:bg-primary transition-all">
                       {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="mr-3 h-5 w-5" /> PUBLISH IDENTITY</>}
                    </Button>
                 </form>
              </section>

              <div className="pt-20">
                <Button onClick={() => signOut(auth!)} variant="ghost" className="w-full h-16 text-destructive/40 hover:text-destructive uppercase tracking-[0.5em] font-black text-[10px]">
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

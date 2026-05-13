'use client';

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { query, collection, where } from "firebase/firestore";
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
  Calendar,
  AlertCircle,
  Star
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle Redirect Result for Mobile Resilience
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          toast({ title: "Signal Connected", description: "Athlete identity verified via Google." });
        }
      })
      .catch((error: any) => {
        console.error("Auth redirect error:", error);
        if (error.code === 'auth/unauthorized-domain') {
          setAuthError("Domain block detected. Please whitelist this origin in your Firebase Console (Auth > Settings > Authorized Domains).");
        }
      });
  }, [auth, toast]);

  const myTeamsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "teams"), where("ownerId", "==", user.uid));
  }, [db, user]);

  const myChallengesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "challenges"), where("ownerId", "==", user.uid));
  }, [db, user]);

  const { data: myTeams } = useCollection(myTeamsQuery);
  const { data: myChallenges } = useCollection(myChallengesQuery);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      console.error("Sign-in process error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError("Origin Authorization Required: Add this URL to 'Authorized Domains' in Firebase Console.");
        toast({
          variant: "destructive",
          title: "Origin Blocked",
          description: "This domain is not whitelisted for authentication.",
        });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Identification Failed",
          description: error.message || "An unexpected error occurred during verification.",
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      setAuthError(null);
      toast({ title: "Signal Terminated", description: "You have been securely signed out." });
    }
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-14 w-14 animate-spin text-primary opacity-40" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 md:pt-44 pb-32">
        <div className="mx-auto max-w-xl px-4">
          {authError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-[2.5rem] p-10 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <AlertCircle className="h-7 w-7" />
              <AlertTitle className="font-black uppercase italic tracking-widest text-sm mb-3">Security Restriction</AlertTitle>
              <AlertDescription className="text-xs font-medium leading-relaxed opacity-70">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          {!user ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[4rem] p-16 text-center border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="h-28 w-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-primary/20">
                <UserCircle className="h-14 w-14 text-primary opacity-40" />
              </div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-6 leading-none">CONNECT <br /><span className="text-primary">IDENTITY</span></h1>
              <p className="text-white/40 mb-12 font-medium italic text-lg leading-relaxed">Join the Mysuru athlete circuit to form squads, issue claims, and track stats.</p>
              <Button 
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="btn-neon-glow w-full h-20 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs rounded-[1.5rem] shadow-2xl transition-all"
              >
                {isSigningIn ? <Loader2 className="h-6 w-6 animate-spin" /> : "IDENTIFY WITH GOOGLE"}
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <section className="glass-card rounded-[3.5rem] p-12 border-white/5 relative overflow-hidden bg-white/[0.02]">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <ShieldCheck className="h-40 w-40 text-primary" />
                </div>
                
                <div className="flex items-center gap-10 relative z-10">
                  <div className="h-28 w-28 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-2xl">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle className="h-14 w-14 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-block bg-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full mb-4">
                      VERIFIED ATHLETE
                    </div>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white truncate leading-none mb-3">
                      {user.displayName?.split(' ')[0] || "ATHLETE"}
                    </h2>
                    <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 truncate">
                      <Mail className="h-4 w-4 shrink-0 text-primary/40" /> {user.email}
                    </p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-6">
                 <div className="glass-card p-10 rounded-[2.5rem] border-white/5 bg-white/[0.01] transition-all hover:bg-white/[0.03]">
                    <Users className="h-6 w-6 text-primary mb-5" />
                    <p className="text-5xl font-black italic leading-none">{myTeams?.length || 0}</p>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-4">Active Squads</p>
                 </div>
                 <div className="glass-card p-10 rounded-[2.5rem] border-white/5 bg-white/[0.01] transition-all hover:bg-white/[0.03]">
                    <Trophy className="h-6 w-6 text-primary mb-5" />
                    <p className="text-5xl font-black italic leading-none">{myChallenges?.length || 0}</p>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-4">Match Claims</p>
                 </div>
              </div>

              <div className="grid gap-5">
                {[
                  { label: "My Squads", icon: Users, href: "/teams", sub: "Roster management & tactics", count: myTeams?.length },
                  { label: "My Challenges", icon: Trophy, href: "/challenges", sub: "Active match negotiations", count: myChallenges?.length },
                  { label: "Discovery Guide", icon: Star, href: "/mysuru", sub: "Regional sport intelligence" },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-10 bg-white/[0.03] rounded-[2.5rem] border border-white/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all group"
                  >
                    <div className="flex items-center gap-8">
                      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                        <item.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-2xl font-black italic uppercase tracking-tight text-white">{item.label}</p>
                        <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2">{item.sub}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                       {item.count !== undefined && (
                          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary">
                             {item.count}
                          </div>
                       )}
                       <ChevronRight className="h-6 w-6 text-white/10 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Layout Structuring for Future Personalization Banners */}
              <div className="pt-10 border-t border-white/5 space-y-6">
                {/* <div className="h-20 w-full rounded-[2rem] border border-dashed border-white/10 flex items-center justify-center text-white/10 text-[9px] font-black uppercase tracking-[0.5em]">
                    Personalized Promotion Node
                </div> */}
                
                <Button 
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full h-20 rounded-[2rem] text-destructive/60 hover:bg-destructive/5 hover:text-destructive font-black uppercase tracking-[0.3em] text-[10px] transition-all"
                >
                  <LogOut className="mr-4 h-5 w-5" /> End Secure Athlete Session
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

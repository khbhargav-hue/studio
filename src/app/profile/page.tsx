
'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
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
  Settings,
  Mail,
  Calendar,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

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
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in failed", error);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32">
        <div className="mx-auto max-w-xl px-4">
          {!user ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[3rem] p-12 text-center border-white/5"
            >
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <UserCircle className="h-12 w-12 text-primary opacity-40" />
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">IDENTITY <span className="text-primary">REQUIRED</span></h1>
              <p className="text-white/40 mb-10 font-medium">Join the Mysuru sports network to build your squad, track stats, and issue challenges.</p>
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full h-18 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_20px_40px_-10px_rgba(57,255,20,0.3)] hover:scale-[1.02] transition-transform"
              >
                SIGN IN WITH GOOGLE
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Profile Header */}
              <section className="glass-card rounded-[3rem] p-10 border-white/5 relative overflow-hidden bg-white/[0.02]">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck className="h-32 w-32 text-primary" />
                </div>
                
                <div className="flex items-center gap-8 relative z-10">
                  <div className="h-24 w-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-2xl">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="inline-block bg-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-3">
                      VERIFIED ATHLETE
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white truncate max-w-[200px] leading-none mb-2">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </h2>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Mail className="h-3 w-3" /> {user.email}
                    </p>
                  </div>
                </div>
              </section>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01]">
                    <Users className="h-5 w-5 text-primary mb-3" />
                    <p className="text-3xl font-black italic leading-none">{myTeams?.length || 0}</p>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2">Active Squads</p>
                 </div>
                 <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01]">
                    <Trophy className="h-5 w-5 text-primary mb-3" />
                    <p className="text-3xl font-black italic leading-none">{myChallenges?.length || 0}</p>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-2">Match Claims</p>
                 </div>
              </div>

              {/* Action Menu */}
              <div className="grid gap-3">
                {[
                  { label: "My Squads", icon: Users, href: "/teams", sub: "Manage rosters & tactics", count: myTeams?.length },
                  { label: "My Challenges", icon: Trophy, href: "/challenges", sub: "Pending match claims", count: myChallenges?.length },
                  { label: "Discovery Guide", icon: Calendar, href: "/mysuru", sub: "Local sport guides" },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-[1.5rem] bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xl font-black italic uppercase tracking-tight text-white">{item.label}</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{item.sub}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       {item.count !== undefined && (
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                             {item.count}
                          </div>
                       )}
                       <ChevronRight className="h-5 w-5 text-white/10 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Secondary Actions */}
              <div className="pt-8 border-t border-white/5 space-y-4">
                <Button 
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full h-16 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive font-black uppercase tracking-widest text-[10px]"
                >
                  <LogOut className="mr-3 h-5 w-5" /> End Secure Athlete Session
                </Button>
                <div className="flex flex-col items-center gap-2">
                   <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/10 italic">Platform Security Version 2.0.4</p>
                   <div className="flex gap-4 opacity-20">
                      <div className="h-1 w-1 bg-white rounded-full" />
                      <div className="h-1 w-1 bg-white rounded-full" />
                      <div className="h-1 w-1 bg-white rounded-full" />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

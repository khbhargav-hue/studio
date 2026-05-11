
'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { 
  UserCircle, 
  LogOut, 
  Users, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Loader2,
  Settings
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const auth = useAuth();

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
              <p className="text-white/40 mb-10 font-medium">Join the Mysuru sports network to build your squad and issue challenges.</p>
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full h-16 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
              >
                SIGN IN WITH GOOGLE
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <section className="glass-card rounded-[3rem] p-10 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck className="h-32 w-32 text-primary" />
                </div>
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Athlete Profile</p>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white truncate max-w-[200px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </h2>
                  </div>
                </div>
              </section>

              <div className="grid gap-4">
                {[
                  { label: "My Teams", icon: Users, href: "/teams", count: "Manage Roster" },
                  { label: "My Challenges", icon: Trophy, href: "/challenges", count: "Active Matchups" },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-lg font-bold uppercase tracking-tight text-white">{item.label}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">{item.count}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                <Button 
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full h-14 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive font-black uppercase tracking-widest text-[10px]"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out from Platform
                </Button>
                <p className="text-[8px] font-black text-center uppercase tracking-[0.4em] text-white/10">Turfista • Secure Athlete Session</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

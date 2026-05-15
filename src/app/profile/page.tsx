
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
  AlertCircle,
  Activity,
  Star,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth).catch((error: any) => {
      console.error("Auth redirect result error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setAuthError(
          <div className="space-y-4">
            <p className="font-bold text-danger uppercase tracking-tighter flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Domain Not Whitelisted
            </p>
            <p className="text-xs opacity-80 leading-relaxed">
              Firebase Security Rules prevent authentication from this domain: <code className="bg-danger/20 px-1 rounded">{domain}</code>
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-[10px] space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Resolution Steps:</p>
              <ol className="text-[10px] list-decimal pl-4 space-y-2 uppercase tracking-tight">
                <li>Access Firebase Console</li>
                <li>Authentication {'>'} Settings {'>'} Authorized Domains</li>
                <li>Add {domain}</li>
              </ol>
              <Button asChild variant="link" className="text-primary text-[10px] h-auto p-0 flex justify-start uppercase font-black">
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                  Open Console <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        );
      }
    });
  }, [auth]);

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
      if (isMobile) await signInWithRedirect(auth, provider);
      else await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Sign-in error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setAuthError(
          <div className="space-y-4">
            <p className="font-bold text-danger uppercase tracking-tighter flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Domain Not Whitelisted
            </p>
            <p className="text-xs opacity-80 leading-relaxed">
              Firebase Security Rules prevent authentication from this domain: <code className="bg-danger/20 px-1 rounded">{domain}</code>
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-[10px] space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Resolution Steps:</p>
              <ol className="text-[10px] list-decimal pl-4 space-y-2 uppercase tracking-tight">
                <li>Access Firebase Console</li>
                <li>Authentication {'>'} Settings {'>'} Authorized Domains</li>
                <li>Add {domain}</li>
              </ol>
              <Button asChild variant="link" className="text-primary text-[10px] h-auto p-0 flex justify-start uppercase font-black">
                <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                  Open Console <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      toast({ title: "Session Terminated", description: "Securely logged out." });
    }
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32">
        <div className="mx-auto max-w-xl px-4">
          {authError && (
            <div className="mb-10 p-8 border border-danger/30 bg-danger/5 rounded-[16px]">
              {authError}
            </div>
          )}

          {!user ? (
            <div className="bg-card border border-border rounded-[16px] p-12 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-[10px] flex items-center justify-center mx-auto mb-8">
                <UserCircle className="h-10 w-10 text-primary opacity-50" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight uppercase mb-4">Athlete Identity</h1>
              <p className="text-muted-foreground text-sm mb-10 leading-relaxed font-medium">Join the Mysuru athlete circuit to form squads and issue match challenges.</p>
              <Button onClick={handleGoogleSignIn} disabled={isSigningIn} className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-widest">
                {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : "Identify with Google"}
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-card border border-border rounded-[16px] p-8 flex items-center gap-6">
                <div className="h-20 w-20 rounded-[10px] border border-border overflow-hidden bg-subtle">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "Athlete"} className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-full w-full p-4 text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="label-caps text-primary mb-1">Verified Athlete</div>
                  <h2 className="text-2xl font-bold truncate text-foreground">{user.displayName || "ATHLETE"}</h2>
                  <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider flex items-center gap-2 mt-1">
                    <Mail className="h-3 w-3" /> {user.email}
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-card border border-border p-6 rounded-[16px]">
                    <Users className="h-5 w-5 text-primary mb-3" />
                    <p className="text-3xl font-bold">{myTeams?.length || 0}</p>
                    <p className="label-caps text-muted-foreground mt-1">Squads</p>
                 </div>
                 <div className="bg-card border border-border p-6 rounded-[16px]">
                    <Activity className="h-5 w-5 text-primary mb-3" />
                    <p className="text-3xl font-bold">{myChallenges?.length || 0}</p>
                    <p className="label-caps text-muted-foreground mt-1">Claims</p>
                 </div>
              </div>

              <div className="grid gap-3">
                {[
                  { label: "Squad Roster", icon: Users, href: "/teams", sub: "Recruitment & Tactics" },
                  { label: "Match Claims", icon: Trophy, href: "/challenges", sub: "Active Circuit Feed" },
                  { label: "Arena Guide", icon: Star, href: "/", sub: "Venue Intelligence" },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-6 bg-card border border-border rounded-[16px] hover:border-primary transition-colors group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-[10px] bg-subtle border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-bold uppercase tracking-tight">{item.label}</p>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>

              <div className="pt-10 border-t border-border">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full h-12 text-danger border-danger/20 hover:bg-danger/5 hover:border-danger uppercase tracking-widest font-bold"
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

'use client';

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useFirestore } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, Mail, Lock, User, ShieldCheck, Chrome, AlertCircle, ExternalLink, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AuthModal({ children, open, onOpenChange }: AuthModalProps) {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [copied, setCopied] = useState(false);

  const copyHostname = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.hostname);
      setCopied(true);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    setError(null);
    
    const provider = new GoogleAuthProvider();
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    try {
      // 1. Ensure persistence
      await setPersistence(auth, browserLocalPersistence);

      if (isMobile) {
        // 2. Mobile: Redirect modality
        await signInWithRedirect(auth, provider);
      } else {
        // 3. Desktop: Popup modality
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "user",
          updatedAt: serverTimestamp()
        }, { merge: true });

        toast({ title: "Identity Verified" });
        if (onOpenChange) onOpenChange(false);
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setError(
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive font-black text-[10px] uppercase tracking-tighter">
              <AlertCircle className="h-4 w-4" /> Domain Not Authorized
            </div>
            <p className="text-[10px] leading-relaxed opacity-70">
              This host (<code className="bg-destructive/10 px-1 py-0.5 rounded text-white font-mono">{domain}</code>) is not authorized.
            </p>
            <Button size="sm" onClick={copyHostname} className="w-full text-[9px] uppercase font-black tracking-widest bg-primary/10 text-primary">
              {copied ? "COPIED" : "COPY HOSTNAME"}
            </Button>
          </div>
        );
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        toast({ title: "Authentication Failed", description: err.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome Athlete" });
      if (onOpenChange) onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Invalid Credentials", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      if (db) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: email,
          photoURL: "",
          role: "user",
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      toast({ title: "Profile Registered" });
      if (onOpenChange) onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Registration Blocked", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Email Required", variant: "destructive" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth!, email);
      toast({ title: "Reset Link Sent" });
    } catch (error: any) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="bg-[#0A0A0A] border-white/5 rounded-[32px] p-10 max-w-[400px] gap-0 shadow-2xl">
        <DialogHeader className="mb-8 text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-[16px] w-fit mb-6 border border-primary/20">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
            ATHLETE <span className="text-primary">IDENTITY</span>
          </DialogTitle>
          <p className="text-[#888] text-[11px] font-bold uppercase tracking-widest mt-2">Secure Circuit Node</p>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-[20px] p-6 mb-8 animate-in zoom-in-95 duration-200">
            <div className="text-xs font-medium">{error}</div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="mt-4 w-full text-[10px] uppercase font-black text-white/40"><RefreshCw className="h-3 w-3 mr-2" /> Retry</Button>
          </div>
        )}

        {!error && (
          <Tabs defaultValue="signin" className="space-y-8">
            <TabsList className="bg-white/5 p-1 h-12 rounded-[12px] border border-white/5 w-full">
              <TabsTrigger value="signin" className="flex-1 h-full rounded-[10px] font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 h-full rounded-[10px] font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 focus-visible:outline-none">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Combat Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 z-10" />
                    <Input type="email" placeholder="name@email.com" className="pl-12 bg-white/5 border-white/5 text-white h-12 focus:border-primary/50" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Secure Passcode</Label>
                    <button type="button" onClick={handleForgotPassword} className="text-[9px] font-black text-primary uppercase hover:underline">Forgot Signal?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 z-10" />
                    <Input type="password" placeholder="••••••••" className="pl-12 bg-white/5 border-white/5 text-white h-12 focus:border-primary/50" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-[12px] mt-4 shadow-lg shadow-primary/20">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Identity"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 focus-visible:outline-none">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Athlete Alias</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 z-10" />
                    <Input type="text" placeholder="John Doe" className="pl-12 bg-white/5 border-white/5 text-white h-12 focus:border-primary/50" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Combat Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 z-10" />
                    <Input type="email" placeholder="name@email.com" className="pl-12 bg-white/5 border-white/5 text-white h-12 focus:border-primary/50" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Secure Passcode</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 z-10" />
                    <Input type="password" placeholder="Min. 8 characters" className="pl-12 bg-white/5 border-white/5 text-white h-12 focus:border-primary/50" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-[12px] mt-4 shadow-lg shadow-primary/20">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Recruitment"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-[#0A0A0A] px-4 text-white/20">Or Instant Access</span></div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleSignIn} 
          disabled={isLoading} 
          className="w-full h-14 border-white/5 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-[12px] hover:bg-white/10 transition-colors"
        >
          <Chrome className="h-4 w-4 mr-3 text-primary" /> Identify with Google
        </Button>

        <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-10 italic">
          By continuing, you accept the Turfista Tactical Protocols.
        </p>
      </DialogContent>
    </Dialog>
  );
}

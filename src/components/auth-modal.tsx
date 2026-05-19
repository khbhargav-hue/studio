
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
import { useAuth, useUser } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  sendPasswordResetEmail
} from "firebase/auth";
import { Loader2, Mail, Lock, User, ShieldCheck, Chrome, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AuthModal({ children, open, onOpenChange }: AuthModalProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<React.ReactNode | null>(null);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) await signInWithRedirect(auth, provider);
      else await signInWithPopup(auth, provider);
      toast({ title: "Identity Verified", description: "Welcome back to the Mysuru circuit." });
      if (onOpenChange) onOpenChange(false);
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setError(
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive font-bold text-[10px] uppercase tracking-tighter">
              <AlertCircle className="h-3.5 w-3.5" /> Domain Not Authorized
            </div>
            <p className="text-[10px] leading-relaxed opacity-70">
              Please add <code className="bg-destructive/10 px-1 py-0.5 rounded text-white">{domain}</code> to your Firebase authorized domains.
            </p>
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[9px] uppercase font-black tracking-widest text-primary hover:underline"
            >
              Open Console <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        );
      } else {
        console.error("Auth error:", err);
        toast({ title: "Authentication Failed", variant: "destructive" });
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
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome Athlete", description: "Access granted to the network." });
      if (onOpenChange) onOpenChange(false);
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        setError("This domain is not authorized for authentication.");
      } else {
        toast({ title: "Invalid Credentials", description: "Check your email or passcode.", variant: "destructive" });
      }
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      toast({ title: "Squad Member Registered", description: "Your athlete profile is now active." });
      if (onOpenChange) onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Registration Blocked", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Identity Required", description: "Enter your email to receive a reset link.", variant: "destructive" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth!, email);
      toast({ title: "Reset Link Dispatched", description: "Check your inbox for recovery instructions." });
    } catch (error: any) {
      toast({ title: "Transmission Failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="bg-[#111] border-[#222] rounded-[24px] p-10 max-w-[400px] gap-0">
        <DialogHeader className="mb-10 text-center">
          <div className="mx-auto bg-[#AAFF00]/10 p-4 rounded-[12px] w-fit mb-6 border border-[#AAFF00]/20">
            <ShieldCheck className="h-8 w-8 text-[#AAFF00]" />
          </div>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
            ATHLETE <span className="text-[#AAFF00]">IDENTITY</span>
          </DialogTitle>
          <p className="text-[#888] text-[11px] font-bold uppercase tracking-widest mt-2">Secure Network Node</p>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-[12px] p-5 mb-8">
            <div className="text-xs font-medium">{error}</div>
          </div>
        )}

        <Tabs defaultValue="signin" className="space-y-8">
          <TabsList className="bg-[#1A1A1A] p-1 h-12 rounded-[10px] border border-[#222] w-full">
            <TabsTrigger value="signin" className="flex-1 h-full rounded-[8px] font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-[#AAFF00] data-[state=active]:text-black">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1 h-full rounded-[8px] font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-[#AAFF00] data-[state=active]:text-black">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-6 focus-visible:outline-none">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888] ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] z-10" />
                  <Input 
                    type="email" 
                    placeholder="name@email.com" 
                    className="pl-12" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#888]">Passcode</Label>
                  <button type="button" onClick={handleForgotPassword} className="text-[9px] font-bold text-[#AAFF00] uppercase hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] z-10" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 bg-[#AAFF00] text-black font-black uppercase tracking-widest text-xs rounded-[10px] mt-4">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Identity"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6 focus-visible:outline-none">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888] ml-1">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] z-10" />
                  <Input 
                    type="text" 
                    placeholder="John Doe" 
                    className="pl-12" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888] ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] z-10" />
                  <Input 
                    type="email" 
                    placeholder="name@email.com" 
                    className="pl-12" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888] ml-1">Secure Passcode</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] z-10" />
                  <Input 
                    type="password" 
                    placeholder="Min. 8 characters" 
                    className="pl-12" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 bg-[#AAFF00] text-black font-black uppercase tracking-widest text-xs rounded-[10px] mt-4">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#222]"></span></div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-[#111] px-4 text-[#444]">Or Instant Access</span></div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleSignIn} 
          disabled={isLoading} 
          className="w-full h-14 border-[#222] bg-[#1A1A1A] text-white font-black uppercase tracking-widest text-[10px] rounded-[10px] hover:bg-[#222] transition-colors"
        >
          <Chrome className="h-4 w-4 mr-3 text-[#AAFF00]" /> Identify with Google
        </Button>

        <p className="text-center text-[9px] font-bold text-[#444] uppercase tracking-tighter mt-10">
          By continuing, you agree to the Turfista Network Protocols.
        </p>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trophy, Loader2, LogIn, AlertCircle, ShieldCheck, ExternalLink, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'khbhargav@gmail.com';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, loading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError("Unauthorized access. Identification required.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      if (user.email === ADMIN_EMAIL) {
        router.replace("/studio");
      }
    }
  }, [user, loading, router]);

  const copyHostname = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.hostname);
      setCopied(true);
      toast({ title: "Hostname Copied", description: "Add this to your Firebase Auth settings." });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setIsLoggingIn(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        setError("Identification failed. Secure zone restricted.");
        setIsLoggingIn(false);
        return;
      }

      toast({
        title: "Identity Verified",
        description: "Welcome to the Studio command center.",
      });
      router.push("/studio");
    } catch (err: any) {
      let message: React.ReactNode = "Verification failed. Check credentials.";
      
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        message = (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive font-black text-sm uppercase tracking-tighter">
              <AlertCircle className="h-4 w-4" /> Domain Authorization Required
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              This environment (<code className="bg-destructive/20 px-1.5 py-0.5 rounded text-white">{domain}</code>) is not authorized in your Firebase Project.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-[10px] space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Resolution Protocol:</p>
              <ol className="text-[10px] list-decimal pl-4 space-y-2 uppercase tracking-tight text-white/60">
                <li>Open Firebase Console</li>
                <li>Go to Build {'->'} Authentication</li>
                <li>Settings {'->'} Authorized Domains</li>
                <li>Add: <span className="text-white font-bold">{domain}</span></li>
              </ol>
              <div className="flex flex-col gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 text-[9px] font-black uppercase tracking-widest bg-primary/10 border-primary/20 text-primary w-full"
                  onClick={copyHostname}
                >
                  {copied ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                  {copied ? "COPIED HOSTNAME" : "COPY HOSTNAME"}
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-white flex-1"
                    onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
                  >
                    Console <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 text-[9px] font-black uppercase tracking-widest text-white/40 flex-1"
                    onClick={() => setError(null)}
                  >
                    <RefreshCw className="ml-1 h-3 w-3" /> Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = "Invalid identity or passcode.";
      }

      setError(message);
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-32">
        <Card className="w-full max-w-md border-border bg-card overflow-hidden rounded-[24px]">
          <CardHeader className="space-y-1 text-center pt-8">
            <div className="mx-auto bg-primary/10 p-3 rounded-[10px] w-fit mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight uppercase italic">
              STUDIO <span className="text-primary">ACCESS</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
              Secure Administrative Node
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-[16px] p-6 animate-in fade-in duration-300">
                  <div className="text-xs font-medium">{error}</div>
                </div>
              )}
              
              {!error && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity (Email)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="khbhargav@gmail.com" 
                      className="bg-white/5 border-border h-12 focus:border-primary text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Passcode</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      className="bg-white/5 border-border h-12 focus:border-primary text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary text-black font-black text-sm uppercase tracking-widest rounded-[12px] shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5 mr-2" />}
                    VERIFY IDENTITY
                  </Button>
                </>
              )}

              {error && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setError(null)}
                  className="w-full h-14 border-border text-white font-black uppercase tracking-widest text-xs rounded-[12px]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> ABORT & RE-INITIALIZE
                </Button>
              )}
            </form>
          </CardContent>
          
          <CardFooter className="pb-8 pt-2 flex justify-center">
            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Security Protocol: Active
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

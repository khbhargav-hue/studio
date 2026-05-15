
'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trophy, Loader2, LogIn, AlertCircle, ShieldCheck, ExternalLink } from "lucide-react";
import { useAuth, useUser, useFirestore } from "@/firebase";
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
      console.error("Login error:", err);
      let message: React.ReactNode = "Verification failed. Check credentials.";
      
      if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        message = (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-danger font-bold text-sm uppercase tracking-tighter">
              <AlertCircle className="h-4 w-4" /> Domain Authorization Required
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              This domain (<code className="bg-danger/20 px-1.5 py-0.5 rounded text-white">{domain}</code>) is not authorized in your Firebase Project.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-[10px] space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Resolution Steps:</p>
              <ol className="text-[10px] list-decimal pl-4 space-y-2 uppercase tracking-tight">
                <li>Access Firebase Console</li>
                <li>Authentication {'>'} Settings {'>'} Authorized Domains</li>
                <li>Add {domain}</li>
              </ol>
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-primary hover:underline"
              >
                Open Console <ExternalLink className="h-3 w-3" />
              </a>
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
        <Card className="w-full max-w-md border-border bg-card overflow-hidden">
          <CardHeader className="space-y-1 text-center pt-8">
            <div className="mx-auto bg-primary/10 p-3 rounded-[10px] w-fit mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight uppercase">
              STUDIO ACCESS
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
              Secure Administrative Node
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-danger/5 border border-danger/20 rounded-[10px] p-5">
                  <div className="text-xs font-medium">{error}</div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="label-caps text-muted-foreground ml-1">Identity (Email)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="khbhargav@gmail.com" 
                  className="bg-subtle border-border h-12 focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="label-caps text-muted-foreground ml-1">Passcode</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="bg-subtle border-border h-12 focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5 mr-2" />}
                VERIFY IDENTITY
              </Button>
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

'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trophy, Loader2, LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'khbhargav@gmail.com';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const logActivity = async (success: boolean, userEmail: string, errorMsg?: string) => {
    if (!db) return;
    try {
      await addDoc(collection(db, "logs"), {
        type: "STUDIO_LOGIN_ATTEMPT",
        email: userEmail,
        success,
        error: errorMsg || null,
        timestamp: serverTimestamp(),
        device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      });
    } catch (e) {
      console.warn("Could not log activity:", e);
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
        await logActivity(false, email, "Unauthorized identity attempt");
        await signOut(auth);
        setError("Identification failed. Secure zone restricted.");
        setIsLoggingIn(false);
        return;
      }

      await logActivity(true, email);
      toast({
        title: "Identity Verified",
        description: "Welcome to the Studio command center.",
      });
      router.push("/studio");
    } catch (err: any) {
      console.error("Login error:", err);
      let message = "Verification failed. Check credentials.";
      
      if (err.code === 'auth/unauthorized-domain') {
        message = "Security error: This domain must be whitelisted in your Firebase Console.";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = "Invalid identity or passcode.";
      }

      await logActivity(false, email, err.code);
      setError(message);
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-32">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-20 animate-pulse" />
          
          <Card className="relative w-full glass-card border-white/10 overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            
            <CardHeader className="space-y-1 text-center pt-10">
              <div className="mx-auto bg-primary/10 p-4 rounded-2xl w-fit mb-6 border border-primary/20">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="font-headline text-3xl font-bold tracking-tighter uppercase italic">
                Studio <span className="text-primary">Access</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Identify yourself to enter the management circuit
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <AlertDescription className="text-xs font-medium leading-relaxed">{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity (Email)</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="khbhargav@gmail.com" 
                    className="bg-background/40 border-white/5 h-14 rounded-2xl focus:border-primary/50 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Passcode</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="bg-background/40 border-white/5 h-14 rounded-2xl focus:border-primary/50 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-xl hover:scale-[1.01] transition-all"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6 mr-2" />}
                  VERIFY IDENTITY
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pb-10 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                <ShieldCheck className="h-3 w-3 text-primary" />
                Security Circuit Engaged
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

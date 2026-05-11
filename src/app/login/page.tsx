
'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trophy, Loader2, LogIn, AlertCircle } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [error, setError] = useState<string | null>(null);

  // Check if an error was passed in URL (e.g. from middleware/layout)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError("Unauthorized access. Admin credentials required.");
    }
  }, [searchParams]);

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.email === ADMIN_EMAIL) {
        router.replace("/admin");
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
        setError("Unauthorized access. Admin credentials required.");
        setIsLoggingIn(false);
        return;
      }

      toast({
        title: "Access Granted",
        description: "Welcome to the Turfista command center.",
      });
      router.push("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      let message = "Failed to login. Please check your credentials.";
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = "Invalid email or password.";
      } else if (err.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      }
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
                Admin <span className="text-primary">Control</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Identify yourself to manage the pitch
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl animate-in fade-in zoom-in duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Entry Denied</AlertTitle>
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Admin Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="khbhargav@gmail.com" 
                    className="bg-background/40 border-white/5 h-14 rounded-2xl focus:border-primary/50 transition-all text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" title="Enter Password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="bg-background/40 border-white/5 h-14 rounded-2xl focus:border-primary/50 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-[0_10px_30px_-5px_rgba(26,255,115,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(26,255,115,0.5)] transition-all hover:scale-[1.01] active:scale-[0.98]"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-6 w-6" />
                  )}
                  ENTER ARENA
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pb-10 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                <div className="h-[1px] w-8 bg-white/10" />
                Security Layer Active
                <div className="h-[1px] w-8 bg-white/10" />
              </div>
              <p className="text-[10px] text-center text-muted-foreground/50 max-w-[200px] mx-auto leading-tight">
                This area is monitored. Unauthorized login attempts are logged for security.
              </p>
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

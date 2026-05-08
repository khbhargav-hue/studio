
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Trophy, Loader2, LogIn, AlertCircle } from "lucide-react"
import { useAuth, useUser } from "@/firebase"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const ADMIN_EMAIL = "admin@turfista.com"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const auth = useAuth()
  const { user, loading } = useUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      if (user.email === ADMIN_EMAIL) {
        router.push("/admin")
      } else {
        // Log out unauthorized users
        if (auth) signOut(auth)
        setError("Unauthorized access. Admin only.")
      }
    }
  }, [user, loading, router, auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return

    setIsLoggingIn(true)
    setError(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (userCredential.user.email !== ADMIN_EMAIL) {
        await signOut(auth)
        setError("Unauthorized access. Admin only.")
        setIsLoggingIn(false)
        return
      }
      toast({
        title: "Login Successful",
        description: "Welcome back to the command center.",
      })
      router.push("/admin")
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.")
      setIsLoggingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-white/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="space-y-1 text-center pt-8">
            <div className="mx-auto bg-primary/20 p-3 rounded-2xl w-fit mb-4">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl font-bold tracking-tighter">ADMIN LOGIN</CardTitle>
            <CardDescription className="text-muted-foreground">
              Turfista Command Center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@turfista.com" 
                  className="bg-background/50 border-white/10 h-12 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-background/50 border-white/10 h-12 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(26,255,115,0.3)] hover:shadow-[0_0_30px_rgba(26,255,115,0.5)] transition-all"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                Access Dashboard
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pb-8">
            <p className="text-xs text-center text-muted-foreground">
              Secure access restricted to Turfista administrators only.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

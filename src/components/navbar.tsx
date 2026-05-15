"use client"

import Link from "next/link"
import { UserCircle, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useUser, useAuth } from "@/firebase"
import { signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth"
import { useRouter } from "next/navigation"
import { TurfistaLogo } from "./brand-logo"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function Navbar() {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push("/")
      toast({ title: "Session Terminated" })
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <nav className="fixed top-0 z-50 w-full h-[64px] glass-navbar px-4 md:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/">
            <TurfistaLogo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="label-caps text-muted-foreground hover:text-primary transition-colors">Arenas</Link>
            <Link href="/teams" className="label-caps text-muted-foreground hover:text-primary transition-colors">Squads</Link>
            <Link href="/challenges" className="label-caps text-muted-foreground hover:text-primary transition-colors">Match Feed</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <Button onClick={handleGoogleSignIn} disabled={isSigningIn} className="h-10 px-6 font-bold uppercase tracking-widest text-[11px]">
              {isSigningIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Identify"}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-full border border-border overflow-hidden bg-secondary">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-full w-full p-2 text-muted-foreground" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border rounded-[10px] mt-2">
                <div className="p-3">
                  <p className="label-caps text-muted-foreground mb-1">Athlete</p>
                  <p className="font-semibold truncate text-[14px]">{user.displayName || "Active User"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">Profile Node</Link>
                </DropdownMenuItem>
                {user.email === 'khbhargav@gmail.com' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/studio">Admin Studio</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" /> Terminate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
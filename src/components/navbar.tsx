"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Menu, LogOut, ShieldCheck, MapPinned, Users, Trophy, UserCircle, Loader2 } from "lucide-react"
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
      toast({ title: "Logged Out" })
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
    <nav className="fixed top-0 z-50 w-full h-[64px] bg-background/95 backdrop-blur-[12px] border-b border-border px-4 md:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <TurfistaLogo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="label-caps text-muted hover:text-foreground">Arenas</Link>
            <Link href="/teams" className="label-caps text-muted hover:text-foreground">Squads</Link>
            <Link href="/challenges" className="label-caps text-muted hover:text-foreground">Match Feed</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <Button onClick={handleGoogleSignIn} disabled={isSigningIn} className="btn-primary h-[40px] px-6 text-xs">
              {isSigningIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIGN IN"}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-full border border-border overflow-hidden bg-surface">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-full w-full p-2 text-muted" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border rounded-xl mt-2">
                <div className="p-3">
                  <p className="label-caps text-muted mb-1">Athlete</p>
                  <p className="font-semibold truncate">{user.displayName || "User"}</p>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface">
                  <Link href="/profile">Dashboard</Link>
                </DropdownMenuItem>
                {user.email === 'khbhargav@gmail.com' && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-surface">
                    <Link href="/studio">Admin Studio</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleLogout} className="text-danger focus:text-danger cursor-pointer hover:bg-surface">
                  <LogOut className="h-4 w-4 mr-2" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <div className="md:hidden">
            <Menu className="h-6 w-6 text-muted" />
          </div>
        </div>
      </div>
    </nav>
  )
}
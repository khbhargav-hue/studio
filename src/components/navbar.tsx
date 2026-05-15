"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Bell, UserCircle, LogOut, Loader2 } from "lucide-react"
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
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Turfs", href: "/turfs" },
  { label: "Teams", href: "/teams" },
  { label: "Challenges", href: "/challenges" },
  { label: "Coaching", href: "/coaching" },
  { label: "Pools", href: "/pools" },
]

export function Navbar() {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    <>
      <nav className="fixed top-0 z-50 w-full h-[64px] glass-navbar px-4 md:px-8">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex flex-col">
              <TurfistaLogo size="sm" />
              <span className="hidden md:block text-[10px] font-bold text-muted uppercase tracking-widest -mt-1 ml-11">
                Mysuru's #1 Turf Network
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={cn(
                    "label-caps transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden md:flex h-10 w-10 items-center justify-center text-muted hover:text-primary">
              <Bell className="h-5 w-5" />
            </button>

            {!user ? (
              <Button onClick={handleGoogleSignIn} disabled={isSigningIn} className="h-10 px-6 font-bold uppercase tracking-widest text-[11px] rounded-button">
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
                <DropdownMenuContent align="end" className="w-56 bg-card border-border rounded-modal mt-2">
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

            <button 
              className="lg:hidden h-10 w-10 flex items-center justify-center text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-[64px] lg:hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col p-6 gap-2">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center h-14 px-6 rounded-card text-2xl font-bold uppercase tracking-tighter italic transition-colors",
                  pathname === link.href ? "bg-primary text-background" : "text-foreground hover:bg-surface"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            {!user && (
              <Button 
                onClick={handleGoogleSignIn} 
                disabled={isSigningIn}
                className="mt-6 h-14 text-xl font-bold uppercase tracking-widest rounded-button"
              >
                Identify with Google
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
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
      toast({ title: "Logged Out", description: "See you on the pitch soon!" })
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
      if (error.code === 'auth/unauthorized-domain') {
        toast({
          variant: "destructive",
          title: "Setup Required",
          description: "Add this domain to 'Authorized Domains' in Firebase Console (Auth > Settings).",
        });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Sign-in Failed",
          description: "Identification could not be verified. Please try again.",
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <nav className="absolute top-0 z-50 w-full px-4 py-8 md:px-12 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <TurfistaLogo size="md" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-12">
          <Link href="/" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-all">Arenas</Link>
          <Link href="/teams" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-all">Squads</Link>
          <Link href="/challenges" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-all">Match Feed</Link>
          <Link href="/mysuru" className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-all">Local Guides</Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-14 w-14 rounded-2xl border border-white/5 bg-white/5 relative overflow-hidden transition-all hover:scale-105 active:scale-95">
                {isSigningIn ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : user?.photoURL ? (
                   <img src={user.photoURL} className="h-8 w-8 rounded-lg object-cover" alt="Profile" />
                ) : (
                   <UserCircle className="h-7 w-7 text-white/40" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/95 border-white/10 w-80 rounded-[2.5rem] p-4 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] mt-6 animate-in fade-in zoom-in-95 duration-300">
              {!user ? (
                <div className="p-2 space-y-4">
                  <div className="text-center py-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">ACCESS REQUIRED</p>
                     <p className="text-xs font-medium text-white/40">Sign in to join the athlete network</p>
                  </div>
                  <Button 
                    onClick={handleGoogleSignIn} 
                    disabled={isSigningIn} 
                    className="w-full h-16 rounded-[1.5rem] bg-white/5 hover:bg-primary hover:text-black border border-white/5 font-black uppercase tracking-widest text-xs gap-3 transition-all"
                  >
                    {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserCircle className="h-6 w-6" />}
                    Identify with Google
                  </Button>
                </div>
              ) : (
                <>
                  <div className="px-4 py-8 text-center bg-white/[0.02] rounded-[1.5rem] mb-4 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">ATHLETE PROFILE</p>
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-2xl font-black italic uppercase text-primary leading-none truncate max-w-full drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">{user.displayName?.split(' ')[0] || "ATHLETE"}</p>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-2 space-y-2">
                    <DropdownMenuItem asChild className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-pointer bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition-all">
                      <Link href="/profile">Dashboard Hub</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-pointer gap-3 justify-center">
                      <LogOut className="h-4 w-4" /> End Session
                    </DropdownMenuItem>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Nav Icons */}
        <div className="md:hidden flex items-center gap-4">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 text-white bg-white/5 border border-white/10 rounded-2xl transition-all active:scale-90">
                <Menu className="h-7 w-7" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-black/98 border-white/10 rounded-[3rem] p-4 mt-6 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300">
              <div className="p-4 space-y-3">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-6 text-center">PLATFORM MENU</p>
                 {[
                   { label: "Mysuru Guides", href: "/mysuru" },
                   { label: "Elite Discovery", href: "/featured" },
                   { label: "Arena Partnership", href: "/partner" },
                   { label: "Support & Help", href: "/contact" }
                 ].map((link) => (
                   <DropdownMenuItem key={link.href} asChild className="h-16 rounded-[1.5rem] font-black italic uppercase tracking-widest text-xs text-white/60 hover:text-primary hover:bg-primary/5 transition-all">
                     <Link href={link.href}>{link.label}</Link>
                   </DropdownMenuItem>
                 ))}
                 <DropdownMenuSeparator className="bg-white/5 my-4" />
                 {!user && (
                   <Button 
                    onClick={handleGoogleSignIn} 
                    disabled={isSigningIn}
                    className="w-full h-18 rounded-[2rem] bg-primary text-black font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                   >
                     {isSigningIn ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <UserCircle className="h-5 w-5 mr-3" />}
                     Connect Google
                   </Button>
                 )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

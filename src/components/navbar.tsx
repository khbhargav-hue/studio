
"use client"

import Link from "next/link"
import { User, Menu, LogOut, ShieldCheck, MapPinned, Users, Trophy, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useUser, useAuth } from "@/firebase"
import { signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useRouter } from "next/navigation"
import { TurfistaLogo } from "./brand-logo"
import { useToast } from "@/hooks/use-toast"

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'khbhargav@gmail.com';

export function Navbar() {
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push("/")
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast({
          variant: "destructive",
          title: "Domain Not Authorized",
          description: "This domain is not authorized for Firebase Auth. Please add it to your Authorized Domains in the Firebase Console.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sign-in Failed",
          description: error.message || "An unexpected error occurred during sign-in.",
        });
      }
    }
  }

  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <nav className="absolute top-0 z-50 w-full px-4 py-6 md:px-12 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <TurfistaLogo size="md" />
        </Link>

        {/* Desktop Links - Secondary priority on mobile */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-all">Find Turfs</Link>
          <Link href="/teams" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-all">Teams</Link>
          <Link href="/challenges" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-all">Challenges</Link>
          <Link href="/mysuru" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-all">Mysuru Guide</Link>
          
          {isAdmin && (
            <Link href="/admin" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:opacity-80 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 transition-all">Admin Portal</Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-12 w-12 rounded-2xl border border-white/5 bg-white/5">
                {user?.photoURL ? (
                   <img src={user.photoURL} className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                   <UserCircle className="h-6 w-6" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/95 border-white/10 w-72 rounded-[2rem] p-3 backdrop-blur-2xl shadow-2xl mt-4">
              {!user ? (
                <div className="p-2 space-y-3">
                  <DropdownMenuItem onClick={handleGoogleSignIn} className="rounded-2xl h-14 focus:bg-primary focus:text-black font-black uppercase tracking-widest text-[10px] cursor-pointer flex items-center justify-center gap-3 bg-white/5 border border-white/5">
                    <UserCircle className="h-5 w-5" /> Sign in with Google
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="rounded-2xl h-12 focus:bg-white/10 font-bold text-[10px] uppercase tracking-widest cursor-pointer flex justify-center">
                    <Link href="/login">Admin Control</Link>
                  </DropdownMenuItem>
                </div>
              ) : (
                <>
                  <div className="px-4 py-6 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Athletic Identity</p>
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-lg font-black italic uppercase text-primary leading-none">{user.displayName?.split(' ')[0] || user.email}</p>
                      {isAdmin && (
                         <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                            <ShieldCheck className="h-3 w-3 text-primary" />
                            <span className="text-[8px] font-black text-primary uppercase">Platform Admin</span>
                         </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10 mx-2" />
                  <div className="p-2 space-y-1">
                    <DropdownMenuItem asChild className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] cursor-pointer">
                      <Link href="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] cursor-pointer">
                      <LogOut className="mr-3 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Header Icons */}
        <div className="md:hidden flex items-center gap-4">
           {isAdmin && (
              <Link href="/admin" className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                 <ShieldCheck className="h-5 w-5" />
              </Link>
           )}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-white bg-white/5 border border-white/10 rounded-xl">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-black/95 border-white/10 rounded-[2.5rem] p-3 mt-4 backdrop-blur-2xl shadow-2xl">
              <div className="p-4 space-y-2">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 text-center">PLATFORM LINKS</p>
                 <DropdownMenuItem asChild className="h-14 rounded-2xl font-black italic uppercase tracking-widest text-xs text-white/60">
                   <Link href="/mysuru">Mysuru Guide</Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild className="h-14 rounded-2xl font-black italic uppercase tracking-widest text-xs text-white/60">
                   <Link href="/about">About Platform</Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild className="h-14 rounded-2xl font-black italic uppercase tracking-widest text-xs text-white/60">
                   <Link href="/contact">Support & Contact</Link>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator className="bg-white/5" />
                 <DropdownMenuItem asChild className="h-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] text-white/30">
                   <Link href="/privacy">Privacy Policy</Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild className="h-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-[9px] text-white/30">
                   <Link href="/terms">Terms of Service</Link>
                 </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Bell, UserCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { TurfistaLogo } from "./brand-logo"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AuthModal } from "./auth-modal"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Turfs", href: "/#listings" },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push("/")
      toast({ title: "Session Terminated" })
    }
  }

  return (
    <>
      <nav className="fixed top-0 z-50 w-full h-[64px] glass-navbar px-4 md:px-8 bg-[#0A0A0A]/95 backdrop-blur-[12px] border-b border-[#222]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-4">
              <TurfistaLogo size="sm" />
              <span className="hidden md:block text-[10px] font-bold text-[#888] uppercase tracking-widest leading-none border-l border-[#222] pl-4">
                Mysuru's #1 <br />Turf Network
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-[#AAFF00]",
                    pathname === link.href ? "text-[#AAFF00]" : "text-[#888]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="h-10 w-10 flex items-center justify-center text-[#888] hover:text-[#AAFF00]">
              <Bell className="h-5 w-5" />
            </button>

            {!user ? (
              <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen}>
                <Button 
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden md:flex h-10 px-6 font-black uppercase tracking-widest text-[11px] rounded-[10px] bg-[#AAFF00] text-black"
                >
                  Identify
                </Button>
              </AuthModal>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-full border border-[#222] overflow-hidden bg-[#1A1A1A]">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle className="h-full w-full p-2 text-[#888]" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#111] border-[#222] rounded-[24px] mt-2 p-2">
                  <div className="p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#888] mb-1">Athlete</p>
                    <p className="font-bold truncate text-[14px] text-white uppercase italic">{user.displayName || "Active User"}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-[#222]" />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-[8px] focus:bg-[#1A1A1A] focus:text-[#AAFF00]">
                    <Link href="/profile" className="w-full flex items-center font-bold uppercase text-[10px] tracking-widest py-3 px-2">Profile Node</Link>
                  </DropdownMenuItem>
                  {user.email === 'khbhargav@gmail.com' && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-[8px] focus:bg-[#1A1A1A] focus:text-[#AAFF00]">
                      <Link href="/studio" className="w-full flex items-center font-bold uppercase text-[10px] tracking-widest py-3 px-2">Admin Studio</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#222]" />
                  <DropdownMenuItem onClick={handleLogout} className="text-[#FF4444] focus:text-[#FF4444] cursor-pointer rounded-[8px] focus:bg-[#FF4444]/10">
                    <div className="w-full flex items-center font-bold uppercase text-[10px] tracking-widest py-3 px-2">
                      <LogOut className="h-4 w-4 mr-2" /> Terminate
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <button 
              className="lg:hidden h-10 w-10 flex items-center justify-center text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0A0A0A] pt-[64px] lg:hidden animate-in fade-in slide-in-from-top duration-200">
          <div className="flex flex-col p-6 gap-2 h-full overflow-y-auto pb-20">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.label} 
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center min-h-[56px] px-6 rounded-[16px] text-2xl font-black uppercase tracking-tighter italic transition-colors",
                  pathname === link.href ? "bg-[#AAFF00] text-black" : "text-white active:bg-[#1A1A1A]"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="mt-8 pt-8 border-t border-[#222] space-y-4">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#888] px-6 mb-4">Identity Hub</p>
               {!user ? (
                 <Button 
                   onClick={() => {
                     setIsMenuOpen(false);
                     setIsAuthOpen(true);
                   }}
                   className="h-16 w-full text-xl font-black uppercase tracking-widest rounded-[16px] bg-[#AAFF00] text-black"
                 >
                   Verify Athlete
                 </Button>
               ) : (
                 <Button 
                   onClick={() => {
                     setIsMenuOpen(false);
                     router.push("/profile");
                   }}
                   variant="outline"
                   className="h-16 w-full text-xl font-black uppercase tracking-widest rounded-[16px] border-[#222]"
                 >
                   My Profile
                 </Button>
               )}
            </div>

            <div className="mt-auto p-6 text-center">
               <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest">© 2026 Turfista Network · Mysuru 🟢</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
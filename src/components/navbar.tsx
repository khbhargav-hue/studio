"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, UserCircle, Search, Bell } from "lucide-react"
import { useUser } from "@/firebase"
import { TurfistaLogo } from "./brand-logo"
import { cn } from "@/lib/utils"

const LINKS = [
  { label: "Feed", href: "/" },
  { label: "Players", href: "/players" },
  { label: "Arenas", href: "/arenas" },
  { label: "Matches", href: "/matches" },
  { label: "Rankings", href: "/leaderboard" },
]

export function Navbar() {
  const { user } = useUser()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full h-[72px] bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <TurfistaLogo size="sm" />
        </Link>
        
        <div className="hidden lg:flex items-center gap-6">
          {LINKS.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary",
                pathname === link.href ? "text-primary bg-primary/5 px-4 py-2 rounded-full" : "text-white/40"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="h-10 w-10 flex items-center justify-center text-white/40 hover:text-primary transition-colors relative">
            <Bell className="h-5 w-5" />
            <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background" />
          </button>
          
          <Link href="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 group">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white uppercase italic group-hover:text-primary transition-colors">{user?.displayName?.split(' ')[0] || "Guest"}</p>
              <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest">Athlete Node</p>
            </div>
            {user?.photoURL ? (
              <div className="relative">
                <img src={user.photoURL} alt={user.displayName || "User"} className="h-9 w-9 rounded-full border border-white/10 p-0.5" />
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/20 border border-white/5">
                <UserCircle className="h-6 w-6" />
              </div>
            )}
          </Link>
          <button className="lg:hidden text-white ml-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 top-[72px] bg-background/95 backdrop-blur-2xl z-[100] p-8 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <Link 
                key={link.label} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-5xl font-black uppercase tracking-tighter italic transition-all py-4",
                  pathname === link.href ? "text-primary" : "text-white/20 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, UserCircle } from "lucide-react"
import { useUser } from "@/firebase"
import { TurfistaLogo } from "./brand-logo"
import { cn } from "@/lib/utils"

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Turfs", href: "/#turfs" },
  { label: "Teams", href: "/teams" },
  { label: "Challenges", href: "/challenges" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Coaches", href: "/coaching" },
]

export function Navbar() {
  const { user } = useUser()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full h-[64px] bg-background/95 backdrop-blur-md border-b border-border px-4 md:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <TurfistaLogo size="sm" />
        </Link>
        
        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em] transition-colors",
                pathname === link.href ? "text-primary" : "text-[#888] hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/profile" className="h-10 w-10 flex items-center justify-center text-[#888] hover:text-primary">
            {user ? (
              <img src={user.photoURL || ""} alt="" className="h-7 w-7 rounded-full border border-border" />
            ) : (
              <UserCircle className="h-6 w-6" />
            )}
          </Link>
          <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 top-[64px] bg-background z-[100] p-6 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link 
                key={link.label} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-4xl font-black uppercase tracking-tighter italic text-white py-4 border-b border-white/5"
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

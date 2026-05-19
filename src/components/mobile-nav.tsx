"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MapPinned, Users, Trophy, UserCircle, Swords } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: MapPinned, label: "Turfs", href: "/#turfs" },
  { icon: Users, label: "Teams", href: "/teams" },
  { icon: Swords, label: "Match", href: "/challenges" },
  { icon: UserCircle, label: "Me", href: "/profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/5 pb-6 pt-3 px-4">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 flex-1",
              pathname === item.href ? "text-primary" : "text-[#444]"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

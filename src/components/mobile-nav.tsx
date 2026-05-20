
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Database, Swords, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  { icon: Home, label: "Feed", href: "/" },
  { icon: Users, label: "Players", href: "/players" },
  { icon: Database, label: "Arenas", href: "/arenas" },
  { icon: Swords, label: "Matches", href: "/matches" },
  { icon: UserCircle, label: "Me", href: "/profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-8 pt-4 px-6">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 flex-1 transition-all duration-300",
              pathname === item.href ? "text-primary scale-110" : "text-white/20"
            )}
          >
            <item.icon className={cn("h-6 w-6", pathname === item.href && "fill-current")} />
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

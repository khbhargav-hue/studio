
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinned, Users, Trophy, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Turfs", icon: MapPinned, href: "/" },
  { label: "Teams", icon: Users, href: "/teams" },
  { label: "Challenges", icon: Trophy, href: "/challenges" },
  { label: "Profile", icon: UserCircle, href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4">
      <div className="mx-auto flex h-20 items-center justify-around rounded-[2.5rem] bg-black/80 border border-white/5 backdrop-blur-2xl px-4 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 group"
            >
              <div className={cn(
                "relative p-2 rounded-2xl transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-white/40 group-hover:text-white/60"
              )}>
                <item.icon className="h-6 w-6" />
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-colors",
                isActive ? "text-primary" : "text-white/20"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

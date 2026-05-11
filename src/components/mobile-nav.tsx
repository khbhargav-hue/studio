
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinned, Users, Trophy, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Turfs", icon: MapPinned, href: "/" },
  { label: "Teams", icon: Users, href: "/teams" },
  { label: "Challenges", icon: Trophy, href: "/challenges" },
  { label: "Profile", icon: UserCircle, href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none">
      <div className="mx-auto flex h-20 items-center justify-around rounded-[2.5rem] bg-black/80 border border-white/5 backdrop-blur-2xl px-4 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 group flex-1 h-full"
            >
              <div className={cn(
                "relative p-2 rounded-2xl transition-all duration-500",
                isActive ? "text-primary scale-110" : "text-white/30 group-active:scale-90"
              )}>
                <item.icon className="h-6 w-6 relative z-10" />
                
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-primary/10 blur-md rounded-full"
                    />
                  )}
                </AnimatePresence>
                
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(57,255,20,1)]"
                  />
                )}
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
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

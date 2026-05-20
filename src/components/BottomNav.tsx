'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PostModal } from "./PostModal";

export function BottomNav() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (pathname.startsWith('/studio') || pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: "Feed", href: "/", icon: "🏠" },
    { label: "Turfs", href: "/turfs", icon: "⚽" },
    { label: "Post", href: "#", icon: "➕" },
    { label: "Players", href: "/players", icon: "👥" },
    { label: "Me", href: "/me", icon: "👤" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-[#111111] border-t border-[#222222] flex justify-around items-center z-[100] px-2">
        {/* Feed Tab */}
        <Link href={navItems[0].href} className={cn("flex flex-col items-center gap-1 transition-colors", pathname === navItems[0].href ? "text-[#AAFF00]" : "text-[#888888]")}>
          <span className="text-[20px]">{navItems[0].icon}</span>
          <span className="text-[11px] font-black uppercase tracking-widest">{navItems[0].label}</span>
        </Link>
        
        {/* Turfs Tab */}
        <Link href={navItems[1].href} className={cn("flex flex-col items-center gap-1 transition-colors", pathname === navItems[1].href ? "text-[#AAFF00]" : "text-[#888888]")}>
          <span className="text-[20px]">{navItems[1].icon}</span>
          <span className="text-[11px] font-black uppercase tracking-widest">{navItems[1].label}</span>
        </Link>

        {/* Center Post Button */}
        <div className="relative -top-4 flex flex-col items-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-[48px] h-[48px] rounded-full bg-[#AAFF00] text-[#0A0A0A] text-[24px] flex items-center justify-center shadow-lg shadow-[#AAFF00]/20 active:scale-95 transition-transform"
          >
            ➕
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#888888] mt-1">Post</span>
        </div>

        {/* Players Tab */}
        <Link href={navItems[3].href} className={cn("flex flex-col items-center gap-1 transition-colors", pathname === navItems[3].href ? "text-[#AAFF00]" : "text-[#888888]")}>
          <span className="text-[20px]">{navItems[3].icon}</span>
          <span className="text-[11px] font-black uppercase tracking-widest">{navItems[3].label}</span>
        </Link>
        
        {/* Me Tab */}
        <Link href={navItems[4].href} className={cn("flex flex-col items-center gap-1 transition-colors", pathname === navItems[4].href ? "text-[#AAFF00]" : "text-[#888888]")}>
          <span className="text-[20px]">{navItems[4].icon}</span>
          <span className="text-[11px] font-black uppercase tracking-widest">{navItems[4].label}</span>
        </Link>
      </nav>

      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

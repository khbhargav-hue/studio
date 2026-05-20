'use client';

import Link from "next/link";
import { Bell, UserCircle } from "lucide-react";
import { useUser } from "@/firebase";
import { AuthModal } from "./auth-modal";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, loading } = useUser();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <header className="sticky top-0 z-[99] h-[56px] w-full bg-[#0A0A0A]/95 border-b border-[#222222] backdrop-blur-[10px] px-4 flex justify-between items-center">
      {/* Left: Brand Node */}
      <Link href="/" className="flex flex-col -gap-1 group">
        <span className="text-[18px] font-[700] text-[#AAFF00] tracking-tighter uppercase italic">
          TURFISTA
        </span>
        <span className="text-[11px] font-[500] text-[#888888] uppercase tracking-widest leading-none">
          Mysuru
        </span>
      </Link>

      {/* Right: Interaction Node */}
      <div className="flex items-center gap-4">
        <button className="h-10 w-10 flex items-center justify-center text-[#888888] hover:text-[#AAFF00] transition-colors relative">
          <Bell className="h-5 w-5" />
          <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-[#AAFF00] rounded-full border border-[#0A0A0A]" />
        </button>

        {loading ? (
          <div className="h-8 w-8 rounded-full bg-[#111111] animate-pulse border border-[#222222]" />
        ) : user ? (
          <Link href="/me" className="h-8 w-8 rounded-full border border-[#AAFF00]/20 p-0.5 overflow-hidden group hover:border-[#AAFF00] transition-all">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "Athlete"} className="h-full w-full object-cover rounded-full" />
            ) : (
              <UserCircle className="h-full w-full text-[#888888]" />
            )}
          </Link>
        ) : (
          <button 
            onClick={() => setShowAuth(true)}
            className="text-[12px] font-black text-[#AAFF00] uppercase tracking-widest px-4 py-2 rounded-lg border border-[#AAFF00]/20 hover:bg-[#AAFF00]/10 transition-all"
          >
            Login
          </button>
        )}
      </div>

      <AuthModal open={showAuth} onOpenChange={setShowAuth} />
    </header>
  );
}

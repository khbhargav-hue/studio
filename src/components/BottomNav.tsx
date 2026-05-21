
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { PostModal } from "./PostModal";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const db = useFirestore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (pathname.startsWith('/studio') || pathname.startsWith('/admin')) {
    return null;
  }

  const convosQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );
  }, [db, user]);

  const { data: convos } = useCollection(convosQuery);

  const totalUnread = useMemo(() => {
    if (!convos || !user) return 0;
    return convos.reduce((acc, convo: any) => acc + (convo.unreadCount?.[user.uid] || 0), 0);
  }, [convos, user]);

  const navItems = [
    { label: "Feed", href: "/", icon: "🏠" },
    { label: "Turfs", href: "/turfs", icon: "⚽" },
    { label: "Post", href: "#", icon: "➕" },
    { label: "Signals", href: "/messages", icon: "⚡", badge: totalUnread },
    { label: "Me", href: "/profile", icon: "👤" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-[#111111] border-t border-[#222222] flex justify-around items-center z-[100] px-2">
        {navItems.map((item, idx) => {
          if (idx === 2) return (
            <div key="post-btn" className="relative -top-4 flex flex-col items-center">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-[48px] h-[48px] rounded-full bg-[#AAFF00] text-[#0A0A0A] text-[24px] flex items-center justify-center shadow-lg shadow-[#AAFF00]/20 active:scale-95 transition-transform"
              >
                ➕
              </button>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#888888] mt-1">Post</span>
            </div>
          );

          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.label} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center gap-1 transition-colors relative", 
                isActive ? "text-[#AAFF00]" : "text-[#888888]"
              )}
            >
              <span className="text-[20px]">{item.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <div className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#111] animate-in zoom-in duration-300">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

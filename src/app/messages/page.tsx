
'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { MessageSquare, UserCircle, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { SkeletonCard } from "@/components/Skeleton";

export default function ConversationsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const convosQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc"),
      limit(20)
    );
  }, [db, user]);

  const { data: convos, loading } = useCollection(convosQuery);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 max-w-lg mx-auto w-full px-4">
        <header className="mb-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <MessageSquare className="h-3 w-3" /> DIRECT SIGNALS
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">
            Tactical <span className="text-primary">Links.</span>
          </h1>
        </header>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : convos && convos.length > 0 ? (
          <div className="space-y-3">
            {convos.map((convo: any) => {
              const otherUid = convo.participants.find((id: string) => id !== user?.uid);
              const otherName = convo.participantNames?.[otherUid] || "Athlete Node";
              const otherPhoto = convo.participantPhotos?.[otherUid];
              const unread = convo.unreadCount?.[user?.uid || ""] || 0;
              const time = convo.lastMessageTime?.seconds 
                ? formatDistanceToNow(new Date(convo.lastMessageTime.seconds * 1000)) + " ago" 
                : "Recently";

              return (
                <Link 
                  key={convo.id} 
                  href={`/messages/${convo.id}`}
                  className="block bg-[#111] border border-[#222] rounded-xl p-4 hover:border-primary/40 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="h-12 w-12 rounded-full bg-[#1A1A1A] border border-[#222] overflow-hidden flex items-center justify-center p-0.5">
                        {otherPhoto ? (
                          <img src={otherPhoto} alt={otherName} className="h-full w-full object-cover rounded-full" />
                        ) : (
                          <UserCircle className="h-8 w-8 text-white/10" />
                        )}
                      </div>
                      {unread > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#111]">
                          {unread}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-sm font-black uppercase italic text-white truncate group-hover:text-primary transition-colors">
                          {otherName}
                        </h3>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{time}</span>
                      </div>
                      <p className={cn(
                        "text-[13px] truncate italic",
                        unread > 0 ? "text-white font-bold" : "text-[#888] font-medium"
                      )}>
                        {convo.lastMessage}
                      </p>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center border border-dashed border-[#222] rounded-2xl bg-[#111]/30">
            <Zap className="h-12 w-12 text-white/5 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase italic text-white/10">No active links</h3>
            <p className="text-white/20 text-xs mt-2 italic">Respond to a match signal to initiate a direct link.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

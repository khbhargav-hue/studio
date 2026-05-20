
'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Trophy, Medal, Star, UserCircle, Loader2, Activity } from "lucide-react";
import { calculateLevel } from "@/lib/rewards";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const db = useFirestore();

  const leadersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("rewardPoints", "desc"), limit(50));
  }, [db]);

  const { data: leaders, loading } = useCollection(leadersQuery);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-2xl mx-auto w-full px-4">
        <header className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <Activity className="h-3 w-3" /> MYSURU ELITE CIRCUIT
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
            Network <span className="text-primary">Legends</span>
          </h1>
          <p className="text-white/40 text-lg font-medium italic">
            The most reliable and active athletes in the circuit.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Syncing Rankings...</p>
          </div>
        ) : leaders && leaders.length > 0 ? (
          <div className="space-y-3">
            {leaders.map((leader: any, idx) => {
              const level = calculateLevel(leader.rewardPoints || 0);
              const isTopThree = idx < 3;
              
              return (
                <div 
                  key={leader.id} 
                  className={cn(
                    "flex items-center justify-between p-6 bg-card border border-white/5 rounded-2xl transition-all hover:border-primary/40 group",
                    isTopThree && "border-primary/20 bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-8 text-center flex items-center justify-center">
                      {idx === 0 ? <Medal className="h-8 w-8 text-yellow-500" /> : 
                       idx === 1 ? <Medal className="h-7 w-7 text-gray-400" /> : 
                       idx === 2 ? <Medal className="h-6 w-6 text-amber-600" /> : 
                       <span className="text-lg font-black italic text-white/20 group-hover:text-primary transition-colors">#{idx + 1}</span>}
                    </div>

                    <div className="h-12 w-12 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                      {leader.photoURL ? (
                        <img src={leader.photoURL} alt={leader.displayName} className="h-full w-full object-cover" />
                      ) : (
                        <UserCircle className="h-6 w-6 text-white/10" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-black uppercase italic tracking-tighter text-white truncate max-w-[120px] md:max-w-none">
                        {leader.displayName || "Athlete Node"}
                      </h3>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest", level.color)}>
                        {level.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Star className="h-4 w-4 text-primary fill-current" />
                      <span className="text-2xl font-black italic text-white leading-none">
                        {leader.rewardPoints || 0}
                      </span>
                    </div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Turf Coins</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
            <Star className="h-12 w-12 text-white/5 mx-auto mb-4" />
            <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">No activity logs detected.</p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

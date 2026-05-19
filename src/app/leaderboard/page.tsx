
'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Trophy, Medal, Star, UserCircle, Loader2 } from "lucide-react";
import { calculateLevel } from "@/lib/rewards";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const db = useFirestore();

  const leadersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("rewardPoints", "desc"), limit(20));
  }, [db]);

  const { data: leaders, loading } = useCollection(leadersQuery);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-4xl mx-auto w-full px-4">
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <Trophy className="h-3 w-3" /> MYSURU ELITE RANKINGS
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            Circuit <span className="text-primary text-neon">Legends</span>
          </h1>
          <p className="text-muted text-lg font-medium italic">
            The most active athletes in the Mysuru sports network.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Fetching Rankings...</p>
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
                    "flex items-center justify-between p-6 bg-card border border-border rounded-[16px] transition-all hover:border-primary/40 group",
                    isTopThree && "border-primary/20 bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 text-center flex items-center justify-center">
                      {idx === 0 ? <Medal className="h-8 w-8 text-yellow-500" /> : 
                       idx === 1 ? <Medal className="h-7 w-7 text-gray-400" /> : 
                       idx === 2 ? <Medal className="h-6 w-6 text-amber-600" /> : 
                       <span className="text-xl font-black italic text-muted group-hover:text-primary transition-colors">#{idx + 1}</span>}
                    </div>

                    <div className="h-12 w-12 rounded-full overflow-hidden border border-border bg-surface flex items-center justify-center">
                      {leader.photoURL ? (
                        <img src={leader.photoURL} alt={leader.displayName} className="h-full w-full object-cover" />
                      ) : (
                        <UserCircle className="h-6 w-6 text-muted" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-black uppercase italic tracking-tighter text-white truncate max-w-[150px] md:max-w-none">
                        {leader.displayName || "Unknown Athlete"}
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
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1">Turf Coins</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-border rounded-[24px]">
            <Star className="h-12 w-12 text-white/5 mx-auto mb-4" />
            <p className="text-muted font-bold uppercase tracking-widest text-[10px]">Circuit is fresh. No legends recorded yet.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

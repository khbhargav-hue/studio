'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { PoolCard } from "@/components/pool-card";
import { Waves, Zap } from "lucide-react";
import { SkeletonCard } from "@/components/Skeleton";

export default function PoolsPage() {
  const db = useFirestore();

  const poolsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "pools"), orderBy("rating", "desc"));
  }, [db]);

  const { data: pools, loading } = useCollection(poolsQuery);

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] selection:bg-[#AAFF00] selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-[#AAFF00]">SWIMMING</div>
            <h1 className="text-4xl md:text-6xl font-[800] tracking-tighter uppercase italic leading-none text-white">
              Top Pools <br />in <span className="text-[#AAFF00]">Mysuru</span>
            </h1>
            <p className="text-[#888888] max-w-xl text-lg font-medium italic">
              Find the perfect lap. Olympic pools, private academies, and eco-friendly swimming centers in Mysuru.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : pools && pools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pools.map((pool) => (
              <PoolCard key={pool.id} pool={pool as any} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-[#222222] rounded-[24px] max-w-2xl mx-auto">
            <Waves className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic text-white/10 tracking-widest">No Pools Logged</h3>
            <p className="text-white/20 font-medium italic mt-2">The aquatic circuit is currently updating. Check back soon for Mysuru pool listings.</p>
          </div>
        )}
        
        {!loading && pools && pools.length > 0 && (
          <div className="mt-20 p-8 rounded-[16px] bg-[#111111] border border-[#222222] flex flex-col md:flex-row items-center gap-6">
            <div className="h-14 w-14 rounded-[12px] bg-[#AAFF00]/10 flex items-center justify-center border border-[#AAFF00]/20">
              <Zap className="h-6 w-6 text-[#AAFF00]" />
            </div>
            <div>
              <h4 className="text-lg font-bold uppercase italic text-white mb-1">Swimmer Intelligence</h4>
              <p className="text-sm text-[#888888] italic">Most pools in Mysuru require a swim cap and proper nylon swimwear. Use the WhatsApp node to confirm specific club rules before your session.</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

"use client"

import { useState, useEffect, useMemo } from 'react';
import { Footer } from '@/components/footer';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/Skeleton';
import { TurfCard } from '@/components/turf-card';

const FILTERS = ["All", "Football", "Cricket", "Pickleball", "Swimming", "Badminton"];

export default function TurfsPage() {
  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    getDocs(collection(db, "turfs"))
      .then(snap => {
        console.log("Turfs found:", snap.size);
        setTurfs(snap.docs.map(d => ({ 
          id: d.id, ...d.data() 
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredTurfs = useMemo(() => {
    if (activeFilter.toLowerCase() === "all") return turfs;
    return turfs.filter(t => 
      JSON.stringify(t).toLowerCase()
        .includes(activeFilter.toLowerCase())
    );
  }, [turfs, activeFilter]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] selection:bg-primary selection:text-black">
      <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full pb-20">
        <header className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-2">ARENA REGISTRY</div>
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
                MYSURU <br /><span className="text-primary">CIRCUIT</span>
              </h1>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "h-10 px-6 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all shrink-0 active:scale-95",
                  activeFilter === f 
                    ? "bg-primary text-black border-primary" 
                    : "bg-white/5 border-white/10 text-white/40 hover:border-primary/40"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
            {filteredTurfs.map(turf => (
              <TurfCard key={turf.id} turf={turf} />
            ))}
          </div>
        )}

        {!loading && filteredTurfs.length === 0 && (
          <div className="py-40 text-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
            <p className="text-white/20 font-black uppercase tracking-[0.4em] italic text-sm">No arenas identified in this discipline.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

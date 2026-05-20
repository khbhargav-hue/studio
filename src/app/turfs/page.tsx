
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useFirestore } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import { Star, MessageCircle, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const FILTERS = ["All", "Football", "Cricket", "Pickleball", "Swimming"];

export default function TurfsPage() {
  const db = useFirestore();
  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    if (!db) return;
    // Direct fetch protocol as requested
    getDocs(collection(db, "turfs")).then(snap => {
      setTurfs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }).catch(err => {
      console.error("DATA_FETCH_FAIL", err);
      setLoading(false);
    });
  }, [db]);

  // Client-side filtration for high performance
  const filteredTurfs = useMemo(() => {
    if (activeFilter === "All") return turfs;
    return turfs.filter(t => t.sports && Array.isArray(t.sports) && t.sports.includes(activeFilter));
  }, [turfs, activeFilter]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <header className="mb-16 space-y-8">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-4">ARENA HUB</div>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white">
              MYSURU <br /><span className="text-primary text-neon">TURFS</span>
            </h1>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 active:scale-95",
                  activeFilter === f 
                    ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(170,255,0,0.2)]" 
                    : "bg-white/5 border-white/10 text-white/40 hover:border-primary/40 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Synchronizing Arenas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredTurfs.map(turf => (
              <div key={turf.id} className="group bg-card border border-white/5 rounded-[2rem] overflow-hidden flex flex-col hover:border-primary/30 transition-all duration-300 shadow-2xl shadow-black">
                <div className="relative aspect-[16/10] w-full bg-black/40">
                  <Image
                    src={turf.imageUrl || "https://picsum.photos/seed/turf/800/500"}
                    alt={turf.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    data-ai-hint="sports arena"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-black text-[8px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest shadow-lg">
                    VERIFIED
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10">
                    <Star className="h-3.5 w-3.5 text-primary fill-current" />
                    <span className="text-[13px] font-black text-white">{turf.rating || 4.8}</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors leading-tight">
                        {turf.name}
                      </h3>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold text-white/40 uppercase tracking-widest mt-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {turf.area}, Mysuru
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-primary italic leading-none">
                        {turf.price || "₹900"}
                      </p>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1.5">PER HOUR</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-10">
                    {turf.sports?.map((s: string) => (
                      <Badge key={s} variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest rounded-lg px-3 py-1 text-white/60">
                        {s}
                      </Badge>
                    ))}
                  </div>

                  <Button asChild className="mt-auto h-16 bg-primary text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10">
                    <a href={`https://wa.me/${turf.whatsapp}?text=Hi! I found ${turf.name} on Turfista and want to ask availability.`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5 mr-3" /> Book via WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredTurfs.length === 0 && (
          <div className="py-40 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <p className="text-white/20 font-black uppercase tracking-[0.4em] italic text-sm">No arenas identified in this discipline.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

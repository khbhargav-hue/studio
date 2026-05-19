
'use client';

import { useMemo, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TurfCard } from "@/components/turf-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { Loader2, Star, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturedPage() {
  const db = useFirestore();
  
  // Broadened query to ensure data visibility
  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "turfs"), limit(20));
  }, [db]);

  const { data: rawTurfs, loading } = useCollection(rawTurfs => {
    if (rawTurfs) {
      console.log("FETCH_SUCCESS: featured", rawTurfs.length);
    }
  }, featuredQuery);

  // Filter for 'isPremium' or 'featured' on the client side
  const turfs = useMemo(() => {
    if (!rawTurfs) return [];
    return rawTurfs.filter((t: any) => t.isPremium === true || t.featured === true || t.isPopular === true);
  }, [rawTurfs]);

  // If no "featured" fields found, show the last 4 added turfs as a fallback
  const displayTurfs = turfs.length > 0 ? turfs : (rawTurfs?.slice(0, 4) || []);

  // Audit Fetch for Console Debugging
  useEffect(() => {
    async function runAudit() {
      if (!db) return;
      console.log("FETCH_START: featured");
      try {
        const snapshot = await getDocs(collection(db, "turfs"));
        console.log("FETCH_SUCCESS: featured snapshot", snapshot.docs.length);
      } catch (err) {
        console.error("FETCH_ERROR: featured", err);
      }
    }
    runAudit();
  }, [db]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-44 pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <div className="inline-flex items-center gap-2 mb-8 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.5em] px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.1)]">
              <Star className="h-3 w-3 fill-current animate-pulse" />
              ELITE DISCOVERY
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-white mb-10">
              Featured <span className="text-primary text-neon">Arenas</span>
            </h1>
            <p className="text-xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">
              Experience Mysuru's most prestigious sporting surfaces. Committed to the cloud for permanent discovery.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Fetching Elite Intel...</p>
            </div>
          ) : displayTurfs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {displayTurfs.map((turf, idx) => (
                <motion.div
                  key={turf.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <TurfCard turf={turf as any} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card rounded-[5rem] border-dashed border-white/10 max-w-3xl mx-auto flex flex-col items-center gap-8">
              <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-white/10" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white/10 uppercase italic tracking-widest mb-4">No turfs yet</h3>
                <p className="text-white/20 font-medium max-w-xs mx-auto">The circuit is currently empty. Deployment of new arena nodes is pending.</p>
              </div>
            </div>
          )}

          {!loading && displayTurfs.length > 0 && (
            <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-white/5 pt-20">
              {[
                { icon: Zap, title: "Elite Surfaces", desc: "Professional-grade turf designed for maximum joint protection and grip." },
                { icon: Star, title: "Night Performance", desc: "Tournament-standard LED floodlights for crystal-clear night matches." },
                { icon: Trophy, title: "Verified Elite", desc: "Hand-picked venues that meet our strict quality and hospitality standards." }
              ].map((item, i) => (
                <div key={i} className="text-center space-y-4">
                  <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-xl font-black italic uppercase text-white">{item.title}</h4>
                  <p className="text-sm text-white/40 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

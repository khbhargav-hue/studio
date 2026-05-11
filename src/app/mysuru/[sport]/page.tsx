
'use client';

import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TurfCard } from "@/components/turf-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Trophy, Zap, Star, Users, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const SPORT_CONFIG: Record<string, any> = {
  football: { name: "Football", icon: Zap, theme: "text-blue-500", desc: "Elite 5v5 & 7v7 football turfs in Mysuru. Pro-grade lighting and FIFA certified grass." },
  cricket: { name: "Cricket", icon: Trophy, theme: "text-orange-500", desc: "High-intensity box cricket arenas. Perfect for evening community matches and tournament practice." },
  pickleball: { name: "Pickleball", icon: Star, theme: "text-green-500", desc: "The fastest growing sport in Mysuru. Find specialized pickleball courts with premium synthetic surfaces." },
  badminton: { name: "Badminton", icon: Users, theme: "text-purple-500", desc: "Coming soon: Premium indoor badminton courts with elite flooring and ventilation." }
};

export default function SportGuidePage() {
  const params = useParams();
  const sportId = params?.sport as string;
  const db = useFirestore();
  
  const config = SPORT_CONFIG[sportId] || SPORT_CONFIG.football;

  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null;
    const displayName = config.name;
    return query(
      collection(db, "turfs"), 
      where("sportTypes", "array-contains", displayName)
    );
  }, [db, config.name]);

  const { data: turfs, loading } = useCollection(turfsQuery);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <Link href="/mysuru" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-primary transition-colors mb-12">
             <ArrowLeft className="h-3 w-3" /> Back to Guides
          </Link>

          <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
             <div className="max-w-2xl">
                <div className={`h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mb-8 ${config.theme}`}>
                   <config.icon className="h-8 w-8" />
                </div>
                <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.9] text-white mb-8">
                   MYSURU <br /><span className={config.theme}>{config.name}</span>
                </h1>
                <p className="text-xl text-white/40 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-6">
                   {config.desc}
                </p>
             </div>
             
             <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-white/[0.01] min-w-[280px]">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 text-center">NETWORK STATS</p>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Venues</span>
                      <span className="text-xl font-black italic">{turfs?.length || 0}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Guide Score</span>
                      <span className="text-xl font-black italic text-primary">9.8</span>
                   </div>
                </div>
             </div>
          </header>

          <section>
             <div className="flex items-center gap-4 mb-12">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(57,255,20,1)]" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">VERIFIED <span className="text-white/20">LISTINGS</span></h2>
             </div>

             {loading ? (
                <div className="flex justify-center py-32">
                   <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                </div>
             ) : (turfs && turfs.length > 0) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                   {turfs.map((turf) => (
                      <TurfCard key={turf.id} turf={turf as any} />
                   ))}
                </div>
             ) : (
                <div className="text-center py-40 glass-card rounded-[4rem] border-dashed border-white/10">
                   <Trophy className="h-16 w-16 mx-auto mb-8 text-white/5" />
                   <h3 className="text-3xl font-black text-white/10 uppercase italic">Expansion Pending</h3>
                   <p className="text-white/20 mt-4 max-w-xs mx-auto text-sm italic">Our scouts are currently verifying new {config.name} arenas in the city center.</p>
                </div>
             )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

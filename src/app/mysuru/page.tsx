
'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MapPin, Trophy, Users, Zap, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const SPORTS = [
  { id: 'football', name: "Football", count: "12+ Arenas", icon: Zap, color: "bg-blue-500/20 text-blue-500" },
  { id: 'cricket', name: "Cricket", count: "8+ Arenas", icon: Trophy, color: "bg-orange-500/20 text-orange-500" },
  { id: 'pickleball', name: "Pickleball", count: "4+ Arenas", icon: Star, color: "bg-green-500/20 text-green-500" },
  { id: 'badminton', name: "Badminton", count: "Coming Soon", icon: Users, color: "bg-purple-500/20 text-purple-500" }
];

const ZONES = [
  { name: "Bogadi", count: 4, desc: "High-density residential sports hub." },
  { name: "Vijaynagar", count: 6, desc: "The heart of box cricket culture." },
  { name: "Bannimantap", count: 3, desc: "Professional full-size arenas." },
  { name: "Kuvempunagar", count: 2, desc: "Elite central community turfs." }
];

export default function MysuruGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <header className="mb-24">
             <div className="inline-flex items-center gap-3 mb-6 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-full">
                <MapPin className="h-3 w-3" />
                OFFICIAL MYSURU GUIDE
             </div>
             <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.9] text-white mb-10">
                THE CITY'S <br /><span className="text-primary text-neon">ARENA HUB.</span>
             </h1>
             <p className="text-xl text-white/40 font-medium max-w-2xl leading-relaxed">
                Your definitive guide to every major pitch, squad, and match circuit in Mysuru. Updated daily with verified availability.
             </p>
          </header>

          {/* Sport Guide Grid */}
          <section className="mb-32">
             <h2 className="text-2xl font-black italic uppercase tracking-widest text-white/20 mb-10">GUIDES BY DISCIPLINE</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {SPORTS.map((sport, idx) => (
                   <Link key={sport.id} href={`/mysuru/${sport.id}`} className="glass-card p-10 rounded-[3rem] border-white/5 bg-white/[0.02] hover:border-primary/30 group transition-all">
                      <div className={`h-16 w-16 rounded-[1.5rem] ${sport.color} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500`}>
                         <sport.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-3xl font-black italic uppercase text-white mb-2">{sport.name}</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{sport.count}</p>
                      <div className="mt-10 flex items-center gap-2 text-primary text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                         VIEW GUIDE <ArrowRight className="h-3 w-3" />
                      </div>
                   </Link>
                ))}
             </div>
          </section>

          {/* Zone Intelligence */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
             <div className="lg:col-span-4 space-y-8 sticky top-32">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">REGIONAL <br /><span className="text-primary">INTELLIGENCE</span></h2>
                <p className="text-white/40 font-medium leading-relaxed">
                   We've broken down Mysuru into high-intensity zones to help you find the closest available slot.
                </p>
                <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20">
                   <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-4">CITY STATUS</p>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold uppercase text-white/60">Active Turfs</span>
                         <span className="text-xl font-black italic">14</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold uppercase text-white/60">Live Challenges</span>
                         <span className="text-xl font-black italic text-primary">8</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {ZONES.map((zone, idx) => (
                   <div key={idx} className="glass-card p-10 rounded-[3rem] border-white/5 bg-white/[0.01] flex flex-col justify-between h-[300px]">
                      <div>
                         <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                            <MapPin className="h-5 w-5 text-white/20" />
                         </div>
                         <h3 className="text-3xl font-black italic uppercase tracking-tight mb-4">{zone.name}</h3>
                         <p className="text-white/40 font-medium italic text-sm">{zone.desc}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6">
                         <span className="text-[10px] font-black text-primary uppercase tracking-widest">{zone.count} PREMIUM VENUES</span>
                         <Link href={`/?area=${zone.name}`} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                            <ArrowRight className="h-4 w-4" />
                         </Link>
                      </div>
                   </div>
                ))}
             </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

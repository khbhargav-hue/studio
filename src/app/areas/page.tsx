
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

const POPULAR_AREAS = [
  { name: "Vijaynagar", count: "4 Venues", description: "The heart of residential sports culture in Mysuru." },
  { name: "Bogadi", count: "3 Venues", description: "Home to premium academies and expansive multi-sport parks." },
  { name: "Kuvempunagar", count: "2 Venues", description: "Central locations with high-intensity community turfs." },
  { name: "Srirampura", count: "2 Venues", description: "Quiet residential arenas perfect for private matches." },
  { name: "Bannimantap", count: "1 Venue", description: "Large scale arenas with elite professional lighting." }
]

export default function AreasPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-20">
            <div className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-xl mb-6">
              Regional Directory
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none text-white mb-8">
              Popular <span className="text-primary">Areas</span>
            </h1>
            <p className="text-xl text-white/60 font-medium max-w-2xl leading-relaxed">
              Find the perfect pitch in your neighborhood. We are expanding across every major zone in Mysuru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {POPULAR_AREAS.map((area, idx) => (
              <Link 
                key={idx} 
                href={`/?area=${area.name}`}
                className="group glass-card p-12 rounded-[3.5rem] border-white/5 hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-10"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h3 className="text-3xl font-bold text-white tracking-tighter uppercase italic">{area.name}</h3>
                  </div>
                  <p className="text-white/40 font-medium text-lg leading-snug max-w-xs">{area.description}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary italic leading-none">{area.count}</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Available</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

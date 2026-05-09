
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Trophy, Users, Zap, MapPin } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-20">
            <div className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-xl mb-6">
              Our Mission
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none text-white mb-8">
              We are <span className="text-primary">Turfista</span>
            </h1>
            <p className="text-xl text-white/60 font-medium leading-relaxed">
              Based in the heart of Mysuru, Turfista is the premier sports discovery and booking platform designed for the modern athlete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="glass-card p-10 rounded-[2.5rem] border-white/5">
              <Trophy className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4 uppercase italic tracking-tight">The Best Arenas</h3>
              <p className="text-white/50 leading-relaxed">
                We scout and verify every turf in Mysuru to ensure you play on professional-grade surfaces with elite facilities.
              </p>
            </div>
            <div className="glass-card p-10 rounded-[2.5rem] border-white/5">
              <Zap className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4 uppercase italic tracking-tight">Instant Discovery</h3>
              <p className="text-white/50 leading-relaxed">
                No more endless calling. Find football, cricket, and pickleball arenas in seconds and connect with managers directly.
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-white/70">
            <p className="text-lg leading-relaxed">
              Turfista was born out of a simple problem: sports enthusiasts in Mysuru struggled to find and book quality turfs efficiently. We saw the growing passion for night-time football, weekend box cricket, and the rising pickleball scene, yet the infrastructure for discovery remained fragmented.
            </p>
            <p className="text-lg leading-relaxed">
              Today, we serve as the central hub for Mysuru’s sporting community. Whether you are a casual player looking for a friendly match or a coach running an academy, Turfista connects you to the right space at the right time.
            </p>
          </div>

          <div className="mt-20 p-12 bg-primary/5 rounded-[3rem] border border-primary/10 text-center">
            <div className="flex justify-center gap-12 items-center flex-wrap">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">5+</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Major Areas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">10+</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Elite Turfs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">2026</div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Established</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

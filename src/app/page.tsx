"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { motion } from "framer-motion"
import { TurfListing } from "@/components/turf-listing"

export default function Home() {
  const db = useFirestore()
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "settings", "branding")
  }, [db])

  const { data: branding } = useDoc(brandingRef)

  const heroBg = branding?.heroImageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=75&w=1920";
  const optimizedHeroBg = heroBg.includes('cloudinary.com') 
    ? heroBg.replace('/upload/', '/upload/f_webp,w_1920,q_12/') 
    : heroBg;

  const scrollToTurfs = () => {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] selection:bg-primary selection:text-black">
      <Navbar />
      
      {/* 1. HERO SECTION (100VH) */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={optimizedHeroBg}
            alt="Mysuru Turf Network"
            fill
            className="object-cover opacity-[0.12] grayscale"
            priority
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/50 via-transparent to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1A1A1A] border border-[#222222] text-[11px] font-black uppercase tracking-[0.3em] text-white"
          >
            <span className="text-primary">●</span> Mysuru's Turf Network — Est. 2024
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-sans text-[36px] md:text-[56px] lg:text-[72px] font-[800] tracking-tighter leading-[1.0] uppercase italic"
          >
            <span className="text-white block">Book Turfs.</span>
            <span className="text-white block">Build Teams.</span>
            <span className="text-primary text-neon block">Rule Mysuru.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[16px] md:text-[18px] text-[#888888] max-w-[520px] mx-auto leading-relaxed font-medium"
          >
            Football • Cricket • Pickleball • Swimming • Coaching — all in one place.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button 
              onClick={scrollToTurfs}
              className="w-full sm:w-auto h-[64px] px-12 text-[14px] uppercase font-black tracking-widest bg-primary text-black rounded-[10px] hover:scale-[1.02] transition-transform shadow-2xl shadow-primary/20"
            >
              ⚽ Book a Turf
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="w-full sm:w-auto h-[64px] px-12 text-[14px] uppercase font-black tracking-widest border-[#222] text-white rounded-[10px] bg-[#111] hover:bg-[#1A1A1A] hover:border-primary transition-all"
            >
              <Link href="/teams">👥 Create Team</Link>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-16 md:pt-24 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#888888]"
          >
            <div className="flex items-center gap-2"><span className="text-white">⚽</span> 20+ Turfs</div>
            <div className="hidden sm:block text-[#222]">•</div>
            <div className="flex items-center gap-2"><span className="text-white">👥</span> 500+ Players</div>
            <div className="hidden sm:block text-[#222]">•</div>
            <div className="flex items-center gap-2"><span className="text-white">🏆</span> 50+ Tournaments</div>
            <div className="hidden sm:block text-[#222]">•</div>
            <div className="flex items-center gap-2"><span className="text-white">📍</span> Mysuru Only</div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#222] cursor-pointer"
          onClick={scrollToTurfs}
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </section>

      {/* 2. QUICK STATS BAR */}
      <section className="bg-[#111] border-t border-b border-[#222] py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-[900] italic text-primary tracking-tighter mb-2">24</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#888888]">Turfs Listed</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-[900] italic text-primary tracking-tighter mb-2">142</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#888888]">Active Teams</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-[900] italic text-primary tracking-tighter mb-2">38</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#888888]">Challenges This Month</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-[900] italic text-primary tracking-tighter mb-2">1</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#888888]">Cities Served</div>
          </div>
        </div>
      </section>

      {/* 3. LISTINGS SECTION (Filters + Grid) */}
      <div id="listings" className="scroll-mt-[64px]">
        <TurfListing />
      </div>

      <Footer />
    </div>
  )
}

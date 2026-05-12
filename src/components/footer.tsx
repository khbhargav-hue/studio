"use client"

import Link from "next/link"
import { TurfistaLogo } from "./brand-logo"
import { Twitter, Instagram, Facebook } from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"

export function Footer() {
  const db = useFirestore();
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);
  const { data: branding } = useDoc(brandingRef);

  return (
    <footer className="mt-auto border-t border-white/5 bg-black/60 backdrop-blur-3xl py-16 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" className="inline-block">
              <TurfistaLogo />
            </Link>
            <p className="text-muted-foreground text-lg font-medium max-w-sm leading-relaxed">
              {branding?.heroDescription || "Discover and book Mysuru’s best sports turfs in one place. Football, Cricket, Pickleball and more."}
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Facebook].map((Icon, idx) => (
                <Link 
                  key={idx} 
                  href="#" 
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary hover:text-background hover:border-primary transition-all duration-300"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Discover</h4>
              <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <Link href="/" className="hover:text-white transition-colors">Browse Arenas</Link>
                <Link href="/featured" className="hover:text-white transition-colors">Featured Venues</Link>
                <Link href="/areas" className="hover:text-white transition-colors">Popular Areas</Link>
              </nav>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Platform</h4>
              <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                <Link href="/partner" className="hover:text-white transition-colors">Partner Program</Link>
              </nav>
            </div>
            <div className="space-y-6 col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Legal</h4>
              <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Premium Sports Discovery System</p>
          </div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em]">
            {branding?.copyrightText || "© 2026 Turfista"}
          </p>
        </div>
      </div>
    </footer>
  )
}

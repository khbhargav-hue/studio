"use client"

import Link from "next/link"
import { Trophy } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-black/40 backdrop-blur-xl py-12 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <span className="font-headline text-2xl font-bold tracking-tighter text-neon uppercase italic">
                TURFISTA
              </span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium max-w-xs text-center md:text-left leading-relaxed">
              Discover and book Mysuru’s best sports turfs in one place.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-bold uppercase tracking-widest">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/about" className="hover:text-primary transition-colors">Partner Program</Link>
              <Link href="/admin" className="hover:text-primary transition-colors">Arena Portal</Link>
            </nav>
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Premium Sports Discovery</p>
              <p className="text-muted-foreground text-xs font-bold">© 2026 Turfista</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

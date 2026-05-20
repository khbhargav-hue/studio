
"use client"

import Link from "next/link"
import { TurfistaLogo } from "./brand-logo"
import { Twitter, Instagram, Facebook, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <TurfistaLogo size="sm" />
            <p className="text-muted text-[15px] leading-relaxed max-w-xs">
              India's premier discovery and booking platform for the modern athlete.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Facebook].map((Icon, idx) => (
                <Link key={idx} href="#" className="h-10 w-10 border border-border rounded-[10px] flex items-center justify-center text-muted hover:text-primary hover:border-primary">
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="label-caps text-primary">Discover</h4>
            <nav className="flex flex-col gap-4 text-[14px] font-medium text-muted">
              <Link href="/" className="hover:text-foreground">Browse Arenas</Link>
              <Link href="/featured" className="hover:text-foreground">Featured Venues</Link>
              <Link href="/areas" className="hover:text-foreground">Popular Areas</Link>
              <Link href="/sponsors" className="hover:text-foreground">Partner Network</Link>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="label-caps text-primary">Platform</h4>
            <nav className="flex flex-col gap-4 text-[14px] font-medium text-muted">
              <Link href="/about" className="hover:text-foreground">About Us</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
              <Link href="/partner" className="hover:text-foreground">Partner Program</Link>
              <Link href="/login" className="hover:text-foreground">Admin Portal</Link>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="label-caps text-primary">Support</h4>
            <div className="flex items-center gap-3 text-muted">
              <div className="h-10 w-10 bg-[#25D366]/10 rounded-[10px] flex items-center justify-center text-[#25D366]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps text-[9px]">WhatsApp</p>
                <p className="text-[14px] font-bold text-foreground">+91 74113 22492</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2 text-[12px] text-muted opacity-60">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex items-center justify-between">
          <p className="label-caps text-[9px] text-muted">© 2026 Turfista Network. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-primary rounded-full" />
            <span className="label-caps text-[9px] text-muted">Network Stable</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

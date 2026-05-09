
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Scale } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-white uppercase italic">Terms of Service</h1>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-10 text-white/60 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing Turfista, you agree to be bound by these Terms of Service and all applicable laws and regulations in India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">2. Platform Role</h2>
              <p>
                Turfista is a discovery and connection platform. We do not own or manage the arenas listed. All booking agreements, payments, and disputes are between the player and the turf owner/manager.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">3. User Conduct</h2>
              <p>
                Users agree not to use the platform for any illegal activities or to harass arena managers. We reserve the right to block access to the platform for users who violate these guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">4. Liability</h2>
              <p>
                Turfista is not liable for any injuries, financial losses, or property damage occurring at any of the listed venues. Players use these facilities at their own risk.
              </p>
            </section>

            <section className="pt-10 border-t border-white/5">
              <p className="text-xs uppercase tracking-widest font-bold">Last Updated: March 2026</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

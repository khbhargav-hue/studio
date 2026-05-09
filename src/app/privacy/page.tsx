
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-white uppercase italic">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-10 text-white/60 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">Introduction</h2>
              <p>
                Turfista is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our discovery and booking platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">Data Collection</h2>
              <p>
                We collect information that you provide directly to us when you search for turfs, contact arena managers via our platform, or sign up for administrative access. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Contact information (email addresses for admins).</li>
                <li>Usage data (IP addresses, browser types, and interaction metrics).</li>
                <li>WhatsApp interaction logs (when you initiate a booking via our WhatsApp links).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">How We Use Your Data</h2>
              <p>
                Your data is used to provide and improve the Turfista experience, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Facilitating connections between players and arena owners.</li>
                <li>Analyzing platform usage to optimize turf rankings and search results.</li>
                <li>Ensuring the security of our administrative portals.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4">Third-Party Services</h2>
              <p>
                We use Firebase (Google Cloud) for data storage and authentication. When you click a WhatsApp booking link, you are redirected to WhatsApp, which operates under its own privacy policy.
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

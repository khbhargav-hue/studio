
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AlertCircle } from "lucide-react"

export default function DisclaimerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-white uppercase italic">Disclaimer</h1>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-10 text-white/60 leading-relaxed">
            <section className="bg-white/5 p-10 rounded-3xl border border-white/5">
              <p className="text-lg font-bold text-white mb-6 uppercase tracking-tight">Information Accuracy</p>
              <p>
                The information provided on Turfista, including pricing, availability, and facilities, is supplied by third-party arena owners or gathered from public sources. While we strive for accuracy, Turfista does not warrant that any information is current or error-free.
              </p>
            </section>

            <section>
              <p className="text-lg font-bold text-white mb-6 uppercase tracking-tight">Direct Connection Only</p>
              <p>
                Turfista acts solely as a discovery and connection platform. We do not handle payments or guarantee booking slots. Any transaction conducted after following a link from Turfista is at the sole discretion and risk of the user.
              </p>
            </section>

            <section>
              <p className="text-lg font-bold text-white mb-6 uppercase tracking-tight">Venue Safety</p>
              <p>
                The "Verified Partner" badge indicates that the turf exists and has been scouted for inclusion on our platform. It is not an endorsement of the safety, insurance status, or structural integrity of the venue. Users are encouraged to inspect venues personally.
              </p>
            </section>

            <section className="pt-10 border-t border-white/5">
              <p className="text-xs uppercase tracking-widest font-bold">Turfista • Mysuru, India</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

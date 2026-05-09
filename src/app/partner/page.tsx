
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ShieldCheck, TrendingUp, Users, Target, CheckCircle2 } from "lucide-react"

export default function PartnerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-24">
            <div className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-xl mb-6">
              Arena Portal
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-white mb-8">
              Grow Your <br /><span className="text-primary">Turf Business</span>
            </h1>
            <p className="text-xl text-white/60 font-medium leading-relaxed max-w-2xl mx-auto">
              Join Mysuru's most elite sports network. List your arena on Turfista and connect with thousands of local players.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              { icon: Users, title: "More Reach", desc: "Gain visibility among Mysuru's active sporting community looking for bookings daily." },
              { icon: TrendingUp, title: "Higher Revenue", desc: "Fill off-peak slots and boost your monthly turnover with targeted discovery." },
              { icon: ShieldCheck, title: "Brand Trust", desc: "Get featured as a Verified Partner and build professional credibility in the city." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                <item.icon className="h-10 w-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-4 uppercase italic tracking-tight">{item.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-[3.5rem] border-white/5 overflow-hidden p-12 md:p-20 relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Target className="h-64 w-64 text-primary" />
            </div>
            
            <div className="max-w-2xl">
              <h2 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter mb-10">
                Partner Benefits
              </h2>
              <div className="space-y-6">
                {[
                  "Dedicated Arena Profile with premium image gallery",
                  "Verified Badge to build trust with players",
                  "Real-time analytics on views and booking leads",
                  "Promotion on Turfista's social media channels",
                  "Direct connection with players via WhatsApp/Call",
                  "Custom pricing breakdown for different court types"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-white/70 font-medium">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>

              <div className="mt-16 space-y-4">
                <Button className="h-16 px-10 bg-primary text-black font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                  APPLY TO JOIN NETWORK
                </Button>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">
                  Our team will review your arena within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

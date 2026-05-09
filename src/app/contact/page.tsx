
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Mail, Twitter, Instagram, Facebook, Send, ShieldCheck } from "lucide-react"

export default function ContactPage() {
  const handleWhatsAppSupport = () => {
    window.open("https://wa.me/917411322492?text=Hi Turfista Support, I need help with...", "_blank")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            <div className="lg:col-span-5 space-y-12">
              <div>
                <div className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-xl mb-6 border border-primary/20">
                  Player Support
                </div>
                <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-white mb-6">
                  Get In <br /><span className="text-primary">Touch</span>
                </h1>
                <p className="text-lg text-white/60 font-medium leading-relaxed">
                  Need help with a booking or have a suggestion for the platform? Our team is available for instant support.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Email Us</p>
                    <p className="text-lg font-bold text-white">contact.turfista@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Reliability</p>
                    <p className="text-lg font-bold text-white">Verified Connections</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleWhatsAppSupport}
                className="w-full h-20 text-xl font-black bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-[2rem] shadow-xl shadow-[#25D366]/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
              >
                <MessageCircle className="h-7 w-7" />
                CHAT ON WHATSAPP
              </Button>

              <div className="pt-10 border-t border-white/5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-6">Follow the Arena</p>
                <div className="flex gap-4">
                  {[Twitter, Instagram, Facebook].map((Icon, idx) => (
                    <div key={idx} className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:border-primary/50 cursor-pointer transition-colors">
                      <Icon className="h-6 w-6 text-white/60" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-card p-10 md:p-14 rounded-[3.5rem] border-white/5 shadow-2xl">
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                      <Input placeholder="John Doe" className="h-14 bg-white/5 border-white/5 rounded-2xl focus:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                      <Input placeholder="john@example.com" className="h-14 bg-white/5 border-white/5 rounded-2xl focus:border-primary/50" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Subject</label>
                    <Input placeholder="Booking Inquiry" className="h-14 bg-white/5 border-white/5 rounded-2xl focus:border-primary/50" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Message</label>
                    <Textarea placeholder="How can we help you?" className="min-h-[150px] bg-white/5 border-white/5 rounded-2xl focus:border-primary/50 leading-relaxed resize-none" />
                  </div>

                  <Button className="w-full h-16 bg-white text-black font-black text-lg rounded-2xl hover:bg-primary transition-colors">
                    <Send className="mr-2 h-5 w-5" />
                    SEND MESSAGE
                  </Button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

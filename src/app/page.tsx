
"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Activity, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"

export default function Home() {
  const db = useFirestore()
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "settings", "branding")
  }, [db])

  const { data: branding, loading } = useDoc(brandingRef)

  // Use Cloudinary optimization for hero if available
  const heroSrc = branding?.heroImageUrl 
    ? (branding.heroImageUrl.includes('cloudinary.com') 
        ? branding.heroImageUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1920/') 
        : branding.heroImageUrl)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-black">
      <Navbar />
      
      {/* HERO SECTION - 100VH FLAT DESIGN */}
      <section className="relative h-screen flex items-center justify-center px-4 overflow-hidden border-b border-border">
        {/* Background Image from Firestore/Cloudinary */}
        {heroSrc && (
          <div className="absolute inset-0 z-0">
            <Image 
              src={heroSrc}
              alt="Sports Turf Background"
              fill
              className="object-cover opacity-15 grayscale"
              priority
            />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 label-caps text-primary bg-primary/10 border border-primary/20 px-5 py-2 rounded-full">
            <Activity className="h-3 w-3" /> {branding?.seoTitle?.split('|')[0] || "Turfista Network"}
          </div>
          
          <h1 className="max-w-4xl mx-auto text-[36px] md:text-[72px] font-bold tracking-tighter leading-[1.0] uppercase italic">
            {branding?.heroHeadingWhite || "Find & Book Your"} <br />
            <span className="text-primary">{branding?.heroHeadingNeon || "Perfect Turf"}</span>
          </h1>
          
          <p className="text-[18px] text-muted-foreground max-w-[480px] mx-auto leading-relaxed font-medium">
            {branding?.heroDescription || "The premier discovery and booking platform for the modern athlete. Join Mysuru's elite match circuit."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild className="w-full sm:w-auto h-14 px-10 text-[14px] uppercase font-bold tracking-widest">
              <Link href="#listings">Book a Turf</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto h-14 px-10 text-[14px] uppercase font-bold tracking-widest">
              <Link href="/teams">Create Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section id="listings" className="py-24 px-4 max-w-7xl mx-auto w-full text-center">
        <p className="label-caps text-muted-foreground">Scanning the circuit for available pitches...</p>
      </section>

      <Footer />
    </div>
  )
}

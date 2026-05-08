"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TurfCard } from "@/components/turf-card"
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Star, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Zap,
  TrendingUp,
  Trophy
} from "lucide-react"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase"
import { doc, increment, updateDoc, query, collection, limit } from "firebase/firestore"
import { useEffect, useMemo, useRef } from "react"

export default function TurfDetail() {
  const { id } = useParams()
  const router = useRouter()
  const db = useFirestore()
  const hasIncremented = useRef(false)

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "turfs", id as string)
  }, [db, id])

  const { data: turf, loading } = useDoc(turfDocRef)

  // Fetch related venues in the same area or same sports
  const relatedQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "turfs"), limit(10))
  }, [db])

  const { data: allTurfs } = useCollection(relatedQuery)

  const relatedTurfs = useMemo(() => {
    if (!allTurfs || !turf) return []
    return allTurfs
      .filter(t => t.id !== turf.id && (t.area === turf.area || t.sportTypes?.some((s: string) => turf.sportTypes?.includes(s))))
      .slice(0, 4)
  }, [allTurfs, turf])

  // View Counter logic: Run once per mount/id change
  useEffect(() => {
    if (db && id && !hasIncremented.current) {
      hasIncremented.current = true;
      const turfRef = doc(db, "turfs", id as string)
      const statsRef = doc(db, "analytics", "stats")
      
      // Atomic increment for views
      updateDoc(turfRef, { views: increment(1) }).catch(() => {});
      updateDoc(statsRef, { totalViews: increment(1) }).catch(() => {});
    }
  }, [db, id])

  const handleWhatsAppClick = () => {
    if (db && id) {
      const turfRef = doc(db, "turfs", id as string)
      const statsRef = doc(db, "analytics", "stats")
      updateDoc(turfRef, { whatsappClicks: increment(1) }).catch(() => {});
      updateDoc(statsRef, { totalWhatsAppClicks: increment(1) }).catch(() => {});
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!turf) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-white/5 p-10 rounded-[3rem] text-center border border-white/5">
            <Zap className="h-16 w-16 text-primary/20 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Venue not found</h1>
            <p className="text-muted-foreground mb-8">The pitch you're looking for might have been moved.</p>
            <Button onClick={() => router.push("/")} className="rounded-2xl h-12 px-8">Back to Search</Button>
          </div>
        </div>
      </div>
    )
  }

  const message = `Hi, I found ${turf.name} in ${turf.area} on Turfista and would like to inquire about booking a slot for ${turf.sportTypes?.[0] || 'a game'}.`
  const whatsappUrl = `https://wa.me/${turf.whatsappNumber}?text=${encodeURIComponent(message)}`

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-6 hover:bg-white/5 rounded-xl font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Media & Info */}
            <div className="lg:col-span-2 space-y-12">
              <section className="relative rounded-[2.5rem] overflow-hidden glass-card p-3 border-white/10 shadow-2xl">
                <Carousel className="w-full">
                  <CarouselContent>
                    {(turf.images || []).length > 0 ? (
                      turf.images.map((img: string, idx: number) => (
                        <CarouselItem key={idx}>
                          <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden">
                            {img ? (
                              <Image 
                                src={img} 
                                alt={turf.name} 
                                fill 
                                className="object-cover"
                                priority={idx === 0}
                              />
                            ) : (
                              <div className="w-full h-full bg-black/40 flex items-center justify-center">
                                <Zap className="h-20 w-20 text-primary opacity-20" />
                              </div>
                            )}
                          </div>
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden bg-black/40 flex items-center justify-center">
                          <Zap className="h-20 w-20 text-primary opacity-20" />
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  <CarouselPrevious className="left-8 bg-background/80 hover:bg-primary hover:text-primary-foreground border-none" />
                  <CarouselNext className="right-8 bg-background/80 hover:bg-primary hover:text-primary-foreground border-none" />
                </Carousel>
              </section>

              <section className="glass-card rounded-[3rem] p-8 md:p-14 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Trophy className="h-40 w-40 text-primary" />
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-8">
                  {(turf.sportTypes || []).map((sport: string) => (
                    <Badge key={sport} className="bg-primary text-primary-foreground font-black px-6 py-1.5 text-xs rounded-xl shadow-lg shadow-primary/20">{sport}</Badge>
                  ))}
                  <Badge variant="outline" className="border-accent/40 text-accent px-4 py-1.5 flex items-center gap-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-accent/5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Partner
                  </Badge>
                  {turf.isPopular && (
                    <Badge variant="outline" className="border-primary/40 text-primary px-4 py-1.5 flex items-center gap-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-primary/5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Trending Venue
                    </Badge>
                  )}
                </div>
                
                <h1 className="font-headline text-5xl md:text-7xl font-bold mb-8 tracking-tighter leading-[0.9] italic uppercase">{turf.name}</h1>
                
                <div className="flex flex-wrap items-center gap-10 text-muted-foreground mb-12">
                  <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                    <Star className="h-6 w-6 text-primary fill-current" />
                    <span className="font-black text-foreground text-2xl tracking-tighter">{turf.rating}</span>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">{turf.area}, Mysuru</span>
                  </div>
                </div>

                <div className="space-y-16">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-2xl font-headline font-bold mb-6 flex items-center gap-3">
                      <div className="h-10 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(26,255,115,0.5)]" />
                      The Experience
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-xl font-medium whitespace-pre-wrap">
                      {turf.description}
                    </p>
                  </div>

                  {(turf.coachingServices && turf.coachingServices.length > 0) && (
                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                      <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <GraduationCap className="h-64 w-64" />
                      </div>
                      <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3 text-primary">
                        <GraduationCap className="h-8 w-8" />
                        Pro Training Programs
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {turf.coachingServices.map((service: string) => (
                          <div key={service} className="flex items-center gap-4 text-foreground font-bold bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-primary/10 transition-colors">
                            <div className="bg-primary/20 p-2 rounded-lg">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-8">
                    <div>
                      <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
                        <Zap className="h-6 w-6 text-primary" />
                        Elite Amenities
                      </h3>
                      <div className="grid grid-cols-1 gap-5">
                        {(turf.amenities || []).map((item: string) => (
                          <div key={item} className="flex items-center gap-4 text-muted-foreground font-bold group">
                            <div className="h-2 w-2 bg-primary rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(26,255,115,1)]" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
                        <Clock className="h-6 w-6 text-accent" />
                        Active Hours
                      </h3>
                      <div className="flex items-start gap-4 bg-white/5 p-8 rounded-[2rem] border border-white/5">
                        <div>
                          <p className="font-black text-muted-foreground mb-2 uppercase tracking-[0.3em] text-[10px]">Current Availability</p>
                          <p className="text-2xl font-black text-foreground italic uppercase">{turf.openingHours}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Venues Section */}
              {relatedTurfs.length > 0 && (
                <section className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">Similar Arenas</h2>
                      <p className="text-muted-foreground text-lg mt-2 font-medium">Other premium venues you might enjoy in {turf.area}.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {relatedTurfs.map((t) => (
                      <TurfCard key={t.id} turf={t as any} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Booking Card */}
            <div className="space-y-8">
              <aside className="sticky top-32 glass-card rounded-[3rem] p-10 border-primary/20 shadow-[0_30px_100px_rgba(26,255,115,0.1)]">
                <div className="mb-12 text-center">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-50">Base Session Rate</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-6xl font-black text-primary italic leading-none">₹{turf.pricePerHour}</span>
                    <span className="text-muted-foreground font-black mt-6 uppercase text-sm tracking-widest">/ hr</span>
                  </div>
                </div>

                <div className="space-y-5 mb-10">
                  <Button 
                    asChild 
                    className="w-full h-20 text-2xl font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] shadow-[0_15px_40px_-5px_rgba(26,255,115,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]" 
                    onClick={handleWhatsAppClick}
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-4 h-8 w-8" />
                      BOOK ARENA
                    </a>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full h-16 border-white/10 hover:bg-white/5 rounded-2xl font-bold text-lg">
                    <a href={`tel:${turf.contactNumber}`}>
                      <Phone className="mr-3 h-5 w-5" /> CONTACT MANAGER
                    </a>
                  </Button>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 mb-10">
                   <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Venue Features</h4>
                   <div className="space-y-4">
                      {(turf.courtTypes || []).map((type: string) => (
                        <div key={type} className="flex items-center gap-3 text-sm font-bold">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {type}
                        </div>
                      ))}
                   </div>
                </div>

                <Separator className="my-10 bg-white/5" />

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground">The Pitch Location</h4>
                    <Button variant="link" asChild className="p-0 h-auto text-primary hover:text-primary/80 font-black text-[10px] uppercase tracking-widest">
                      <a href={turf.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        GET DIRECTIONS <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                  <div className="aspect-[4/3] relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-inner group">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(turf.area + ' Mysuru')}`}
                      className="absolute inset-0 w-full h-full grayscale opacity-40 contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:opacity-60 group-hover:grayscale-0"
                      loading="lazy"
                    ></iframe>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <MapPin className="h-10 w-10 text-primary drop-shadow-[0_0_15px_rgba(26,255,115,0.8)]" />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-xl border-t border-white/5 lg:hidden animate-in slide-in-from-bottom duration-500">
        <Button 
          asChild 
          className="w-full h-16 text-lg font-black bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20"
          onClick={handleWhatsAppClick}
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-6 w-6" />
            BOOK NOW (₹{turf.pricePerHour}/hr)
          </a>
        </Button>
      </div>
    </div>
  )
}

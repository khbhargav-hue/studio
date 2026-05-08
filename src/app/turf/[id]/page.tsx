
"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Zap
} from "lucide-react"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import { useDoc, useFirestore } from "@/firebase"
import { doc, increment, updateDoc } from "firebase/firestore"
import { useEffect } from "react"

export default function TurfDetail() {
  const { id } = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { data: turf, loading } = useDoc(id ? doc(db!, "turfs", id as string) : null)

  useEffect(() => {
    if (turf && db && id) {
      const turfRef = doc(db, "turfs", id as string)
      const statsRef = doc(db, "analytics", "stats")
      
      updateDoc(turfRef, { views: increment(1) }).catch(() => {});
      updateDoc(statsRef, { totalViews: increment(1) }).catch(() => {});
    }
  }, [turf, db, id])

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
          <h1 className="text-2xl font-bold mb-4">Venue not found</h1>
          <Button onClick={() => router.push("/")}>Back to Listings</Button>
        </div>
      </div>
    )
  }

  const whatsappUrl = `https://wa.me/${turf.whatsappNumber}?text=Hi, I would like to book ${turf.name} for a session.`

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-6 hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Media & Info */}
            <div className="lg:col-span-2 space-y-8">
              <section className="relative rounded-3xl overflow-hidden glass-card p-2">
                <Carousel className="w-full">
                  <CarouselContent>
                    {(turf.images || []).map((img: string, idx: number) => (
                      <CarouselItem key={idx}>
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden">
                          {img ? (
                            <Image 
                              src={img} 
                              alt={turf.name} 
                              fill 
                              className="object-cover"
                              data-ai-hint="sports arena"
                            />
                          ) : (
                            <div className="w-full h-full bg-black/40 flex items-center justify-center">
                              <Zap className="h-20 w-20 text-primary opacity-20" />
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-background/80" />
                  <CarouselNext className="right-4 bg-background/80" />
                </Carousel>
              </section>

              <section className="glass-card rounded-[2.5rem] p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {(turf.sportTypes || []).map((sport: string) => (
                    <Badge key={sport} className="bg-primary text-primary-foreground font-black px-4 py-1">{sport}</Badge>
                  ))}
                  <Badge variant="outline" className="border-accent text-accent px-4 py-1 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Partner
                  </Badge>
                </div>
                
                <h1 className="font-headline text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">{turf.name}</h1>
                
                <div className="flex flex-wrap items-center gap-8 text-muted-foreground mb-10">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl">
                    <Star className="h-5 w-5 text-primary fill-current" />
                    <span className="font-black text-foreground text-lg">{turf.rating}</span>
                    <span className="text-sm opacity-60">({turf.reviewCount || 0} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-medium">{turf.area}, Mysuru</span>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-2xl font-headline font-bold mb-6 flex items-center gap-3">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      About the Venue
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                      {turf.description}
                    </p>
                  </div>

                  {(turf.coachingServices && turf.coachingServices.length > 0) && (
                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8">
                      <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-3 text-primary">
                        <GraduationCap className="h-6 w-6" />
                        Available Coaching
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {turf.coachingServices.map((service: string) => (
                          <div key={service} className="flex items-center gap-3 text-foreground font-medium bg-white/5 p-3 rounded-xl border border-white/5">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                    <div>
                      <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-3">
                        <Zap className="h-5 w-5 text-primary" />
                        Amenities
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {(turf.amenities || []).map((item: string) => (
                          <div key={item} className="flex items-center gap-3 text-muted-foreground">
                            <div className="h-2 w-2 bg-primary rounded-full" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-3">
                        <Clock className="h-5 w-5 text-accent" />
                        Availability
                      </h3>
                      <div className="flex items-start gap-3 bg-white/5 p-6 rounded-3xl border border-white/5">
                        <div>
                          <p className="font-bold text-foreground mb-1 uppercase tracking-widest text-xs opacity-50">Opening Hours</p>
                          <p className="text-lg font-bold">{turf.openingHours}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Booking Card */}
            <div className="space-y-6">
              <aside className="sticky top-32 glass-card rounded-[2.5rem] p-8 border-primary/20 shadow-2xl shadow-primary/5">
                <div className="mb-10 text-center">
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-50">Starting Session</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-5xl font-black text-primary italic">₹{turf.pricePerHour}</span>
                    <span className="text-muted-foreground font-bold mt-2">/ hr</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <Button asChild className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl shadow-primary/20" onClick={handleWhatsAppClick}>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-3 h-6 w-6" />
                      BOOK NOW
                    </a>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full h-14 border-white/10 hover:bg-white/5 rounded-2xl font-bold">
                    <a href={`tel:${turf.contactNumber}`}>
                      <Phone className="mr-2 h-4 w-4" /> CALL MANAGER
                    </a>
                  </Button>
                </div>

                <Separator className="my-8 bg-white/5" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Location</h4>
                    <Button variant="link" asChild className="p-0 h-auto text-primary hover:text-primary/80 font-bold text-xs">
                      <a href={turf.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        VIEW MAP <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <div className="aspect-video relative rounded-3xl overflow-hidden border border-white/5 shadow-inner">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(turf.area + ' Mysuru')}`}
                      className="absolute inset-0 w-full h-full grayscale opacity-60 contrast-125"
                      loading="lazy"
                    ></iframe>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

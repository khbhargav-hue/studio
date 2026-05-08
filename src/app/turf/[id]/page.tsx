"use client"

import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { MOCK_TURFS } from "@/lib/data"
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
  ExternalLink 
} from "lucide-react"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"

export default function TurfDetail() {
  const { id } = useParams()
  const router = useRouter()
  const turf = MOCK_TURFS.find(t => t.id === id)

  if (!turf) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-2xl font-bold mb-4">Turf not found</h1>
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
                    {turf.images.map((img, idx) => (
                      <CarouselItem key={idx}>
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden">
                          <Image 
                            src={img} 
                            alt={turf.name} 
                            fill 
                            className="object-cover"
                            data-ai-hint="sports arena"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-background/80" />
                  <CarouselNext className="right-4 bg-background/80" />
                </Carousel>
              </section>

              <section className="glass-card rounded-3xl p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {turf.sportTypes.map(sport => (
                    <Badge key={sport} className="bg-primary text-primary-foreground font-bold">{sport}</Badge>
                  ))}
                  <Badge variant="outline" className="border-accent text-accent">Verified Venue</Badge>
                </div>
                
                <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">{turf.name}</h1>
                
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary fill-current" />
                    <span className="font-bold text-foreground">{turf.rating}</span>
                    <span>({turf.reviewCount} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{turf.area}, Mysuru</span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-headline font-bold mb-4">About the Turf</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {turf.description}
                  </p>
                </div>

                <Separator className="my-8 bg-white/10" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-headline font-bold mb-4">Amenities</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {turf.amenities.map(item => (
                        <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-headline font-bold mb-4">Timings</h3>
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <Clock className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Opening Hours</p>
                        <p className="text-sm">{turf.openingHours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Booking Card */}
            <div className="space-y-6">
              <aside className="sticky top-32 glass-card rounded-3xl p-8 border-primary/20 shadow-2xl shadow-primary/5">
                <div className="mb-8">
                  <p className="text-muted-foreground text-sm mb-1">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">₹{turf.pricePerHour}</span>
                    <span className="text-muted-foreground">per hour</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <Button asChild className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-3 h-6 w-6" />
                      Book via WhatsApp
                    </a>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full h-12 border-white/10 hover:bg-white/5 rounded-xl">
                    <a href={`tel:${turf.contactNumber}`}>
                      <Phone className="mr-2 h-4 w-4" /> Call Manager
                    </a>
                  </Button>
                </div>

                <Separator className="my-6 bg-white/10" />

                <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Location</h4>
                  <div className="aspect-square relative rounded-2xl overflow-hidden border border-white/10">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124731.81559902633!2d76.54145927690196!3d12.321303831885662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf70381d572ef7%3A0x2b899a6f3b4648e5!2sMysuru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1709400000000!5m2!1sen!2sin"
                      className="absolute inset-0 w-full h-full grayscale opacity-70"
                      loading="lazy"
                    ></iframe>
                  </div>
                  <Button variant="link" asChild className="p-0 h-auto text-primary hover:text-primary/80">
                    <a href={turf.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      Open in Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
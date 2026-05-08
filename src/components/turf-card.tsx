"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, Trophy, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Turf } from "@/lib/types"

interface TurfCardProps {
  turf: Turf
}

export function TurfCard({ turf }: TurfCardProps) {
  const whatsappUrl = `https://wa.me/${turf.whatsappNumber}?text=Hi, I would like to book ${turf.name} for a session.`

  return (
    <Card className="group overflow-hidden border-none bg-card/40 transition-all duration-300 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/10">
      <Link href={`/turf/${turf.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={turf.images[0]}
            alt={turf.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            data-ai-hint="sports turf"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground font-semibold">
            {turf.rating} <Star className="ml-1 h-3 w-3 fill-current" />
          </Badge>
          <div className="absolute bottom-3 left-3 flex gap-2">
            {turf.sportTypes.map((sport) => (
              <Badge key={sport} variant="secondary" className="bg-background/80 backdrop-blur-sm border-none text-[10px] uppercase tracking-wider">
                {sport}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/turf/${turf.id}`}>
            <h3 className="font-headline text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
              {turf.name}
            </h3>
          </Link>
          <span className="text-primary font-bold text-lg">₹{turf.pricePerHour}<span className="text-xs text-muted-foreground font-normal">/hr</span></span>
        </div>
        <div className="flex items-center text-muted-foreground text-sm gap-1 mb-1">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="line-clamp-1">{turf.area}, Mysuru</span>
        </div>
        <div className="flex items-center text-muted-foreground text-sm gap-1">
          <Trophy className="h-3.5 w-3.5 text-accent" />
          <span>{turf.reviewCount} Reviews</span>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button 
          asChild 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Book on WhatsApp
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
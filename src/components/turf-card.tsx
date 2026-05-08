
"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, MessageCircle, Clock, Maximize, Trophy } from "lucide-react"
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
    <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md transition-all duration-500 hover:bg-card/50 hover:shadow-[0_0_40px_rgba(26,255,115,0.15)] hover:-translate-y-2 rounded-[2rem]">
      {/* Glow Effect Layer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -inset-[2px] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-[2rem]" />
      </div>

      <Link href={`/turf/${turf.id}`} className="block">
        <div className="relative aspect-[16/11] overflow-hidden rounded-t-[2rem]">
          {turf.images?.[0] ? (
            <Image
              src={turf.images[0]}
              alt={turf.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              data-ai-hint="sports field"
            />
          ) : (
            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
              <Trophy className="h-12 w-12 text-primary opacity-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            <Badge className="bg-primary text-primary-foreground font-black px-3 py-1 text-xs shadow-lg">
              {turf.rating || 0} <Star className="ml-1 h-3 w-3 fill-current" />
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {turf.sportTypes?.map((sport) => (
              <Badge key={sport} variant="secondary" className="bg-white/10 backdrop-blur-md border-white/5 text-[10px] font-bold uppercase tracking-wider text-white">
                {sport}
              </Badge>
            ))}
          </div>
        </div>
      </Link>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Link href={`/turf/${turf.id}`}>
            <h3 className="font-headline text-2xl font-bold group-hover:text-primary transition-colors line-clamp-1 leading-none mb-1">
              {turf.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-xs gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{turf.area}</span>
            </div>
          </Link>
          <div className="text-right">
            <span className="text-primary font-black text-xl leading-none">₹{turf.pricePerHour}</span>
            <p className="text-[10px] text-muted-foreground font-medium uppercase">per hour</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {turf.courtTypes?.map(court => (
            <Badge key={court} variant="outline" className="border-white/5 text-muted-foreground text-[10px] py-0 px-2 flex items-center gap-1">
              <Maximize className="h-2.5 w-2.5" />
              {court}
            </Badge>
          ))}
          <Badge variant="outline" className="border-white/5 text-muted-foreground text-[10px] py-0 px-2 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {turf.openingHours?.includes('24') ? 'Open 24/7' : turf.openingHours || 'Timing N/A'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button 
          asChild 
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(26,255,115,0.5)] group-hover:shadow-[0_10px_25px_-5px_rgba(26,255,115,0.6)]"
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            Quick Book
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

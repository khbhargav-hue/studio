'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, MessageCircle, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Turf } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { doc, setDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as gtag from "@/lib/gtag";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface TurfCardProps {
  turf: Turf
}

export function TurfCard({ turf }: TurfCardProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isThrottled, setIsThrottled] = useState(false);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    if (!db || !turf.id) return;
    
    gtag.event({
      action: 'generate_lead',
      category: 'Booking',
      label: turf.name,
      value: 1
    });

    if (isThrottled) return;
    setIsThrottled(true);
    setTimeout(() => setIsThrottled(false), 5000);

    const leadData = {
      turfId: turf.id,
      turfName: turf.name,
      area: turf.area,
      sportType: turf.sportTypes?.[0] || 'Unknown',
      timestamp: serverTimestamp(),
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 150) : 'Unknown',
    };

    addDoc(collection(db, "leads"), leadData)
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'leads',
          operation: 'create',
          requestResourceData: leadData
        }));
      });

    const turfRef = doc(db, "turfs", turf.id);
    const statsRef = doc(db, "analytics", "stats");
    
    setDoc(turfRef, { whatsappClicks: increment(1) }, { merge: true })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: turfRef.path,
          operation: 'update',
          requestResourceData: { whatsappClicks: increment(1) }
        }));
      });

    setDoc(statsRef, { totalWhatsAppClicks: increment(1) }, { merge: true })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: statsRef.path,
          operation: 'update',
          requestResourceData: { totalWhatsAppClicks: increment(1) }
        }));
      });
  };

  const displayImage = turf.mainImage || "https://picsum.photos/seed/turf-placeholder/800/600";

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="group relative overflow-hidden border-none bg-secondary/40 glass-card rounded-[2.5rem] flex flex-col h-full shadow-2xl">
        <Link href={`/turf/${turf.id}`} className="block relative aspect-[16/10] overflow-hidden rounded-t-[2.5rem]">
          <Image
            src={displayImage}
            alt={turf.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
               <span className="text-[10px] font-black text-primary italic uppercase tracking-tighter">{turf.sportTypes?.[0]}</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4">
             <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-2xl">
                <span className="text-xs font-black text-white italic">{turf.rating || 4.5}</span>
                <Star className="h-3 w-3 text-[hsl(var(--rating))] fill-current" />
             </div>
          </div>
        </Link>

        <CardContent className="p-8 flex-1 flex flex-col">
          <Link href={`/turf/${turf.id}`} className="mb-6 block">
            <h3 className="text-2xl mb-2 group-hover:text-primary transition-colors italic font-black uppercase tracking-tighter leading-tight text-white line-clamp-1">
              {turf.name}
            </h3>
            <div className="flex items-center text-white/30 text-[10px] font-bold uppercase tracking-widest gap-2">
              <MapPin className="h-3 w-3 text-primary/60" />
              <span>{turf.area}, Mysuru</span>
            </div>
          </Link>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
             <div className="flex items-center gap-2">
                <span className="text-2xl font-black italic text-primary">₹{turf.pricePerHour}</span>
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">/ HR</span>
             </div>
             <Button 
              asChild 
              onClick={handleWhatsAppClick}
              size="sm"
              className="h-11 px-6 bg-white/5 hover:bg-primary hover:text-black border border-white/10 rounded-xl transition-all"
            >
              <a href={`https://wa.me/${turf.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

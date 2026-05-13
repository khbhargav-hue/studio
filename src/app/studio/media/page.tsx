'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, ExternalLink, Info } from "lucide-react";

export default function MediaLibraryPage() {
  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Media <span className="text-primary">Intelligence</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Platform media is now powered by Cloudinary CDN.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden p-12 text-center">
          <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-primary/20">
            <Cloud className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black italic uppercase mb-4">External Media Control</h2>
          <p className="text-white/40 text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-12 italic">
            To ensure maximum security and high-speed delivery, global platform assets are managed directly via your Cloudinary Media Library dashboard.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Button asChild className="h-16 px-10 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl">
              <a href="https://cloudinary.com/console/media_library" target="_blank" rel="noopener noreferrer">
                OPEN CLOUDINARY DASHBOARD <ExternalLink className="ml-3 h-4 w-4" />
              </a>
            </Button>
          </div>
        </Card>

        <div className="glass-card rounded-[3rem] p-10 border-primary/10 bg-primary/5 flex items-start gap-6">
           <Info className="h-6 w-6 text-primary shrink-0 mt-1" />
           <div>
              <h4 className="text-lg font-black uppercase italic text-primary mb-2">Technical Note</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Images uploaded via the "Visual Identity" or "Arena Deployment" editors are automatically pushed to your Cloudinary cloud and linked to Firestore. You can view, tag, and delete these assets directly from your Cloudinary console for full administrative control.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, ExternalLink, Info, Database } from "lucide-react";
import { CloudinaryPicker } from "@/components/cloudinary-picker";
import { useToast } from "@/hooks/use-toast";

export default function MediaLibraryPage() {
  const { toast } = useToast();

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Media <span className="text-primary">Intelligence</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Global platform assets managed via Cloudinary CDN.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden p-12 text-center">
          <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-primary/20">
            <Database className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black italic uppercase mb-4">Unified Cloud Library</h2>
          <p className="text-white/40 text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-12 italic">
            Browse, reuse, and organize all platform imagery directly from your secure Cloudinary Media Library.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <CloudinaryPicker 
              label="OPEN MEDIA EXPLORER" 
              variant="default"
              className="h-16 px-10 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl"
              onSelect={(url) => {
                toast({ title: "Asset Selected", description: "Image URL copied to clipboard for reuse." });
                navigator.clipboard.writeText(url);
              }}
            />
            <Button asChild variant="outline" className="h-16 px-10 border-white/10 bg-white/5 font-black uppercase tracking-widest text-xs rounded-2xl">
              <a href="https://cloudinary.com/console/media_library" target="_blank" rel="noopener noreferrer">
                EXTERNAL DASHBOARD <ExternalLink className="ml-3 h-4 w-4" />
              </a>
            </Button>
          </div>
        </Card>

        <div className="glass-card rounded-[3rem] p-10 border-primary/10 bg-primary/5 flex items-start gap-6">
           <Info className="h-6 w-6 text-primary shrink-0 mt-1" />
           <div>
              <h4 className="text-lg font-black uppercase italic text-primary mb-2">Platform Media Protocol</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Images selected via the Media Explorer are instantly linked to the Turfista database. To ensure performance, the system automatically appends optimization flags (f_auto, q_auto) to all delivery URLs. Organize your library by using the designated folders in Cloudinary: <strong>Hero</strong>, <strong>Turfs</strong>, and <strong>Challenges</strong>.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

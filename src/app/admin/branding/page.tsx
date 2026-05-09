
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Palette, 
  Save, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon, 
  Monitor, 
  Layout, 
  Globe, 
  Mail, 
  Phone, 
  ExternalLink,
  ShieldCheck,
  Upload
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { TurfistaLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

export default function BrandingSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const { data: brandingData, loading } = useDoc(brandingRef);

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    heroBadgeText: "WE CONNECT YOU TO THE BEST TURFS",
    heroHeading1: "PLAY MORE.",
    heroHeading2: "BOOK EASY.",
    heroDescription: "Discover and book Mysuru’s best sports turfs in one place.",
    heroImageUrl: "https://picsum.photos/seed/turf-hero/1920/1080",
    logoUrl: "",
    seoTitle: "Turfista | Premium Sports Turf Discovery in Mysuru",
    seoDescription: "Find and book the best football and cricket turfs in Mysuru, Karnataka.",
    footerEmail: "contact.turfista@gmail.com",
    footerWhatsapp: "917411322492",
    copyrightText: "© 2026 Turfista"
  });

  useEffect(() => {
    if (brandingData) {
      setFormData(prev => ({
        ...prev,
        ...brandingData
      }));
    }
  }, [brandingData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsSaving(true);
    const docRef = doc(db, "settings", "branding");

    setDoc(docRef, {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true })
      .then(() => {
        toast({
          title: "Branding Updated",
          description: "Changes are now live across the platform."
        });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: formData
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Global <span className="text-primary">Branding</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Control the visual narrative and identity of Turfista.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 rounded-2xl border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px]" asChild>
            <a href="/" target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> Preview Platform</a>
          </Button>
          <div className="px-5 py-3 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Control Active</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            {/* Hero Section */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Layout className="h-8 w-8 text-primary" />
                  Hero Narrative
                </CardTitle>
                <CardDescription className="text-lg">Customize the primary messaging of the landing page.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="badge" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Top Badge Text</Label>
                  <Input 
                    id="badge" 
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 focus:border-primary/50 text-base"
                    value={formData.heroBadgeText}
                    onChange={(e) => setFormData({...formData, heroBadgeText: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="h1" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Main Heading 1 (White)</Label>
                    <Input 
                      id="h1" 
                      className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 font-bold text-lg"
                      value={formData.heroHeading1}
                      onChange={(e) => setFormData({...formData, heroHeading1: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="h2" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Main Heading 2 (Neon Green)</Label>
                    <Input 
                      id="h2" 
                      className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 font-bold text-lg text-primary"
                      value={formData.heroHeading2}
                      onChange={(e) => setFormData({...formData, heroHeading2: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="desc" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Hero Subheading</Label>
                  <Textarea 
                    id="desc"
                    className="min-h-[140px] bg-white/5 border-white/5 rounded-[2rem] p-6 text-lg leading-relaxed resize-none focus:border-primary/50"
                    value={formData.heroDescription}
                    onChange={(e) => setFormData({...formData, heroDescription: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Globe className="h-8 w-8 text-primary" />
                  SEO & Indexing
                </CardTitle>
                <CardDescription className="text-lg">Manage search engine visibility and metadata.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="seoTitle" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Meta Title</Label>
                  <Input 
                    id="seoTitle" 
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="seoDesc" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Meta Description</Label>
                  <Textarea 
                    id="seoDesc"
                    className="min-h-[120px] bg-white/5 border-white/5 rounded-[2rem] p-6 leading-relaxed resize-none"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Footer & Contacts */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Mail className="h-8 w-8 text-primary" />
                  Communications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="footEmail" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Support Email</Label>
                    <Input 
                      id="footEmail" 
                      type="email"
                      className="h-14 bg-white/5 border-white/5 rounded-2xl px-6"
                      value={formData.footerEmail}
                      onChange={(e) => setFormData({...formData, footerEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="footWhatsapp" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">WhatsApp Support (91...)</Label>
                    <Input 
                      id="footWhatsapp" 
                      className="h-14 bg-white/5 border-white/5 rounded-2xl px-6"
                      value={formData.footerWhatsapp}
                      onChange={(e) => setFormData({...formData, footerWhatsapp: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="copyright" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Copyright Disclaimer</Label>
                  <Input 
                    id="copyright" 
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6"
                    value={formData.copyrightText}
                    onChange={(e) => setFormData({...formData, copyrightText: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Identity Control */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative group">
              <CardHeader className="p-8 pb-4 text-center">
                <CardTitle className="font-headline text-2xl font-bold">Brand Identity</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="aspect-square rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center p-10 transition-all group-hover:border-primary/40">
                  {formData.logoUrl ? (
                    <div className="relative">
                      <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full animate-pulse" />
                      <img src={formData.logoUrl} alt="Logo" className="relative max-h-32 object-contain drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <TurfistaLogo iconOnly size="xl" className="mb-6" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">SVG Vector Logo</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Logo URL (512x512 PNG)</Label>
                  <div className="relative">
                    <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input 
                      placeholder="Paste Image Link..." 
                      className="h-12 bg-white/5 border-white/5 rounded-xl pl-12 pr-6"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-center text-muted-foreground uppercase font-medium leading-relaxed">
                  Recommended: 512x512 Transparent PNG or WebP. <br />Max 2MB for performance.
                </p>
              </CardContent>
            </Card>

            {/* Visual Assets */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                  <ImageIcon className="h-6 w-6 text-accent" />
                  Hero Visual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-white/5 bg-black/40 group">
                  <img src={formData.heroImageUrl} alt="Hero Preview" className="object-cover w-full h-full opacity-60 transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end p-8">
                    <Monitor className="h-6 w-6 text-primary mb-3" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Dynamic Hero Preview</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Background Image URL</Label>
                  <Input 
                    className="h-12 bg-white/5 border-white/5 rounded-xl px-4"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({...formData, heroImageUrl: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme Colors - Visual Indicators */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                  <Palette className="h-6 w-6 text-primary" />
                  Theme Core
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {[
                  { label: "Primary Green", color: "bg-[#39FF14]", hex: "#39FF14" },
                  { label: "Text White", color: "bg-white", hex: "#FFFFFF" },
                  { label: "Deep Black", color: "bg-black border border-white/10", hex: "#000000" },
                  { label: "Accent Glow", color: "bg-[#39FF14] opacity-50 blur-sm", hex: "RGBA(57,255,20,0.5)" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-white/30">{item.hex}</span>
                      <div className={cn("h-6 w-6 rounded-full shadow-lg", item.color)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="flex-1 h-20 bg-primary text-black font-black text-2xl rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(57,255,20,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(57,255,20,0.6)] hover:scale-[1.01] transition-all active:scale-[0.98]"
          >
            {isSaving ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="mr-4 h-8 w-8" />}
            PUBLISH CHANGES
          </Button>
          <Button 
            type="button"
            variant="outline"
            className="h-20 px-12 border-white/10 bg-white/5 rounded-[2rem] font-black text-xl hover:bg-white/10"
            asChild
          >
            <a href="/" target="_blank">LIVE PREVIEW</a>
          </Button>
        </div>
      </form>
    </div>
  );
}

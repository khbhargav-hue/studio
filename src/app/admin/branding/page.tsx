
'use client';

import { useState, useEffect, useRef } from "react";
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
  Upload,
  Cloud,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { TurfistaLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function BrandingSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const { data: brandingData, loading } = useDoc(brandingRef);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  
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
    copyrightText: "© 2026 Turfista",
    cloudinaryCloudName: "",
    cloudinaryUploadPreset: ""
  });

  useEffect(() => {
    if (brandingData) {
      setFormData(prev => ({
        ...prev,
        ...brandingData
      }));
    }
  }, [brandingData]);

  const uploadToCloudinary = async (file: File) => {
    if (!formData.cloudinaryCloudName || !formData.cloudinaryUploadPreset) {
      toast({
        title: "Configuration Required",
        description: "Please provide your Cloudinary Cloud Name and Upload Preset below.",
        variant: "destructive"
      });
      return null;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', formData.cloudinaryUploadPreset);
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${formData.cloudinaryCloudName}/image/upload`, {
        method: 'POST',
        body: uploadFormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Could not connect to Cloudinary.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const url = await uploadToCloudinary(file);
    if (url) {
      setFormData(prev => ({ ...prev, logoUrl: url }));
      toast({ title: "Visual Processed", description: "Logo updated in local state. Click Publish to save." });
    }
    setUploadingLogo(false);
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    const url = await uploadToCloudinary(file);
    if (url) {
      setFormData(prev => ({ ...prev, heroImageUrl: url }));
      toast({ title: "Backdrop Processed", description: "Hero image updated in local state. Click Publish to save." });
    }
    setUploadingHero(false);
  };

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
          title: "Platform Published",
          description: "All visual changes are now live across Turfista."
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
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Platform <span className="text-primary">Control</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Manage visuals, identity, and Cloudinary storage.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 rounded-2xl border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px]" asChild>
            <a href="/" target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> Live Site</a>
          </Button>
          <div className="px-5 py-3 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Admin Active</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            {/* Storage Config */}
            <Card className="glass-card border-primary/20 bg-primary/5 rounded-[3rem] overflow-hidden shadow-2xl relative border-dashed">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Cloud className="h-8 w-8 text-primary" />
                  Cloud Storage Config
                </CardTitle>
                <CardDescription className="text-lg">Required for image uploads to work.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="cloudName" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Cloud Name</Label>
                    <Input 
                      id="cloudName" 
                      placeholder="e.g., turfista-media"
                      className="h-14 bg-background border-white/5 rounded-2xl px-6 focus:border-primary/50"
                      value={formData.cloudinaryCloudName}
                      onChange={(e) => setFormData({...formData, cloudinaryCloudName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="preset" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Unsigned Upload Preset</Label>
                    <Input 
                      id="preset" 
                      placeholder="e.g., website_assets"
                      className="h-14 bg-background border-white/5 rounded-2xl px-6 focus:border-primary/50"
                      value={formData.cloudinaryUploadPreset}
                      onChange={(e) => setFormData({...formData, cloudinaryUploadPreset: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className={cn(
                  "p-6 rounded-2xl border flex items-start gap-4 transition-all",
                  formData.cloudinaryCloudName && formData.cloudinaryUploadPreset 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                )}>
                  {formData.cloudinaryCloudName && formData.cloudinaryUploadPreset ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {formData.cloudinaryCloudName && formData.cloudinaryUploadPreset ? "Storage System Engaged" : "Configuration Missing"}
                    </p>
                    <p className="text-xs font-medium opacity-70 leading-relaxed">
                      {formData.cloudinaryCloudName && formData.cloudinaryUploadPreset 
                        ? "You can now upload assets. Images will be automatically optimized and stored." 
                        : "Upload functionality is currently disabled. Please provide Cloudinary credentials."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identity Control */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <TurfistaLogo iconOnly size="md" />
                  Brand Identity
                </CardTitle>
                <CardDescription className="text-lg">Manage your logo and visual watermark.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 flex flex-col items-center gap-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group cursor-pointer"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="relative aspect-square w-64 rounded-full border-2 border-dashed border-primary/20 bg-black/40 flex items-center justify-center p-12 hover:border-primary/60 transition-all overflow-hidden">
                    {uploadingLogo ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Processing...</span>
                      </div>
                    ) : formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-[0_0_20px_rgba(57,255,20,0.6)]" />
                    ) : (
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Upload className="h-12 w-12" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload PNG</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                        <Button type="button" size="sm" className="bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-full h-10 px-6 pointer-events-none">Replace Logo</Button>
                      </div>
                    </div>
                  </div>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </motion.div>
                
                <div className="text-center space-y-2">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">Recommended: 512x512 Transparent PNG</p>
                </div>
              </CardContent>
            </Card>

            {/* Visual Assets */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-4">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <ImageIcon className="h-8 w-8 text-primary" />
                  Hero Backdrop
                </CardTitle>
                <CardDescription className="text-lg">Cinematic visual for the platform landing page.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div 
                  className="relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-dashed border-white/10 bg-black/40 group cursor-pointer"
                  onClick={() => heroInputRef.current?.click()}
                >
                  <AnimatePresence mode="wait">
                    {uploadingHero ? (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center gap-4"
                      >
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">Optimizing...</span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  
                  <img 
                    src={formData.heroImageUrl} 
                    alt="Hero Preview" 
                    className={cn(
                      "object-cover w-full h-full transition-all duration-700 group-hover:scale-105",
                      uploadingHero ? "opacity-20 blur-sm" : "opacity-60"
                    )} 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col items-center justify-center p-8">
                    <div className="p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 shadow-2xl">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <p className="mt-6 text-[10px] font-black text-white uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity">REPLACE BACKGROUND</p>
                  </div>
                  <input type="file" ref={heroInputRef} onChange={handleHeroUpload} accept="image/*" className="hidden" />
                </div>
              </CardContent>
            </Card>

            {/* Narratives Section */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Layout className="h-8 w-8 text-primary" />
                  Hero Narrative
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="badge" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Top Badge Text</Label>
                  <Input 
                    id="badge" 
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-base"
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
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* SEO Section */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-4">
                  <Globe className="h-6 w-6 text-primary" />
                  SEO Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Meta Title</Label>
                  <Input 
                    id="seoTitle" 
                    className="h-12 bg-white/5 border-white/5 rounded-xl px-4"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDesc" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Meta Description</Label>
                  <Textarea 
                    id="seoDesc"
                    className="min-h-[120px] bg-white/5 border-white/5 rounded-xl p-4 text-xs leading-relaxed resize-none"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contacts */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-4">
                  <Mail className="h-6 w-6 text-primary" />
                  Comm Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="footEmail" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Support Email</Label>
                  <Input 
                    id="footEmail" 
                    className="h-12 bg-white/5 border-white/5 rounded-xl px-4"
                    value={formData.footerEmail}
                    onChange={(e) => setFormData({...formData, footerEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footWhatsapp" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">WhatsApp (91...)</Label>
                  <Input 
                    id="footWhatsapp" 
                    className="h-12 bg-white/5 border-white/5 rounded-xl px-4"
                    value={formData.footerWhatsapp}
                    onChange={(e) => setFormData({...formData, footerWhatsapp: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="copyright" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Copyright Line</Label>
                  <Input 
                    id="copyright" 
                    className="h-12 bg-white/5 border-white/5 rounded-xl px-4"
                    value={formData.copyrightText}
                    onChange={(e) => setFormData({...formData, copyrightText: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visual Indicators */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                  <Palette className="h-6 w-6 text-primary" />
                  Palette
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {[
                  { label: "Primary Green", color: "bg-[#39FF14]", hex: "#39FF14" },
                  { label: "Text White", color: "bg-white", hex: "#FFFFFF" },
                  { label: "Deep Black", color: "bg-black border border-white/10", hex: "#000000" }
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

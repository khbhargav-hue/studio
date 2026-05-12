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

export default function BrandingStudioPage() {
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
          title: "Branding Published",
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
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Platform <span className="text-primary">Branding</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Manage visual narratives and SEO identity.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 rounded-2xl border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px]" asChild>
            <a href="/" target="_blank"><ExternalLink className="h-4 w-4 mr-2" /> Open Site</a>
          </Button>
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
                  Storage Node
                </CardTitle>
                <CardDescription className="text-lg">Cloudinary credentials for media persistence.</CardDescription>
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
                    <Label htmlFor="preset" className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Unsigned Preset</Label>
                    <Input 
                      id="preset" 
                      placeholder="e.g., assets_unsigned"
                      className="h-14 bg-background border-white/5 rounded-2xl px-6 focus:border-primary/50"
                      value={formData.cloudinaryUploadPreset}
                      onChange={(e) => setFormData({...formData, cloudinaryUploadPreset: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identity Control */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <TurfistaLogo iconOnly size="md" />
                  Brand Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 flex flex-col items-center gap-10">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full opacity-50" />
                  <div className="relative aspect-square w-64 rounded-full border-2 border-dashed border-primary/20 bg-black/40 flex items-center justify-center p-12 hover:border-primary/60 transition-all overflow-hidden">
                    {uploadingLogo ? (
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    ) : formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Upload className="h-12 w-12 opacity-40" />
                    )}
                  </div>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </div>
              </CardContent>
            </Card>

            {/* Narratives Section */}
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Layout className="h-8 w-8 text-primary" />
                  Platform Copy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Hero Heading White</Label>
                  <Input 
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6"
                    value={formData.heroHeading1}
                    onChange={(e) => setFormData({...formData, heroHeading1: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Hero Heading Neon</Label>
                  <Input 
                    className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 text-primary"
                    value={formData.heroHeading2}
                    onChange={(e) => setFormData({...formData, heroHeading2: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Description</Label>
                  <Textarea 
                    className="min-h-[140px] bg-white/5 border-white/5 rounded-[2rem] p-6 text-lg"
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
                  SEO Node
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Meta Title</Label>
                  <Input 
                    className="h-12 bg-white/5 border-white/5 rounded-xl px-4"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Meta Description</Label>
                  <Textarea 
                    className="min-h-[120px] bg-white/5 border-white/5 rounded-xl p-4 text-xs"
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
                  Support
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email</Label>
                  <Input 
                    className="h-12 bg-white/5 border-white/5 rounded-xl px-4"
                    value={formData.footerEmail}
                    onChange={(e) => setFormData({...formData, footerEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">WhatsApp</Label>
                  <Input 
                    className="h-12 bg-white/5 border-white/5 rounded-xl px-4"
                    value={formData.footerWhatsapp}
                    onChange={(e) => setFormData({...formData, footerWhatsapp: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="flex-1 h-20 bg-primary text-black font-black text-2xl rounded-[2rem] shadow-2xl"
          >
            {isSaving ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="mr-4 h-8 w-8" />}
            PUBLISH STUDIO CHANGES
          </Button>
        </div>
      </form>
    </div>
  );
}

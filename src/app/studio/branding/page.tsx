
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
  Layout, 
  Globe, 
  Mail, 
  Phone, 
  ExternalLink,
  ShieldCheck,
  Upload,
  Cloud
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase, useStorage } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { TurfistaLogo } from "@/components/brand-logo";

export default function BrandingStudioPage() {
  const db = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const { data: brandingData, loading } = useDoc(brandingRef);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [formData, setFormData] = useState({
    heroHeadingWhite: "PLAY",
    heroHeadingNeon: "MORE.",
    heroHeading2White: "BOOK",
    heroHeading2Neon: "EASY.",
    heroDescription: "Discover and book Mysuru’s best sports turfs in one place.",
    logoUrl: "",
    seoTitle: "Turfista | Premium Sports Community in Mysuru",
    seoDescription: "Find elite sports arenas, join local teams, and challenge rivals in Mysuru.",
    footerEmail: "contact.turfista@gmail.com",
    footerWhatsapp: "917411322492",
    copyrightText: "© 2026 Turfista"
  });

  useEffect(() => {
    if (brandingData) {
      setFormData(prev => ({ ...prev, ...brandingData }));
    }
  }, [brandingData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;
    setUploadingLogo(true);
    const storageRef = ref(storage, `branding/logo_${Date.now()}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, logoUrl: url }));
      toast({ title: "Visual Node Updated" });
    } catch (err) {
      toast({ title: "Upload Failed", variant: "destructive" });
    }
    setUploadingLogo(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);
    const docRef = doc(db, "settings", "branding");
    setDoc(docRef, { ...formData, updatedAt: serverTimestamp() }, { merge: true })
      .then(() => toast({ title: "Platform Branding Published" }))
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: formData
        }));
      })
      .finally(() => setIsSaving(false));
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Visual <span className="text-primary">Identity</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Configure platform narratives and brand assets.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <TurfistaLogo iconOnly size="md" /> Identity Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 flex flex-col items-center gap-10">
                <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                  <div className="relative aspect-square w-64 rounded-full border-2 border-dashed border-primary/20 bg-black/40 flex items-center justify-center p-12 transition-all">
                    {uploadingLogo ? <Loader2 className="h-12 w-12 animate-spin text-primary" /> : (
                      formData.logoUrl ? <img src={formData.logoUrl} className="max-h-full max-w-full object-contain" /> : <Upload className="h-12 w-12 opacity-40" />
                    )}
                  </div>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden">
              <CardHeader className="p-10 pb-0"><CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><Layout className="h-8 w-8 text-primary" /> Narrative Control</CardTitle></CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Heading 1 (White)</Label>
                     <Input className="h-14 bg-white/5 border-white/5 rounded-2xl" value={formData.heroHeadingWhite} onChange={e => setFormData({...formData, heroHeadingWhite: e.target.value})} />
                   </div>
                   <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Heading 1 (Neon)</Label>
                     <Input className="h-14 bg-white/5 border-white/5 rounded-2xl text-primary" value={formData.heroHeadingNeon} onChange={e => setFormData({...formData, heroHeadingNeon: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Hero Description</Label>
                  <Textarea className="min-h-[140px] bg-white/5 border-white/5 rounded-[2rem] p-6 text-lg" value={formData.heroDescription} onChange={e => setFormData({...formData, heroDescription: e.target.value})} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 pb-4"><CardTitle className="font-headline text-2xl font-bold flex items-center gap-4"><Globe className="h-6 w-6 text-primary" /> SEO Configuration</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Meta Title</Label>
                  <Input className="h-12 bg-white/5 border-white/5 rounded-xl px-4" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Meta Description</Label>
                  <Textarea className="min-h-[120px] bg-white/5 border-white/5 rounded-xl p-4 text-xs" value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden">
              <CardHeader className="p-8 pb-4"><CardTitle className="font-headline text-2xl font-bold flex items-center gap-4"><Mail className="h-6 w-6 text-primary" /> Support Network</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Support Email</Label>
                  <Input className="h-12 bg-white/5 border-white/5 rounded-xl px-4" value={formData.footerEmail} onChange={e => setFormData({...formData, footerEmail: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Support WhatsApp</Label>
                  <Input className="h-12 bg-white/5 border-white/5 rounded-xl px-4" value={formData.footerWhatsapp} onChange={e => setFormData({...formData, footerWhatsapp: e.target.value})} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Button type="submit" disabled={isSaving} className="w-full h-20 bg-primary text-black font-black text-2xl rounded-[2rem] shadow-2xl">
          {isSaving ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="mr-4 h-8 w-8" />}
          PUBLISH PLATFORM CHANGES
        </Button>
      </form>
    </div>
  );
}

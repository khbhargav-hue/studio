
'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Palette, 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Layout, 
  Globe, 
  Mail, 
  Upload, 
  Zap,
  Info,
  ShieldAlert,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'turfista_upload';

export default function BrandingStudioPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const { data: brandingData, loading } = useDoc(brandingRef);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    heroHeadingWhite: "PLAY",
    heroHeadingNeon: "MORE.",
    heroDescription: "Discover and book Mysuru’s best sports turfs in one place.",
    logoUrl: "",
    faviconUrl: "",
    heroImageUrl: "",
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

  const uploadToCloudinary = (file: File, key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!CLOUDINARY_CLOUD_NAME) {
        toast({ title: "Configuration Missing", variant: "destructive" });
        resolve(null);
        return;
      }

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      setUploadingStates(prev => ({ ...prev, [key]: true }));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, true);

      xhr.onload = () => {
        setUploadingStates(prev => ({ ...prev, [key]: false }));
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          toast({ title: "Media Sync Failed", variant: "destructive" });
          resolve(null);
        }
      };

      xhr.onerror = () => {
        setUploadingStates(prev => ({ ...prev, [key]: false }));
        toast({ title: "Network error", variant: "destructive" });
        resolve(null);
      };

      xhr.send(uploadData);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, key);
    if (url) {
      setFormData(prev => ({ ...prev, [`${key}Url`]: url }));
      toast({ title: "Asset Staged", description: `${key} identity updated.` });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsSaving(true);
    const docRef = doc(db, "settings", "branding");
    const dataToSave = {
      ...formData,
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(docRef, dataToSave, { merge: true });
      toast({ 
        title: "Platform Identity Synchronized", 
        description: "Changes are permanent across the network." 
      });
    } catch (err: any) {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: dataToSave,
        message: err.message
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <Loader2 className="h-14 w-14 animate-spin text-primary opacity-40" />
      <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.5em]">Establishing Connection...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Visual <span className="text-primary">Identity</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Configure global platform narratives and persistent branding assets.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        <Tabs defaultValue="hero" className="space-y-10">
          <TabsList className="bg-white/5 p-1 h-14 rounded-[1.5rem] border border-white/5">
            <TabsTrigger value="hero" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">Hero & Logo</TabsTrigger>
            <TabsTrigger value="seo" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">SEO & Support</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden">
                <CardHeader className="p-10 pb-0">
                  <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><Layout className="h-8 w-8 text-primary" /> Core Copy</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Heading (White)</Label>
                      <Input className="h-14 bg-white/5 border-white/5 rounded-2xl" value={formData.heroHeadingWhite} onChange={e => setFormData({...formData, heroHeadingWhite: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Heading (Neon)</Label>
                      <Input className="h-14 bg-white/5 border-white/5 rounded-2xl text-primary" value={formData.heroHeadingNeon} onChange={e => setFormData({...formData, heroHeadingNeon: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Platform Narrative</Label>
                    <Textarea className="min-h-[140px] bg-white/5 border-white/5 rounded-[2rem] p-6 text-lg leading-relaxed italic" value={formData.heroDescription} onChange={e => setFormData({...formData, heroDescription: e.target.value})} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden">
                <CardHeader className="p-10 pb-0"><CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><Smartphone className="h-8 w-8 text-primary" /> Permanent Assets</CardTitle></CardHeader>
                <CardContent className="p-10 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Identity Logo</Label>
                    <div 
                      className={cn(
                        "relative aspect-square rounded-3xl border-2 border-dashed flex items-center justify-center p-8 transition-all overflow-hidden bg-black/40 cursor-pointer",
                        uploadingStates['logo'] ? "opacity-50" : "border-primary/20 hover:border-primary/50"
                      )}
                      onClick={() => !uploadingStates['logo'] && logoInputRef.current?.click()}
                    >
                      {uploadingStates['logo'] ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : formData.logoUrl ? <img src={formData.logoUrl} className="max-h-full max-w-full object-contain" alt="Logo" /> : <Upload className="h-6 w-6 text-white/20" />}
                      <input type="file" ref={logoInputRef} onChange={e => handleFileUpload(e, 'logo')} accept="image/*" className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Browser Favicon</Label>
                    <div 
                      className={cn(
                        "relative aspect-square rounded-3xl border-2 border-dashed flex items-center justify-center p-8 transition-all overflow-hidden bg-black/40 cursor-pointer",
                        uploadingStates['favicon'] ? "opacity-50" : "border-primary/20 hover:border-primary/50"
                      )}
                      onClick={() => !uploadingStates['favicon'] && faviconInputRef.current?.click()}
                    >
                      {uploadingStates['favicon'] ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : formData.faviconUrl ? <img src={formData.faviconUrl} className="h-10 w-10 object-contain" alt="Favicon" /> : <Upload className="h-6 w-6 text-white/20" />}
                      <input type="file" ref={faviconInputRef} onChange={e => handleFileUpload(e, 'favicon')} accept="image/*" className="hidden" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-0"><CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><Globe className="h-8 w-8 text-primary" /> Search Discovery</CardTitle></CardHeader>
                <CardContent className="p-10 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Meta Title Template</Label>
                    <Input className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Search Snippet (Description)</Label>
                    <Textarea className="min-h-[160px] bg-white/5 border-white/5 rounded-[2rem] p-6 text-sm italic" value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-0"><CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><Mail className="h-8 w-8 text-primary" /> Support Hub</CardTitle></CardHeader>
                <CardContent className="p-10 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Administrative Email</Label>
                    <Input className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" value={formData.footerEmail} onChange={e => setFormData({...formData, footerEmail: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">WhatsApp Support Signal</Label>
                    <Input className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" value={formData.footerWhatsapp} onChange={e => setFormData({...formData, footerWhatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Copyright Identity</Label>
                    <Input className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" value={formData.copyrightText} onChange={e => setFormData({...formData, copyrightText: e.target.value})} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          type="submit" 
          disabled={isSaving} 
          className="w-full h-24 bg-primary text-black font-black text-3xl rounded-[2.5rem] shadow-2xl hover:scale-[1.01] transition-all"
        >
          {isSaving ? <Loader2 className="h-10 w-10 animate-spin" /> : <Save className="mr-6 h-10 w-10" />}
          PUBLISH PERMANENT IDENTITY
        </Button>
      </form>
    </div>
  );
}

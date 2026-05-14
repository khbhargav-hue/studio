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
  Target,
  Wind,
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldAlert
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
  const heroInputRef = useRef<HTMLInputElement>(null);
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const { data: brandingData, loading } = useDoc(brandingRef);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    heroHeadingWhite: "PLAY",
    heroHeadingNeon: "MORE.",
    heroDescription: "Discover and book Mysuru’s best sports turfs in one place.",
    logoUrl: "",
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
        toast({ title: "Configuration Missing", description: "Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your env.", variant: "destructive" });
        resolve(null);
        return;
      }

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      setUploadingStates(prev => ({ ...prev, [key]: true }));
      setUploadProgress(prev => ({ ...prev, [key]: 0 }));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ ...prev, [key]: progress }));
        }
      };

      xhr.onload = () => {
        setUploadingStates(prev => ({ ...prev, [key]: false }));
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          console.error("[Cloudinary] Upload Failure:", xhr.responseText);
          toast({ title: "Media Sync Failed", description: "Check diagnostic alert for setup instructions.", variant: "destructive" });
          resolve(null);
        }
      };

      xhr.onerror = () => {
        setUploadingStates(prev => ({ ...prev, [key]: false }));
        toast({ title: "Network error during media sync.", variant: "destructive" });
        resolve(null);
      };

      xhr.send(uploadData);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, 'logo');
    if (url) {
      setFormData(prev => ({ ...prev, logoUrl: url }));
      toast({ title: "Logo Captive", description: "Identity staged. Publish to persist." });
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, 'hero');
    if (url) {
      setFormData(prev => ({ ...prev, heroImageUrl: url }));
      toast({ title: "Hero Media Captive", description: "New athlete profile staged." });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "settings", "branding");
      const dataToSave = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      // Perform a blocking high-integrity write to ensure persistence
      await setDoc(docRef, dataToSave, { merge: true });
      
      toast({ 
        title: "Platform Identity Synchronized", 
        description: "Your changes are now permanent and live on the network." 
      });

    } catch (err: any) {
      console.error("[Studio] Persistence failure:", err);
      toast({ 
        variant: "destructive", 
        title: "Synchronization Error", 
        description: "Secure write failed. Check rules or connection." 
      });
      
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'settings/branding',
        operation: 'write',
        requestResourceData: formData,
        message: err.message
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <Loader2 className="h-14 w-14 animate-spin text-primary opacity-40" />
      <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.5em]">Establishing Branding Connection...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Visual <span className="text-primary text-neon">Identity</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Configure global platform narratives. Changes persist through all network builds.</p>
        </div>
      </div>

      <div className="mb-10">
        {!CLOUDINARY_CLOUD_NAME ? (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-[2rem] p-8">
            <AlertCircle className="h-6 w-6" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs mb-2">Cloudinary Disconnected</AlertTitle>
            <AlertDescription className="text-xs opacity-80 leading-relaxed font-medium">
              Media flows are inactive. Add <strong>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</strong> to your environment to enable uploads.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-primary/5 border-primary/20 text-primary rounded-[2rem] p-8">
            <ShieldAlert className="h-6 w-6" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs mb-2">Media Protocol Active</AlertTitle>
            <AlertDescription className="text-xs opacity-80 leading-relaxed font-medium">
              Cloud: <span className="font-bold">{CLOUDINARY_CLOUD_NAME}</span> • Active Preset: <span className="font-bold underline">{CLOUDINARY_UPLOAD_PRESET}</span>
              <p className="mt-2 text-[10px] opacity-60">Note: Ensure your preset is 'Unsigned' in your Cloudinary Dashboard Settings &gt; Upload.</p>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="hero" className="space-y-10">
        <TabsList className="bg-white/5 p-1 h-14 rounded-[1.5rem] border border-white/5">
          <TabsTrigger value="hero" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">Hero & Logo</TabsTrigger>
          <TabsTrigger value="seo" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">SEO & Support</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave} className="space-y-10">
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
                  
                  <div className="pt-8 border-t border-white/5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 block">Identity Logo</Label>
                    <div className="relative group cursor-pointer" onClick={() => !uploadingStates['logo'] && logoInputRef.current?.click()}>
                      <div className={cn(
                        "relative aspect-square w-40 rounded-3xl border-2 border-dashed flex items-center justify-center p-8 transition-all overflow-hidden",
                        uploadingStates['logo'] ? "opacity-50" : "border-primary/20 bg-black/40 hover:border-primary/50"
                      )}>
                        {uploadingStates['logo'] ? (
                          <div className="text-center w-full">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                            <Progress value={uploadProgress['logo']} className="h-1 bg-white/10" />
                          </div>
                        ) : (
                          formData.logoUrl ? <img src={formData.logoUrl} className="max-h-full max-w-full object-contain" alt="Logo" /> : <Upload className="h-6 w-6 text-white/20" />
                        )}
                      </div>
                      <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden">
                <CardHeader className="p-10 pb-4">
                  <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><ImageIcon className="h-8 w-8 text-primary" /> Visual Target</CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-4 space-y-10">
                   <div 
                      className={cn(
                        "relative aspect-square w-full max-w-[420px] mx-auto rounded-full border-2 border-dashed transition-all overflow-hidden flex items-center justify-center group bg-black/40",
                        uploadingStates['hero'] ? "opacity-50 border-primary/20" : "border-primary/40 hover:border-primary hover:shadow-[0_0_50px_rgba(57,255,20,0.1)] cursor-pointer"
                      )}
                      onClick={() => !uploadingStates['hero'] && heroInputRef.current?.click()}
                    >
                      {uploadingStates['hero'] ? (
                        <div className="text-center w-64 p-12">
                          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                          <Progress value={uploadProgress['hero']} className="h-2 bg-white/10" />
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-6 italic">Syncing Asset...</p>
                        </div>
                      ) : formData.heroImageUrl ? (
                        <div className="relative w-full h-full p-12 flex items-center justify-center">
                           <img src={formData.heroImageUrl} className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(170,255,0,0.2)]" alt="Hero" />
                           <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-black/80 px-8 py-4 rounded-full border border-primary/40 text-primary font-black uppercase tracking-widest text-[11px]">REPLACE ATHLETE</div>
                           </div>
                        </div>
                      ) : (
                        <div className="text-center p-12 opacity-30">
                          <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
                          <p className="text-[11px] font-black uppercase tracking-widest">TAP TO UPLOAD HERO</p>
                        </div>
                      )}
                      <input type="file" ref={heroInputRef} onChange={handleHeroUpload} className="hidden" accept="image/*" />
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                       <Info className="h-6 w-6 text-primary shrink-0" />
                       <p className="text-[11px] font-medium text-white/50 leading-relaxed uppercase tracking-widest">Recommended: <span className="text-primary font-black">1200 x 1200px</span>. PNG or WebP with transparent background preferred for premium blending.</p>
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">WhatsApp Support Signal (91...)</Label>
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

          <Button 
            type="submit" 
            disabled={isSaving} 
            className="w-full h-24 bg-primary text-black font-black text-3xl rounded-[2.5rem] shadow-2xl hover:scale-[1.01] transition-all"
          >
            {isSaving ? <Loader2 className="h-10 w-10 animate-spin" /> : <Save className="mr-6 h-10 w-10" />}
            PUBLISH CHANGES TO NETWORK
          </Button>
        </form>
      </Tabs>
    </div>
  );
}

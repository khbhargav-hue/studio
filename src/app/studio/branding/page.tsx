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

const DEFAULT_CHALLENGES = [
  { name: "Football", sub: "5v5 Challenge", icon: "Zap", imageUrl: "https://picsum.photos/seed/ball1/400/400", buttonText: "JOIN NOW" },
  { name: "Cricket", sub: "Match Challenge", icon: "Target", imageUrl: "https://picsum.photos/seed/bat1/400/400", buttonText: "JOIN NOW" },
  { name: "Badminton", sub: "Doubles Challenge", icon: "Wind", imageUrl: "https://picsum.photos/seed/shuttle1/400/400", buttonText: "JOIN NOW" },
  { name: "Pickleball", sub: "Dink Challenge", icon: "Star", imageUrl: "https://picsum.photos/seed/paddle1/400/400", buttonText: "JOIN NOW" }
];

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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
    heroHeading2White: "BOOK",
    heroHeading2Neon: "EASY.",
    heroDescription: "Discover and book Mysuru’s best sports turfs in one place.",
    logoUrl: "",
    heroImageUrl: "",
    seoTitle: "Turfista | Premium Sports Community in Mysuru",
    seoDescription: "Find elite sports arenas, join local teams, and challenge rivals in Mysuru.",
    footerEmail: "contact.turfista@gmail.com",
    footerWhatsapp: "917411322492",
    copyrightText: "© 2026 Turfista",
    challenges: DEFAULT_CHALLENGES
  });

  useEffect(() => {
    if (brandingData) {
      setFormData(prev => ({ 
        ...prev, 
        ...brandingData,
        challenges: Array.isArray(brandingData.challenges) ? brandingData.challenges : DEFAULT_CHALLENGES
      }));
    }
  }, [brandingData]);

  const uploadToCloudinary = (file: File, key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        toast({ 
          title: "Config Missing", 
          description: "Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env file.", 
          variant: "destructive" 
        });
        resolve(null);
        return;
      }

      console.log(`[Cloudinary] Starting upload to ${CLOUDINARY_CLOUD_NAME} using preset ${CLOUDINARY_UPLOAD_PRESET}`);

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
          const errorMsg = xhr.responseText;
          console.error("[Cloudinary] Upload Error:", errorMsg);
          
          let friendlyMsg = "Verify Cloudinary Cloud Name & Unsigned Preset.";
          if (errorMsg.includes("Upload preset not found")) {
            friendlyMsg = `The preset "${CLOUDINARY_UPLOAD_PRESET}" was not found. Please create an 'Unsigned' preset in Cloudinary Settings > Upload.`;
          }

          toast({ 
            title: "Media Upload Failed", 
            description: friendlyMsg, 
            variant: "destructive" 
          });
          resolve(null);
        }
      };

      xhr.onerror = () => {
        setUploadingStates(prev => ({ ...prev, [key]: false }));
        toast({ title: "Network error during upload.", variant: "destructive" });
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
      toast({ title: "Logo Staged", description: "Publish changes to save." });
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, 'hero');
    if (url) {
      setFormData(prev => ({ ...prev, heroImageUrl: url }));
      toast({ title: "Hero Media Staged", description: "Publish to go live." });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsSaving(true);
    
    try {
      const docRef = doc(db, "settings", "branding");
      
      const dataToSave = {
        heroHeadingWhite: String(formData.heroHeadingWhite || ""),
        heroHeadingNeon: String(formData.heroHeadingNeon || ""),
        heroHeading2White: String(formData.heroHeading2White || ""),
        heroHeading2Neon: String(formData.heroHeading2Neon || ""),
        heroDescription: String(formData.heroDescription || ""),
        logoUrl: String(formData.logoUrl || ""),
        heroImageUrl: String(formData.heroImageUrl || ""),
        seoTitle: String(formData.seoTitle || ""),
        seoDescription: String(formData.seoDescription || ""),
        footerEmail: String(formData.footerEmail || ""),
        footerWhatsapp: String(formData.footerWhatsapp || ""),
        copyrightText: String(formData.copyrightText || ""),
        challenges: (formData.challenges || []).map(c => ({
          name: String(c.name || ""),
          sub: String(c.sub || ""),
          imageUrl: String(c.imageUrl || ""),
          buttonText: String(c.buttonText || ""),
          icon: String(c.icon || "")
        })),
        updatedAt: serverTimestamp()
      };

      setDoc(docRef, dataToSave, { merge: true })
        .then(() => {
          toast({ title: "Changes Published", description: "Site identity synchronized successfully." });
          setIsSaving(false);
        })
        .catch(async (serverError) => {
          setIsSaving(false);
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'write',
            requestResourceData: dataToSave,
            message: serverError.message
          });
          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (err: any) {
      setIsSaving(false);
      toast({ variant: "destructive", title: "Error", description: "Could not prepare data for publish." });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <Loader2 className="h-14 w-14 animate-spin text-primary opacity-40" />
      <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em]">Synchronizing Brand Intel...</p>
    </div>
  );

  const isConfigMissing = !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET;

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Visual <span className="text-primary text-neon">Identity</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Configure global platform narratives and branding.</p>
        </div>
      </div>

      <div className="mb-10">
        {isConfigMissing ? (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-[2rem] p-8">
            <AlertCircle className="h-6 w-6" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs mb-2">Cloudinary Setup Required</AlertTitle>
            <AlertDescription className="text-xs opacity-80 leading-relaxed font-medium">
              Media flows are inactive. Add <strong>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</strong> and <strong>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</strong> to your .env file.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-primary/5 border-primary/20 text-primary rounded-[2rem] p-8">
            <ShieldAlert className="h-6 w-6" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs mb-2">Media Bridge Active</AlertTitle>
            <AlertDescription className="text-xs opacity-80 leading-relaxed font-medium">
              Cloud: <span className="font-bold">{CLOUDINARY_CLOUD_NAME}</span> • Preset: <span className="font-bold underline">{CLOUDINARY_UPLOAD_PRESET}</span>
              <p className="mt-2 text-[10px] opacity-60">Note: Ensure this preset is 'Unsigned' in your Cloudinary Dashboard.</p>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="hero" className="space-y-10">
        <TabsList className="bg-white/5 p-1 h-14 rounded-[1.5rem] border border-white/5">
          <TabsTrigger value="hero" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">Hero & Logo</TabsTrigger>
          <TabsTrigger value="challenges" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">Challenge Hub</TabsTrigger>
          <TabsTrigger value="seo" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase tracking-widest text-[10px]">SEO & Support</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave} className="space-y-10">
          <TabsContent value="hero" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden order-2 lg:order-1">
                <CardHeader className="p-10 pb-0">
                  <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><Layout className="h-8 w-8 text-primary" /> Copy Strategy</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Row 1 (White)</Label>
                      <Input className="h-14 bg-white/5 border-white/5 rounded-2xl" value={formData.heroHeadingWhite} onChange={e => setFormData({...formData, heroHeadingWhite: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Row 1 (Neon)</Label>
                      <Input className="h-14 bg-white/5 border-white/5 rounded-2xl text-primary" value={formData.heroHeadingNeon} onChange={e => setFormData({...formData, heroHeadingNeon: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Row 2 (White)</Label>
                      <Input className="h-14 bg-white/5 border-white/5 rounded-2xl" value={formData.heroHeading2White} onChange={e => setFormData({...formData, heroHeading2White: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Row 2 (Neon)</Label>
                      <Input className="h-14 bg-white/5 border-white/5 rounded-2xl text-primary" value={formData.heroHeading2Neon} onChange={e => setFormData({...formData, heroHeading2Neon: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Sub-Description</Label>
                    <Textarea className="min-h-[140px] bg-white/5 border-white/5 rounded-[2rem] p-6 text-lg leading-relaxed italic" value={formData.heroDescription} onChange={e => setFormData({...formData, heroDescription: e.target.value})} />
                  </div>
                  
                  <div className="pt-8 border-t border-white/5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 block">Primary Logo</Label>
                    <div className="relative group cursor-pointer" onClick={() => !uploadingStates['logo'] && !isConfigMissing && logoInputRef.current?.click()}>
                      <div className={cn(
                        "relative aspect-square w-40 rounded-3xl border-2 border-dashed flex items-center justify-center p-8 transition-all overflow-hidden",
                        isConfigMissing ? "opacity-20 cursor-not-allowed border-white/10" : "border-primary/20 bg-black/40 hover:border-primary/50"
                      )}>
                        {uploadingStates['logo'] ? (
                          <div className="text-center w-full px-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                            <Progress value={uploadProgress['logo']} className="h-1 bg-white/10" />
                          </div>
                        ) : (
                          formData.logoUrl ? <img src={formData.logoUrl} className="max-h-full max-w-full object-contain" alt="Logo Preview" /> : <Upload className="h-6 w-6 text-white/20" />
                        )}
                      </div>
                      <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-[3rem] overflow-hidden order-1 lg:order-2">
                <CardHeader className="p-10 pb-4">
                  <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                     <ImageIcon className="h-8 w-8 text-primary" />
                     Hero Backdrop
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-4 space-y-10">
                   <div className="flex items-center gap-3 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                      <Info className="h-5 w-5 text-primary shrink-0" />
                      <div className="text-[10px] font-black uppercase tracking-widest leading-tight text-white/60">
                        Recommended: <span className="text-primary italic">1200 × 1200 px</span> • PNG/WebP preferred
                      </div>
                   </div>

                   <div 
                      className={cn(
                        "relative aspect-square w-full max-w-[420px] mx-auto rounded-full border-2 border-dashed transition-all overflow-hidden flex items-center justify-center group",
                        isConfigMissing ? "opacity-20 cursor-not-allowed border-white/10" : "border-primary/40 bg-black/60 hover:border-primary hover:shadow-[0_0_50px_rgba(57,255,20,0.2)] cursor-pointer"
                      )}
                      onClick={() => !uploadingStates['hero'] && !isConfigMissing && heroInputRef.current?.click()}
                    >
                      {uploadingStates['hero'] ? (
                        <div className="text-center w-64 p-12">
                          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                          <Progress value={uploadProgress['hero']} className="h-2 bg-white/10" />
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-4">Uploading...</p>
                        </div>
                      ) : formData.heroImageUrl ? (
                        <div className="relative w-full h-full p-12 flex items-center justify-center">
                           <img src={formData.heroImageUrl} className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" alt="Hero Preview" />
                           <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-black/80 px-6 py-3 rounded-full border border-primary/40 text-primary font-black uppercase tracking-widest text-[10px]">Replace Media</div>
                           </div>
                        </div>
                      ) : (
                        <div className="text-center p-12 opacity-30">
                          <Upload className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase">Click to select athlete image</p>
                        </div>
                      )}
                      <input type="file" ref={heroInputRef} onChange={handleHeroUpload} className="hidden" accept="image/*" />
                    </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {formData.challenges.map((challenge, idx) => (
                <Card key={idx} className="glass-card border-white/5 rounded-[3rem] overflow-hidden">
                  <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
                      {challenge.name === 'Football' && <Zap className="h-5 w-5 text-primary" />}
                      {challenge.name === 'Cricket' && <Target className="h-5 w-5 text-primary" />}
                      {challenge.name === 'Badminton' && <Wind className="h-5 w-5 text-primary" />}
                      {challenge.name === 'Pickleball' && <Star className="h-5 w-5 text-primary" />}
                      {challenge.name} Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex gap-6">
                      <div 
                        className={cn(
                          "relative aspect-square w-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all",
                          isConfigMissing ? "opacity-20 cursor-not-allowed border-white/10" : "bg-black/40 border-white/10 cursor-pointer hover:border-primary/50"
                        )}
                        onClick={() => {
                          if (isConfigMissing) return;
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as any).files?.[0];
                            if (file) {
                              uploadToCloudinary(file, `cat-${idx}`).then(url => {
                                if (url) {
                                  const updated = [...formData.challenges];
                                  updated[idx].imageUrl = url;
                                  setFormData({...formData, challenges: updated});
                                }
                              });
                            }
                          };
                          input.click();
                        }}
                      >
                        {uploadingStates[`cat-${idx}`] ? (
                          <div className="p-4 w-full">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                          </div>
                        ) : (
                          challenge.imageUrl ? <img src={challenge.imageUrl} className="h-full w-full object-cover" alt="Cat Preview" /> : <Upload className="h-6 w-6 opacity-30" />
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-white/30">Subtitle</Label>
                          <Input 
                            className="h-10 bg-white/5 border-white/5 rounded-xl" 
                            value={challenge.sub} 
                            onChange={e => {
                              const updated = [...formData.challenges];
                              updated[idx].sub = e.target.value;
                              setFormData({...formData, challenges: updated});
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-white/30">Button Label</Label>
                          <Input 
                            className="h-10 bg-white/5 border-white/5 rounded-xl" 
                            value={challenge.buttonText} 
                            onChange={e => {
                              const updated = [...formData.challenges];
                              updated[idx].buttonText = e.target.value;
                              setFormData({...formData, challenges: updated});
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-0"><CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><Globe className="h-8 w-8 text-primary" /> SEO Intelligence</CardTitle></CardHeader>
                <CardContent className="p-10 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Meta Title</Label>
                    <Input className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Meta Description</Label>
                    <Textarea className="min-h-[160px] bg-white/5 border-white/5 rounded-[2rem] p-6 text-sm italic" value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-0"><CardTitle className="font-headline text-3xl font-bold flex items-center gap-4"><Mail className="h-8 w-8 text-primary" /> Support Relay</CardTitle></CardHeader>
                <CardContent className="p-10 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Primary Email</Label>
                    <Input className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" value={formData.footerEmail} onChange={e => setFormData({...formData, footerEmail: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">WhatsApp Support (91...)</Label>
                    <Input className="h-14 bg-white/5 border-white/5 rounded-2xl px-6" value={formData.footerWhatsapp} onChange={e => setFormData({...formData, footerWhatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Copyright Label</Label>
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
            PUBLISH CHANGES TO LIVE PORTAL
          </Button>
        </form>
      </Tabs>
    </div>
  );
}

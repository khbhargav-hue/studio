'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  Save, 
  Image as ImageIcon, 
  Zap, 
  Trophy, 
  Settings2, 
  IndianRupee, 
  Upload, 
  X,
  Plus,
  AlertCircle
} from "lucide-react";
import { generateTurfDescriptionForAdmin } from "@/ai/flows/generate-turf-description-for-admin";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SPORT_OPTIONS = ["Cricket", "Football", "Pickleball", "Badminton"];
const COURT_OPTIONS = [
  "Cricket Half Court", 
  "Cricket Full Court", 
  "Football Half Court", 
  "Football Full Court",
  "Pickleball Court",
  "Badminton Court"
];

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function SelectionGroup({ 
  title, 
  options, 
  selected, 
  onToggle, 
  icon: Icon 
}: { 
  title: string, 
  options: string[], 
  selected: string[], 
  onToggle: (val: string) => void,
  icon?: any
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <Label className="text-sm font-bold uppercase tracking-widest opacity-70">{title}</Label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const id = `opt-${title.replace(/\s+/g, '-')}-${opt}`;
          return (
            <label 
              key={opt}
              htmlFor={id}
              className={cn(
                "group relative flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer",
                isSelected 
                  ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(57,255,20,0.1)]" 
                  : "bg-white/5 border-white/5 hover:border-white/20"
              )}
            >
              <Checkbox 
                id={id}
                checked={isSelected}
                onCheckedChange={() => onToggle(opt)}
                className={cn(isSelected && "border-primary")}
              />
              <span 
                className={cn(
                  "flex-1 text-xs font-semibold select-none", 
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              >
                {opt}
              </span>
              {isSelected && <div className="absolute inset-0 bg-primary/5 rounded-xl animate-pulse pointer-events-none" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function NewTurfForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const db = useFirestore();
  const editId = searchParams.get("id");
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !editId) return null;
    return doc(db, "turfs", editId);
  }, [db, editId]);

  const { data: existingTurf, loading: loadingExisting } = useDoc(turfDocRef);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    area: "",
    location: "",
    pricePerHour: 1000,
    courtPricing: {} as Record<string, number>,
    description: "",
    amenities: ["Flood Lights", "Parking", "Washroom"] as string[],
    sportTypes: [] as string[],
    courtTypes: [] as string[],
    rating: 4.5,
    reviewCount: 0,
    openingHours: "Open 24 Hours",
    contactNumber: "",
    whatsappNumber: "",
    mainImage: "",
    galleryImages: [] as string[],
    mapUrl: "",
    isPopular: false
  });

  useEffect(() => {
    if (existingTurf && editId) {
      setFormData(prev => ({
        ...prev,
        ...existingTurf,
        id: existingTurf.id || editId,
        courtPricing: existingTurf.courtPricing || {},
        galleryImages: existingTurf.galleryImages || []
      }));
    }
  }, [existingTurf, editId]);

  const uploadToCloudinary = (file: File, key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        toast({ title: "Cloudinary Setup Required in .env", variant: "destructive" });
        resolve(null);
        return;
      }

      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

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
          console.error("Cloudinary Error:", xhr.responseText);
          toast({ title: "CDN Upload Failed. Check Cloud Name & Preset.", variant: "destructive" });
          resolve(null);
        }
      };

      xhr.onerror = () => {
        setUploadingStates(prev => ({ ...prev, [key]: false }));
        toast({ title: "Network Error during CDN upload", variant: "destructive" });
        resolve(null);
      };

      xhr.send(form);
    });
  };

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, 'main');
    if (url) setFormData(prev => ({ ...prev, mainImage: url }));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadToCloudinary(files[i], `gal-${i}`);
      if (url) setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, url] }));
    }
  };

  const toggleSelection = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  }, []);

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.area) {
      toast({ title: "Identity Required", description: "Name and Area must be set for AI context.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateTurfDescriptionForAdmin({
        turfName: formData.name,
        location: `${formData.area}, Mysuru`,
        sportTypes: formData.sportTypes as any,
        pricePerHour: formData.pricePerHour,
        amenities: formData.amenities,
      });
      setFormData(prev => ({ ...prev, description: result.description }));
      toast({ title: "Intelligence Generated" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    console.log("[Studio/New] Starting deployment flow...");
    setIsSaving(true);
    
    try {
      const id = editId || formData.name.toLowerCase().replace(/\s+/g, '-');
      const turfRef = doc(db, "turfs", id);
      
      // Sanitization: Picking only required fields and ensuring no undefined values
      const dataToSave = { 
        id,
        name: formData.name || "",
        area: formData.area || "",
        location: formData.location || "",
        pricePerHour: Number(formData.pricePerHour) || 0,
        courtPricing: formData.courtPricing || {},
        description: formData.description || "",
        amenities: formData.amenities || [],
        sportTypes: formData.sportTypes || [],
        courtTypes: formData.courtTypes || [],
        rating: Number(formData.rating) || 4.5,
        reviewCount: Number(formData.reviewCount) || 0,
        openingHours: formData.openingHours || "",
        contactNumber: formData.contactNumber || "",
        whatsappNumber: formData.whatsappNumber || "",
        mainImage: formData.mainImage || "",
        galleryImages: formData.galleryImages || [],
        mapUrl: formData.mapUrl || "",
        isPopular: !!formData.isPopular,
        updatedAt: serverTimestamp() 
      };

      console.log("[Studio/New] Deployment payload ready:", dataToSave);

      setDoc(turfRef, dataToSave, { merge: true })
      .then(() => {
        console.log("[Studio/New] Deployment successful.");
        toast({ title: "Arena Deployed", description: "The listing is now active on the discovery feed." });
        setIsSaving(false);
        router.push("/studio");
      })
      .catch(async (err) => {
        console.error("[Studio/New] Deployment rejected:", err);
        setIsSaving(false);
        
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: turfRef.path,
          operation: 'write',
          requestResourceData: dataToSave,
          message: err.message
        }));
      });

    } catch (err: any) {
      console.error("[Studio/New] Critical exception in handleSubmit:", err);
      setIsSaving(false);
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: err.message || "An unexpected error occurred during sanitization."
      });
    }
  };

  const isConfigMissing = !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET;

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-12">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group font-black text-[10px] uppercase tracking-[0.3em] text-white/40 h-12">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(57,255,20,1)]" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">CDN Deployment active</span>
        </div>
      </div>

      {isConfigMissing && (
        <Alert variant="destructive" className="mb-10 bg-destructive/10 border-destructive/20 text-destructive rounded-[2rem] p-8">
          <AlertCircle className="h-6 w-6" />
          <AlertTitle className="font-black uppercase tracking-widest text-xs mb-2">Cloudinary Setup Required</AlertTitle>
          <AlertDescription className="text-xs opacity-80 leading-relaxed font-medium">
            Define <strong>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</strong> and <strong>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</strong> in your <strong>.env</strong> to enable the media engine.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-10">
            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Settings2 className="h-8 w-8 text-primary" />
                  Arena Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Turf Identity</Label>
                    <Input 
                      placeholder="e.g., Shine Arena" 
                      className="h-14 bg-background/50 border-white/5 rounded-2xl"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Zone (Area)</Label>
                    <Input 
                      placeholder="e.g., Rajiv Nagar" 
                      className="h-14 bg-background/50 border-white/5 rounded-2xl"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Physical Location</Label>
                  <Input 
                    placeholder="Full street address..." 
                    className="h-14 bg-background/50 border-white/5 rounded-2xl"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Base Price (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                      <Input 
                        type="number"
                        className="h-14 pl-12 bg-background/50 border-white/5 rounded-2xl font-black text-xl text-primary"
                        value={formData.pricePerHour}
                        onChange={(e) => setFormData({...formData, pricePerHour: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">WhatsApp Bridge</Label>
                    <Input 
                      placeholder="91..."
                      className="h-14 bg-background/50 border-white/5 rounded-2xl"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Sparkles className="h-8 w-8 text-accent" />
                  Marketing Narrative
                </CardTitle>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="bg-accent text-accent-foreground font-black uppercase tracking-widest text-[9px] h-10 px-6 rounded-xl"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "GENERATE WITH AI"}
                </Button>
              </CardHeader>
              <CardContent className="p-10 pt-4">
                <Textarea 
                  placeholder="The AI engine will craft a premium description..." 
                  className="min-h-[250px] bg-background/50 border-white/5 rounded-[2rem] p-8 leading-relaxed resize-none italic font-medium"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-10">
            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-4">
                  <ImageIcon className="h-6 w-6 text-primary" />
                  Arena Assets (Cloudinary)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Primary Display (Thumbnail)</Label>
                  <div 
                    className={cn(
                      "relative aspect-video rounded-3xl border-2 border-dashed transition-all overflow-hidden group",
                      isConfigMissing ? "opacity-20 cursor-not-allowed border-white/10" : "border-primary/20 bg-primary/5 hover:border-primary/50 cursor-pointer"
                    )}
                    onClick={() => !uploadingStates['main'] && !isConfigMissing && mainInputRef.current?.click()}
                  >
                    {uploadingStates['main'] && (
                      <div className="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <Progress value={uploadProgress['main']} className="h-1 w-full bg-white/10" />
                        <p className="text-[9px] font-black uppercase text-primary mt-4">Optimizing for CDN...</p>
                      </div>
                    )}
                    {formData.mainImage ? (
                      <img src={formData.mainImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                        <Upload className="h-10 w-10" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Select Main Image</span>
                      </div>
                    )}
                    <input type="file" ref={mainInputRef} onChange={handleMainUpload} className="hidden" accept="image/*" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Gallery Node</Label>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      disabled={isConfigMissing}
                      className="h-8 px-4 rounded-lg text-[9px] font-black uppercase" 
                      onClick={() => galleryInputRef.current?.click()}
                    >
                       ADD PHOTOS
                    </Button>
                    <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} className="hidden" multiple accept="image/*" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {formData.galleryImages.map((url, i) => (
                      <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFormData(p => ({...p, galleryImages: p.galleryImages.filter(u => u !== url)}))} className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <X className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-4">
                  <Zap className="h-6 w-6 text-primary" />
                  Platform Logic
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <SelectionGroup title="Sport Categories" options={SPORT_OPTIONS} selected={formData.sportTypes} onToggle={(v) => toggleSelection('sportTypes', v)} icon={Trophy} />
                <SelectionGroup title="Court Formats" options={COURT_OPTIONS} selected={formData.courtTypes} onToggle={(v) => toggleSelection('courtTypes', v)} />
                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">Elite Promotion</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Feature on city discovery feed</p>
                    </div>
                    <Switch checked={formData.isPopular} onCheckedChange={(c) => setFormData({...formData, isPopular: c})} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 pt-10">
          <Button 
            type="submit" 
            disabled={isSaving} 
            className="flex-1 h-20 bg-primary text-black font-black text-2xl rounded-[2rem] shadow-2xl transition-all"
          >
            {isSaving ? <Loader2 className="mr-4 h-8 w-8 animate-spin" /> : <Save className="mr-4 h-8 w-8" />}
            {editId ? "PUBLISH UPDATES" : "DEPLOY ARENA"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-20 px-12 border-white/10 bg-white/5 rounded-[2rem] font-black text-xl hover:bg-destructive hover:text-white hover:border-destructive transition-all">
            ABORT
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewTurfPage() {
  return (
    <Suspense fallback={null}>
      <NewTurfForm />
    </Suspense>
  );
}

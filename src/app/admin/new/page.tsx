
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
  Plus
} from "lucide-react";
import { generateTurfDescriptionForAdmin } from "@/ai/flows/generate-turf-description-for-admin";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SPORT_OPTIONS = ["Cricket", "Football", "Pickleball"];
const COURT_OPTIONS = [
  "Cricket Half Court", 
  "Cricket Full Court", 
  "Football Half Court", 
  "Football Full Court",
  "Pickleball Court"
];

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

  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !editId) return null;
    return doc(db, "turfs", editId);
  }, [db, editId]);

  const { data: branding } = useDoc(brandingRef);
  const { data: existingTurf, loading: loadingExisting } = useDoc(turfDocRef);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
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
    coachingServices: [] as string[],
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

  const uploadToCloudinary = async (file: File) => {
    if (!branding?.cloudinaryCloudName || !branding?.cloudinaryUploadPreset) {
      toast({
        title: "Configuration Missing",
        description: "Configure Cloudinary in Branding Settings first.",
        variant: "destructive"
      });
      return null;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', branding.cloudinaryUploadPreset);
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${branding.cloudinaryCloudName}/image/upload`, {
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
        title: "Upload Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMain(true);
    const url = await uploadToCloudinary(file);
    if (url) {
      setFormData(prev => ({ ...prev, mainImage: url }));
      toast({ title: "Main Image Updated" });
    }
    setIsUploadingMain(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingGallery(true);
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      if (url) {
        setFormData(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, url]
        }));
      }
    }
    setIsUploadingGallery(false);
    toast({ title: "Gallery Updated" });
  };

  const toggleSelection = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        const next = current.filter(v => v !== value);
        return { ...prev, [field]: next };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  }, []);

  const handlePriceChange = (courtType: string, price: string) => {
    setFormData(prev => ({
      ...prev,
      courtPricing: {
        ...prev.courtPricing,
        [courtType]: Number(price)
      }
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.area) {
      toast({ title: "Name & Area required for AI", variant: "destructive" });
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
      toast({ title: "Description Generated" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const id = editId || formData.name.toLowerCase().replace(/\s+/g, '-');
    const turfRef = doc(db, "turfs", id);
    
    setDoc(turfRef, {
      ...formData,
      id,
      updatedAt: serverTimestamp()
    }, { merge: true })
    .then(() => {
      toast({ title: "Venue Published" });
      router.push("/admin");
    })
    .catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: turfRef.path,
        operation: 'write',
        requestResourceData: formData
      }));
    });
  };

  if (editId && loadingExisting) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-12">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(57,255,20,1)]" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Admin Control Active</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-10">
            {/* Identity Card */}
            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Settings2 className="h-8 w-8 text-primary" />
                  Arena Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Turf Name</Label>
                    <Input 
                      placeholder="e.g., Kuber's Turf" 
                      className="h-14 bg-background/50 border-white/5 rounded-2xl"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Zone (Area)</Label>
                    <Input 
                      placeholder="e.g., Kuvempunagar" 
                      className="h-14 bg-background/50 border-white/5 rounded-2xl"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Full Location Address</Label>
                  <Input 
                    placeholder="Physical coordinates..." 
                    className="h-14 bg-background/50 border-white/5 rounded-2xl"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Starting Price (₹)</Label>
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
                    <Label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Opening Hours</Label>
                    <Input 
                      className="h-14 bg-background/50 border-white/5 rounded-2xl"
                      value={formData.openingHours}
                      onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                    />
                  </div>
                </div>

                {formData.courtTypes.length > 0 && (
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Dynamic Pricing Breakdown</h4>
                    <div className="grid gap-4">
                      {formData.courtTypes.map(type => (
                        <div key={type} className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="flex-1 text-xs font-bold uppercase">{type}</span>
                          <div className="w-32 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 font-bold">₹</span>
                            <Input 
                              type="number"
                              className="h-12 pl-8 bg-black/40 border-white/5 rounded-xl text-primary font-bold"
                              value={formData.courtPricing[type] || ""}
                              onChange={(e) => handlePriceChange(type, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Copywriting */}
            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-3xl font-bold flex items-center gap-4">
                  <Sparkles className="h-8 w-8 text-accent" />
                  Marketing Intel
                </CardTitle>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="bg-accent text-accent-foreground font-black uppercase tracking-widest text-[9px] h-10 px-6 rounded-xl"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate with AI
                </Button>
              </CardHeader>
              <CardContent className="p-10 pt-4">
                <Textarea 
                  placeholder="The engine uses AI to craft premium descriptions..." 
                  className="min-h-[250px] bg-background/50 border-white/5 rounded-[2rem] p-8 leading-relaxed resize-none focus:border-accent/40"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-10">
            {/* Real Media Upload */}
            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-4">
                  <ImageIcon className="h-6 w-6 text-primary" />
                  Real Imagery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                {/* Main Image Dropzone */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Primary Display (Thumbnail)</Label>
                  <div 
                    className="relative aspect-video rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 hover:border-primary/50 transition-all cursor-pointer overflow-hidden group"
                    onClick={() => mainInputRef.current?.click()}
                  >
                    <AnimatePresence>
                      {isUploadingMain && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                          <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Optimizing...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {formData.mainImage ? (
                      <img src={formData.mainImage} alt="Main" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                        <Upload className="h-10 w-10" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Select Main Photo</span>
                      </div>
                    )}
                    <input type="file" ref={mainInputRef} onChange={handleMainUpload} className="hidden" accept="image/*" />
                  </div>
                </div>

                {/* Gallery Dropzone */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Gallery Collection</Label>
                    <span className="text-[9px] font-black text-primary uppercase">{formData.galleryImages.length} Photos</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatePresence>
                      {formData.galleryImages.map((url, i) => (
                        <motion.div key={url} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                          <img src={url} alt={`Gal ${i}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setFormData(p => ({ ...p, galleryImages: p.galleryImages.filter(u => u !== url) }))}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    <button 
                      type="button" 
                      onClick={() => galleryInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-white/20 transition-all"
                    >
                      {isUploadingGallery ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Plus className="h-6 w-6 text-white/20" />}
                      <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Add More</span>
                    </button>
                    <input type="file" ref={galleryInputRef} onChange={handleGalleryUpload} className="hidden" multiple accept="image/*" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Config Options */}
            <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-4">
                  <Zap className="h-6 w-6 text-primary" />
                  Platform Config
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <SelectionGroup 
                  title="Supported Sports"
                  options={SPORT_OPTIONS}
                  selected={formData.sportTypes}
                  onToggle={(v) => toggleSelection('sportTypes', v)}
                  icon={Trophy}
                />
                
                <SelectionGroup 
                  title="Arena Formats"
                  options={COURT_OPTIONS}
                  selected={formData.courtTypes}
                  onToggle={(v) => toggleSelection('courtTypes', v)}
                />

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">Promoted Venue</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Show on featured discovery page</p>
                    </div>
                    <Switch 
                      checked={formData.isPopular}
                      onCheckedChange={(c) => setFormData({...formData, isPopular: c})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 pt-10">
          <Button type="submit" className="flex-1 h-20 bg-primary text-black font-black text-2xl rounded-[2rem] shadow-2xl hover:scale-[1.01] transition-transform">
            <Save className="mr-4 h-8 w-8" /> {editId ? "PUBLISH UPDATES" : "PUBLISH ARENA"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-20 px-12 border-white/10 bg-white/5 rounded-[2rem] font-black text-xl hover:bg-white/10">
            DISCARD
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewTurfPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <NewTurfForm />
    </Suspense>
  );
}

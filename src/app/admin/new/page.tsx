
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
  CardDescription, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2, Save, Image as ImageIcon, Zap, Trophy, MapPin, Settings2, Globe, IndianRupee, Upload, X } from "lucide-react";
import { generateTurfDescriptionForAdmin } from "@/ai/flows/generate-turf-description-for-admin";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
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
const FACILITY_OPTIONS = [
  "Swimming Pool", 
  "Parking", 
  "Flood Lights", 
  "Washroom", 
  "Drinking Water", 
  "Cafeteria", 
  "Seating Area"
];
const COACHING_OPTIONS = [
  "Leather Cricket Coaching", 
  "Cricket Coaching", 
  "Football Coaching", 
  "Kids Football Coaching", 
  "Personal Training"
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
                  ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(26,255,115,0.1)]" 
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    area: "",
    location: "",
    pricePerHour: 1000,
    courtPricing: {} as Record<string, number>,
    description: "",
    amenities: [] as string[],
    sportTypes: [] as string[],
    courtTypes: [] as string[],
    coachingServices: [] as string[],
    rating: 4.5,
    reviewCount: 0,
    openingHours: "06:00 AM - 11:00 PM",
    contactNumber: "",
    whatsappNumber: "",
    images: [] as string[],
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
        images: existingTurf.images || []
      }));
    }
  }, [existingTurf, editId]);

  const uploadToCloudinary = async (file: File) => {
    if (!branding?.cloudinaryCloudName || !branding?.cloudinaryUploadPreset) {
      toast({
        title: "Configuration Required",
        description: "Please set up Cloudinary in Branding Settings before uploading images.",
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
        title: "Upload Failed",
        description: error.message || "Cloudinary connection issue.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadToCloudinary(file);
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      toast({ title: "Image Uploaded", description: "Venue gallery updated locally. Click Publish to save." });
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleSelection = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        const next = current.filter(v => v !== value);
        const nextPricing = { ...prev.courtPricing };
        if (field === 'courtTypes') delete nextPricing[value];
        return { ...prev, [field]: next, courtPricing: nextPricing };
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
      toast({
        title: "Info Missing",
        description: "Add a name and area so AI can write a contextual description.",
        variant: "destructive"
      });
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
        uniqueFeatures: formData.coachingServices.length > 0 
          ? `Includes specialized coaching in: ${formData.coachingServices.join(', ')}.`
          : undefined
      });
      setFormData(prev => ({ ...prev, description: result.description }));
      toast({
        title: "AI Description Ready",
        description: "Review the generated content below.",
      });
    } catch (error) {
      toast({
        title: "AI Writing Failed",
        description: "Try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const prices = Object.values(formData.courtPricing);
    const minPrice = prices.length > 0 ? Math.min(...prices) : formData.pricePerHour;

    const id = editId || formData.name.toLowerCase().replace(/\s+/g, '-');
    const turfRef = doc(db, "turfs", id);
    
    setDoc(turfRef, {
      ...formData,
      id,
      pricePerHour: minPrice,
      updatedAt: serverTimestamp()
    }, { merge: true })
    .then(() => {
      toast({
        title: editId ? "Venue Updated" : "Venue Created",
        description: `${formData.name} is now live.`
      });
      router.push("/admin");
    })
    .catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: turfRef.path,
        operation: editId ? 'update' : 'create',
        requestResourceData: formData
      });
      errorEmitter.emit('permission-error', permissionError);
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
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="hover:bg-white/5 rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-2xl">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-xs font-bold text-accent uppercase tracking-widest">Real-time Sync</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-8">
            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                  <Settings2 className="h-6 w-6 text-primary" />
                  Venue Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Venue Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Kuber's Turf" 
                      className="h-12 bg-background/50 border-white/5 rounded-xl"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (Mysuru)</Label>
                    <Input 
                      id="area" 
                      placeholder="e.g., Kuvempunagar" 
                      className="h-12 bg-background/50 border-white/5 rounded-xl"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Address</Label>
                  <Input 
                    id="location" 
                    placeholder="Full address for players..." 
                    className="h-12 bg-background/50 border-white/5 rounded-xl"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Hourly (₹)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      className="h-12 bg-background/50 border-white/5 rounded-xl font-bold text-primary"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({...formData, pricePerHour: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timings">Hours</Label>
                    <Input 
                      id="timings" 
                      placeholder="e.g., 24 Hours"
                      className="h-12 bg-background/50 border-white/5 rounded-xl"
                      value={formData.openingHours}
                      onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                    />
                  </div>
                </div>

                {formData.courtTypes.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" /> Court Rates
                    </h4>
                    <div className="space-y-3">
                      {formData.courtTypes.map(type => (
                        <div key={type} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <Label className="flex-1 text-xs font-bold">{type}</Label>
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                            <Input 
                              type="number"
                              className="pl-7 h-10 bg-background/50 border-white/5 rounded-xl font-bold"
                              value={formData.courtPricing[type] || ""}
                              onChange={(e) => handlePriceChange(type, e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Phone</Label>
                    <Input 
                      id="contact" 
                      className="h-12 bg-background/50 border-white/5 rounded-xl"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp (91...)</Label>
                    <Input 
                      id="whatsapp" 
                      className="h-12 bg-background/50 border-white/5 rounded-xl"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-accent" />
                  Market Copy
                </CardTitle>
                <Button 
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-accent text-accent-foreground font-black hover:opacity-90 rounded-xl px-4"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  AI ASSIST
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <Textarea 
                  placeholder="Marketing description..." 
                  className="min-h-[200px] bg-background/50 border-white/5 rounded-2xl p-4 leading-relaxed resize-none focus:border-accent/40"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
            {/* Gallery Upload Section */}
            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                  <ImageIcon className="h-6 w-6 text-primary" />
                  Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div 
                  className="relative aspect-video rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/50 transition-all overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                      >
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Optimizing...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-white">Upload Photos</p>
                      <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">PNG, JPG, WEBP</p>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <AnimatePresence>
                    {formData.images.map((url, i) => (
                      <motion.div 
                        key={url}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group"
                      >
                        <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="font-headline text-xl font-bold flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <SelectionGroup 
                  title="Sports"
                  options={SPORT_OPTIONS}
                  selected={formData.sportTypes}
                  onToggle={(v) => toggleSelection('sportTypes', v)}
                  icon={Trophy}
                />
                <SelectionGroup 
                  title="Formats"
                  options={COURT_OPTIONS}
                  selected={formData.courtTypes}
                  onToggle={(v) => toggleSelection('courtTypes', v)}
                />
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Label className="text-sm font-bold">Featured</Label>
                    <Switch 
                      checked={formData.isPopular}
                      onCheckedChange={(checked) => setFormData({...formData, isPopular: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4 pt-8">
          <Button type="submit" className="flex-1 h-16 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-xl hover:scale-[1.01] transition-transform">
            <Save className="mr-3 h-6 w-6" /> {editId ? "SAVE CHANGES" : "PUBLISH VENUE"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()} className="h-16 px-8 border border-white/5 rounded-2xl font-bold">
            CANCEL
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewTurfPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <NewTurfForm />
    </Suspense>
  );
}

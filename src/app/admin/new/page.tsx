
'use client';

import { useState, useEffect, Suspense, useCallback } from "react";
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
import { ArrowLeft, Sparkles, Loader2, Save, Image as ImageIcon, Zap, Trophy, MapPin, Settings2 } from "lucide-react";
import { generateTurfDescriptionForAdmin } from "@/ai/flows/generate-turf-description-for-admin";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from "@/lib/utils";

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
          const checkboxId = `opt-${title.toLowerCase().replace(/\s+/g, '-')}-${opt.toLowerCase().replace(/\s+/g, '-')}`;
          return (
            <div 
              key={opt}
              className={cn(
                "group relative flex items-center space-x-3 p-3 rounded-xl border transition-all",
                isSelected 
                  ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(26,255,115,0.1)]" 
                  : "bg-white/5 border-white/5 hover:border-white/20"
              )}
            >
              <Checkbox 
                id={checkboxId}
                checked={isSelected}
                onCheckedChange={() => onToggle(opt)}
                className={cn(isSelected && "border-primary")}
              />
              <Label 
                htmlFor={checkboxId}
                className={cn(
                  "flex-1 text-xs font-semibold cursor-pointer z-10", 
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              >
                {opt}
              </Label>
              {isSelected && <div className="absolute inset-0 bg-primary/5 rounded-xl animate-pulse pointer-events-none" />}
            </div>
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

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !editId) return null;
    return doc(db, "turfs", editId);
  }, [db, editId]);

  const { data: existingTurf, loading: loadingExisting } = useDoc(turfDocRef);

  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    area: "",
    location: "",
    pricePerHour: 1000,
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
    images: [""],
    isPopular: false
  });

  // Sync existing turf data to state
  useEffect(() => {
    if (existingTurf) {
      setFormData(prev => {
        // Prevent unnecessary state updates if data is same
        if (prev.id === existingTurf.id && prev.name === existingTurf.name && prev.updatedAt === existingTurf.updatedAt) {
          return prev;
        }
        return {
          ...existingTurf,
          id: existingTurf.id || "",
          pricePerHour: existingTurf.pricePerHour || 1000,
          amenities: existingTurf.amenities || [],
          sportTypes: existingTurf.sportTypes || [],
          courtTypes: existingTurf.courtTypes || [],
          coachingServices: existingTurf.coachingServices || [],
          images: existingTurf.images?.length ? existingTurf.images : [""]
        };
      });
    }
  }, [existingTurf]);

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

    const id = editId || formData.name.toLowerCase().replace(/\s+/g, '-');
    const turfRef = doc(db, "turfs", id);
    
    setDoc(turfRef, {
      ...formData,
      id,
      updatedAt: serverTimestamp()
    }, { merge: true })
    .catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: turfRef.path,
        operation: editId ? 'update' : 'create',
        requestResourceData: formData
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    toast({
      title: editId ? "Venue Updated" : "Venue Created",
      description: `${formData.name} is now live.`
    });
    router.push("/admin");
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-2xl">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-xs font-bold text-accent uppercase tracking-widest">Advanced Setup</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                  <Settings2 className="h-6 w-6 text-primary" />
                  Core Details
                </CardTitle>
                <CardDescription>Primary information about the sports facility.</CardDescription>
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
                  <Label htmlFor="location">Full Address</Label>
                  <Input 
                    id="location" 
                    placeholder="Exact location for directions..." 
                    className="h-12 bg-background/50 border-white/5 rounded-xl"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price Per Hour (₹)</Label>
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
                    <Label htmlFor="timings">Operating Hours</Label>
                    <Input 
                      id="timings" 
                      placeholder="e.g., 24 Hours or 06:00 AM - 10:30 PM"
                      className="h-12 bg-background/50 border-white/5 rounded-xl"
                      value={formData.openingHours}
                      onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-accent" />
                    Listing Copy
                  </CardTitle>
                </div>
                <Button 
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-accent text-accent-foreground font-black hover:opacity-90 rounded-xl px-4"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  AI WRITE
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <Textarea 
                  placeholder="The AI will help write this based on your selected features..." 
                  className="min-h-[220px] bg-background/50 border-white/5 rounded-2xl p-4 leading-relaxed resize-none focus:border-accent/40"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </CardContent>
            </Card>
          </div>

          {/* Configuration Column */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="font-headline text-xl font-bold flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  Facility Options
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                
                <SelectionGroup 
                  title="Sport Types"
                  options={SPORT_OPTIONS}
                  selected={formData.sportTypes}
                  onToggle={(v) => toggleSelection('sportTypes', v)}
                  icon={Trophy}
                />

                <SelectionGroup 
                  title="Court Sizes"
                  options={COURT_OPTIONS}
                  selected={formData.courtTypes}
                  onToggle={(v) => toggleSelection('courtTypes', v)}
                  icon={Settings2}
                />

                <SelectionGroup 
                  title="Extra Facilities"
                  options={FACILITY_OPTIONS}
                  selected={formData.amenities}
                  onToggle={(v) => toggleSelection('amenities', v)}
                />

                <SelectionGroup 
                  title="Coaching Services"
                  options={COACHING_OPTIONS}
                  selected={formData.coachingServices}
                  onToggle={(v) => toggleSelection('coachingServices', v)}
                />

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Featured Venue</Label>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Boost to homepage spotlight</p>
                    </div>
                    <Switch 
                      checked={formData.isPopular}
                      onCheckedChange={(checked) => setFormData({...formData, isPopular: checked})}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="font-headline text-lg font-bold flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  Media Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Main Cover Image URL</Label>
                  <Input 
                    placeholder="https://images.unsplash.com/..." 
                    className="bg-background/50 border-white/5 rounded-xl h-10"
                    value={formData.images[0]}
                    onChange={(e) => setFormData({...formData, images: [e.target.value]})}
                  />
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/20 flex items-center justify-center group">
                  {formData.images[0] ? (
                    <img src={formData.images[0]} alt="Preview" className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-muted-foreground text-center p-4">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-bold">PREVIEW AREA</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4 pt-8">
          <Button type="submit" className="flex-1 h-16 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.98]">
            <Save className="mr-3 h-6 w-6" /> {editId ? "SAVE CHANGES" : "PUBLISH ARENA"}
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

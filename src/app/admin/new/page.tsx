'use client';

import { useState, useEffect, Suspense } from "react";
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
import { ArrowLeft, Sparkles, Loader2, Save, Image as ImageIcon, Zap } from "lucide-react";
import { generateTurfDescriptionForAdmin } from "@/ai/flows/generate-turf-description-for-admin";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    name: "",
    area: "",
    location: "",
    pricePerHour: 1000,
    description: "",
    amenities: ["Floodlights", "Parking", "Water"],
    sportTypes: ["Football"] as string[],
    courtTypes: ["Full Court"] as string[],
    rating: 4.5,
    reviewCount: 0,
    openingHours: "06:00 AM - 11:00 PM",
    contactNumber: "",
    whatsappNumber: "",
    images: ["https://picsum.photos/seed/turfista/800/600"],
    isPopular: false
  });

  useEffect(() => {
    if (existingTurf) {
      setFormData({
        ...existingTurf,
        pricePerHour: existingTurf.pricePerHour || 1000,
        amenities: existingTurf.amenities || [],
        sportTypes: existingTurf.sportTypes || [],
        courtTypes: existingTurf.courtTypes || [],
        images: existingTurf.images || [""]
      });
    }
  }, [existingTurf]);

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
        sportTypes: formData.sportTypes as ("Football" | "Cricket")[],
        pricePerHour: formData.pricePerHour,
        amenities: formData.amenities,
        uniqueFeatures: `A premier sports venue located in ${formData.area}.`
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
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          <span className="text-xs font-bold text-accent uppercase tracking-widest">Admin Mode</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Info Column */}
          <div className="md:col-span-8 space-y-8">
            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="font-headline text-2xl font-bold">Venue Details</CardTitle>
                <CardDescription>Configure the core properties of the turf.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Venue Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Apex Arena" 
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
                      placeholder="e.g., Jayalakshmipuram" 
                      className="h-12 bg-background/50 border-white/5 rounded-xl"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Full Address / Precise Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Exact address for players..." 
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
                      placeholder="e.g., 06:00 AM - 11:30 PM"
                      className="h-12 bg-background/50 border-white/5 rounded-xl"
                      value={formData.openingHours}
                      onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl font-bold">Marketing Copy</CardTitle>
                  <CardDescription>Tell the story of your venue.</CardDescription>
                </div>
                <Button 
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-accent text-accent-foreground font-black hover:opacity-90 rounded-xl"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  AI GENERATE
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <Textarea 
                  placeholder="Describe your turf's vibe, quality, and community..." 
                  className="min-h-[200px] bg-background/50 border-white/5 rounded-2xl p-4 leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </CardContent>
            </Card>
          </div>

          {/* Settings Column */}
          <div className="md:col-span-4 space-y-8">
            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="font-headline text-lg font-bold">Status & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Featured Listing</Label>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Show in Popular section</p>
                  </div>
                  <Switch 
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => setFormData({...formData, isPopular: checked})}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-bold block mb-3 uppercase tracking-widest opacity-50">Sports</Label>
                  <div className="space-y-3">
                    {["Football", "Cricket"].map((sport) => (
                      <div key={sport} className="flex items-center space-x-3">
                        <Checkbox 
                          id={sport.toLowerCase()} 
                          checked={formData.sportTypes.includes(sport)}
                          onCheckedChange={(checked) => {
                            if (checked) setFormData({...formData, sportTypes: [...formData.sportTypes, sport]})
                            else setFormData({...formData, sportTypes: formData.sportTypes.filter(s => s !== sport)})
                          }}
                        />
                        <label htmlFor={sport.toLowerCase()} className="text-sm font-medium cursor-pointer">{sport}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <Label className="text-sm font-bold block mb-3 uppercase tracking-widest opacity-50">Court Sizes</Label>
                  <div className="space-y-3">
                    {["Half Court", "Full Court"].map((court) => (
                      <div key={court} className="flex items-center space-x-3">
                        <Checkbox 
                          id={court.toLowerCase().replace(' ', '-')} 
                          checked={formData.courtTypes.includes(court)}
                          onCheckedChange={(checked) => {
                            if (checked) setFormData({...formData, courtTypes: [...formData.courtTypes, court]})
                            else setFormData({...formData, courtTypes: formData.courtTypes.filter(c => c !== court)})
                          }}
                        />
                        <label htmlFor={court.toLowerCase().replace(' ', '-')} className="text-sm font-medium cursor-pointer">{court}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="font-headline text-lg font-bold">Public Media</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Main Image URL</Label>
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
                      <p className="text-[10px] font-bold">IMAGE PREVIEW</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4 pt-8">
          <Button type="submit" className="flex-1 h-16 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
            <Save className="mr-3 h-6 w-6" /> {editId ? "UPDATE LISTING" : "PUBLISH VENUE"}
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

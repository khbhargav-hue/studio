'use client';

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  IndianRupee, 
  Upload, 
  Settings2, 
  Clock,
  Layout,
  CheckCircle2,
  Phone,
  Zap,
  ShieldCheck
} from "lucide-react";
import { generateTurfDescriptionForAdmin } from "@/ai/flows/generate-turf-description-for-admin";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from "@/lib/utils";

const SPORT_OPTIONS = ["Football", "Cricket", "Pickleball", "Badminton", "Basketball"];
const PITCH_SIZES = ["5-a-side", "7-a-side", "9-a-side", "11-a-side"];
const PITCH_TYPES = ["Artificial", "Natural", "Astroturf"];
const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const AMENITY_KEYS = [
  { key: "parking", label: "Parking" },
  { key: "changingRooms", label: "Changing Rooms" },
  { key: "showers", label: "Showers" },
  { key: "drinkingWater", label: "Water" },
  { key: "floodlights", label: "Floodlights" },
  { key: "firstAid", label: "First Aid" },
  { key: "cafeteria", label: "Cafeteria" },
  { key: "washrooms", label: "Washrooms" },
  { key: "ballProvided", label: "Ball Provided" },
  { key: "metalStudsOk", label: "Metal Studs OK" },
];

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'turfista_upload';

function NewTurfForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const db = useFirestore();
  const editId = searchParams.get("id");
  const mainInputRef = useRef<HTMLInputElement>(null);

  const turfDocRef = useMemoFirebase(() => {
    if (!db || !editId) return null;
    return doc(db, "turfs", editId);
  }, [db, editId]);

  const { data: existingTurf, loading: loadingExisting } = useDoc(turfDocRef);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    whatsapp: "",
    imageUrl: "",
    images: [] as string[],
    isActive: true,
    isPremium: false,
    address: "",
    area: "",
    city: "Mysuru",
    pincode: "",
    googleMapsUrl: "",
    lat: 12.2958,
    lng: 76.6394,
    sports: [] as string[],
    pitchType: "Artificial",
    pitchSizes: [] as string[],
    dimensions: "",
    maxPlayers: 14,
    pricePerHour: 900,
    peakHourPrice: 1200,
    peakHoursStart: "18:00",
    slotDuration: 60,
    openTime: "06:00",
    closeTime: "22:00",
    openDays: DAY_OPTIONS,
    checkInMinutes: 15,
    amenities: {
      parking: true,
      changingRooms: true,
      showers: false,
      drinkingWater: true,
      floodlights: true,
      firstAid: true,
      cafeteria: false,
      washrooms: true,
      ballProvided: true,
      metalStudsOk: false,
    },
    rating: 4.5,
    reviewCount: 0,
    rules: [] as string[],
  });

  useEffect(() => {
    if (existingTurf) {
      setFormData(prev => ({
        ...prev,
        ...existingTurf,
        amenities: { ...prev.amenities, ...(existingTurf.amenities || {}) }
      }));
    }
  }, [existingTurf]);

  const uploadToCloudinary = (file: File, key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!CLOUDINARY_CLOUD_NAME) {
        toast({ title: "Config Missing", variant: "destructive" });
        resolve(null);
        return;
      }
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      setUploadingStates(prev => ({ ...prev, [key]: true }));
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, true);
      xhr.onload = () => {
        setUploadingStates(prev => ({ ...prev, [key]: false }));
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url);
        else resolve(null);
      };
      xhr.send(form);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);
    const id = editId || formData.name.toLowerCase().replace(/\s+/g, '-');
    const turfRef = doc(db, "turfs", id);
    const dataToSave = {
      ...formData,
      id,
      updatedAt: serverTimestamp(),
      createdAt: existingTurf?.createdAt || serverTimestamp()
    };

    try {
      await setDoc(turfRef, dataToSave, { merge: true });
      toast({ title: editId ? "Intel Synchronized" : "Arena Deployed" });
      router.push("/studio");
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `turfs/${id}`,
        operation: editId ? 'update' : 'create',
        requestResourceData: dataToSave
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.area) {
      toast({ title: "Context Missing", description: "Name/Area required for AI.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateTurfDescriptionForAdmin({
        turfName: formData.name,
        location: `${formData.area}, Mysuru`,
        sportTypes: formData.sports.length > 0 ? formData.sports as any : ["Football"],
        pricePerHour: formData.pricePerHour,
        amenities: Object.entries(formData.amenities).filter(([_, v]) => v).map(([k]) => k),
      });
      setFormData(p => ({ ...p, description: result.description }));
      toast({ title: "Narrative Locked" });
    } catch (err) {
      toast({ title: "AI Circuit Offline", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingExisting && editId) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-12">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-lg group font-black text-[10px] uppercase tracking-widest text-muted h-10 px-0">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary text-black font-black uppercase text-[9px] tracking-widest border-none">
            {editId ? "Update Cycle" : "Genesis Cycle"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Core Identity */}
            <Card className="bg-card border-border rounded-[24px] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black italic flex items-center gap-3 uppercase"><Settings2 className="h-5 w-5 text-primary" /> Arena Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Turf Identity*</Label>
                    <Input className="h-12 bg-surface border-border rounded-xl focus:border-primary/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">WhatsApp Hub* (Digits Only)</Label>
                    <Input className="h-12 bg-surface border-border rounded-xl focus:border-primary/50" placeholder="917411..." value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Sport Disciplines</Label>
                    <div className="flex flex-wrap gap-2">
                      {SPORT_OPTIONS.map(sport => (
                        <div key={sport} className="flex items-center gap-2 bg-surface px-3 py-2 rounded-lg border border-border">
                          <Checkbox 
                            id={`sport-${sport}`} 
                            checked={formData.sports.includes(sport)}
                            onCheckedChange={(checked) => {
                              const newSports = checked 
                                ? [...formData.sports, sport] 
                                : formData.sports.filter(s => s !== sport);
                              setFormData({...formData, sports: newSports});
                            }}
                          />
                          <Label htmlFor={`sport-${sport}`} className="text-[10px] font-bold uppercase cursor-pointer">{sport}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Pitch Formats</Label>
                    <div className="flex flex-wrap gap-2">
                      {PITCH_SIZES.map(size => (
                        <div key={size} className="flex items-center gap-2 bg-surface px-3 py-2 rounded-lg border border-border">
                          <Checkbox 
                            id={`size-${size}`} 
                            checked={formData.pitchSizes.includes(size)}
                            onCheckedChange={(checked) => {
                              const newSizes = checked 
                                ? [...formData.pitchSizes, size] 
                                : formData.pitchSizes.filter(s => s !== size);
                              setFormData({...formData, pitchSizes: newSizes});
                            }}
                          />
                          <Label htmlFor={`size-${size}`} className="text-[10px] font-bold uppercase cursor-pointer">{size}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Full Physical Address*</Label>
                  <Input className="h-12 bg-surface border-border rounded-xl" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Area in Mysuru*</Label>
                    <Input className="h-12 bg-surface border-border rounded-xl" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Surface Type</Label>
                    <select className="h-12 w-full bg-surface border border-border rounded-xl px-4 text-xs font-bold uppercase" value={formData.pitchType} onChange={e => setFormData({...formData, pitchType: e.target.value})}>
                      {PITCH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Dimensions</Label>
                    <Input className="h-12 bg-surface border-border rounded-xl" placeholder="60 x 40 ft" value={formData.dimensions} onChange={e => setFormData({...formData, dimensions: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Max Athletes</Label>
                    <Input type="number" className="h-12 bg-surface border-border rounded-xl font-bold" value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: Number(e.target.value)})} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Narrative AI */}
            <Card className="bg-card border-border rounded-[24px] overflow-hidden">
              <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-black italic flex items-center gap-3 uppercase"><Sparkles className="h-5 w-5 text-primary" /> Strategy Narrative</CardTitle>
                <Button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="h-9 px-4 bg-primary text-black font-black uppercase text-[9px] tracking-widest rounded-lg">
                  {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                  Generate AI
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <Textarea className="min-h-[160px] bg-surface border-border p-6 rounded-xl text-sm italic leading-relaxed" placeholder="Detailed marketing description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="bg-card border-border rounded-[24px] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black italic flex items-center gap-3 uppercase"><ShieldCheck className="h-5 w-5 text-primary" /> Arena Regulations</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Textarea className="min-h-[120px] bg-surface border-border p-6 rounded-xl text-sm italic" placeholder="One rule per line..." value={formData.rules.join('\n')} onChange={e => setFormData({...formData, rules: e.target.value.split('\n')})} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Financial Deck */}
            <Card className="bg-card border-border rounded-[24px] overflow-hidden">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-lg font-black italic flex items-center gap-3 uppercase"><IndianRupee className="h-4 w-4 text-primary" /> Pricing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted ml-1">Base Price / HR*</Label>
                  <Input type="number" className="h-10 bg-surface border-border font-black text-primary text-lg rounded-lg" value={formData.pricePerHour} onChange={e => setFormData({...formData, pricePerHour: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted ml-1">Peak Price / HR</Label>
                  <Input type="number" className="h-10 bg-surface border-border font-black text-white text-lg rounded-lg" value={formData.peakHourPrice} onChange={e => setFormData({...formData, peakHourPrice: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted ml-1">Peak Cycle Starts</Label>
                  <Input type="time" className="h-10 bg-surface border-border rounded-lg font-bold" value={formData.peakHoursStart} onChange={e => setFormData({...formData, peakHoursStart: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            {/* Ops Deck */}
            <Card className="bg-card border-border rounded-[24px] overflow-hidden">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-lg font-black italic flex items-center gap-3 uppercase"><Clock className="h-4 w-4 text-primary" /> Operational Intel</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted ml-1">Open</Label>
                    <Input type="time" className="h-10 bg-surface border-border rounded-lg font-bold" value={formData.openTime} onChange={e => setFormData({...formData, openTime: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted ml-1">Close</Label>
                    <Input type="time" className="h-10 bg-surface border-border rounded-lg font-bold" value={formData.closeTime} onChange={e => setFormData({...formData, closeTime: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted ml-1">Operating Days</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAY_OPTIONS.map(day => (
                      <div key={day} className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-border">
                        <Checkbox 
                          id={`day-${day}`} 
                          checked={formData.openDays.includes(day)}
                          onCheckedChange={(checked) => {
                            const newDays = checked ? [...formData.openDays, day] : formData.openDays.filter(d => d !== day);
                            setFormData({...formData, openDays: newDays});
                          }}
                        />
                        <Label htmlFor={`day-${day}`} className="text-[8px] font-bold uppercase cursor-pointer">{day.slice(0,3)}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted ml-1">Check-in Buff (Min)</Label>
                  <Input type="number" className="h-10 bg-surface border-border rounded-lg font-bold" value={formData.checkInMinutes} onChange={e => setFormData({...formData, checkInMinutes: Number(e.target.value)})} />
                </div>
              </CardContent>
            </Card>

            {/* Facility Hub */}
            <Card className="bg-card border-border rounded-[24px] overflow-hidden">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-lg font-black italic flex items-center gap-3 uppercase"><Layout className="h-4 w-4 text-primary" /> Amenities</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {AMENITY_KEYS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted">{label}</span>
                    <Switch 
                      checked={(formData.amenities as any)[key]} 
                      onCheckedChange={(val) => setFormData({
                        ...formData, 
                        amenities: { ...formData.amenities, [key]: val }
                      })} 
                    />
                  </div>
                ))}
                <div className="pt-6 border-t border-border space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase">Premium Listing</p>
                      <p className="text-[8px] text-primary/40 uppercase tracking-widest">Featured Badge</p>
                    </div>
                    <Switch checked={formData.isPremium} onCheckedChange={(val) => setFormData({...formData, isPremium: val})} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                    <div>
                      <p className="text-[10px] font-black text-white uppercase">Active Status</p>
                      <p className="text-[8px] text-muted uppercase tracking-widest">Public discovery</p>
                    </div>
                    <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({...formData, isActive: val})} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card className="bg-card border-border rounded-[24px] overflow-hidden">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="text-lg font-black italic flex items-center gap-3 uppercase"><ImageIcon className="h-4 w-4 text-primary" /> Media</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div 
                  className="relative aspect-video rounded-xl border-2 border-dashed border-border bg-surface hover:border-primary/50 cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all group"
                  onClick={() => mainInputRef.current?.click()}
                >
                  {uploadingStates['main'] && <Loader2 className="h-6 w-6 animate-spin text-primary absolute z-10" />}
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Main" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted" />
                      <span className="text-[9px] font-black uppercase text-muted tracking-widest">Upload Identity</span>
                    </div>
                  )}
                  <input type="file" ref={mainInputRef} className="hidden" onChange={async (e) => {
                    const url = await uploadToCloudinary(e.target.files?.[0] as File, 'main');
                    if (url) setFormData(p => ({ ...p, imageUrl: url }));
                  }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-12 border-t border-border">
          <Button type="submit" disabled={isSaving} className="bg-primary text-black h-16 text-xl font-black italic uppercase rounded-2xl flex-1 shadow-2xl shadow-primary/20">
            {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : editId ? "Update Intelligence" : "Deploy Arena"}
          </Button>
          <Button type="button" variant="outline" className="h-16 px-12 rounded-2xl text-lg font-black uppercase border-border hover:bg-destructive hover:text-white" onClick={() => router.push("/studio")}>
            Abort
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewTurfPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>}>
      <NewTurfForm />
    </Suspense>
  );
}

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
  AlertCircle,
  ShieldAlert,
  Info,
  MapPin,
  Clock,
  Layout
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
const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const AMENITY_KEYS = [
  { key: "parking", label: "Parking" },
  { key: "changingRooms", label: "Changing Rooms" },
  { key: "showers", label: "Showers" },
  { key: "drinkingWater", label: "Drinking Water" },
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
    pitchType: "Artificial Grass",
    pitchSizes: [] as string[],
    dimensions: "",
    maxPlayers: 10,
    pricePerHour: 1000,
    peakHourPrice: 1400,
    peakHoursStart: "18:00",
    slotDuration: 60,
    openTime: "06:00",
    closeTime: "23:00",
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
        toast({ title: "Cloudinary Config Missing", variant: "destructive" });
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
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(prev => ({ ...prev, [key]: Math.round((e.loaded / e.total) * 100) }));
      };
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
    try {
      await setDoc(turfRef, {
        ...formData,
        id,
        updatedAt: serverTimestamp(),
        createdAt: existingTurf?.createdAt || serverTimestamp()
      }, { merge: true });
      toast({ title: editId ? "Intelligence Updated" : "Arena Deployed" });
      router.push("/studio");
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `turfs/${id}`,
        operation: editId ? 'update' : 'create',
        requestResourceData: formData
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.area) {
      toast({ title: "Data Required", description: "Name and Area required for AI context.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateTurfDescriptionForAdmin({
        turfName: formData.name,
        location: `${formData.area}, ${formData.city}`,
        sportTypes: formData.sports as any,
        pricePerHour: formData.pricePerHour,
        amenities: Object.entries(formData.amenities).filter(([_, v]) => v).map(([k]) => k),
      });
      setFormData(p => ({ ...p, description: result.description }));
      toast({ title: "Narrative Generated" });
    } catch (err) {
      toast({ title: "AI Offline", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl group font-black text-[10px] uppercase tracking-[0.3em] text-white/40 h-12">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(170,255,0,1)]" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{editId ? "Update Node" : "Deployment Console"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-2xl font-bold flex items-center gap-4"><Settings2 className="h-6 w-6 text-primary" /> Arena Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">Arena Name</Label>
                    <Input className="h-12 bg-surface" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">WhatsApp Node</Label>
                    <Input className="h-12 bg-surface" placeholder="91..." value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="label-caps opacity-70">Full Address</Label>
                  <Input className="h-12 bg-surface" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">Area</Label>
                    <Input className="h-12 bg-surface" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">City</Label>
                    <Input className="h-12 bg-surface" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">Pincode</Label>
                    <Input className="h-12 bg-surface" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">Max Players</Label>
                    <Input type="number" className="h-12 bg-surface" value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: Number(e.target.value)})} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-4"><Sparkles className="h-6 w-6 text-primary" /> Narrative</CardTitle>
                <Button type="button" size="sm" className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-6" onClick={handleGenerateDescription} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "GENERATE AI"}
                </Button>
              </CardHeader>
              <CardContent className="p-10">
                <Textarea className="min-h-[200px] bg-surface p-6 text-lg italic" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-10 pb-0">
                <CardTitle className="text-2xl font-bold flex items-center gap-4"><IndianRupee className="h-6 w-6 text-primary" /> Pricing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <Label className="label-caps opacity-70">Base Price / HR</Label>
                  <Input type="number" className="h-12 bg-surface font-bold text-primary" value={formData.pricePerHour} onChange={e => setFormData({...formData, pricePerHour: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label className="label-caps opacity-70">Peak Price / HR</Label>
                  <Input type="number" className="h-12 bg-surface font-bold" value={formData.peakHourPrice} onChange={e => setFormData({...formData, peakHourPrice: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label className="label-caps opacity-70">Peak Starts At</Label>
                  <Input type="time" className="h-12 bg-surface" value={formData.peakHoursStart} onChange={e => setFormData({...formData, peakHoursStart: e.target.value})} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-bold flex items-center gap-4"><Layout className="h-5 w-5 text-primary" /> Facility Hub</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-3">
                  {AMENITY_KEYS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                      <Switch 
                        checked={(formData.amenities as any)[key]} 
                        onCheckedChange={(val) => setFormData({
                          ...formData, 
                          amenities: { ...formData.amenities, [key]: val }
                        })} 
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                    <div>
                      <p className="text-xs font-bold text-primary uppercase">Premium Listing</p>
                      <p className="text-[8px] text-primary/40 uppercase tracking-widest">Featured on feed</p>
                    </div>
                    <Switch checked={formData.isPremium} onCheckedChange={(val) => setFormData({...formData, isPremium: val})} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-bold flex items-center gap-4"><Clock className="h-5 w-5 text-primary" /> Operational Intel</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">Open Time</Label>
                    <Input type="time" className="h-10 bg-surface" value={formData.openTime} onChange={e => setFormData({...formData, openTime: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps opacity-70">Close Time</Label>
                    <Input type="time" className="h-10 bg-surface" value={formData.closeTime} onChange={e => setFormData({...formData, closeTime: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="label-caps opacity-70">Check-in Buff (Min)</Label>
                  <Input type="number" className="h-10 bg-surface" value={formData.checkInMinutes} onChange={e => setFormData({...formData, checkInMinutes: Number(e.target.value)})} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-bold flex items-center gap-4"><ImageIcon className="h-5 w-5 text-primary" /> Assets</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div 
                  className="relative aspect-video rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 hover:border-primary/50 cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all"
                  onClick={() => mainInputRef.current?.click()}
                >
                  {uploadingStates['main'] && <Loader2 className="h-8 w-8 animate-spin text-primary absolute z-10" />}
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Main" />
                  ) : (
                    <Upload className="h-8 w-8 opacity-20" />
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

        <div className="flex gap-4 pt-10">
          <Button type="submit" disabled={isSaving} className="flex-1 h-20 bg-primary text-black font-black text-2xl rounded-2xl shadow-2xl hover:scale-[1.01] transition-all">
            {isSaving ? <Loader2 className="h-8 w-8 animate-spin" /> : "PUBLISH ARENA"}
          </Button>
          <Button type="button" variant="outline" className="h-20 px-12 border-white/10 bg-white/5 rounded-2xl font-black text-xl hover:bg-destructive hover:text-white" onClick={() => router.push("/studio")}>
            ABORT
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewTurfPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-black"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <NewTurfForm />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import Image from 'next/image';
import { Star, MessageCircle, MapPin, Loader2, Plus, Layout, Settings2, IndianRupee, Phone, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const FILTERS = ["All", "Football", "Cricket", "Pickleball", "Swimming", "Badminton"];
const AREAS = ["Vijayanagar", "Yadavagiri", "JP Nagar", "Saraswathipuram", "Kuvempunagar", "Bogadi", "Hebbal", "Other"];
const SPORT_OPTIONS = ["Football", "Cricket", "Pickleball", "Badminton", "Swimming"];

export default function TurfsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    area: "Vijayanagar",
    sports: [] as string[],
    price: "",
    whatsapp: "",
    imageUrl: "",
    rating: "4.5"
  });

  // Admin Role Check
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);
  const isAdmin = profile?.role === 'admin';

  const fetchTurfs = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "turfs"));
      setTurfs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("DATA_FETCH_FAIL", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, [db]);

  const handleSaveTurf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsAdding(true);
    const payload = {
      ...formData,
      price: Number(formData.price),
      rating: Number(formData.rating),
      isActive: true,
      isPremium: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "turfs"), payload);
      toast({ title: "Arena Deployed", description: `${formData.name} is now live on the circuit.` });
      setShowDialog(false);
      setFormData({
        name: "",
        area: "Vijayanagar",
        sports: [],
        price: "",
        whatsapp: "",
        imageUrl: "",
        rating: "4.5"
      });
      fetchTurfs();
    } catch (err: any) {
      toast({ title: "Deployment Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const filteredTurfs = useMemo(() => {
    if (activeFilter === "All") return turfs;
    return turfs.filter(t => t.sports && Array.isArray(t.sports) && t.sports.includes(activeFilter));
  }, [turfs, activeFilter]);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-32 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <header className="mb-16 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-4">ARENA HUB</div>
              <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white">
                MYSURU <br /><span className="text-primary text-neon">TURFS</span>
              </h1>
            </div>

            {isAdmin && (
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="h-14 px-8 bg-primary text-black font-black uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add New Arena
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/5 rounded-[2rem] p-10 max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black uppercase italic text-white tracking-tighter">
                      ARENA <span className="text-primary">GENESIS</span>
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveTurf} className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Turf Identity</Label>
                        <Input 
                          placeholder="e.g. Matchbox Mysore" 
                          className="h-12 bg-white/5 border-white/10 text-white" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Regional Zone</Label>
                        <Select value={formData.area} onValueChange={v => setFormData({...formData, area: v})}>
                          <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0A0A0A] border-white/10">
                            {AREAS.map(a => <SelectItem key={a} value={a} className="text-white">{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Discipline Capability</Label>
                      <div className="flex flex-wrap gap-3">
                        {SPORT_OPTIONS.map(sport => (
                          <div key={sport} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                            <Checkbox 
                              id={`add-sport-${sport}`} 
                              checked={formData.sports.includes(sport)}
                              onCheckedChange={(checked) => {
                                const newSports = checked 
                                  ? [...formData.sports, sport] 
                                  : formData.sports.filter(s => s !== sport);
                                setFormData({...formData, sports: newSports});
                              }}
                            />
                            <Label htmlFor={`add-sport-${sport}`} className="text-[10px] font-bold uppercase cursor-pointer text-white">{sport}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
                          <IndianRupee className="h-3 w-3" /> Hourly Rate
                        </Label>
                        <Input 
                          type="number"
                          placeholder="900" 
                          className="h-12 bg-white/5 border-white/10 text-white" 
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
                          <Phone className="h-3 w-3" /> WhatsApp Hub
                        </Label>
                        <Input 
                          placeholder="917411..." 
                          className="h-12 bg-white/5 border-white/10 text-white" 
                          value={formData.whatsapp}
                          onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
                        <ImageIcon className="h-3 w-3" /> Media Intelligence (URL)
                      </Label>
                      <Input 
                        placeholder="Paste Cloudinary or Unsplash URL..." 
                        className="h-12 bg-white/5 border-white/10 text-white" 
                        value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
                        <Star className="h-3 w-3" /> Surface Integrity Rating
                      </Label>
                      <Input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        className="h-12 bg-white/5 border-white/10 text-white" 
                        value={formData.rating}
                        onChange={e => setFormData({...formData, rating: e.target.value})}
                      />
                    </div>

                    <Button type="submit" disabled={isAdding} className="w-full h-16 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20">
                      {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy to Circuit Registry"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 active:scale-95",
                  activeFilter === f 
                    ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(170,255,0,0.2)]" 
                    : "bg-white/5 border-white/10 text-white/40 hover:border-primary/40 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Synchronizing Arenas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredTurfs.map(turf => (
              <div key={turf.id} className="group bg-card border border-white/5 rounded-[2rem] overflow-hidden flex flex-col hover:border-primary/30 transition-all duration-300 shadow-2xl shadow-black">
                <div className="relative aspect-[16/10] w-full bg-black/40">
                  <Image
                    src={turf.imageUrl || "https://picsum.photos/seed/turf/800/500"}
                    alt={turf.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-black text-[8px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest shadow-lg">
                    VERIFIED
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10">
                    <Star className="h-3.5 w-3.5 text-primary fill-current" />
                    <span className="text-[13px] font-black text-white">{turf.rating || 4.8}</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors leading-tight">
                        {turf.name}
                      </h3>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold text-white/40 uppercase tracking-widest mt-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {turf.area}, Mysuru
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-primary italic leading-none">
                        ₹{turf.price || "900"}
                      </p>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1.5">PER HOUR</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-10">
                    {turf.sports?.map((s: string) => (
                      <Badge key={s} variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest rounded-lg px-3 py-1 text-white/60">
                        {s}
                      </Badge>
                    ))}
                  </div>

                  <Button asChild className="mt-auto h-16 bg-primary text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10">
                    <a href={`https://wa.me/${turf.whatsapp}?text=Hi! I found ${turf.name} on Turfista and want to ask availability.`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5 mr-3" /> Book via WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredTurfs.length === 0 && (
          <div className="py-40 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <p className="text-white/20 font-black uppercase tracking-[0.4em] italic text-sm">No arenas identified in this discipline.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

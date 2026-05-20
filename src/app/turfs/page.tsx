
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Footer } from '@/components/footer';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, getDocs, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { Star, MessageCircle, MapPin, Loader2, Plus, IndianRupee, Phone, Image as ImageIcon } from 'lucide-react';
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
  DialogTrigger 
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
      price: formData.price,
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
    return turfs.filter(t => t.sports && Array.isArray(t.sports) && (t.sports as string[]).some(s => s.toLowerCase() === activeFilter.toLowerCase()));
  }, [turfs, activeFilter]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] selection:bg-primary selection:text-black">
      <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <header className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-2">ARENA REGISTRY</div>
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-white">
                MYSURU <br /><span className="text-primary">CIRCUIT</span>
              </h1>
            </div>

            {isAdmin && (
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="h-14 px-8 bg-primary text-black font-black uppercase tracking-widest text-[11px] rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> Add Arena Node
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
                          <IndianRupee className="h-3 w-3" /> Hourly Rate (Text)
                        </Label>
                        <Input 
                          placeholder="₹900/hr" 
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
                        placeholder="Paste image URL..." 
                        className="h-12 bg-white/5 border-white/10 text-white" 
                        value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
                        <Star className="h-3 w-3" /> Rating
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

                    <Button type="submit" disabled={isAdding} className="w-full h-16 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl">
                      {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy to Circuit"}
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
                  "h-10 px-6 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all shrink-0 active:scale-95",
                  activeFilter === f 
                    ? "bg-primary text-black border-primary" 
                    : "bg-white/5 border-white/10 text-white/40 hover:border-primary/40"
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
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Syncing Registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
            {filteredTurfs.map(turf => (
              <div key={turf.id} className="bg-[#111] border border-[#222] rounded-[12px] overflow-hidden mb-[12px] flex flex-col h-full group">
                <div className="relative h-[160px] w-full bg-[#1A1A1A] overflow-hidden">
                  <img
                    src={turf.imageUrl || ""}
                    alt={turf.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling;
                      if (placeholder) {
                        placeholder.classList.remove('hidden');
                        placeholder.classList.add('flex');
                      }
                    }}
                  />
                  <div className="hidden absolute inset-0 items-center justify-center text-[40px] flex-col bg-[#1A1A1A]">
                    <span>⚽</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/10 mt-2">No Image</span>
                  </div>
                </div>

                <div className="p-[14px] flex-1 flex flex-col">
                  <h3 className="text-[15px] font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">{turf.name}</h3>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#888] mb-3 italic">
                    <MapPin className="h-3 w-3 text-primary" /> {turf.area}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {turf.sports?.map((s: string) => (
                      <span key={s} className="bg-[#1A1A1A] border border-[#333] px-2 py-0.5 rounded-[4px] text-[9px] font-black text-white/40 uppercase tracking-widest">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[15px] font-black text-[#AAFF00] italic leading-none">
                      {turf.pricePerHour ? `₹${turf.pricePerHour}/hr` : (turf.price || "Price on Request")}
                    </span>
                    <div className="flex items-center gap-1 text-[13px] text-yellow-500 font-black italic">
                      <Star className="h-3 w-3 fill-current" /> {turf.rating || "4.5"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.open("https://wa.me/" + turf.whatsapp + "?text=" + encodeURIComponent("Hi! I found " + turf.name + " on Turfista and want to ask availability."), "_blank")}
                  className="w-full bg-[#25D366] text-white py-[14px] text-[14px] font-black uppercase tracking-widest transition-all active:scale-[0.98] hover:bg-[#20ba5a] flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" /> Book on WhatsApp
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredTurfs.length === 0 && (
          <div className="py-40 text-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
            <p className="text-white/20 font-black uppercase tracking-[0.4em] italic text-sm">No arenas identified in this discipline.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

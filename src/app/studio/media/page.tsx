
'use client';

import { useState, useMemo, useEffect } from "react";
import { useCollection, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Trash2, Loader2, MousePointer2, Megaphone, Target, DollarSign, Building2, Save, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SPORT_TARGETS = ["All", "Football", "Cricket", "Pickleball", "Swimming", "Badminton"];
const AREA_TARGETS = [
  "All", "Vijayanagar", "Yadavagiri", "JP Nagar", "Bogadi", "Hebbal", 
  "Saraswathipuram", "Kuvempunagar", "Nazarbad", "Mysuru Central"
];

export default function AdsManagerPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingRevenue, setIsSavingRevenue] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    imageUrl: "",
    targetUrl: "",
    sportTarget: "All",
    areaTarget: "All",
    isActive: true,
  });

  // Revenue State
  const [revenueData, setRevenueData] = useState({
    featuredTurfs: 0,
    adRevenue: 0,
    sponsorships: 0
  });

  const adsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "ads"), orderBy("createdAt", "desc"));
  }, [db]);

  const revenueRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "revenue");
  }, [db]);

  const { data: ads, loading } = useCollection(adsQuery);
  const { data: savedRevenue } = useDoc(revenueRef);

  useEffect(() => {
    if (savedRevenue) {
      setRevenueData({
        featuredTurfs: savedRevenue.featuredTurfs || 0,
        adRevenue: savedRevenue.adRevenue || 0,
        sponsorships: savedRevenue.sponsorships || 0
      });
    }
  }, [savedRevenue]);

  const stats = useMemo(() => {
    if (!ads) return { active: 0, clicks: 0, earned: 0, sponsors: 0 };
    const active = ads.filter((a: any) => a.isActive).length;
    const clicks = ads.reduce((acc: number, a: any) => acc + (a.clickCount || 0), 0);
    const uniqueSponsors = new Set(ads.map((a: any) => a.businessName)).size;
    const earned = clicks * 10; 
    return { active, clicks, earned, sponsors: uniqueSponsors };
  }, [ads]);

  const totalRevenue = Number(revenueData.featuredTurfs) + Number(revenueData.adRevenue) + Number(revenueData.sponsorships);

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);

    try {
      await addDoc(collection(db, "ads"), {
        ...formData,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Ad saved", description: "Business node deployed to circuit." });
      setFormData({
        businessName: "",
        imageUrl: "",
        targetUrl: "",
        sportTarget: "All",
        areaTarget: "All",
        isActive: true,
      });
    } catch (err) {
      toast({ title: "Error saving ad", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRevenue = async () => {
    if (!db) return;
    setIsSavingRevenue(true);

    const monthStr = new Date().toISOString().slice(0, 7); // e.g. "2025-12"

    try {
      await setDoc(doc(db, "settings", "revenue"), {
        featuredTurfs: Number(revenueData.featuredTurfs),
        adRevenue: Number(revenueData.adRevenue),
        sponsorships: Number(revenueData.sponsorships),
        month: monthStr,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "Revenue Intel Locked", description: "Monthly figures synchronized with Firestore." });
    } catch (err) {
      toast({ title: "Sync Failed", variant: "destructive" });
    } finally {
      setIsSavingRevenue(false);
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: boolean) => {
    if (!db) return;
    updateDoc(doc(db, "ads", adId), { 
      isActive: !currentStatus,
      updatedAt: serverTimestamp() 
    });
  };

  const handleDeleteAd = async (adId: string) => {
    if (!db) return;
    deleteDoc(doc(db, "ads", adId)).then(() => {
      toast({ title: "Ad removed" });
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      <p className="text-xs text-muted font-medium italic">Syncing Ad Circuit...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-primary" />
          Ads & Sponsors
        </h1>
        <p className="text-muted mt-1 italic">Earn money from local businesses in Mysuru</p>
      </header>

      {/* SECTION 1 — Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Ads", value: stats.active, icon: Target },
          { label: "Total Clicks", value: stats.clicks, icon: MousePointer2 },
          { label: "This Month Earned", value: `₹${stats.earned}`, icon: DollarSign },
          { label: "Sponsors", value: stats.sponsors, icon: Building2 }
        ].map((item, i) => (
          <div key={i} className="bg-[#111] border border-[#222] p-6 rounded-xl">
            <div className="flex items-center gap-2 text-muted mb-2">
              <item.icon className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{item.value}</div>
          </div>
        ))}
      </div>

      {/* SECTION 2 — Add New Ad */}
      <Card className="bg-[#111] border-[#222] rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
            <span className="text-primary">➕</span> Add New Ad
          </h2>
          <form onSubmit={handleSaveAd} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted">Business name</Label>
                <Input 
                  placeholder="e.g. Decathlon Mysuru" 
                  className="bg-[#1A1A1A] border-[#333]" 
                  value={formData.businessName}
                  onChange={e => setFormData({...formData, businessName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted">Ad image URL</Label>
                <Input 
                  placeholder="https://..." 
                  className="bg-[#1A1A1A] border-[#333]" 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted">Link URL</Label>
                <Input 
                  placeholder="https://..." 
                  className="bg-[#1A1A1A] border-[#333]" 
                  value={formData.targetUrl}
                  onChange={e => setFormData({...formData, targetUrl: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted">Sport target</Label>
                  <Select value={formData.sportTarget} onValueChange={v => setFormData({...formData, sportTarget: v})}>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#333]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#111] border-[#333] text-white">
                      {SPORT_TARGETS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted">Area target</Label>
                  <Select value={formData.areaTarget} onValueChange={v => setFormData({...formData, areaTarget: v})}>
                    <SelectTrigger className="bg-[#1A1A1A] border-[#333]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#111] border-[#333] text-white">
                      {AREA_TARGETS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1A1A1A] border border-[#333] rounded-xl">
                <div>
                  <p className="text-sm font-medium">Active status</p>
                  <p className="text-[10px] text-muted">Show this ad in the feed</p>
                </div>
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={v => setFormData({...formData, isActive: v})} 
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSaving}
                className="w-full h-12 bg-primary text-black font-bold uppercase tracking-widest text-[11px]"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Ad"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* SECTION 3 — Active ads list */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold italic">Active ads list</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-[#1A1A1A]">
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableHead className="text-muted text-[10px] uppercase font-bold">Image</TableHead>
                <TableHead className="text-muted text-[10px] uppercase font-bold">Business</TableHead>
                <TableHead className="text-muted text-[10px] uppercase font-bold">Sport</TableHead>
                <TableHead className="text-muted text-[10px] uppercase font-bold">Area</TableHead>
                <TableHead className="text-muted text-[10px] uppercase font-bold text-center">Clicks</TableHead>
                <TableHead className="text-muted text-[10px] uppercase font-bold text-center">Active</TableHead>
                <TableHead className="text-muted text-[10px] uppercase font-bold text-right">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads?.map((ad: any) => (
                <TableRow key={ad.id} className="border-[#222] hover:bg-white/[0.02] transition-colors">
                  <TableCell>
                    <div className="h-10 w-14 rounded bg-[#1A1A1A] border border-[#333] overflow-hidden">
                      <img 
                        src={ad.imageUrl} 
                        className="h-full w-full object-cover" 
                        alt={ad.businessName}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { (e.target as any).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%231A1A1A'/%3E%3Ctext x='50%25' y='50%25' fill='%23444' text-anchor='middle' font-size='40'%3E⚽%3C/text%3E%3C/svg%3E" }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">{ad.businessName}</TableCell>
                  <TableCell className="text-xs italic text-muted">{ad.sportTarget || "All"}</TableCell>
                  <TableCell className="text-xs italic text-muted">{ad.areaTarget || "All"}</TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs font-bold">{ad.clickCount || 0}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch 
                        checked={ad.isActive} 
                        onCheckedChange={() => toggleAdStatus(ad.id, ad.isActive)} 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!ads || ads.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted italic text-xs">
                    No ads active in the circuit.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* SECTION 4 — Revenue Tracker */}
      <div className="space-y-8 pt-12 border-t border-[#222]">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Revenue Tracker
            </h2>
            <p className="text-xs text-muted mt-1 italic">Manual entry for monthly circuit earnings</p>
          </div>
          <Button 
            onClick={handleSaveRevenue} 
            disabled={isSavingRevenue}
            className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-lg"
          >
            {isSavingRevenue ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Sync Revenue</>}
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "featuredTurfs", label: "Featured Turfs", placeholder: "Paid listings count" },
            { id: "adRevenue", label: "Ad Revenue", placeholder: "Total ads collected" },
            { id: "sponsorships", label: "Sponsorships", placeholder: "Monthly sponsors" }
          ].map((field) => (
            <div key={field.id} className="bg-[#111] border border-[#222] p-6 rounded-xl space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted">{field.label}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                <Input 
                  type="number"
                  placeholder="0"
                  className="bg-[#1A1A1A] border-[#333] pl-8 h-12 text-lg font-bold"
                  value={(revenueData as any)[field.id]}
                  onChange={e => setRevenueData({...revenueData, [field.id]: e.target.value})}
                />
              </div>
              <p className="text-[9px] text-white/20 italic">{field.placeholder}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl flex flex-col items-center text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">TOTAL CIRCUIT REVENUE</p>
          <div className="text-6xl font-black italic tracking-tighter text-primary">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-4">Calculated based on manual administrative input</p>
        </div>
      </div>
    </div>
  );
}

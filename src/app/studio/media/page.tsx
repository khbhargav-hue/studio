
'use client';

import { useState } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc, updateDoc, setDoc, serverTimestamp, increment } from "firebase/firestore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, Plus, Edit2, Trash2, ExternalLink, MousePointer2, Loader2, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AdManagerPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    targetUrl: "",
    description: "",
    isActive: true,
  });

  const adsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "ads"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: ads, loading } = useCollection(adsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSaving(true);

    const adId = editingAd?.id || `ad-${Date.now()}`;
    const adRef = doc(db, "ads", adId);

    try {
      await setDoc(adRef, {
        ...formData,
        id: adId,
        updatedAt: serverTimestamp(),
        createdAt: editingAd?.createdAt || serverTimestamp(),
        clickCount: editingAd?.clickCount || 0
      }, { merge: true });

      toast({ title: editingAd ? "Ad Intel Updated" : "Ad Deployed to Circuit" });
      setShowAddDialog(false);
      resetForm();
    } catch (err) {
      toast({ title: "Transmission Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "ads", id));
      toast({ title: "Ad Redacted" });
    } catch (err) {
      toast({ title: "Redaction Failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      targetUrl: "",
      description: "",
      isActive: true,
    });
    setEditingAd(null);
  };

  const startEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || "",
      imageUrl: ad.imageUrl || "",
      targetUrl: ad.targetUrl || "",
      description: ad.description || "",
      isActive: ad.isActive ?? true,
    });
    setShowAddDialog(true);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <TrendingUp className="h-8 w-8 text-primary" />
             <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Ads <span className="text-primary">Intelligence</span></h1>
          </div>
          <p className="text-muted text-sm font-medium uppercase tracking-widest opacity-60">Manage Sponsored Performance Across the Network</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-black font-black uppercase tracking-widest text-[11px] rounded-xl h-12 px-8">
              <Plus className="mr-2 h-4 w-4" /> Add Ad Card
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border rounded-[24px] max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                {editingAd ? "Modify" : "Deploy"} <span className="text-primary">Sponsored Node</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted">Ad Title</Label>
                <Input 
                  placeholder="e.g. Premium Sports Gear Sale"
                  className="h-12 bg-surface border-border rounded-xl" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted">Target URL</Label>
                <Input className="h-12 bg-surface border-border rounded-xl" placeholder="https://..." value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted">Ad Creative (URL)</Label>
                <Input 
                  className="h-12 bg-surface border-border rounded-xl" 
                  value={formData.imageUrl} 
                  placeholder="Paste image URL..." 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted">Brief Description</Label>
                <Input 
                  placeholder="Short marketing hook..."
                  className="h-12 bg-surface border-border rounded-xl" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase">Active Status</p>
                  <p className="text-[8px] text-muted uppercase tracking-widest">Public discovery in feed</p>
                </div>
                <Switch checked={formData.isActive} onCheckedChange={v => setFormData({...formData, isActive: v})} />
              </div>

              <DialogFooter className="pt-6">
                <Button type="submit" disabled={isSaving} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : editingAd ? "Sync Changes" : "Transmit to Circuit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="bg-card border-border rounded-[24px] overflow-hidden">
          <div className="p-8 border-b border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-xl font-black italic uppercase">Campaign <span className="text-primary">Performance</span></h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="p-6 font-black uppercase tracking-widest text-[10px] text-muted">Creative</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted text-center">Status</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted text-center">Engagement</TableHead>
                  <TableHead className="text-right p-6 font-black uppercase tracking-widest text-[10px] text-muted">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads?.map((ad: any) => (
                  <TableRow key={ad.id} className="border-border hover:bg-surface/30 transition-colors">
                    <TableCell className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-16 rounded-lg bg-surface border border-border overflow-hidden">
                          <img src={ad.imageUrl} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white uppercase italic">{ad.title}</p>
                          <p className="text-[9px] font-bold uppercase tracking-tight text-muted truncate max-w-[200px]">{ad.targetUrl}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("px-3 py-0.5 rounded-lg font-black text-[9px] uppercase border-none", ad.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                        {ad.isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/20">
                        <MousePointer2 className="h-3 w-3 text-primary" />
                        <span className="text-sm font-black italic text-white">{ad.clickCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right p-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg hover:border-primary hover:text-primary transition-all bg-surface" onClick={() => startEdit(ad)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all bg-surface" onClick={() => handleDelete(ad.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!ads || ads.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted italic text-[10px] font-black uppercase tracking-widest">No ad nodes deployed.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

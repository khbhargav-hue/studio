
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Palette, Save, Loader2, Sparkles, Image as ImageIcon, Monitor, Layout } from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function BrandingSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const brandingRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "branding");
  }, [db]);

  const { data: brandingData, loading } = useDoc(brandingRef);

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    heroBadgeText: "WE CONNECT YOU TO THE BEST TURFS",
    heroHeading1: "PLAY MORE.",
    heroHeading2: "BOOK EASY.",
    heroDescription: "Discover and book Mysuru’s best sports turfs in one place.",
    heroImageUrl: "https://picsum.photos/seed/turf-hero/1920/1080",
    logoUrl: ""
  });

  useEffect(() => {
    if (brandingData) {
      setFormData(prev => ({
        ...prev,
        ...brandingData
      }));
    }
  }, [brandingData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsSaving(true);
    const docRef = doc(db, "settings", "branding");

    setDoc(docRef, {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true })
      .then(() => {
        toast({
          title: "Branding Updated",
          description: "Changes are now live on the homepage."
        });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: formData
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Branding Control</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage how Turfista looks to your players.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl">
          <Palette className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Global Style Engine</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden md:col-span-2">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="font-headline text-2xl font-bold flex items-center gap-3">
                <Layout className="h-6 w-6 text-primary" />
                Hero Narrative
              </CardTitle>
              <CardDescription>Update the primary messaging on the landing page hero section.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="badge">Top Badge Text</Label>
                <Input 
                  id="badge" 
                  className="h-12 bg-background/50 border-white/5 rounded-xl"
                  value={formData.heroBadgeText}
                  onChange={(e) => setFormData({...formData, heroBadgeText: e.target.value})}
                  placeholder="e.g., WE CONNECT YOU TO THE BEST TURFS"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="h1">Heading Line 1 (White)</Label>
                  <Input 
                    id="h1" 
                    className="h-12 bg-background/50 border-white/5 rounded-xl font-bold"
                    value={formData.heroHeading1}
                    onChange={(e) => setFormData({...formData, heroHeading1: e.target.value})}
                    placeholder="PLAY MORE."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="h2">Heading Line 2 (Neon Green)</Label>
                  <Input 
                    id="h2" 
                    className="h-12 bg-background/50 border-white/5 rounded-xl font-bold text-primary"
                    value={formData.heroHeading2}
                    onChange={(e) => setFormData({...formData, heroHeading2: e.target.value})}
                    placeholder="BOOK EASY."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Hero Subheading / Description</Label>
                <Textarea 
                  id="desc"
                  className="min-h-[100px] bg-background/50 border-white/5 rounded-2xl leading-relaxed resize-none"
                  value={formData.heroDescription}
                  onChange={(e) => setFormData({...formData, heroDescription: e.target.value})}
                  placeholder="Tell players what Turfista is about..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="font-headline text-xl font-bold flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-accent" />
                Hero Background
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs">Image URL (Unsplash/Direct Link)</Label>
                <Input 
                  placeholder="https://images.unsplash.com/..." 
                  className="bg-background/50 border-white/5 rounded-xl"
                  value={formData.heroImageUrl}
                  onChange={(e) => setFormData({...formData, heroImageUrl: e.target.value})}
                />
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/40">
                <img src={formData.heroImageUrl} alt="Hero Preview" className="object-cover w-full h-full opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="bg-primary/20 p-2 rounded-full mb-2">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">Desktop Preview</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="font-headline text-xl font-bold flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                Branding Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs">Logo Image URL (Optional)</Label>
                <Input 
                  placeholder="Defaults to SVG logo if empty" 
                  className="bg-background/50 border-white/5 rounded-xl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                />
              </div>
              <div className="aspect-video rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-6">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="max-h-12 object-contain" />
                ) : (
                  <>
                    <Palette className="h-8 w-8 text-white/10 mb-2" />
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Using Default SVG Logo</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Button 
          type="submit" 
          disabled={isSaving}
          className="w-full h-16 bg-primary text-primary-foreground font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.98]"
        >
          {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="mr-3 h-6 w-6" />}
          PUBLISH CHANGES
        </Button>
      </form>
    </div>
  );
}


'use client';

import { useState, useEffect } from "react";
import { useStorage } from "@/firebase";
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Image as ImageIcon, Database, Cloud, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MediaLibraryPage() {
  const storage = useStorage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<any[]>([]);

  const fetchMedia = async () => {
    if (!storage) return;
    setLoading(true);
    const mediaList: any[] = [];
    
    // Check main folders
    const folders = ['turfs/main', 'turfs/gallery', 'branding', 'branding/challenges', 'branding/hero'];
    
    try {
      for (const folder of folders) {
        const folderRef = ref(storage, folder);
        const result = await listAll(folderRef);
        
        for (const item of result.items) {
          const url = await getDownloadURL(item);
          mediaList.push({
            name: item.name,
            path: item.fullPath,
            url,
            folder
          });
        }
      }
      setMedia(mediaList);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to scan storage", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, [storage]);

  const handleDelete = async (path: string) => {
    if (!storage) return;
    try {
      const itemRef = ref(storage, path);
      await deleteObject(itemRef);
      setMedia(prev => prev.filter(m => m.path !== path));
      toast({ title: "Visual Node Deleted" });
    } catch (err) {
      toast({ title: "Deletion Failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-10 w-10 text-primary" />
            <h1 className="font-headline text-5xl font-bold tracking-tight uppercase italic">Media <span className="text-primary">Vault</span></h1>
          </div>
          <p className="text-muted-foreground text-xl font-medium">Manage global platform assets stored on Firebase Cloud.</p>
        </div>
        <Button onClick={fetchMedia} variant="outline" className="h-14 rounded-2xl border-white/5 bg-white/5 font-black uppercase text-[10px] tracking-widest">
           <RefreshCw className="mr-2 h-4 w-4" /> Scan Storage
        </Button>
      </div>

      {media.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {media.map((item, idx) => (
            <Card key={idx} className="glass-card border-white/5 rounded-[2rem] overflow-hidden group">
              <div className="relative aspect-square bg-black">
                <img src={item.url} className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt={item.name} />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                   <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white/10 hover:bg-primary hover:text-black" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                         <ExternalLink className="h-4 w-4" />
                      </a>
                   </Button>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-destructive/20 hover:bg-destructive hover:text-white">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] bg-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-3xl font-black italic uppercase text-destructive">Wipe Node?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/40">This will permanently delete the file from Firebase Storage. Broken links may occur if used.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-4">
                          <AlertDialogCancel className="rounded-2xl font-bold uppercase tracking-widest text-[10px] h-14 bg-white/5 border-white/10">Abort</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.path)} className="bg-destructive text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] h-14">Confirm Wipe</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
                </div>
              </div>
              <CardContent className="p-4">
                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest truncate mb-1">{item.folder}</p>
                 <p className="text-[10px] font-bold text-white/60 truncate">{item.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-48 glass-card rounded-[5rem] border-dashed border-white/10">
           <Cloud className="h-20 w-20 mx-auto mb-8 text-white/5" />
           <h3 className="text-3xl font-black text-white/10 uppercase italic">Vault Depleted</h3>
           <p className="text-white/20 mt-4 max-w-xs mx-auto text-sm italic">No active assets found in indexed cloud directories.</p>
        </div>
      )}
    </div>
  );
}

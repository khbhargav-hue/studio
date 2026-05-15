'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { 
  Edit2, 
  Trash2, 
  Plus, 
  Loader2,
  Users,
  Trophy,
  Zap,
  RefreshCcw,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

export default function StudioDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'turfs'), orderBy("updatedAt", "desc"));
  }, [db]);

  const teamsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
  }, [db]);

  const challengesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: turfs, loading: turfsLoading } = useCollection(turfsQuery);
  const { data: teams } = useCollection(teamsQuery);
  const { data: challenges } = useCollection(challengesQuery);

  const togglePopularStatus = (turfId: string, currentStatus: boolean) => {
    if (!db) return;
    const turfRef = doc(db, 'turfs', turfId);
    updateDoc(turfRef, { isPremium: !currentStatus, updatedAt: new Date() })
      .then(() => toast({ title: !currentStatus ? 'Arena Promoted' : 'Promotion Ended' }));
  };

  const handleDeleteTurf = (turfId: string) => {
    if (!db) return;
    const turfRef = doc(db, 'turfs', turfId);
    deleteDoc(turfRef)
      .then(() => toast({ title: 'Listing Redacted' }));
  };

  if (turfsLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <ShieldCheck className="h-8 w-8 text-primary" />
             <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Studio <span className="text-primary">Dashboard</span></h1>
          </div>
          <p className="text-muted text-sm font-medium uppercase tracking-widest opacity-60">Mysuru Grassroots Intelligence Hub</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="outline" onClick={() => window.location.reload()} className="h-12 rounded-xl border-border bg-surface font-black uppercase tracking-widest text-[10px]">
            <RefreshCcw className="h-4 w-4 mr-2" /> Sync Circuit
          </Button>
          <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[11px] rounded-xl h-12 px-8">
            <Link href="/studio/new"><Plus className="mr-2 h-4 w-4" /> Deploy Arena</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Turfs", val: turfs?.length, icon: Zap },
          { label: "Teams", val: teams?.length, icon: Users },
          { label: "Challenges", val: challenges?.length, icon: Trophy }
        ].map((item, i) => (
          <Card key={i} className="bg-card border-border rounded-[16px] overflow-hidden group hover:border-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
              <CardTitle className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{item.label}</CardTitle>
              <item.icon className="h-3.5 w-3.5 text-primary/40 group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent className="px-5 pb-6">
              <div className="text-4xl font-black italic tracking-tighter leading-none text-white">
                {item.val || 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="inventory" className="space-y-8">
        <TabsList className="bg-surface p-1 h-12 rounded-xl border border-border">
          <TabsTrigger value="inventory" className="px-8 h-full rounded-lg font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="bg-card border-border rounded-[24px] overflow-hidden">
          <div className="p-8 border-b border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-xl font-black italic uppercase">Arena <span className="text-primary">Node Registry</span></h2>
            <Badge className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border border-primary/20">LIVE FIRESTORE LINK</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="p-6 font-black uppercase tracking-widest text-[10px] text-muted">Identity</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted">Status</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted text-center">Price/HR</TableHead>
                  <TableHead className="text-right p-6 font-black uppercase tracking-widest text-[10px] text-muted">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turfs?.map((turf) => (
                  <TableRow key={turf.id} className="border-border hover:bg-surface/30 transition-colors">
                    <TableCell className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 rounded-lg bg-surface border border-border overflow-hidden">
                          {turf.imageUrl ? <img src={turf.imageUrl} className="h-full w-full object-cover" alt="" /> : <Zap className="h-full w-full p-3 opacity-10" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white uppercase italic">{turf.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-tight text-muted">{turf.area} • {turf.sports?.join(', ')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => togglePopularStatus(turf.id, !!turf.isPremium)}
                          className={cn(
                            "rounded-lg h-8 px-3 transition-all border",
                            turf.isPremium ? "text-primary bg-primary/10 border-primary/20" : "text-muted border-border hover:text-white"
                          )}
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest">{turf.isPremium ? 'Featured' : 'Standard'}</span>
                        </Button>
                        <Badge className={cn("px-3 py-0.5 rounded-lg font-black text-[9px] uppercase border-none", turf.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                          {turf.isActive ? 'Active' : 'Offline'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black italic text-base text-primary">
                      ₹{turf.pricePerHour}
                    </TableCell>
                    <TableCell className="text-right p-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg hover:border-primary hover:text-primary transition-all bg-surface" asChild>
                          <Link href={`/studio/new?id=${turf.id}`}><Edit2 className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all bg-surface">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border rounded-[24px]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black italic uppercase text-destructive tracking-tighter">Terminate Listing?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted font-medium italic">This action will permanently redact "{turf.name}" from the Mysuru circuit database.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 gap-3">
                              <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 border-border">Abort</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTurf(turf.id)} className="bg-destructive text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-11 hover:bg-destructive/90">Redact Permanent</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
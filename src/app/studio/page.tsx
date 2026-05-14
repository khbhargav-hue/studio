
'use client';

import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, updateDoc, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Eye, 
  MousePointerClick, 
  Edit2, 
  Trash2, 
  Plus, 
  Loader2,
  Users,
  Star,
  Trophy,
  Database,
  Calendar,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Zap,
  RefreshCcw,
  Activity,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState } from 'react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  const leadsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'leads'), orderBy('timestamp', 'desc'), limit(50));
  }, [db]);

  const statsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'analytics', 'stats');
  }, [db]);

  const { data: turfs, loading: turfsLoading } = useCollection(turfsQuery);
  const { data: teams } = useCollection(teamsQuery);
  const { data: challenges } = useCollection(challengesQuery);
  const { data: leads } = useCollection(leadsQuery);
  const { data: stats } = useDoc(statsRef);

  const togglePopularStatus = (turfId: string, currentStatus: boolean) => {
    if (!db) return;
    const turfRef = doc(db, 'turfs', turfId);
    updateDoc(turfRef, { isPremium: !currentStatus })
      .then(() => toast({ title: !currentStatus ? 'Arena Promoted' : 'Promotion Ended' }))
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: turfRef.path,
          operation: 'update',
          requestResourceData: { isPremium: !currentStatus }
        }));
      });
  };

  const handleDeleteTurf = (turfId: string) => {
    if (!db) return;
    const turfRef = doc(db, 'turfs', turfId);
    deleteDoc(turfRef)
      .then(() => toast({ title: 'Listing Redacted' }))
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: turfRef.path,
          operation: 'delete'
        }));
      });
  };

  if (turfsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <ShieldCheck className="h-8 w-8 text-primary" />
             <h1 className="text-5xl font-black tracking-tighter italic uppercase">Network <span className="text-primary text-neon">Studio</span></h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium italic">Manage the grassroots sports intelligence of Mysuru.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.location.reload()} className="h-14 rounded-2xl border-white/5 bg-white/5 font-black uppercase tracking-widest text-[10px]">
            <RefreshCcw className="h-4 w-4 mr-2" /> Sync Circuit
          </Button>
          <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl h-14 px-8 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all">
            <Link href="/studio/new"><Plus className="mr-2 h-6 w-6" /> DEPLOY ARENA</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-white/5 p-1 h-14 rounded-[2rem] border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="px-8 h-full rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <LayoutDashboard className="h-4 w-4 mr-2 hidden md:block" /> Intelligence
          </TabsTrigger>
          <TabsTrigger value="inventory" className="px-8 h-full rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <Database className="h-4 w-4 mr-2 hidden md:block" /> Arenas
          </TabsTrigger>
          <TabsTrigger value="community" className="px-8 h-full rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <Users className="h-4 w-4 mr-2 hidden md:block" /> Squads & Claims
          </TabsTrigger>
          <TabsTrigger value="leads" className="px-8 h-full rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <MessageSquare className="h-4 w-4 mr-2 hidden md:block" /> Converstions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Global Views", val: stats?.totalViews, icon: Eye },
              { label: "Active Leads", val: stats?.totalWhatsAppClicks, icon: MousePointerClick },
              { label: "Verified Squads", val: teams?.length, icon: Users },
              { label: "Circuit Claims", val: challenges?.length, icon: Trophy }
            ].map((item, i) => (
              <Card key={i} className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-8">
                  <CardTitle className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{item.label}</CardTitle>
                  <item.icon className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent className="px-8 pb-10">
                  <div className="text-6xl font-black italic tracking-tighter leading-none text-white">
                    {typeof item.val === 'number' ? item.val.toLocaleString() : (item.val || 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-black italic uppercase">Arena <span className="text-primary text-neon">Inventory</span></h2>
               <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mt-3">Managing {turfs?.length || 0} active pitches in Mysuru circuit</p>
            </div>
            <Badge className="bg-primary/20 text-primary px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border-none">FIRESTORE SYNC ACTIVE</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="p-8 font-black uppercase tracking-[0.4em] text-[9px] text-white/30">Arena Identity</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.4em] text-[9px] text-white/30">Feature Status</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.4em] text-[9px] text-white/30 text-center">Engagement</TableHead>
                  <TableHead className="text-right p-8 font-black uppercase tracking-[0.4em] text-[9px] text-white/30">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turfs?.map((turf) => (
                  <TableRow key={turf.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="p-8">
                      <p className="font-black text-2xl italic tracking-tighter text-white uppercase">{turf.name}</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 mt-1">{turf.area} • {turf.sports?.join(', ')}</p>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => togglePopularStatus(turf.id, !!turf.isPremium)}
                        className={cn(
                          "rounded-full h-10 w-10 p-0 transition-all",
                          turf.isPremium ? "text-primary bg-primary/10 shadow-[0_0_20px_rgba(170,255,0,0.3)]" : "text-white/5 hover:text-white"
                        )}
                      >
                        <Star className={cn("h-4 w-4", turf.isPremium && "fill-current")} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center font-black italic text-xl text-primary/40">
                      {turf.whatsappClicks || 0} <span className="text-[9px] font-bold uppercase tracking-widest ml-1 opacity-40">Leads</span>
                    </TableCell>
                    <TableCell className="text-right p-8">
                      <div className="flex justify-end gap-3">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all bg-white/5 border border-white/5" asChild>
                          <Link href={`/studio/new?id=${turf.id}`}><Edit2 className="h-4 w-4" /></Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all bg-white/5 border border-white/5">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border-white/10 rounded-[3rem] bg-black shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-3xl font-black italic uppercase text-destructive tracking-tighter">Terminate Listing?</AlertDialogTitle>
                              <AlertDialogDescription className="text-white/40 font-medium italic">Permanent removal of "{turf.name}" from public circuits. This action is immutable.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 gap-4">
                              <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 bg-white/5 border-white/10">Abort</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTurf(turf.id)} className="bg-destructive text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 hover:bg-destructive/80">Confirm Wipe</AlertDialogAction>
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

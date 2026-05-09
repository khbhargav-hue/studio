'use client';

import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  TrendingUp, 
  Edit2, 
  Trash2, 
  Plus, 
  Loader2,
  Users,
  Star,
  BarChart3,
  Trophy,
  Database,
  BarChart as BarChartIcon
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MOCK_TURFS } from '@/lib/data';
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'turfs'), orderBy('name', 'asc'));
  }, [db]);

  const statsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'analytics', 'stats');
  }, [db]);

  const { data: turfs, loading: turfsLoading } = useCollection(turfsQuery);
  const { data: stats } = useDoc(statsRef);

  const processedAnalytics = useMemo(() => {
    if (!turfs || turfs.length === 0) return { areaStats: [], mostViewed: null, topArea: 'N/A' };

    const areaCounts: Record<string, number> = {};
    let maxViews = -1;
    let mostViewed = null;

    turfs.forEach(turf => {
      const views = turf.views || 0;
      const area = turf.area || 'Unknown';
      areaCounts[area] = (areaCounts[area] || 0) + views;
      
      if (views >= maxViews && views > 0) {
        maxViews = views;
        mostViewed = turf;
      }
    });

    const areaStats = Object.entries(areaCounts)
      .map(([name, views]) => ({ name, views }))
      .filter(item => item.views > 0)
      .sort((a, b) => b.views - a.views);

    const topArea = areaStats.length > 0 ? areaStats[0].name : 'N/A';

    return { areaStats, mostViewed, topArea };
  }, [turfs]);

  const handleDelete = (id: string, name: string) => {
    if (!db) return;
    
    const turfRef = doc(db, 'turfs', id);
    deleteDoc(turfRef).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: turfRef.path,
        operation: 'delete'
      });
      errorEmitter.emit('permission-error', permissionError);
    });
    
    toast({
      title: 'Listing Deleted',
      description: `${name} has been removed.`
    });
  };

  const handleSeedData = async () => {
    if (!db) return;
    setIsSeeding(true);
    
    try {
      const turfPromises = MOCK_TURFS.map(turf => {
        const turfRef = doc(db, 'turfs', turf.id);
        return setDoc(turfRef, {
          ...turf,
          updatedAt: serverTimestamp(),
          views: 0,
          whatsappClicks: 0
        }, { merge: true });
      });

      const statsRef = doc(db, 'analytics', 'stats');
      const statsPromise = setDoc(statsRef, {
        totalViews: 0,
        totalWhatsAppClicks: 0,
        totalUsers: 0,
      }, { merge: true });

      const brandingRef = doc(db, 'settings', 'branding');
      const brandingPromise = setDoc(brandingRef, {
        heroBadgeText: "WE CONNECT YOU TO THE BEST TURFS",
        heroHeading1: "BOOK EASY.",
        heroHeading2: "PLAY MORE.",
        heroDescription: "Discover and book Mysuru’s best sports turfs in one place.",
        heroImageUrl: "https://picsum.photos/seed/turf-hero/1920/1080",
        logoUrl: "",
        updatedAt: serverTimestamp()
      }, { merge: true });

      await Promise.all([...turfPromises, statsPromise, brandingPromise]);
      
      toast({
        title: "Database Synced",
        description: "Real-world turf data is now live.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Verify admin permissions and connection.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (turfsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const chartConfig = {
    views: {
      label: "Activity",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl tracking-tight">COMMAND <span className="text-primary">CENTER</span></h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Real-time arena metrics and platform management.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleSeedData} 
            disabled={isSeeding}
            className="border-white/10 hover:bg-white/5 h-14 rounded-xl font-black text-xs uppercase tracking-widest bg-white/5"
          >
            {isSeeding ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Database className="h-5 w-5 mr-2" />}
            Sync Real Data
          </Button>
          <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl h-14 px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
            <Link href="/admin/new">
              <Plus className="mr-2 h-5 w-5" /> Add Venue
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Views", val: stats?.totalViews, icon: Eye, color: "text-primary" },
          { label: "Bookings", val: stats?.totalWhatsAppClicks, icon: MousePointerClick, color: "text-primary" },
          { label: "Members", val: stats?.totalUsers, icon: Users, color: "text-primary" },
          { label: "Hot Zone", val: processedAnalytics.topArea, icon: TrendingUp, color: "text-primary" }
        ].map((item, i) => (
          <Card key={i} className="glass-card border-none overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.label}</CardTitle>
              <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-125", item.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black italic tracking-tighter">
                {typeof item.val === 'number' ? item.val.toLocaleString() : (item.val === 'N/A' ? 'NONE' : item.val)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 glass-card border-none rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">AREA <span className="text-primary">TRAFFIC</span></CardTitle>
            </div>
            <CardDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Views distribution by region</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-6">
            {processedAnalytics.areaStats.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedAnalytics.areaStats}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      className="font-black uppercase tracking-widest"
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      className="font-black"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="views" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <BarChartIcon className="h-12 w-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">Awaiting Data Flow</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 glass-card border-none rounded-2xl overflow-hidden flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">MVP <span className="text-primary">VENUE</span></CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-8">
            {processedAnalytics.mostViewed ? (
              <div className="space-y-6">
                <div className="relative w-40 h-40 mx-auto rounded-2xl overflow-hidden border-2 border-primary/20 p-1 group">
                  <img 
                    src={processedAnalytics.mostViewed.images[0]} 
                    alt="MVP"
                    className="w-full h-full object-cover rounded-xl grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
                </div>
                <div>
                  <h3 className="text-3xl text-primary leading-none mb-1">
                    {processedAnalytics.mostViewed.name}
                  </h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{processedAnalytics.mostViewed.area}</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/5 rounded-xl p-4 min-w-[100px] border border-white/5">
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Reach</p>
                    <p className="text-2xl font-black italic">{processedAnalytics.mostViewed.views || 0}</p>
                  </div>
                  <div className="bg-primary/10 rounded-xl p-4 min-w-[100px] border border-primary/20">
                    <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest mb-1">Leads</p>
                    <p className="text-2xl font-black italic text-primary">{processedAnalytics.mostViewed.whatsappClicks || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                <Trophy className="h-12 w-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">No MVP Identified</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border-none shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h2 className="text-2xl">LIVE <span className="text-primary">INVENTORY</span></h2>
          <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
            {turfs?.length || 0} TOTAL UNITS
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Venue</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Zone</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px]">Base Rate</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Traffic</TableHead>
                <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Leads</TableHead>
                <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turfs?.map((turf) => (
                <TableRow key={turf.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-black text-xl italic tracking-tighter text-white py-6">{turf.name}</TableCell>
                  <TableCell className="text-white/40 font-bold uppercase tracking-widest text-xs">{turf.area}</TableCell>
                  <TableCell className="font-black text-primary italic">₹{turf.pricePerHour}</TableCell>
                  <TableCell className="text-center font-mono font-bold text-white/60">
                    {turf.views || 0}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-primary">
                    {turf.whatsappClicks || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-primary/10 hover:text-primary transition-all" asChild>
                        <Link href={`/admin/new?id=${turf.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/10 rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-3xl text-destructive italic">TERMINATE LISTING?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/60 font-medium">
                              Removing <span className="text-white font-black">{turf.name}</span> will instantly wipe it from the public discovery engine.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="bg-white/5 border-white/5 rounded-xl font-black uppercase tracking-widest text-xs">ABORT</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(turf.id, turf.name)}
                              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-black uppercase tracking-widest text-xs"
                            >
                              TERMINATE
                            </AlertDialogAction>
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
      </div>
    </div>
  );
}

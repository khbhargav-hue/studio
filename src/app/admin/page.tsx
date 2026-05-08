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
  CheckCircle
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
    if (!turfs) return { areaStats: [], mostViewed: null, topArea: 'N/A' };

    const areaCounts: Record<string, number> = {};
    let maxViews = -1;
    let mostViewed = null;

    turfs.forEach(turf => {
      areaCounts[turf.area] = (areaCounts[turf.area] || 0) + (turf.views || 0);
      
      if ((turf.views || 0) > maxViews) {
        maxViews = turf.views;
        mostViewed = turf;
      }
    });

    const areaStats = Object.entries(areaCounts)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views);

    const topArea = areaStats.length > 0 ? areaStats[0].name : 'N/A';

    return { areaStats, mostViewed, topArea };
  }, [turfs]);

  const handleDelete = (id: string, name: string) => {
    if (!db) return;
    if (confirm(`Are you sure you want to delete "${name}"? This action is permanent.`)) {
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
        description: `${name} has been removed from the directory.`
      });
    }
  };

  const handleSeedData = async () => {
    if (!db) return;
    setIsSeeding(true);
    
    try {
      const promises = MOCK_TURFS.map(turf => {
        const turfRef = doc(db, 'turfs', turf.id);
        return setDoc(turfRef, {
          ...turf,
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      await Promise.all(promises);
      
      toast({
        title: "Database Synced",
        description: "Real-world Mysuru venues have been added to your collection.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Check your permissions and try again.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (turfsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  const chartConfig = {
    views: {
      label: "Total Views",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1 text-lg">Real-time performance metrics and venue management.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSeedData} 
            disabled={isSeeding}
            className="border-white/5 hover:bg-white/5 h-12 rounded-2xl font-bold"
          >
            {isSeeding ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Database className="h-5 w-5 mr-2" />}
            Sync Real Data
          </Button>
          <Button asChild className="bg-primary text-primary-foreground font-bold rounded-2xl h-12 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            <Link href="/admin/new">
              <Plus className="mr-2 h-5 w-5" /> Add New Venue
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Reach</CardTitle>
            <Eye className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique page views tracked</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Conversion</CardTitle>
            <MousePointerClick className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalWhatsAppClicks?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total WhatsApp booking clicks</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Players</CardTitle>
            <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform user base</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Area</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold truncate">{processedAnalytics.topArea}</div>
            <p className="text-xs text-muted-foreground mt-1">Highest regional activity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-headline font-bold">Area Popularity</CardTitle>
            </div>
            <CardDescription>Views distribution across different Mysuru areas</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedAnalytics.areaStats}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="views" 
                    fill="var(--color-views)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 rounded-[2rem] overflow-hidden flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-accent" />
              <CardTitle className="text-xl font-headline font-bold">Most Viewed Venue</CardTitle>
            </div>
            <CardDescription>Current trending turf on the platform</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-8">
            {processedAnalytics.mostViewed ? (
              <div className="space-y-4">
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20 p-1">
                  {processedAnalytics.mostViewed.images?.[0] ? (
                    <img 
                      src={processedAnalytics.mostViewed.images[0]} 
                      alt={processedAnalytics.mostViewed.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center rounded-full">
                      <Trophy className="h-10 w-10 text-primary opacity-20" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">
                    {processedAnalytics.mostViewed.name}
                  </h3>
                  <p className="text-muted-foreground font-bold">{processedAnalytics.mostViewed.area}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <div className="bg-white/5 rounded-2xl p-4 min-w-[100px]">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Views</p>
                    <p className="text-2xl font-bold">{processedAnalytics.mostViewed.views || 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 min-w-[100px]">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Leads</p>
                    <p className="text-2xl font-bold text-accent">{processedAnalytics.mostViewed.whatsappClicks || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold">Venue Listings</h2>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-none px-3 py-1 font-bold">
            {turfs?.length || 0} ACTIVE
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="font-bold">Venue</TableHead>
                <TableHead className="font-bold">Area</TableHead>
                <TableHead className="font-bold">Price/hr</TableHead>
                <TableHead className="font-bold text-center">Views</TableHead>
                <TableHead className="font-bold text-center">Featured</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turfs?.map((turf) => (
                <TableRow key={turf.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-bold text-lg">{turf.name}</TableCell>
                  <TableCell className="text-muted-foreground">{turf.area}</TableCell>
                  <TableCell className="font-bold text-primary">₹{turf.pricePerHour}</TableCell>
                  <TableCell className="text-center font-mono">
                    {turf.views || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {turf.isPopular ? (
                      <Badge className="bg-accent/20 text-accent border-accent/20">Featured</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Standard</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" asChild>
                        <Link href={`/admin/new?id=${turf.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                        onClick={() => handleDelete(turf.id, turf.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!turfs || turfs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Plus className="h-12 w-12 opacity-20" />
                      <p className="text-lg">No venues listed yet.</p>
                      <Button variant="outline" asChild>
                        <Link href="/admin/new">Create first listing</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

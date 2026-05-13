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
  Download,
  Calendar,
  Phone,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  History,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function StudioDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Data Queries
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'turfs'), orderBy('name', 'asc'));
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
    return query(collection(db, 'leads'), orderBy('timestamp', 'desc'), limit(100));
  }, [db]);

  const statsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'analytics', 'stats');
  }, [db]);

  const { data: turfs, loading: turfsLoading } = useCollection(turfsQuery);
  const { data: teams } = useCollection(teamsQuery);
  const { data: challenges } = useCollection(challengesQuery);
  const { data: leads, loading: leadsLoading } = useCollection(leadsQuery);
  const { data: stats } = useDoc(statsRef);

  const processedAnalytics = useMemo(() => {
    if (!turfs || turfs.length === 0) return { areaStats: [], mostViewed: null, topArea: 'N/A', mostBooked: null };

    const areaCounts: Record<string, number> = {};
    let maxViews = -1;
    let maxBookings = -1;
    let mostViewed = null;
    let mostBooked = null;

    turfs.forEach(turf => {
      const views = turf.views || 0;
      const bookings = turf.whatsappClicks || 0;
      const area = turf.area || 'Unknown';
      areaCounts[area] = (areaCounts[area] || 0) + views;
      
      if (views >= maxViews) {
        maxViews = views;
        mostViewed = turf;
      }
      if (bookings >= maxBookings) {
        maxBookings = bookings;
        mostBooked = turf;
      }
    });

    const areaStats = Object.entries(areaCounts)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views);

    return { areaStats, mostViewed, mostBooked, topArea: areaStats[0]?.name || 'N/A' };
  }, [turfs]);

  const handleExportLeads = () => {
    if (!leads) return;
    const headers = ["Date", "Turf", "Area", "Sport", "Device"];
    const csvContent = [
      headers.join(","),
      ...leads.map(l => [
        l.timestamp?.toDate() ? format(l.timestamp.toDate(), "yyyy-MM-dd HH:mm") : "N/A",
        `"${l.turfName}"`,
        `"${l.area}"`,
        `"${l.sportType}"`,
        `"${l.deviceInfo}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `turfista_leads_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Intelligence Exported" });
  };

  const togglePopularStatus = (turfId: string, currentStatus: boolean) => {
    if (!db) return;
    const turfRef = doc(db, 'turfs', turfId);
    updateDoc(turfRef, { isPopular: !currentStatus })
      .then(() => toast({ title: !currentStatus ? 'Venue Promoted' : 'Promotion Ended' }))
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: turfRef.path,
          operation: 'update',
          requestResourceData: { isPopular: !currentStatus }
        }));
      });
  };

  const handleDeleteTurf = (turfId: string, turfName: string) => {
    if (!db) return;
    const turfRef = doc(db, 'turfs', turfId);
    deleteDoc(turfRef)
      .then(() => toast({ title: 'Listing Deleted' }))
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
             <ShieldCheck className="h-6 w-6 text-primary" />
             <h1 className="text-5xl font-black tracking-tighter italic uppercase">Arena <span className="text-primary">Studio</span></h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">Secure platform intelligence and arena deployment.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleExportLeads}
            className="h-14 rounded-2xl border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px]"
          >
            <Download className="h-4 w-4 mr-2" /> Data Export
          </Button>
          <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl h-14 px-8 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
            <Link href="/studio/new">
              <Plus className="mr-2 h-5 w-5" /> Deploy Arena
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-white/5 p-1 h-14 rounded-[2rem] border border-white/5 w-full md:w-auto overflow-x-auto overflow-y-hidden no-scrollbar">
          <TabsTrigger value="overview" className="px-8 h-full rounded-[1.5rem] font-bold uppercase tracking-widest text-[9px] md:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <LayoutDashboard className="h-4 w-4 mr-2 hidden md:block" /> Overview
          </TabsTrigger>
          <TabsTrigger value="inventory" className="px-8 h-full rounded-[1.5rem] font-bold uppercase tracking-widest text-[9px] md:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <Database className="h-4 w-4 mr-2 hidden md:block" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="community" className="px-8 h-full rounded-[1.5rem] font-bold uppercase tracking-widest text-[9px] md:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <Users className="h-4 w-4 mr-2 hidden md:block" /> Community
          </TabsTrigger>
          <TabsTrigger value="leads" className="px-8 h-full rounded-[1.5rem] font-bold uppercase tracking-widest text-[9px] md:text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <MessageSquare className="h-4 w-4 mr-2 hidden md:block" /> Leads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Global Reach", val: stats?.totalViews, icon: Eye, color: "text-primary" },
              { label: "Booking Leads", val: stats?.totalWhatsAppClicks, icon: MousePointerClick, color: "text-primary" },
              { label: "Active Pitches", val: turfs?.length, icon: Trophy, color: "text-primary" },
              { label: "Live Squads", val: teams?.length, icon: Users, color: "text-primary" }
            ].map((item, i) => (
              <Card key={i} className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-8">
                  <CardTitle className="text-[9px] font-black text-white/40 uppercase tracking-widest">{item.label}</CardTitle>
                  <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-125", item.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-10">
                  <div className="text-6xl font-black italic tracking-tighter leading-none">
                    {typeof item.val === 'number' ? item.val.toLocaleString() : (item.val || 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
              <CardHeader className="p-12">
                <CardTitle className="text-3xl font-black italic uppercase">Regional <span className="text-primary text-neon">Traffic</span></CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Visibility distribution across Mysuru zones</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] p-12 pt-0">
                {processedAnalytics.areaStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedAnalytics.areaStats}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 900}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 9}} />
                      <RechartsTooltip content={<DashboardTooltipContent />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                      <Bar dataKey="views" radius={[6, 6, 0, 0]} barSize={40}>
                        {processedAnalytics.areaStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#39FF14' : 'rgba(57,255,20,0.2)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <BarChart3 className="h-16 w-16 mb-4" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Awaiting city traffic...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-4 space-y-8">
              <Card className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden bg-primary/5 border-primary/10">
                <CardHeader className="p-10">
                  <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-4">
                    <Star className="h-6 w-6 text-primary fill-current animate-pulse" /> Top Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                  {processedAnalytics.mostViewed ? (
                    <div className="space-y-8">
                      <div className="aspect-square rounded-[2rem] overflow-hidden border border-primary/20 shadow-2xl">
                        <img src={processedAnalytics.mostViewed.mainImage} className="w-full h-full object-cover grayscale-[0.3]" />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black italic text-primary leading-none uppercase">{processedAnalytics.mostViewed.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-3">{processedAnalytics.mostViewed.area}</p>
                      </div>
                      <div className="flex items-center justify-between py-6 border-t border-white/5">
                        <div className="text-center">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Visits</p>
                          <p className="text-2xl font-black italic">{processedAnalytics.mostViewed.views}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">Leads</p>
                          <p className="text-2xl font-black italic text-primary">{processedAnalytics.mostViewed.whatsappClicks}</p>
                        </div>
                      </div>
                    </div>
                  ) : <p className="text-center text-white/10 py-20 font-black uppercase text-[10px]">Intelligence gathering...</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
          <div className="p-10 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-black italic uppercase">Arena <span className="text-primary">Inventory</span></h2>
               <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2">Managing {turfs?.length || 0} active pitches in Mysuru</p>
            </div>
            <Badge className="bg-primary/20 text-primary px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border-none self-start md:self-auto">
              FULL SYSTEM ACTIVE
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="p-8 font-black uppercase tracking-widest text-[9px] text-white/30">Arena Identity</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-white/30">Location</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-white/30">Feature Status</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-white/30 text-center">Visits</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-white/30 text-center">Leads</TableHead>
                  <TableHead className="text-right p-8 font-black uppercase tracking-widest text-[9px] text-white/30">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turfs?.map((turf) => (
                  <TableRow key={turf.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-black text-2xl italic tracking-tighter text-white p-8">
                       {turf.name}
                       <div className="flex gap-2 mt-2">
                          {turf.sportTypes?.map((s: string) => (
                             <span key={s} className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md text-white/40">{s}</span>
                          ))}
                       </div>
                    </TableCell>
                    <TableCell className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{turf.area}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => togglePopularStatus(turf.id, !!turf.isPopular)}
                        className={cn(
                          "rounded-full h-10 w-10 p-0 transition-all",
                          turf.isPopular ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(57,255,20,0.3)]" : "text-white/10 hover:text-white"
                        )}
                      >
                        <Star className={cn("h-4 w-4", turf.isPopular && "fill-current")} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-white/30">{turf.views || 0}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary">{turf.whatsappClicks || 0}</TableCell>
                    <TableCell className="text-right p-8">
                      <div className="flex justify-end gap-3">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all bg-white/5 border border-white/5" asChild>
                          <Link href={`/studio/new?id=${turf.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all bg-white/5 border border-white/5">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border-white/10 rounded-[2.5rem] bg-black">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-3xl font-black italic uppercase text-destructive">Terminate Listing?</AlertDialogTitle>
                              <AlertDialogDescription className="text-white/40 font-medium">Permanent removal of "{turf.name}" from public circuits.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 gap-4">
                              <AlertDialogCancel className="rounded-2xl font-bold uppercase tracking-widest text-[10px] h-14 bg-white/5 border-white/10">Abort</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTurf(turf.id, turf.name)} className="bg-destructive text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] h-14">Confirm Wipe</AlertDialogAction>
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

        <TabsContent value="community" className="space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
                 <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-4">
                       <Users className="h-6 w-6 text-primary" /> Active Squads
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="px-10 pb-10">
                    <div className="space-y-4">
                       {teams?.slice(0, 5).map((team: any) => (
                          <div key={team.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                             <div>
                                <p className="font-bold uppercase text-white">{team.teamName}</p>
                                <p className="text-[8px] font-black text-white/20 uppercase mt-1">{team.sport} • {team.area}</p>
                             </div>
                             <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                {team.players?.length || 0}
                             </div>
                          </div>
                       ))}
                       <p className="text-center text-[8px] font-black text-white/20 uppercase tracking-widest pt-4">Showing {Math.min(5, teams?.length || 0)} of {teams?.length || 0} total squads</p>
                    </div>
                 </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
                 <CardHeader className="p-10 pb-4">
                    <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-4">
                       <Zap className="h-6 w-6 text-primary" /> Match Requests
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="px-10 pb-10">
                    <div className="space-y-4">
                       {challenges?.slice(0, 5).map((challenge: any) => (
                          <div key={challenge.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                             <div>
                                <p className="font-bold uppercase text-white">{challenge.teamName}</p>
                                <p className="text-[8px] font-black text-white/20 uppercase mt-1">{challenge.date} @ {challenge.time}</p>
                             </div>
                             <Badge className={cn(
                                "text-[8px] font-black uppercase rounded-lg border-none",
                                challenge.status === 'open' ? "bg-primary/20 text-primary" : "bg-white/10 text-white/20"
                             )}>
                                {challenge.status}
                             </Badge>
                          </div>
                       ))}
                       <p className="text-center text-[8px] font-black text-white/20 uppercase tracking-widest pt-4">Recent {Math.min(5, challenges?.length || 0)} community match claims</p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="leads" className="glass-card border-white/5 rounded-[3.5rem] overflow-hidden">
          <div className="p-12 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h2 className="text-3xl font-black italic uppercase text-primary">Lead <span className="text-white">Intelligence</span></h2>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-2">Conversion activity via secure WhatsApp bridge</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportLeads} className="h-12 px-8 rounded-2xl border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest">
               RAW EXPORT (.CSV)
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="p-8 font-black uppercase tracking-widest text-[9px] text-white/30">Timestamp</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-white/30">Arena Context</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-white/30">Sport</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-white/30">Client Device Fingerprint</TableHead>
                  <TableHead className="text-right p-8 font-black uppercase tracking-widest text-[9px] text-white/30">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads?.map((lead) => (
                  <TableRow key={lead.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="p-8 font-mono text-[10px] text-white/40">
                      {lead.timestamp?.toDate() ? format(lead.timestamp.toDate(), "MMM dd, HH:mm") : 'SYNCING'}
                    </TableCell>
                    <TableCell>
                       <p className="font-black text-white italic uppercase">{lead.turfName}</p>
                       <p className="text-[8px] font-bold text-white/20 uppercase mt-1">{lead.area}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest">{lead.sportType}</Badge>
                    </TableCell>
                    <TableCell className="text-[10px] text-white/20 italic truncate max-w-[240px] font-mono">{lead.deviceInfo}</TableCell>
                    <TableCell className="text-right p-8">
                       <div className="flex items-center justify-end gap-2 text-primary font-black text-[9px] uppercase">
                          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                          CONVERTED
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

function DashboardTooltipContent({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-white/10 p-5 rounded-[1.5rem] shadow-2xl backdrop-blur-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">{payload[0].payload.name}</p>
        <p className="text-3xl font-black italic text-white leading-none">{payload[0].value.toLocaleString()}</p>
        <p className="text-[9px] font-bold uppercase text-white/20 tracking-widest mt-2">Visibility Rank: #1</p>
      </div>
    );
  }
  return null;
}

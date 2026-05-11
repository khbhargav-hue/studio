'use client';

import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, setDoc, serverTimestamp, limit } from 'firebase/firestore';
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
  MessageSquare
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
  Tooltip as RechartsTooltip,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  // Data Queries
  const turfsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'turfs'), orderBy('name', 'asc'));
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
  const { data: leads, loading: leadsLoading } = useCollection(leadsQuery);
  const { data: stats } = useDoc(statsRef);

  // Analytics Processing
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
    const headers = ["Date", "Turf", "Area", "Sport", "Device", "Name", "Phone"];
    const csvContent = [
      headers.join(","),
      ...leads.map(l => [
        l.timestamp?.toDate() ? format(l.timestamp.toDate(), "yyyy-MM-dd HH:mm") : "N/A",
        `"${l.turfName}"`,
        `"${l.area}"`,
        `"${l.sportType}"`,
        `"${l.deviceInfo}"`,
        `"${l.customerName || 'N/A'}"`,
        `"${l.customerPhone || 'N/A'}"`
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
    toast({ title: "Leads Exported", description: "CSV file generated successfully." });
  };

  const handleDelete = (id: string, name: string) => {
    if (!db) return;
    const turfRef = doc(db, 'turfs', id);
    deleteDoc(turfRef).then(() => {
      toast({ title: 'Listing Deleted', description: `${name} has been removed.` });
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase">Platform <span className="text-primary">Control</span></h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Analytics, inventory and lead intelligence.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleExportLeads}
            className="h-14 rounded-2xl border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px]"
          >
            <Download className="h-4 w-4 mr-2" /> Export Leads
          </Button>
          <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl h-14 px-8 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
            <Link href="/admin/new">
              <Plus className="mr-2 h-5 w-5" /> Add Arena
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-white/5 p-1 h-14 rounded-2xl border border-white/5">
          <TabsTrigger value="overview" className="px-8 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="inventory" className="px-8 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <Database className="h-4 w-4 mr-2" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="leads" className="px-8 h-full rounded-xl font-bold uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black">
            <MessageSquare className="h-4 w-4 mr-2" /> Leads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Platform Views", val: stats?.totalViews, icon: Eye, color: "text-primary" },
              { label: "Total Leads", val: stats?.totalWhatsAppClicks, icon: MousePointerClick, color: "text-primary" },
              { label: "Active Pitches", val: turfs?.length, icon: Trophy, color: "text-primary" },
              { label: "Hot Zone", val: processedAnalytics.topArea, icon: TrendingUp, color: "text-primary" }
            ].map((item, i) => (
              <Card key={i} className="glass-card border-white/5 rounded-3xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.label}</CardTitle>
                  <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-125", item.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-black italic tracking-tighter leading-none">
                    {typeof item.val === 'number' ? item.val.toLocaleString() : item.val}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black italic uppercase">Regional <span className="text-primary">Traffic</span></CardTitle>
                <CardDescription className="text-xs font-bold uppercase text-white/40 tracking-widest">Views distribution across Mysuru zones</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] p-8">
                {processedAnalytics.areaStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedAnalytics.areaStats}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} />
                      <RechartsTooltip content={<AdminDashboardTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="views" radius={[8, 8, 0, 0]} barSize={50}>
                        {processedAnalytics.areaStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#39FF14' : 'rgba(57,255,20,0.3)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <BarChart3 className="h-12 w-12 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting traffic flow...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-4 space-y-8">
              <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden bg-primary/5 border-primary/20">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" /> MVP Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  {processedAnalytics.mostViewed ? (
                    <div className="space-y-6">
                      <div className="aspect-square rounded-2xl overflow-hidden border border-primary/20">
                        <img src={processedAnalytics.mostViewed.mainImage} className="w-full h-full object-cover grayscale-[0.5]" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black italic text-primary leading-none uppercase">{processedAnalytics.mostViewed.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-2">{processedAnalytics.mostViewed.area}</p>
                      </div>
                      <div className="flex items-center justify-between py-4 border-t border-white/5">
                        <div className="text-center">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Reach</p>
                          <p className="text-xl font-black italic">{processedAnalytics.mostViewed.views}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Leads</p>
                          <p className="text-xl font-black italic text-primary">{processedAnalytics.mostViewed.whatsappClicks}</p>
                        </div>
                      </div>
                    </div>
                  ) : <p className="text-center text-white/20 py-20 font-black uppercase text-[10px]">No MVP Active</p>}
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black italic uppercase">Daily Traffic</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4">
                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Real-time Users</span>
                      <span className="text-xl font-black italic text-primary">LIVE</span>
                   </div>
                   <p className="text-[9px] text-white/20 font-medium leading-relaxed italic">
                     Analytics system is syncing every 60 seconds. Traffic data includes unique mobile and desktop sessions.
                   </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h2 className="text-2xl font-black italic uppercase">Inventory <span className="text-primary">Control</span></h2>
            <Badge className="bg-primary/20 text-primary px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-none">
              {turfs?.length || 0} TOTAL UNITS
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Arena</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Area</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Base Rate</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Views</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Inquiries</TableHead>
                  <TableHead className="text-right font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turfs?.map((turf) => (
                  <TableRow key={turf.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-black text-xl italic tracking-tighter text-white py-6">{turf.name}</TableCell>
                    <TableCell className="text-white/40 font-bold uppercase tracking-widest text-xs">{turf.area}</TableCell>
                    <TableCell className="font-black text-primary italic">₹{turf.pricePerHour}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-white/40">{turf.views || 0}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary">{turf.whatsappClicks || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" asChild>
                          <Link href={`/admin/new?id=${turf.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border-white/10 rounded-3xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black italic uppercase text-destructive">Wipe Arena Data?</AlertDialogTitle>
                              <AlertDialogDescription>Permanent removal of "{turf.name}" from public discovery.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6">
                              <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Abort</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(turf.id, turf.name)} className="bg-destructive text-white rounded-xl font-bold uppercase tracking-widest text-[10px]">Terminate</AlertDialogAction>
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

        <TabsContent value="leads" className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h2 className="text-2xl font-black italic uppercase">Booking <span className="text-primary">Intelligence</span></h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Recent inquiries via WhatsApp</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="py-6 font-black uppercase tracking-widest text-[10px]">Timestamp</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Turf</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Sport</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Area</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px]">Device Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads?.map((lead) => (
                  <TableRow key={lead.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="py-5 font-mono text-xs text-white/60">
                      {lead.timestamp?.toDate() ? format(lead.timestamp.toDate(), "MMM dd, HH:mm") : 'N/A'}
                    </TableCell>
                    <TableCell className="font-bold text-white">{lead.turfName}</TableCell>
                    <TableCell>
                      <Badge className="bg-white/10 text-white/60 border-none px-3 py-1 text-[9px] uppercase tracking-widest">{lead.sportType}</Badge>
                    </TableCell>
                    <TableCell className="text-white/40 text-xs font-bold uppercase">{lead.area}</TableCell>
                    <TableCell className="text-xs text-white/20 italic truncate max-w-[200px]">{lead.deviceInfo}</TableCell>
                  </TableRow>
                ))}
                {(!leads || leads.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center opacity-20">
                      <Calendar className="h-10 w-10 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest text-[10px]">No inquiries logged yet</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminDashboardTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{payload[0].payload.name}</p>
        <p className="text-xl font-black italic text-white">{payload[0].value.toLocaleString()} <span className="text-[10px] uppercase text-white/40">Views</span></p>
      </div>
    );
  }
  return null;
}
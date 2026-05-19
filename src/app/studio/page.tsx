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
import { Edit2, Trash2, Plus, Zap, Users, Trophy, UserCheck, TrendingUp, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

export default function StudioDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  const turfsQuery = useMemoFirebase(() => query(collection(db, 'turfs'), orderBy("updatedAt", "desc")), [db]);
  const teamsQuery = useMemoFirebase(() => query(collection(db, 'teams'), orderBy('createdAt', 'desc')), [db]);
  const challengesQuery = useMemoFirebase(() => query(collection(db, 'challenges'), orderBy('createdAt', 'desc')), [db]);

  const { data: turfs, loading: turfsLoading } = useCollection(turfsQuery);
  const { data: teams } = useCollection(teamsQuery);
  const { data: challenges } = useCollection(challengesQuery);

  const toggleStatus = (coll: string, id: string, field: string, val: boolean) => {
    updateDoc(doc(db, coll, id), { [field]: !val, updatedAt: new Date() })
      .then(() => toast({ title: "Circuit node updated" }));
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black italic uppercase leading-none">Studio <span className="text-primary">Admin</span></h1>
          <p className="text-[#888] text-[10px] font-black uppercase tracking-widest mt-2">Mysuru Sports Circuit Node: 🟢 Stable</p>
        </div>
        <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[11px] h-12 px-8">
          <Link href="/studio/new"><Plus className="mr-2 h-4 w-4" /> Add New Node</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Turfs", val: turfs?.length, icon: Zap },
          { label: "Teams", val: teams?.length, icon: Users },
          { label: "Claims", val: challenges?.length, icon: Trophy },
          { label: "Coaches", val: 0, icon: UserCheck }
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border p-6 group hover:border-primary">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">{item.label}</span>
              <item.icon className="h-4 w-4 text-primary opacity-20 group-hover:opacity-100" />
            </div>
            <div className="text-4xl font-black italic leading-none text-white">{item.val || 0}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="turfs" className="space-y-8">
        <TabsList className="bg-card p-1 h-12 border border-border rounded-none w-full md:w-auto">
          <TabsTrigger value="turfs" className="flex-1 md:flex-none px-8 font-black uppercase tracking-widest text-[10px]">Turfs</TabsTrigger>
          <TabsTrigger value="teams" className="flex-1 md:flex-none px-8 font-black uppercase tracking-widest text-[10px]">Teams</TabsTrigger>
          <TabsTrigger value="ads" className="flex-1 md:flex-none px-8 font-black uppercase tracking-widest text-[10px]">Ads</TabsTrigger>
        </TabsList>

        <TabsContent value="turfs" className="bg-card border border-border">
          <div className="p-6 border-b border-border bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-lg">Arena Registry</h2>
            <Badge className="bg-primary text-black font-black uppercase text-[8px] tracking-widest">LIVE FIRESTORE</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-[#444]">Identity</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[9px] text-[#444]">Discovery</TableHead>
                  <TableHead className="text-right font-black uppercase tracking-widest text-[9px] text-[#444]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turfs?.map((turf) => (
                  <TableRow key={turf.id} className="border-border hover:bg-white/[0.01]">
                    <TableCell>
                      <p className="font-black uppercase italic text-sm text-white">{turf.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-tight text-[#444]">{turf.area}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button onClick={() => toggleStatus('turfs', turf.id, 'isPremium', !!turf.isPremium)} className={cn("text-[9px] font-black px-2 py-1 uppercase tracking-widest border", turf.isPremium ? "border-primary text-primary" : "border-[#222] text-[#444]")}>Featured</button>
                        <button onClick={() => toggleStatus('turfs', turf.id, 'isActive', !!turf.isActive)} className={cn("text-[9px] font-black px-2 py-1 uppercase tracking-widest border", turf.isActive ? "border-green-500 text-green-500" : "border-red-500 text-red-500")}>Active</button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" asChild>
                          <Link href={`/studio/new?id=${turf.id}`}><Edit2 className="h-3 w-3" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => deleteDoc(doc(db, 'turfs', turf.id))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
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

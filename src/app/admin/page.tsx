'use client';

import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

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

  if (turfsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1 text-lg">Real-time performance metrics and venue management.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground font-bold rounded-2xl h-12 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
          <Link href="/admin/new">
            <Plus className="mr-2 h-5 w-5" /> Add New Venue
          </Link>
        </Button>
      </div>

      {/* Analytics Grid */}
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
            <div className="text-3xl font-bold">Vijayanagar</div>
            <p className="text-xs text-muted-foreground mt-1">Highest regional activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Turf Management Table */}
      <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h2 className="font-headline text-xl font-bold">Venue Listings</h2>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
            {turfs?.length || 0} Total
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="font-bold">Venue</TableHead>
                <TableHead className="font-bold">Area</TableHead>
                <TableHead className="font-bold">Price/hr</TableHead>
                <TableHead className="font-bold">Rating</TableHead>
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
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-primary fill-current" />
                      <span className="font-bold">{turf.rating}</span>
                    </div>
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

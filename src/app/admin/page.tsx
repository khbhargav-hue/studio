
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  MousePointerClick, 
  TrendingUp,
  Loader2,
  Users
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser, useCollection, useDoc, useFirestore } from "@/firebase"
import { useRouter } from "next/navigation"
import { collection, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: userLoading } = useUser()
  const db = useFirestore()
  
  // Auth Protection
  useEffect(() => {
    if (!userLoading && (!user || user.email !== "admin@turfista.com")) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  // Data Fetching
  const turfsQuery = query(collection(db!, "turfs"), orderBy("name", "asc"))
  const { data: turfs, loading: turfsLoading } = useCollection(turfsQuery)
  const { data: stats } = useDoc(doc(db!, "analytics", "stats"))

  const handleDelete = (id: string) => {
    if (!db) return
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      const turfRef = doc(db, "turfs", id)
      deleteDoc(turfRef).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: turfRef.path,
          operation: 'delete'
        })
        errorEmitter.emit('permission-error', permissionError)
      })
      toast({
        title: "Listing Deleted",
        description: "The turf listing has been removed."
      })
    }
  }

  if (userLoading || turfsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your venue listings and track performance.</p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20">
            <Link href="/admin/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Turf
            </Link>
          </Button>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">WhatsApp Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalWhatsAppClicks?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">+5.4% from last month</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Registered players</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Popular Area</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Vijayanagar</div>
              <p className="text-xs text-muted-foreground">Highest engagement</p>
            </CardContent>
          </Card>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border-white/5">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Turf Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Sports</TableHead>
                <TableHead>Price/hr</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turfs?.map((turf) => (
                <TableRow key={turf.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">{turf.name}</TableCell>
                  <TableCell className="text-muted-foreground">{turf.area}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {turf.sportTypes?.map((s: string) => (
                        <Badge key={s} variant="secondary" className="bg-background/50 text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>₹{turf.pricePerHour}</TableCell>
                  <TableCell>
                    <Badge className="bg-primary/20 text-primary border-none">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="hover:bg-white/10 hover:text-primary" asChild>
                        <Link href={`/admin/new?id=${turf.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(turf.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!turfs || turfs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No turfs found. Start by adding one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

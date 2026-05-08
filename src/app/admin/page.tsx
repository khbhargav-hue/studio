"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { MOCK_TURFS } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BarChart3, 
  Eye, 
  MousePointerClick, 
  TrendingUp 
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

export default function AdminDashboard() {
  const [turfs, setTurfs] = useState(MOCK_TURFS)

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      setTurfs(turfs.filter(t => t.id !== id))
    }
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
          <Button asChild className="bg-primary text-primary-foreground font-bold">
            <Link href="/admin/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Turf
            </Link>
          </Button>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,458</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">WhatsApp Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-muted-foreground">+5.4% from last month</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Popular Area</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Vijayanagar</div>
              <p className="text-xs text-muted-foreground">Highest engagement this week</p>
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
              {turfs.map((turf) => (
                <TableRow key={turf.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium">{turf.name}</TableCell>
                  <TableCell className="text-muted-foreground">{turf.area}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {turf.sportTypes.map(s => (
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
                      <Button variant="ghost" size="icon" className="hover:bg-white/10 hover:text-primary">
                        <Edit2 className="h-4 w-4" />
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
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
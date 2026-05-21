"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  ExternalLink, 
  MessageCircle, 
  Loader2, 
  Zap, 
  Trophy, 
  ShieldCheck, 
  Globe,
  Star
} from "lucide-react"
import { db } from "@/lib/firebase"
import { getAuth } from "firebase/auth"
import { useUser, useDoc, useMemoFirebase } from "@/firebase"
import { collection, query, getDocs, addDoc, doc, serverTimestamp, orderBy, getDoc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import Image from "next/image"

const CATEGORIES = ["Sports Brand", "Equipment", "Academy", "Local Business"]
const TIERS = ["Gold", "Silver", "Bronze"]

export default function SponsorsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  
  const [sponsors, setSponsors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser || !db) return;
    
    getDoc(doc(db, "users", currentUser.uid))
      .then(snap => {
        if (snap.exists()) {
          setIsAdmin(snap.data().role === "admin");
        } else {
          setDoc(doc(db, "users", currentUser.uid), {
            name: currentUser.displayName || "Player",
            email: currentUser.email,
            role: "user",
            createdAt: serverTimestamp()
          });
        }
      })
      .catch(err => {
        if (err.code === "unavailable") {
          console.log("Offline - using cached data for identity check");
        } else {
          console.error("Identity verification error:", err);
        }
      });
  }, [user, db]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    website: "",
    category: "Sports Brand",
    tier: "Bronze"
  })

  const fetchSponsors = async () => {
    if (!db) return
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, "sponsors"))
      setSponsors(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error("SPONSOR_FETCH_FAIL", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSponsors()
  }, [db])

  const sortedSponsors = useMemo(() => {
    const tierMap: Record<string, number> = { Gold: 1, Silver: 2, Bronze: 3 }
    return [...sponsors].sort((a, b) => (tierMap[a.tier] || 4) - (tierMap[b.tier] || 4))
  }, [sponsors])

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return
    setIsAdding(true)

    const payload = {
      ...formData,
      isActive: true,
      createdAt: serverTimestamp()
    }

    try {
      await addDoc(collection(db, "sponsors"), payload)
      toast({ title: "Partner Synchronized", description: `${formData.name} is now part of the circuit.` })
      setShowDialog(false)
      setFormData({ name: "", logoUrl: "", website: "", category: "Sports Brand", tier: "Bronze" })
      fetchSponsors()
    } catch (err: any) {
      toast({ title: "Deployment Failed", description: err.message, variant: "destructive" })
    } finally {
      setIsAdding(false)
    }
  }

  const handleBecomeSponsor = () => {
    window.open("https://wa.me/917411322492?text=Hi! I want to sponsor Turfista Mysuru.", "_blank")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-40 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              <Zap className="h-3 w-3" /> NETWORK PARTNERS
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">
              The Elite <br /><span className="text-primary text-neon">Circuit.</span>
            </h1>
            <p className="text-white/40 text-xl font-medium leading-relaxed italic border-l-2 border-primary/20 pl-8 max-w-xl">
              Powering the next generation of Mysuru sports. Experience the brands and businesses fueling our community.
            </p>
          </div>

          {isAdmin && (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <button className="h-20 px-10 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center">
                  <Plus className="h-6 w-6 mr-3" /> DEPLOY PARTNER
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/5 rounded-[2.5rem] p-10 max-w-lg shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase italic text-white tracking-tighter">
                    PARTNER <span className="text-primary">GENESIS</span>
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveSponsor} className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Partner Identity</Label>
                    <Input placeholder="e.g. Decathlon Mysuru" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="h-14 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Category</Label>
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                        <SelectTrigger className="h-14 bg-white/5"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card">{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Tier Level</Label>
                      <Select value={formData.tier} onValueChange={v => setFormData({...formData, tier: v})}>
                        <SelectTrigger className="h-14 bg-white/5"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card">{TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Logo URL</Label>
                    <Input placeholder="Paste URL..." value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} required className="h-14 bg-white/5" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Digital Domain (Website)</Label>
                    <Input placeholder="https://..." value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} required className="h-14 bg-white/5" />
                  </div>
                  <Button type="submit" disabled={isAdding} className="w-full h-16 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl">
                    {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy to Circuit"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </header>

        {/* Sponsor Grid */}
        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          </div>
        ) : sortedSponsors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/[0.02]">
            <Trophy className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-white/10 uppercase italic">Partner Network Offline</h3>
            <p className="text-white/20 mt-4 max-w-sm mx-auto italic text-lg leading-relaxed">No sponsors have been identified in the current cycle. Join the movement to power Mysuru sports.</p>
          </div>
        )}

        {/* Partnership CTA */}
        <section className="mt-40 p-12 md:p-24 bg-primary/5 border border-primary/20 rounded-[4rem] text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Zap className="h-96 w-96 text-primary" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-12">
            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] text-white">
              Power the <br /><span className="text-primary">Next Generation.</span>
            </h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed italic">
              Connect your brand with thousands of active athletes in Mysuru. Join the city's premier sports discovery network.
            </p>
            <Button 
              onClick={handleBecomeSponsor}
              className="h-24 px-16 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-[#25D366]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 mx-auto"
            >
              <MessageCircle className="h-8 w-8" />
              BECOME A SPONSOR
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function SponsorCard({ sponsor }: { sponsor: any }) {
  const isGold = sponsor.tier === "Gold"

  return (
    <div className={cn(
      "group bg-card border rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-500 hover:scale-[1.02]",
      isGold 
        ? "border-primary/40 shadow-[0_0_40px_rgba(170,255,0,0.1)] lg:col-span-1" 
        : "border-white/5 hover:border-white/20"
    )}>
      <div className={cn(
        "relative rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 overflow-hidden group-hover:bg-white/10 transition-colors",
        isGold ? "h-48 w-full" : "h-32 w-full"
      )}>
        <Image 
          src={sponsor.logoUrl || "https://placehold.co/400x400/111/AAFF00?text=LOGO"} 
          alt={sponsor.name} 
          fill
          className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 300px"
        />
        {isGold && (
          <div className="absolute top-4 right-4 bg-primary text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest shadow-lg">
            ELITE GOLD
          </div>
        )}
      </div>

      <div className="space-y-2 mb-10">
        <h3 className={cn(
          "font-black uppercase italic tracking-tighter text-white transition-colors group-hover:text-primary",
          isGold ? "text-3xl" : "text-xl"
        )}>
          {sponsor.name}
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="bg-white/5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white/40 border border-white/5">
            {sponsor.category}
          </span>
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
            sponsor.tier === "Gold" ? "bg-primary/10 text-primary border-primary/20" : 
            sponsor.tier === "Silver" ? "bg-gray-400/10 text-gray-400 border-gray-400/20" : 
            "bg-amber-700/10 text-amber-700 border-amber-700/20"
          )}>
            {sponsor.tier} TIER
          </span>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-auto w-full h-14 border-white/5 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary hover:text-black hover:border-primary transition-all shadow-xl">
        <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
          VISIT DOMAIN <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  )
}

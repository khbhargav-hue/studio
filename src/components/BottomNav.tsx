'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const SPORTS = [
  { label: "Football ⚽", value: "Football" },
  { label: "Cricket 🏏", value: "Cricket" },
  { label: "Pickleball 🎾", value: "Pickleball" },
  { label: "Badminton 🏸", value: "Badminton" },
]

export function BottomNav() {
  const pathname = usePathname();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [showDialog, setShowDialog] = useState(false);
  const [text, setText] = useState("");
  const [sport, setSport] = useState("Football");
  const [location, setLocation] = useState("");
  const [playersNeeded, setPlayersNeeded] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) {
      alert("Please sign in first");
      return;
    }

    addDoc(collection(db, "posts"), {
      text: text,
      sport: sport,
      location: location,
      playersNeeded: Number(playersNeeded),
      likes: 0,
      postedBy: {
        uid: user.uid,
        name: user.displayName || "Player",
        photo: user.photoURL || ""
      },
      createdAt: serverTimestamp()
    }).then(() => {
      setText("");
      setLocation("");
      setPlayersNeeded(1);
      setShowDialog(false);
      toast({ title: "Signal Broadcasted 🚀" });
    }).catch(err => alert(err.message));
  };

  const navItems = [
    { label: "Feed", href: "/", icon: "🏠" },
    { label: "Turfs", href: "/turfs", icon: "⚽" },
    { label: "Players", href: "/players", icon: "👥" },
    { label: "Me", href: "/profile", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-[#111111] border-t border-[#222222] flex justify-around items-center z-[100] px-2">
      {/* Feed Tab */}
      <Link href={navItems[0].href} className={cn("flex flex-col items-center gap-1 transition-colors", pathname === navItems[0].href ? "text-[#AAFF00]" : "text-[#888888]")}>
        <span className="text-[20px]">{navItems[0].icon}</span>
        <span className="text-[11px] font-black uppercase tracking-widest">{navItems[0].label}</span>
      </Link>
      
      {/* Turfs Tab */}
      <Link href={navItems[1].href} className={cn("flex flex-col items-center gap-1 transition-colors", pathname === navItems[1].href ? "text-[#AAFF00]" : "text-[#888888]")}>
        <span className="text-[20px]">{navItems[1].icon}</span>
        <span className="text-[11px] font-black uppercase tracking-widest">{navItems[1].label}</span>
      </Link>

      {/* Center Post Button */}
      <div className="relative -top-4 flex flex-col items-center">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <button className="w-[48px] h-[48px] rounded-full bg-[#AAFF00] text-[#0A0A0A] text-[24px] flex items-center justify-center shadow-lg shadow-[#AAFF00]/20 active:scale-95 transition-transform">
              ➕
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] border-[#222222] rounded-[24px] p-8 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                NEW <span className="text-[#AAFF00]">SIGNAL</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#888] ml-1">Discipline</Label>
                  <Select value={sport} onValueChange={setSport}>
                    <SelectTrigger className="h-12 bg-[#1A1A1A] border-[#222222] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#222222]">
                      {SPORTS.map(s => <SelectItem key={s.value} value={s.value} className="text-white font-bold">{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#888] ml-1">Needed</Label>
                  <Input type="number" className="h-12 bg-[#1A1A1A] border-[#222222] text-white" value={playersNeeded} onChange={e => setPlayersNeeded(Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888] ml-1">Area in Mysuru</Label>
                <Input placeholder="e.g. Vijayanagar / Bogadi" className="h-12 bg-[#1A1A1A] border-[#222222] text-white" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888] ml-1">Message</Label>
                <Textarea placeholder="What's the match plan?" className="bg-[#1A1A1A] border-[#222222] min-h-[100px] text-white italic" value={text} onChange={e => setText(e.target.value)} />
              </div>
              <Button type="submit" className="w-full h-14 bg-[#AAFF00] text-[#0A0A0A] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#AAFF00]/10">
                ⚡ Broadcast Signal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#888888] mt-1">Post</span>
      </div>

      {/* Players Tab */}
      <Link href={navItems[2].href} className={cn("flex flex-col items-center gap-1 transition-colors", pathname === navItems[2].href ? "text-[#AAFF00]" : "text-[#888888]")}>
        <span className="text-[20px]">{navItems[2].icon}</span>
        <span className="text-[11px] font-black uppercase tracking-widest">{navItems[2].label}</span>
      </Link>
      
      {/* Me Tab */}
      <Link href={navItems[3].href} className={cn("flex flex-col items-center gap-1 transition-colors", pathname === navItems[3].href ? "text-[#AAFF00]" : "text-[#888888]")}>
        <span className="text-[20px]">{navItems[3].icon}</span>
        <span className="text-[11px] font-black uppercase tracking-widest">{navItems[3].label}</span>
      </Link>
    </nav>
  );
}

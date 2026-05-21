'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SPORTS = [
  { id: "Football", label: "Football ⚽" },
  { id: "Cricket", label: "Cricket 🏏" },
  { id: "Pickleball", label: "Pickleball 🎾" },
  { id: "Badminton", label: "Badminton 🏸" },
  { id: "Swimming", label: "Swimming 🏊" },
];

const AREAS = [
  "Vijayanagar", "Yadavagiri", "JP Nagar", "Bogadi", "Hebbal", 
  "Saraswathipuram", "Kuvempunagar", "Nazarbad", "Other"
];

const PLAYER_COUNTS = [1, 2, 3, 5, 10];

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [sport, setSport] = useState("Football");
  const [area, setArea] = useState("Vijayanagar");
  const [time, setTime] = useState("18:00");
  const [playersNeeded, setPlayersNeeded] = useState(1);

  const charCount = text.length;
  const isApproachingLimit = charCount >= 130;

  const resetForm = () => {
    setText("");
    setSport("Football");
    setArea("Vijayanagar");
    setTime("18:00");
    setPlayersNeeded(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
        toast({ title: "Identity Required", description: "Please login to post a match.", variant: "destructive" });
        return;
    }

    addDoc(collection(db, "posts"), {
      text: text,
      sport: sport,
      location: area,
      matchTime: time,
      playersNeeded: playersNeeded,
      likes: 0,
      postedBy: {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName || "Player",
        photo: auth.currentUser.photoURL || ""
      },
      createdAt: serverTimestamp()
    }).then(() => {
      onClose();
      resetForm();
      toast({ title: "Signal Broadcasted 🚀" });
    }).catch(e => {
       toast({ title: "Transmission Failed", description: e.message, variant: "destructive" });
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#111111] border-t border-[#333333] rounded-t-[16px] p-4 pb-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-[#333333] rounded-full" />
            </div>

            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-base font-bold italic uppercase tracking-tighter text-white leading-none">
                  Post a Match <span className="text-[#AAFF00]">⚡</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888] mt-1">WHAT'S YOUR GAME?</p>
              </div>
              <button onClick={onClose} className="p-1 text-white/20 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {SPORTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSport(s.id)}
                      className={cn(
                        "flex-none py-[7px] px-3 rounded-full text-xs font-bold border transition-all duration-200 active:scale-95",
                        sport === s.id
                          ? "bg-[#AAFF00] text-[#0A0A0A] border-[#AAFF00] shadow-[0_0_20px_rgba(170,255,0,0.2)]"
                          : "bg-[#1A1A1A] text-[#F5F5F5]/40 border-[#333333] hover:border-[#AAFF00]/30"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Textarea
                  placeholder="Need 4 more players for a friendly match!"
                  className="bg-[#1A1A1A] border-[#333333] rounded-xl p-2.5 text-white h-[70px] min-h-[70px] text-[13px] focus:border-[#AAFF00]/50 italic leading-relaxed resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 150))}
                  maxLength={150}
                  required
                />
                <div className="flex justify-end px-1">
                  <span className={cn(
                    "text-[10px] font-black tracking-widest uppercase",
                    isApproachingLimit ? "text-red-500" : "text-[#444]"
                  )}>
                    {charCount}/150
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#888888] ml-1">Location Hub</Label>
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger className="h-9 py-2 px-2.5 bg-[#1A1A1A] border-[#333333] text-white rounded-lg italic font-bold text-xs">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-[#333333] text-white">
                      {AREAS.map((a) => (
                        <SelectItem key={a} value={a} className="font-bold italic text-xs">{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#888888] ml-1">Kick-off Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 z-10" />
                    <input
                      type="time"
                      className="w-full h-9 bg-[#1A1A1A] border border-[#333333] rounded-lg pl-8 pr-2.5 py-2 text-white font-bold text-xs focus:outline-none focus:border-[#AAFF00]/50"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888888] ml-1">Players Needed</Label>
                <div className="flex gap-1.5">
                  {PLAYER_COUNTS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPlayersNeeded(count)}
                      className={cn(
                        "w-11 h-9 rounded-lg border font-black italic text-[13px] transition-all active:scale-95",
                        playersNeeded === count
                          ? "bg-[#AAFF00] text-black border-[#AAFF00]"
                          : "bg-[#1A1A1A] text-white/40 border-[#333333] hover:border-[#AAFF00]/30"
                      )}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1.5 space-y-2">
                <button
                  type="submit"
                  className="w-full p-[13px] h-auto bg-[#AAFF00] text-[#0A0A0A] text-sm font-black uppercase tracking-widest rounded-[10px] shadow-xl shadow-[#AAFF00]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  ⚡ Post to Mysuru Circuit
                </button>
                <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] italic">
                  Visible to all players in Mysuru
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

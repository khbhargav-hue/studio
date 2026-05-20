'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, MapPin, Zap } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const SPORTS = [
  { id: "Football", label: "Football ⚽" },
  { id: "Cricket", label: "Cricket 🏏" },
  { id: "Pickleball", label: "Pickleball 🎾" },
  { id: "Badminton", label: "Badminton 🏸" },
];

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ isOpen, onClose }: PostModalProps) {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

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

    const postData = {
      text,
      sport,
      location,
      playersNeeded: Number(playersNeeded),
      likes: 0,
      postedBy: {
        uid: user.uid,
        name: user.displayName || "Player",
        photo: user.photoURL || ""
      },
      createdAt: serverTimestamp()
    };

    // DEBUG NODE: Injected as per tactical request
    addDoc(collection(db, "posts"), postData)
      .then((docRef) => {
        console.log("SAVED TO FIRESTORE:", docRef.id);
        // Reset UI state for next broadcast
        setText("");
        setLocation("");
        setPlayersNeeded(1);
        toast({ title: "Signal Broadcasted 🚀" });
        onClose();
      })
      .catch((err) => {
        console.error("FIRESTORE FAILED:", err.code, err.message);
        alert("Save failed: " + err.code + " - " + err.message);
      });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#111111] border-t border-[#333333] rounded-t-[24px] p-6 pb-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1.5 bg-[#333333] rounded-full" />
            </div>

            <div className="flex justify-between items-center mb-8 px-1">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                NEW <span className="text-[#AAFF00]">SIGNAL</span>
              </h2>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar px-1">
              {/* Textarea */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888888] ml-1">Strategy Narrative</Label>
                <Textarea
                  placeholder="What's your game plan? Looking for players in Mysuru..."
                  className="bg-[#1A1A1A] border-[#333333] rounded-[10px] p-4 text-[#F5F5F5] min-h-[100px] text-[16px] focus:border-[#AAFF00]/50 italic leading-relaxed"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </div>

              {/* Sport Pills */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888888] ml-1">Target Discipline</Label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {SPORTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSport(s.id)}
                      className={`flex-none h-11 px-5 rounded-full text-[13px] font-bold border transition-all duration-200 active:scale-95 ${
                        sport === s.id
                          ? "bg-[#AAFF00] text-[#0A0A0A] border-[#AAFF00] shadow-[0_0_20px_rgba(170,255,0,0.2)]"
                          : "bg-[#1A1A1A] text-[#F5F5F5]/40 border-[#333333] hover:border-[#AAFF00]/30"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#888888] ml-1">Regional Node (Area)</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    placeholder="e.g. Vijayanagar / Bogadi"
                    className="bg-[#1A1A1A] border-[#333333] pl-12 h-14 text-[#F5F5F5] italic font-bold"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Players Stepper */}
              <div className="flex items-center justify-between p-6 bg-[#1A1A1A] rounded-2xl border border-[#333333]">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#888888]">Recruitment</p>
                  <p className="text-base font-bold text-white uppercase italic">Players needed</p>
                </div>
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setPlayersNeeded(Math.max(1, playersNeeded - 1))}
                    className="h-12 w-12 rounded-xl border border-[#333333] flex items-center justify-center text-white hover:border-[#AAFF00] hover:text-[#AAFF00] transition-all active:scale-90 bg-black/20"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="text-3xl font-black italic text-[#AAFF00] w-8 text-center">{playersNeeded}</span>
                  <button
                    type="button"
                    onClick={() => setPlayersNeeded(playersNeeded + 1)}
                    className="h-12 w-12 rounded-xl border border-[#333333] flex items-center justify-center text-white hover:border-[#AAFF00] hover:text-[#AAFF00] transition-all active:scale-90 bg-black/20"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-16 bg-[#AAFF00] text-[#0A0A0A] text-[16px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#AAFF00]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Zap className="h-5 w-5" /> ⚡ Post Now
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

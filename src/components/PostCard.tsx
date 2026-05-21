
'use client';

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Heart, MessageCircle, Share2, MapPin, Users, Send, X, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, deleteDoc, getFirestore, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";

interface PostCardProps {
  post: any;
  currentUser: any;
  isAdmin?: boolean;
  onDelete: () => void;
  onLike: () => void;
  hasLiked: boolean;
}

export default function PostCard({ post, currentUser, isAdmin, onDelete, onLike, hasLiked }: PostCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(post.text);
  
  const isOwner = currentUser?.uid === post.postedBy?.uid;
  const canManage = isAdmin === true || isOwner;

  const timeAgo = post.createdAt?.seconds 
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000)) + " ago" 
    : "Recently";

  const handleDelete = (postId: string) => {
    const db = getFirestore();
    deleteDoc(doc(db, "posts", postId))
      .then(() => console.log("deleted"))
      .catch(e => alert("Delete failed: " + e.message));
  };

  const handleReply = (postId: string, replyText: string) => {
    if (!replyText.trim()) return;
    if (!auth.currentUser) {
      alert("Please sign in to reply.");
      return;
    }
    const db = getFirestore();
    addDoc(collection(db, "posts", postId, "replies"), {
      text: replyText,
      postedBy: {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName || "Player",
        photo: auth.currentUser.photoURL || ""
      },
      createdAt: serverTimestamp()
    }).then(() => {
      setReplyText("");
      setIsReplying(false);
    }).catch(e => alert(e.message));
  };

  const handleSaveEdit = () => {
    updateDoc(doc(db, "posts", post.id), { text: editText })
      .then(() => setEditOpen(false))
      .catch(e => alert("Update failed: " + e.message));
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Join my ${post.sport} match in ${post.location} Mysuru! Check it out on Turfista.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 mb-3 transition-all hover:border-primary/20 group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#1A1A1A] border border-[#222] p-0.5 overflow-hidden shrink-0">
            <img 
              src={post.postedBy?.photo || `https://picsum.photos/seed/${post.postedBy?.uid}/100`} 
              className="h-full w-full object-cover rounded-full" 
              alt="Athlete" 
              loading="lazy"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold text-white uppercase tracking-tight">{post.postedBy?.name}</p>
            </div>
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest mt-0.5">
              {post.location} · {timeAgo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/20">
            {post.sport}
          </span>
          {canManage && (
            <div className="flex gap-1">
              <button 
                onClick={() => setEditOpen(true)} 
                className="p-1.5 text-white/20 hover:text-primary transition-colors" 
                title="Edit Signal"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(post.id)} 
                className="p-1.5 text-destructive/40 hover:text-destructive transition-colors" 
                title="Retract Signal"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[#F5F5F5] text-[15px] leading-normal font-medium italic">"{post.text}"</p>
      </div>

      {post.playersNeeded > 0 && (
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-[13px] font-black text-primary italic mb-4">
          <Users className="h-3.5 w-3.5" />
          <span>{post.playersNeeded} PLAYERS NEEDED</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={onLike} 
            disabled={hasLiked}
            className={cn(
              "flex items-center gap-2 transition-colors group/like",
              hasLiked ? "text-red-500" : "text-white/40 hover:text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
            <span className="text-[13px] font-black uppercase tracking-widest">{post.likes || 0}</span>
          </button>
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className={cn(
              "flex items-center gap-2 transition-colors",
              isReplying ? "text-primary" : "text-white/40 hover:text-primary"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-[13px] font-black uppercase tracking-widest">Reply</span>
          </button>
        </div>
        <button 
          onClick={handleWhatsAppShare} 
          className="flex items-center gap-2 text-white/40 hover:text-[#25D366] transition-colors" 
          title="Share on WhatsApp"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-[13px] font-black uppercase tracking-widest">Share</span>
        </button>
      </div>

      {isReplying && (
        <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2">
            <Input 
              placeholder="Type your response..." 
              className="h-10 bg-white/5 border-white/10 text-white text-xs italic"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleReply(post.id, replyText);
              }}
              autoFocus
            />
            <button 
              className="h-10 px-4 bg-primary text-black rounded-lg font-black uppercase text-[10px]"
              onClick={() => handleReply(post.id, replyText)}
            >
              <Send className="h-4 w-4" />
            </button>
            <button 
              className="h-10 w-10 p-0 text-white/20 hover:text-white flex items-center justify-center"
              onClick={() => {
                setIsReplying(false);
                setReplyText("");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#111] border-white/5 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white font-black italic uppercase tracking-tighter">Edit Signal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={editText} 
              onChange={(e) => setEditText(e.target.value)}
              className="bg-white/5 border-white/10 text-white italic min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 border-white/10 text-white font-black uppercase text-[10px]">Abort</Button>
            <Button onClick={handleSaveEdit} className="flex-1 bg-primary text-black font-black uppercase text-[10px]">Sync Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

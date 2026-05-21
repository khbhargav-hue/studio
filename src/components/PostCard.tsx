
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Heart, MessageCircle, Share2, Users, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, deleteDoc, getFirestore, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: any;
  currentUser: any;
  isAdmin?: boolean;
  onDelete: () => void;
  onLike: () => void;
  hasLiked: boolean;
}

const ERROR_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%231A1A1A'/%3E%3Ctext x='50%25' y='50%25' fill='%23444' text-anchor='middle' font-size='40'%3E⚽%3C/text%3E%3C/svg%3E";

const optimizeUrl = (url: string) => {
  if (!url) return url;
  return url.includes('cloudinary.com') ? `${url}?w=400&q=60&f=webp` : url;
};

export default function PostCard({ post, currentUser, isAdmin, onLike, hasLiked }: PostCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isEditOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(post.text);
  
  const isOwner = currentUser?.uid === post.postedBy?.uid;
  const canManage = isAdmin === true || isOwner;

  const timeAgo = post.createdAt?.seconds 
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000)) + " ago" 
    : "Recently";

  const handleDelete = (postId: string) => {
    const dbInstance = getFirestore();
    deleteDoc(doc(dbInstance, "posts", postId))
      .then(() => {})
      .catch(() => {});
  };

  const handleReply = () => {
    if (!auth.currentUser || !post.postedBy?.uid) {
      toast({ title: "Identification Required", description: "Verify identity to send signals.", variant: "destructive" });
      return;
    }
    
    const me = auth.currentUser;
    if (me.uid === post.postedBy.uid) {
      toast({ title: "Self-Signal Detected", description: "You cannot message yourself.", variant: "destructive" });
      return;
    }

    const convoId = [me.uid, post.postedBy.uid].sort().join("_");
    
    setDoc(doc(db, "conversations", convoId), {
      participants: [me.uid, post.postedBy.uid],
      participantNames: {
        [me.uid]: me.displayName || "Athlete",
        [post.postedBy.uid]: post.postedBy.name || "Athlete"
      },
      participantPhotos: {
        [me.uid]: me.photoURL || "",
        [post.postedBy.uid]: post.postedBy.photo || post.postedBy.photoURL || ""
      },
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unreadCount: { [me.uid]: 0, [post.postedBy.uid]: 0 },
      relatedPostId: post.id,
      createdAt: serverTimestamp()
    }, { merge: true }).then(() => {
      router.push("/messages/" + convoId);
    });
  };

  const handleSaveEdit = () => {
    updateDoc(doc(db, "posts", post.id), { text: editText })
      .then(() => setEditOpen(false))
      .catch(() => {});
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
              src={optimizeUrl(post.postedBy?.photo || post.postedBy?.photoURL || `https://picsum.photos/seed/${post.postedBy?.uid}/100`)} 
              className="h-full w-full object-cover rounded-full" 
              alt="Athlete" 
              loading="lazy"
              decoding="async"
              onError={(e) => { (e.target as any).src = ERROR_IMAGE }}
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
            onClick={handleReply}
            className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-[13px] font-black uppercase tracking-widest">Message</span>
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


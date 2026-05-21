'use client';

import { formatDistanceToNow } from "date-fns";
import { Trash2, Heart, MessageCircle, Share2, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, deleteDoc, getFirestore } from "firebase/firestore";

interface PostCardProps {
  post: any;
  currentUser: any;
  onDelete: () => void;
  onLike: () => void;
  hasLiked: boolean;
}

export default function PostCard({ post, currentUser, onDelete, onLike, hasLiked }: PostCardProps) {
  const isOwner = currentUser?.uid === post.postedBy?.uid;
  const timeAgo = post.createdAt?.seconds 
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000)) + " ago" 
    : "Recently";

  const handleDelete = (postId: string) => {
    const db = getFirestore();
    deleteDoc(doc(db, "posts", postId))
      .then(() => console.log("deleted"))
      .catch(e => alert("Delete failed: " + e.message));
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Join my ${post.sport} match in ${post.location} Mysuru! Check it out on Turfista.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4 mb-3 transition-all hover:border-primary/20 group">
      {/* Top Row: Avatar & Identity */}
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
          {isOwner && (
            <button 
              onClick={() => handleDelete(post.id)} 
              className="p-1.5 text-destructive/40 hover:text-destructive transition-colors" 
              title="Retract Signal"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Body */}
      <div className="mb-4">
        <p className="text-[#F5F5F5] text-[15px] leading-normal font-medium italic">"{post.text}"</p>
      </div>

      {/* Players Needed Badge */}
      {post.playersNeeded > 0 && (
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-[13px] font-black text-primary italic mb-4">
          <Users className="h-3.5 w-3.5" />
          <span>{post.playersNeeded} PLAYERS NEEDED</span>
        </div>
      )}

      {/* Action Footer */}
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
          <button className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors">
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
    </div>
  );
}

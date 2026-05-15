
'use client';

import { useState } from 'react';
import { Star, User, Loader2, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function ReviewSection({ turfId, currentRating, reviewCount }: { turfId: string, currentRating: number, reviewCount: number }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !turfId) return null;
    return query(
      collection(db, 'turfs', turfId, 'reviews'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
  }, [db, turfId]);

  const { data: reviews, loading } = useCollection(reviewsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !rating) return;

    setIsSubmitting(true);
    try {
      const reviewRef = collection(db, 'turfs', turfId, 'reviews');
      await addDoc(reviewRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous Athlete',
        userPhoto: user.photoURL || '',
        rating,
        comment,
        timestamp: serverTimestamp()
      });

      const turfRef = doc(db, 'turfs', turfId);
      const newCount = reviewCount + 1;
      const newAverage = ((currentRating * reviewCount) + rating) / newCount;
      
      await updateDoc(turfRef, {
        rating: Number(newAverage.toFixed(1)),
        reviewCount: increment(1)
      });

      toast({ title: "Feedback Transmitted", description: "Your performance review has been recorded." });
      setRating(0);
      setComment('');
    } catch (err) {
      toast({ title: "Signal Error", description: "Feedback transmission failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-[#AAFF00]" />
        <h2 className="text-xl font-[800] italic uppercase tracking-tighter">Athlete <span className="text-[#888888]">Feedback</span></h2>
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-[#111111] p-8 rounded-[16px] border border-[#222222] space-y-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={cn("h-6 w-6", s <= rating ? "fill-[#AAFF00] text-[#AAFF00]" : "text-white/5")} />
              </button>
            ))}
            <span className="ml-4 text-[10px] font-black uppercase tracking-widest opacity-40">Rate Performance</span>
          </div>
          
          <Textarea 
            placeholder="Describe the turf condition, lighting quality, or match experience..."
            className="bg-[#1A1A1A] border-[#222222] rounded-[10px] p-6 min-h-[100px] italic text-sm text-[#F5F5F5] focus:border-[#AAFF00]/50"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0} 
            className="w-full h-14 bg-[#AAFF00] text-black rounded-[10px] font-black uppercase tracking-widest text-[11px]"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transmit Feedback"}
          </Button>
        </form>
      ) : (
        <div className="p-10 border border-dashed border-[#222222] rounded-[16px] text-center bg-[#111111]/50">
          <p className="text-[#888888] text-xs font-bold uppercase tracking-widest italic">Join the network to submit arena feedback.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#AAFF00] opacity-20" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review: any) => (
            <div key={review.id} className="p-6 rounded-[16px] bg-[#111111] border border-[#222222] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#1A1A1A] border border-[#222222] flex items-center justify-center overflow-hidden">
                    {review.userPhoto ? (
                      <img src={review.userPhoto} alt={review.userName} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-[#888888]" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black italic uppercase text-[#F5F5F5]">{review.userName}</p>
                    <p className="text-[8px] font-bold text-[#888888] uppercase tracking-widest">
                      {review.timestamp?.seconds ? format(new Date(review.timestamp.seconds * 1000), 'MMM dd, yyyy') : 'Recently'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("h-2.5 w-2.5", s <= review.rating ? "fill-[#AAFF00] text-[#AAFF00]" : "text-white/5")} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#888888] italic leading-relaxed">"{review.comment}"</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-[#222222] rounded-[16px] opacity-30">
            <MessageSquare className="h-8 w-8 mx-auto mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Logs Yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

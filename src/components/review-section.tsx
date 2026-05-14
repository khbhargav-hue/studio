
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
      // 1. Add Review
      const reviewRef = collection(db, 'turfs', turfId, 'reviews');
      await addDoc(reviewRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous Athlete',
        userPhoto: user.photoURL || '',
        rating,
        comment,
        timestamp: serverTimestamp()
      });

      // 2. Update Turf Aggregates
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
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Player <span className="text-white/20">Feedback</span></h2>
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-[2rem] border-white/5 bg-white/[0.02] space-y-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={cn("h-8 w-8", s <= rating ? "fill-primary text-primary" : "text-white/10")} />
              </button>
            ))}
            <span className="ml-4 label-caps opacity-40">Select Performance Rating</span>
          </div>
          
          <Textarea 
            placeholder="Describe the turf condition, lighting quality, or match experience..."
            className="bg-surface border-white/5 rounded-2xl p-6 min-h-[120px] italic text-base"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />

          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0} 
            className="btn-primary w-full h-14 rounded-xl font-black uppercase tracking-widest text-xs"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> TRANSMIT FEEDBACK</>}
          </Button>
        </form>
      ) : (
        <div className="p-10 border border-dashed border-white/5 rounded-[2rem] text-center bg-white/[0.01]">
          <p className="text-white/30 font-medium italic">Join the network to submit arena feedback.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review: any) => (
            <div key={review.id} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {review.userPhoto ? (
                      <img src={review.userPhoto} alt={review.userName} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-white/20" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black italic uppercase text-white">{review.userName}</p>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      {review.timestamp?.seconds ? format(new Date(review.timestamp.seconds * 1000), 'MMM dd, yyyy') : 'Recently'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-primary text-primary" : "text-white/5")} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/60 italic leading-relaxed">"{review.comment}"</p>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-20">
            <MessageSquare className="h-10 w-10 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Logs Yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

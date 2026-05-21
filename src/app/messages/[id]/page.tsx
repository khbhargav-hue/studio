
'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Send, UserCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ChatViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [text, setText] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);

  const convoRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "conversations", id);
  }, [db, id]);

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(
      collection(db, "conversations", id, "messages"),
      orderBy("createdAt", "asc"),
      limit(50)
    );
  }, [db, id]);

  const { data: convo } = useDoc(convoRef);
  const { data: messages, loading: messagesLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark as read protocol
  useEffect(() => {
    if (db && id && user && convo && convo.unreadCount?.[user.uid] > 0) {
      updateDoc(doc(db, "conversations", id), {
        [`unreadCount.${user.uid}`]: 0
      });
    }
  }, [db, id, user, convo]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !db || !user || !convo) return;

    setIsTransmitting(true);
    const otherUid = convo.participants.find((p: string) => p !== user.uid);
    
    const msgData = {
      text: text,
      senderId: user.uid,
      senderName: user.displayName || "Player",
      senderPhoto: user.photoURL || "",
      read: false,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "conversations", id, "messages"), msgData);
      await updateDoc(doc(db, "conversations", id), {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${otherUid}`]: (convo.unreadCount?.[otherUid] || 0) + 1,
        updatedAt: serverTimestamp()
      });
      setText("");
    } finally {
      setIsTransmitting(false);
    }
  };

  if (!user) return null;

  const otherUid = convo?.participants.find((p: string) => p !== user.uid);
  const otherName = convo?.participantNames?.[otherUid] || "Athlete Node";
  const otherPhoto = convo?.participantPhotos?.[otherUid];

  return (
    <div className="flex flex-col h-screen bg-[#050505] selection:bg-primary selection:text-black">
      <header className="fixed top-0 z-[100] h-[64px] w-full bg-[#0A0A0A]/95 border-b border-[#222] backdrop-blur-xl px-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="h-9 w-9 rounded-full bg-[#1A1A1A] border border-[#222] overflow-hidden flex items-center justify-center p-0.5">
           {otherPhoto ? <img src={otherPhoto} className="h-full w-full object-cover rounded-full" /> : <UserCircle className="h-6 w-6 text-white/10" />}
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-black uppercase italic text-white leading-none">{otherName}</h2>
          <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1.5">Circuit Active</p>
        </div>
      </header>

      <main 
        ref={scrollRef}
        className="flex-1 pt-[80px] pb-[100px] overflow-y-auto px-4 space-y-4 no-scrollbar"
      >
        {messagesLoading ? (
          <div className="flex items-center justify-center py-20">
             <Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg: any) => {
            const isMe = msg.senderId === user.uid;
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-[14px] leading-snug italic font-medium",
                  isMe ? "bg-primary text-black rounded-tr-none" : "bg-[#1A1A1A] text-white rounded-tl-none border border-[#222]"
                )}>
                  {msg.text}
                </div>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1.5 px-1">
                  {msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), 'HH:mm') : 'Syncing...'}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-40 text-center opacity-20 italic text-[11px] font-black uppercase tracking-[0.4em]">Establish tactical link...</div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0A0A0A]/95 border-t border-[#222] backdrop-blur-xl">
        <form onSubmit={handleSend} className="max-w-lg mx-auto flex gap-2">
          <Input 
            placeholder="Type transmission..." 
            className="h-12 bg-[#1A1A1A] border-[#333] text-white text-sm italic rounded-xl focus:border-primary/50"
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={isTransmitting}
          />
          <button 
            type="submit"
            disabled={!text.trim() || isTransmitting}
            className="h-12 w-12 bg-primary text-black rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
          >
            {isTransmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

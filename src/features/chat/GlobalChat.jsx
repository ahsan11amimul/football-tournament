import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import useAuthStore from '../../store/useAuthStore';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Send, MessageSquare, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalChat() {
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, 'chat'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(docs);
      setLoading(false);
      // Auto scroll
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      uid: profile.uid,
      userName: profile.fullName,
      userAvatar: profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`,
      role: profile.role,
      createdAt: serverTimestamp(),
    };

    setNewMessage('');
    try {
      await addDoc(collection(db, 'chat'), messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] p-0 overflow-hidden border-white/5 bg-background-glass">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Tournament Lounge</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Now
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => {
          const isMe = msg.uid === profile.uid;
          const isAdmin = msg.role === 'admin';

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                <img src={msg.userAvatar} alt="" className="w-full h-full object-cover" />
              </div>
              
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold ${isAdmin ? 'text-primary' : 'text-slate-500'}`}>
                    {msg.userName}
                  </span>
                  {isAdmin && <ShieldCheck className="w-3 h-3 text-primary" />}
                </div>
                
                <div className={`px-4 py-2 rounded-2xl text-sm ${
                  isMe 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                
                {msg.createdAt && (
                  <span className="text-[9px] text-slate-600 mt-1">
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'hh:mm a') : 'Just now'}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your thoughts..."
            className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
          <Button type="submit" size="sm" className="w-12 h-10 p-0 rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

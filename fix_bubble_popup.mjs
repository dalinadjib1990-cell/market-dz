import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

const replacement = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, User } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

export default function FloatingChatBubble() {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.unreadCount && data.unreadCount[user.uid]) {
          total += data.unreadCount[user.uid];
        }
      });
      setUnreadCount(total);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("FloatingChatBubble listener error:", error);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Hide on messages route
  if (!user || !isVisible || location.pathname === '/messages') return null;

  return (
    <div className="fixed bottom-24 right-4 md:right-6 z-[100] flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 overflow-hidden rounded-2xl border-2 border-cyan-400 bg-[#0a0a0a] shadow-[0_0_30px_rgba(34,211,238,0.4)] flex flex-col relative w-[calc(100vw-2rem)] md:w-[380px] h-[65vh] md:h-[600px] max-h-[800px]"
          >
            <div className="bg-[#111] border-b border-cyan-400/30 p-3 flex justify-between items-center z-10">
              <span className="font-bold text-cyan-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                الرسائل
              </span>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 w-full bg-brand-black relative">
              <iframe 
                src="/messages" 
                className="w-full h-full absolute inset-0 border-none" 
                title="Messages"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#0a0a0a] flex items-center justify-center overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95",
            isOpen ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" : "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-pulse-slow"
          )}
        >
          {isOpen ? (
            <X className="text-red-500 w-6 h-6" />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=200&auto=format&fit=crop" 
              alt="Chat" 
              className="w-full h-full object-cover"
            />
          )}
        </button>
        
        {!isOpen && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg"
          >
            {unreadCount > 9 ? '+9' : unreadCount}
          </motion.div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/FloatingChatBubble.tsx', replacement);
console.log("FloatingChatBubble popup implemented");

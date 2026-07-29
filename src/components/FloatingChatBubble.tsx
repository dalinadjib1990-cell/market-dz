import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, User } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

export default function FloatingChatBubble() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const constraintsRef = React.useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

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
        
        // Play sound if last message is new and from someone else
        if (data.lastMessage && data.lastSenderId !== user.uid) {
          const msgId = `${doc.id}_${data.updatedAt?.seconds}`;
          // Use a functional check to avoid stale closure or dependency on lastMessageId
          setLastMessageId(prevId => {
            if (prevId && prevId !== msgId) {
              const audio = new Audio(NOTIFICATION_SOUND);
              audio.play().catch(() => {}); // Ignore interaction errors
            }
            return msgId;
          });
        }
      });
      setUnreadCount(total);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("FloatingChatBubble listener error:", error);
      }
    });

    return () => unsubscribe();
  }, [user]); // Removed lastMessageId dependency

  // Hide on messages route
  if (!user || !isVisible || location.pathname === '/messages') return null;

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-50" />
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        className="fixed bottom-24 right-6 z-50 cursor-grab active:cursor-grabbing pointer-events-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
      <div className="relative">
        <button
          onClick={() => navigate('/messages')}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-green shadow-[0_0_15px_rgba(168,85,247,0.7)] flex items-center justify-center overflow-hidden border-2 border-purple-400 animate-pulse-slow active:scale-90 transition-transform"
        >
          {profile?.photoURL ? (
            <img 
              src={profile.photoURL} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <MessageSquare className="text-white w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-[#0a0a0a]"
            >
              {unreadCount > 9 ? '+9' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute -bottom-1 -left-1 w-5 h-5 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
          title="إخفاء"
        >
          <X size={10} className="text-white/80" />
        </button>
      </div>
      </motion.div>
    </>
  );
}

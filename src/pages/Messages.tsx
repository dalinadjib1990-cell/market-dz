import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Chat, Message } from '../types';
import { Send, User, Search, MoreVertical, Phone, MessageSquare, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

export default function Messages() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playNotificationSound = () => {
    if (soundEnabled) {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(e => console.log('Sound play error:', e));
    }
  };

  useEffect(() => {
    if (!user) return;
    // Remove orderBy to avoid index requirements during initial setup
    const q = query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', user.uid)
    );
    
    const unsubChats = onSnapshot(q, (snap) => {
      let updatedChats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat));
      
      // Sort in memory instead of Firestore orderBy
      updatedChats.sort((a, b) => {
        const timeA = (a.updatedAt as any)?.toMillis?.() || 0;
        const timeB = (b.updatedAt as any)?.toMillis?.() || 0;
        return timeB - timeA;
      });

      snap.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          if (data.lastMessage && data.updatedAt && data.lastSenderId !== user.uid) {
            playNotificationSound();
          }
        }
      });
      
      setChats(updatedChats);
    }, (error) => {
      console.error('Chats Snapshot Error:', error);
      toast.error('خطأ في تحميل المحادثات: ' + error.message);
    });
    return () => unsubChats();
  }, [user, soundEnabled]);

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    // Remove orderBy to avoid index requirements
    const q = query(
      collection(db, 'messages'), 
      where('chatId', '==', activeChat.id)
    );
    
    const unsubMessages = onSnapshot(q, (snap) => {
      let updatedMessages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      
      // Sort in memory
      updatedMessages.sort((a, b) => {
        const timeA = (a.createdAt as any)?.toMillis?.() || 0;
        const timeB = (b.createdAt as any)?.toMillis?.() || 0;
        return timeA - timeB;
      });

      setMessages(updatedMessages);
    }, (error) => {
      console.error('Messages Snapshot Error:', error);
      toast.error('خطأ في تحميل الرسائل: ' + error.message);
    });
    return () => unsubMessages();
  }, [activeChat]);

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || newMessage;
    if (!user || !activeChat || !textToSend.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        chatId: activeChat.id,
        senderId: user.uid,
        text: textToSend,
        createdAt: serverTimestamp(),
      });
      
      // Update chat metadata
      await setDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: textToSend,
        lastSenderId: user.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      if (!textOverride) setNewMessage('');
    } catch (error) {
      console.error(error);
      toast.error('فشل إرسال الرسالة');
    }
  };

  const QUICK_REPLIES = [
    'كم السعر النهائي؟',
    'هل السيارة لا تزال متوفرة؟',
    'واش هو السوم (آخر عرض)؟',
    'أين يمكنني رؤية السيارة؟'
  ];

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] py-4 md:py-8">
      <div className="glass-card h-full flex overflow-hidden relative">
        {/* Sidebar */}
        <div className={cn(
          "w-full md:w-80 border-l border-white/10 flex flex-col transition-all duration-300",
          activeChat ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 border-b border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">الرسائل</h2>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  soundEnabled ? "bg-brand-green/10 text-brand-green" : "bg-white/5 text-white/20"
                )}
                title={soundEnabled ? "إيقاف الصوت" : "تفعيل الصوت"}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input type="text" placeholder="بحث في المحادثات..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-white/20">جاري التحميل...</div>
            ) : chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-right",
                  activeChat?.id === chat.id && "bg-white/5 border-r-4 border-brand-green"
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <User size={24} className="text-white/40" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm truncate">
                      {user.uid === chat.buyerId ? chat.sellerName : chat.buyerName}
                    </span>
                    <span className="text-[10px] text-white/20">
                      {chat.updatedAt?.toDate() ? new Date(chat.updatedAt.toDate()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[10px] text-brand-green font-bold truncate mb-1">{chat.adTitle}</p>
                  <p className="text-xs text-white/40 truncate">{chat.lastMessage || 'لا توجد رسائل بعد'}</p>
                </div>
              </button>
            ))}
            {!loading && chats.length === 0 && (
              <div className="p-12 text-center text-white/20 text-sm">لا توجد محادثات نشطة</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          !activeChat ? "hidden md:flex" : "flex"
        )}>
          {activeChat ? (
            <>
              <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 hover:bg-white/5 rounded-lg text-white/40"
                  >
                    <ArrowRight size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                    <User size={20} className="text-brand-green" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">
                      {user.uid === activeChat.buyerId ? activeChat.sellerName : activeChat.buyerName}
                    </h3>
                    <p className="text-[10px] text-brand-green font-bold uppercase">{activeChat.adTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40"><Phone size={18} /></button>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40"><MoreVertical size={18} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full space-y-6">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                      <MessageSquare size={32} className="text-white/20" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-white/60 font-bold">ابدأ المحادثة الآن</p>
                      <p className="text-xs text-white/20">اختر رسالة سريعة للبدء</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                      {QUICK_REPLIES.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(undefined, reply)}
                          className="p-3 bg-white/5 hover:bg-brand-green/10 hover:text-brand-green border border-white/10 rounded-xl text-xs font-bold transition-all text-right"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={cn(
                    "flex",
                    msg.senderId === user.uid ? "justify-start" : "justify-end"
                  )}>
                    <div className={cn(
                      "max-w-[70%] p-4 rounded-2xl text-sm",
                      msg.senderId === user.uid 
                        ? "bg-brand-green text-white rounded-tr-none" 
                        : "bg-white/5 text-white rounded-tl-none border border-white/10"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 flex gap-4">
                <input
                  type="text"
                  placeholder="اكتب رسالتك..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary !p-3">
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-white/20">
              <MessageSquare size={64} />
              <p className="font-bold">اختر محادثة للبدء</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

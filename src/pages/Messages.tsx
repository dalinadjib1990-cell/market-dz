import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Chat, Message } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Send, User, Search, MoreVertical, Phone, MessageSquare, Volume2, VolumeX, ArrowRight, CheckCircle2, Image as ImageIcon, Trash2, Edit2, X, Loader2 } from 'lucide-react';
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
  const [activeAd, setActiveAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const uids = new Set<string>();
      chats.forEach(c => {
        if (c.participants) {
          c.participants.forEach(uid => uids.add(uid));
        }
      });
      
      const newProfiles = { ...profiles };
      let changed = false;
      
      for (const uid of uids) {
        if (!newProfiles[uid]) {
          try {
            const d = await getDoc(doc(db, 'users', uid));
            if (d.exists()) {
              newProfiles[uid] = d.data();
              changed = true;
            }
          } catch (e) {
            console.error('Error fetching profile for', uid, e);
          }
        }
      }
      
      if (changed) {
        setProfiles(newProfiles);
      }
    };
    
    if (chats.length > 0) {
      fetchProfiles();
    }
  }, [chats]);

  const playNotificationSound = () => {
    if (soundEnabled) {
      const audio = new Audio(NOTIFICATION_SOUND);
      audio.play().catch(e => console.log('Sound play error:', e));
    }
  };

  useEffect(() => {
    if (activeChat?.adId) {
      const fetchAd = async () => {
        try {
          const adSnap = await getDoc(doc(db, 'ads', activeChat.adId));
          if (adSnap.exists()) {
            setActiveAd({ id: adSnap.id, ...adSnap.data() });
          }
        } catch (error) {
          console.error('Error fetching ad for chat:', error);
        }
      };
      fetchAd();
    } else {
      setActiveAd(null);
    }
  }, [activeChat?.adId]);

  useEffect(() => {
    if (!user) return;
    // Remove orderBy to avoid index requirements during initial setup
    const q = query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', user.uid)
    );
    
    const unsubChats = onSnapshot(q, (snap) => {
      console.log('Current User UID:', user.uid);
      console.log('Chats snapshot received. Count:', snap.size);
      
      let updatedChats = snap.docs.map(d => {
        const data = d.data();
        console.log('Chat found:', d.id, 'Participants:', data.participants);
        return { id: d.id, ...data } as Chat;
      });
      
      // Sort in memory instead of Firestore orderBy
      updatedChats.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (val.seconds) return val.seconds * 1000;
          return 0;
        };
        return getTime(b.updatedAt) - getTime(a.updatedAt);
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
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
      setLoading(false);
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
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (val.seconds) return val.seconds * 1000;
          return 0;
        };
        return getTime(a.createdAt) - getTime(b.createdAt);
      });

      setMessages(updatedMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });
    return () => unsubMessages();
  }, [activeChat]);

  useEffect(() => {
    if (activeChat && user) {
      // Clear unread count for current user
      const chatRef = doc(db, 'chats', activeChat.id);
      setDoc(chatRef, {
        [`unreadCount.${user.uid}`]: 0
      }, { merge: true }).catch(console.error);

      // Mark messages as read
      const unreadMessages = messages.filter(m => m.senderId !== user.uid && !m.read);
      unreadMessages.forEach(m => {
        setDoc(doc(db, 'messages', m.id), { read: true }, { merge: true }).catch(console.error);
      });
    }
  }, [activeChat, user, messages.length]);

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string, imageUrl?: string) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || newMessage;
    if (!user || !activeChat || (!textToSend.trim() && !imageUrl)) return;
    try {
      const otherUid = activeChat.participants?.find(id => id !== user.uid);
      
      await addDoc(collection(db, 'messages'), {
        chatId: activeChat.id,
        senderId: user.uid,
        text: textToSend,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        read: false,
      });
      
      // Update chat metadata and increment unread count for other user
      const chatRef = doc(db, 'chats', activeChat.id);
      const updateData: any = {
        lastMessage: imageUrl ? '📷 صورة' : textToSend,
        lastSenderId: user.uid,
        updatedAt: serverTimestamp(),
      };
      
      if (otherUid) {
        updateData[`unreadCount.${otherUid}`] = (activeChat.unreadCount?.[otherUid] || 0) + 1;
      }
      
      await setDoc(chatRef, updateData, { merge: true });

      if (!textOverride) setNewMessage('');
    } catch (error) {
      console.error(error);
      toast.error('فشل إرسال الرسالة');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'market_auto_dz');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dcegf2b44/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        await handleSendMessage(undefined, '', data.secure_url);
      }
    } catch (error) {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      await setDoc(doc(db, 'messages', msgId), { deleted: true, text: 'تم حذف هذه الرسالة' }, { merge: true });
      toast.success('تم حذف الرسالة');
    } catch (error) {
      toast.error('فشل حذف الرسالة');
    }
  };

  const handleEditMessage = async (msgId: string) => {
    if (!editText.trim()) return;
    try {
      await setDoc(doc(db, 'messages', msgId), { text: editText, edited: true }, { merge: true });
      setEditingMessageId(null);
      setEditText('');
      toast.success('تم تعديل الرسالة');
    } catch (error) {
      toast.error('فشل تعديل الرسالة');
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
    <div className="max-w-7xl mx-auto px-4 h-[calc(100dvh-140px)] md:h-[calc(100vh-80px)] py-4 md:py-8">
      <div className="glass-card h-full flex overflow-hidden relative">
        {/* Sidebar */}
        <div className={cn(
          "w-full md:w-80 border-l border-white/10 flex flex-col transition-all duration-300",
          activeChat ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 border-b border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">الرسائل</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/')}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white"
                  title="إغلاق"
                >
                  <X size={18} />
                </button>
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
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {(() => {
                    const otherUid = chat.participants?.find(id => id !== user.uid);
                    const otherProfile = otherUid ? profiles[otherUid] : null;
                    if (otherProfile?.photoURL) {
                      return <img src={otherProfile.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />;
                    }
                    return <User size={24} className="text-white/40" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm truncate">
                      {(() => {
                        const otherUid = chat.participants?.find(id => id !== user.uid);
                        const otherProfile = otherUid ? profiles[otherUid] : null;
                        
                        if (otherProfile) {
                          return `${otherProfile.firstName || ''} ${otherProfile.lastName || ''}`.trim() || otherProfile.displayName || otherProfile.email?.split('@')[0];
                        }

                        const isBuyer = user.uid === chat.buyerId;
                        const otherName = isBuyer ? chat.sellerName : chat.buyerName;
                        const otherEmail = isBuyer ? chat.sellerEmail : chat.buyerEmail;
                        
                        if (otherName && !otherName.includes('undefined')) return otherName;
                        if (otherEmail) return otherEmail.split('@')[0];
                        return isBuyer ? 'بائع' : 'مشتري';
                      })()}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-white/20">
                        {(() => {
                          const val = chat.updatedAt;
                          if (!val) return '';
                          const date = typeof val.toDate === 'function' ? val.toDate() : (val.seconds ? new Date(val.seconds * 1000) : null);
                          return date ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
                        })()}
                      </span>
                      {chat.unreadCount?.[user.uid] > 0 && (
                        <span className="bg-brand-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {chat.unreadCount[user.uid]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] text-brand-green font-bold truncate flex-1">{chat.adTitle}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {chat.adWilaya && <span className="text-[9px] text-white/40 bg-white/5 px-1 rounded">{chat.adWilaya}</span>}
                      {chat.adPrice && <span className="text-[9px] text-emerald-400 font-bold">{chat.adPrice.toLocaleString()} دج</span>}
                      {chat.adSamouni && <span className="text-[9px] text-red-500 font-bold">سوموني: {chat.adSamouni.toLocaleString()}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-white/40 truncate mt-1">{chat.lastMessage || 'لا توجد رسائل بعد'}</p>
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
          "flex-1 flex flex-col transition-all duration-300 relative h-full",
          !activeChat ? "hidden md:flex" : "flex"
        )}>
          {activeChat ? (
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 hover:bg-white/5 rounded-lg text-white/40"
                  >
                    <ArrowRight size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center overflow-hidden">
                    {(() => {
                      const otherUid = activeChat.participants?.find(id => id !== user.uid);
                      const otherProfile = otherUid ? profiles[otherUid] : null;
                      if (otherProfile?.photoURL) {
                        return <img src={otherProfile.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />;
                      }
                      return <User size={20} className="text-brand-green" />;
                    })()}
                  </div>
                  <div className="min-w-0 text-right">
                    <h3 className="font-bold text-sm truncate">
                      {(() => {
                        const otherUid = activeChat.participants?.find(id => id !== user.uid);
                        const otherProfile = otherUid ? profiles[otherUid] : null;
                        
                        if (otherProfile) {
                          return `${otherProfile.firstName || ''} ${otherProfile.lastName || ''}`.trim() || otherProfile.displayName || otherProfile.email?.split('@')[0];
                        }

                        const isBuyer = user.uid === activeChat.buyerId;
                        const otherName = isBuyer ? activeChat.sellerName : activeChat.buyerName;
                        const otherEmail = isBuyer ? activeChat.sellerEmail : activeChat.buyerEmail;
                        
                        if (otherName && !otherName.includes('undefined')) return otherName;
                        if (otherEmail) return otherEmail.split('@')[0];
                        return isBuyer ? 'بائع' : 'مشتري';
                      })()}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[10px] text-brand-green font-bold uppercase">{activeChat.adTitle || activeAd?.title}</p>
                      <span className="text-[9px] text-white/40">|</span>
                      <span className="text-xs text-emerald-400 font-black">
                        {(activeChat.adPrice || activeAd?.price)?.toLocaleString() || '---'} دج
                      </span>
                      {(activeChat.adSamouni || activeAd?.samouni) && (
                        <>
                          <span className="text-[9px] text-white/40">|</span>
                          <span className="text-xs text-red-500 font-black">
                            سوموني: {(activeChat.adSamouni || activeAd?.samouni).toLocaleString()}
                          </span>
                        </>
                      )}
                      <span className="text-[9px] text-white/60">({activeChat.adWilaya || activeAd?.wilaya || '---'})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40"><Phone size={18} /></button>
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-white/40"
                    title="إغلاق المحادثة"
                  >
                    <X size={18} />
                  </button>
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
                    "flex group",
                    msg.senderId === user.uid ? "justify-start" : "justify-end"
                  )}>
                    <div className={cn(
                      "max-w-[75%] p-4 rounded-2xl text-sm relative shadow-lg transition-all hover:scale-[1.01]",
                      msg.senderId === user.uid 
                        ? "bg-gradient-to-br from-brand-green to-emerald-900 text-white rounded-tr-none shadow-brand-green/10" 
                        : "bg-gradient-to-br from-white/10 to-white/5 text-white rounded-tl-none border border-white/10 shadow-black/20"
                    )}>
                      {editingMessageId === msg.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <input 
                            type="text" 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs outline-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingMessageId(null)} className="text-[10px] text-white/40">إلغاء</button>
                            <button onClick={() => handleEditMessage(msg.id)} className="text-[10px] text-brand-green font-bold">حفظ</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Sent" className="rounded-xl mb-2 max-w-full h-auto cursor-pointer hover:opacity-90" onClick={() => window.open(msg.imageUrl)} />
                          )}
                          <p className={cn(msg.deleted && "italic text-white/20")}>{msg.text}</p>
                          {msg.edited && !msg.deleted && <span className="text-[8px] text-white/20 block mt-1">(معدلة)</span>}
                        </>
                      )}
                      
                      {msg.senderId === user.uid && !msg.deleted && (
                        <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <button onClick={() => { setEditingMessageId(msg.id); setEditText(msg.text); }} className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      )}

                      {msg.senderId === user.uid && (
                        <div className="absolute -bottom-4 right-0 text-[9px] text-white/20 font-bold flex items-center gap-1">
                          <CheckCircle2 size={8} className={cn(msg.read ? "text-brand-green" : "text-white/20")} />
                          {msg.read ? 'تمت القراءة' : 'تم الإرسال'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-white/10 flex gap-4 bg-[#0a0a0a]/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <label className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-all text-white/40 hover:text-white">
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="اكتب رسالتك..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm outline-none focus:border-brand-green/50 focus:bg-white/10 transition-all"
                  />
                </div>
                <button type="submit" className="bg-brand-green text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-green/20">
                  <Send size={20} />
                </button>
              </form>
            </div>
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

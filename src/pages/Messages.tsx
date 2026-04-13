import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Chat, Message } from '../types';
import { Send, User, Search, MoreVertical, Phone, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Messages() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const unsubChats = onSnapshot(q, (snap) => {
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat)));
    });
    return () => unsubChats();
  }, [user]);

  useEffect(() => {
    if (!activeChat) return;
    const q = query(collection(db, 'messages'), where('chatId', '==', activeChat.id), orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });
    return () => unsubMessages();
  }, [activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChat || !newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        chatId: activeChat.id,
        senderId: user.uid,
        text: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-80px)] py-8">
      <div className="glass-card h-full flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-l border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10 space-y-4">
            <h2 className="text-xl font-bold">الرسائل</h2>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input type="text" placeholder="بحث في المحادثات..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {chats.map(chat => (
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
                    <span className="font-bold text-sm truncate">بائع مجهول</span>
                    <span className="text-[10px] text-white/20">12:30</span>
                  </div>
                  <p className="text-xs text-white/40 truncate">{chat.lastMessage || 'لا توجد رسائل بعد'}</p>
                </div>
              </button>
            ))}
            {chats.length === 0 && (
              <div className="p-12 text-center text-white/20 text-sm">لا توجد محادثات نشطة</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {activeChat ? (
            <>
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
                    <User size={20} className="text-brand-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">بائع مجهول</h3>
                    <p className="text-[10px] text-brand-green font-bold uppercase">متصل الآن</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40"><Phone size={18} /></button>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40"><MoreVertical size={18} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
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

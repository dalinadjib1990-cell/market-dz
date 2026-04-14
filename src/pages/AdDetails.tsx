import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, collection, addDoc, setDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Ad, Comment } from '../types';
import { 
  MapPin, Calendar, Gauge, CheckCircle2, Phone, MessageSquare, 
  Share2, Heart, ChevronLeft, ChevronRight, User, Star, ShieldCheck,
  Zap, Info
} from 'lucide-react';
import { cn, generateId } from '../lib/utils';
import { toast } from 'sonner';

export default function AdDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAd = async () => {
      const docSnap = await getDoc(doc(db, 'ads', id));
      if (docSnap.exists()) {
        setAd({ id: docSnap.id, ...docSnap.data() } as Ad);
      } else {
        toast.error('الإعلان غير موجود');
        navigate('/');
      }
      setLoading(false);
    };
    fetchAd();

    const q = query(collection(db, 'comments'), where('adId', '==', id));
    const unsubComments = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    });

    return () => unsubComments();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    try {
      await addDoc(collection(db, 'comments'), {
        adId: id,
        userId: user.uid,
        userName: `${profile?.firstName} ${profile?.lastName}`,
        text: newComment,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      toast.error('فشل إضافة التعليق');
    }
  };

  const startChat = async () => {
    if (!ad || !user) {
      toast.error('يرجى تسجيل الدخول للمراسلة');
      navigate('/login');
      return;
    }
    if (!ad || !ad.userId) {
      console.log('Ad data missing or userId missing:', ad);
      toast.error('بيانات البائع غير مكتملة');
      return;
    }
    console.log('Starting chat. Current User:', user.uid, 'Ad Owner:', ad.userId);
    // Allow self-messaging for testing as requested by user
    
    try {
      // Fetch all chats for the user
      const chatQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      
      const chatSnap = await getDocs(chatQuery);
      
      // Find chat for this specific ad and specific seller
      const existingChat = chatSnap.docs.find(doc => {
        const data = doc.data();
        return data.adId === id && data.participants?.includes(ad.userId);
      });
      
      let chatId = '';
      
      if (!existingChat) {
        // Generate clean names
        const getCleanName = (p: any, u: any, fallback: string) => {
          if (p && (p.firstName || p.lastName)) {
            return `${p.firstName || ''} ${p.lastName || ''}`.trim();
          }
          return u.displayName || u.email?.split('@')[0] || fallback;
        };

        const finalBuyerName = getCleanName(profile, user, 'مشتري');
        
        const newChatRef = await addDoc(collection(db, 'chats'), {
          participants: [user.uid, ad.userId],
          adId: id,
          adTitle: ad.title,
          buyerId: user.uid,
          sellerId: ad.userId,
          buyerName: finalBuyerName,
          sellerName: ad.sellerName || 'بائع',
          buyerEmail: user.email,
          sellerEmail: ad.sellerEmail || '', // Store emails for backup identification
          updatedAt: serverTimestamp(),
          lastMessage: 'هل السيارة لا تزال متوفرة؟',
          lastSenderId: user.uid,
        });
        chatId = newChatRef.id;

        await addDoc(collection(db, 'messages'), {
          chatId: chatId,
          senderId: user.uid,
          text: 'هل السيارة لا تزال متوفرة؟',
          createdAt: serverTimestamp(),
        });
        toast.success('تم بدء محادثة حقيقية');
      } else {
        chatId = existingChat.id;
      }
      
      navigate('/messages');
    } catch (error: any) {
      console.error('Start Chat Error:', error);
      if (error.message?.includes('Missing or insufficient permissions')) {
        toast.error('خطأ في الصلاحيات. يرجى التأكد من تسجيل الدخول.');
      } else {
        toast.error('فشل بدء المحادثة. يرجى المحاولة لاحقاً.');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div></div>;
  if (!ad) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Images and Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-[32px] overflow-hidden glass-card">
              <img src={ad.images[currentImage]} alt={ad.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : ad.images.length - 1)}
                  className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-green transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
                <button 
                  onClick={() => setCurrentImage(prev => prev < ad.images.length - 1 ? prev + 1 : 0)}
                  className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-green transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {ad.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentImage(idx)}
                  className={cn(
                    "w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all",
                    currentImage === idx ? "border-brand-green scale-105" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Ad Details */}
          <div className={cn(
            "glass-card p-8 space-y-8 border-2",
            ad.template === 'commercial' ? 'border-brand-green/20 bg-brand-green/5' :
            ad.template === 'attractive' ? 'border-brand-red/20 bg-brand-red/5' :
            ad.template === 'special' ? 'border-amber-500/20 bg-amber-500/5' :
            'border-white/5 bg-white/5'
          )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tighter">{ad.title}</h1>
                <div className="flex items-center gap-4 text-white/40 text-sm">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {ad.wilaya}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {ad.createdAt?.toDate().toLocaleDateString('fr-FR')}</span>
                  <span className="flex items-center gap-1"><Zap size={14} /> {ad.views} مشاهدة</span>
                </div>
              </div>
              <div className="text-right space-y-2">
                <p className="text-4xl font-black text-brand-green">{ad.price.toLocaleString()} دج</p>
                {ad.samouni && (
                  <p className="text-xl font-bold text-brand-red">ساموني: {ad.samouni.toLocaleString()} دج</p>
                )}
                {ad.isNegotiable && <span className="text-xs bg-brand-red/10 text-brand-red px-2 py-1 rounded font-bold">قابل للتفاوض</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">الماركة</p>
                <p className="font-bold">{ad.brand}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">الموديل</p>
                <p className="font-bold">{ad.model}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">السنة</p>
                <p className="font-bold">{ad.year}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">المسافة</p>
                <p className="font-bold">{ad.mileage?.toLocaleString() || '---'} كم</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">المحرك</p>
                <p className="font-bold">{ad.engine || '---'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">علبة السرعة</p>
                <p className="font-bold">{ad.gearbox || '---'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">نوع الطاقة</p>
                <p className="font-bold">{ad.fuelType}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">الحالة</p>
                <p className="font-bold">{ad.condition}</p>
              </div>
              {ad.salonCondition && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-bold">حالة الصالون</p>
                  <p className="font-bold">{ad.salonCondition}</p>
                </div>
              )}
              {ad.suspensionRating && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-bold">حالة التعليق</p>
                  <p className="font-bold">{ad.suspensionRating}/10</p>
                </div>
              )}
              {ad.tiresRating && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-bold">حالة العجلات</p>
                  <p className="font-bold">{ad.tiresRating}/10</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">الوصف</h3>
              <p className="text-white/60 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
            </div>

            {ad.repairs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold">العوادات (Réparations)</h3>
                <div className="flex flex-wrap gap-2">
                  {ad.repairs.map(r => (
                    <span key={r} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="glass-card p-8 space-y-8">
            <h3 className="text-xl font-bold">التعليقات ({comments.length})</h3>
            
            <form onSubmit={handleAddComment} className="flex gap-4">
              <input 
                type="text" 
                placeholder="اكتب تعليقك هنا..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary !py-2">إرسال</button>
            </form>

            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User size={20} className="text-white/40" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{comment.userName}</span>
                      <span className="text-[10px] text-white/20">{new Date(comment.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-white/60">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Seller Info and Actions */}
        <div className="space-y-6">
          <div className="glass-card p-8 space-y-8 sticky top-28">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                <User size={32} className="text-brand-green" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{ad.sellerName}</h4>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold">4.8</span>
                  <span className="text-xs text-white/20 mr-1">(12 تقييم)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {ad.showPhone ? (
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full btn-primary flex items-center justify-center gap-3"
                >
                  <Phone size={20} />
                  {showPhone ? ad.sellerPhone : 'إظهار رقم الهاتف'}
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-3 bg-white/5 text-white/40 rounded-xl font-bold flex items-center justify-center gap-3 cursor-not-allowed"
                >
                  <Phone size={20} />
                  الرقم مخفي من قبل البائع
                </button>
              )}
              <button 
                onClick={startChat}
                className="w-full btn-secondary flex items-center justify-center gap-3"
              >
                <MessageSquare size={20} />
                مراسلة البائع
              </button>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/40">
                <ShieldCheck size={18} className="text-brand-green" />
                <span>بائع موثوق لدى المنصة</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <Info size={18} className="text-brand-green" />
                <span>تاريخ الانضمام: جانفي 2024</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 transition-all">
                <Heart size={18} />
                حفظ
              </button>
              <button className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 transition-all">
                <Share2 size={18} />
                مشاركة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

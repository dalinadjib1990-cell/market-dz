import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, collection, addDoc, setDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Ad, Comment } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { 
  MapPin, Calendar, Gauge, CheckCircle2, Phone, MessageSquare, 
  Share2, Heart, ChevronLeft, ChevronRight, User, Star, ShieldCheck,
  Zap, Info, Trash2, Edit2, Activity, X, Search, Droplets
} from 'lucide-react';
import { cn, generateId } from '../lib/utils';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';

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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAd = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'ads', id));
        if (docSnap.exists()) {
          setAd({ id: docSnap.id, ...docSnap.data() } as Ad);
        } else {
          toast.error('الإعلان غير موجود');
          navigate('/');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `ads/${id}`);
      } finally {
        setLoading(false);
      }
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
    if (!user || !id || !newComment.trim()) return;
    try {
      await addDoc(collection(db, 'comments'), {
        adId: id,
        userId: user.uid,
        userName: `${profile?.firstName} ${profile?.lastName}`,
        text: newComment,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
      toast.success('تم إضافة التعليق');
    } catch (error) {
      toast.error('فشل إضافة التعليق');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    try {
      await setDoc(doc(db, 'comments', commentId), { deleted: true, text: 'تم حذف هذا التعليق' }, { merge: true });
      toast.success('تم حذف التعليق');
    } catch (error) {
      toast.error('فشل حذف التعليق');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    try {
      await setDoc(doc(db, 'comments', commentId), { text: editCommentText, edited: true }, { merge: true });
      setEditingCommentId(null);
      setEditCommentText('');
      toast.success('تم تعديل التعليق');
    } catch (error) {
      toast.error('فشل تعديل التعليق');
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

    if (user.uid === ad.userId) {
      toast.error('لا يمكنك مراسلة نفسك');
      return;
    }

    console.log('Starting chat. Current User:', user.uid, 'Ad Owner:', ad.userId);
    
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
          adPrice: ad.price,
          adSamouni: ad.samouni || null,
          adWilaya: ad.wilaya,
          buyerId: user.uid,
          sellerId: ad.userId,
          buyerName: finalBuyerName,
          sellerName: ad.sellerName || 'بائع',
          buyerEmail: user.email,
          sellerEmail: ad.sellerEmail || '', // Store emails for backup identification
          updatedAt: serverTimestamp(),
          lastMessage: 'هل السيارة لا تزال متوفرة؟',
          lastSenderId: user.uid,
          unreadCount: {
            [ad.userId]: 1
          }
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
      {/* Fullscreen Image Zoom */}
      {showZoom && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
          onClick={() => setShowZoom(false)}
        >
          <button className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors">
            <X size={32} />
          </button>
          <img 
            src={ad.images[currentImage]} 
            alt={ad.title} 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Images and Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-[32px] overflow-hidden glass-card group cursor-zoom-in" onClick={() => setShowZoom(true)}>
              <img src={ad.images[currentImage]} alt={ad.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                  <Search className="text-white" size={24} />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
              <div className="space-y-2 text-right">
                <h1 className="text-3xl font-black tracking-tighter">{ad.title}</h1>
                <div className="flex items-center gap-4 text-white/40 text-sm justify-end">
                  <span className="flex items-center gap-1"><Zap size={14} /> {ad.views} مشاهدة</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {ad.createdAt?.toDate().toLocaleDateString('fr-FR')}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {ad.wilaya}</span>
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
                <p className="text-[10px] text-white/40 uppercase font-bold">الحالة العامة</p>
                <p className="font-bold">{ad.condition}</p>
              </div>
            </div>

            {/* Vehicle Condition Analysis */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-bold flex items-center gap-2 justify-end">
                تحليل حالة السيارة
                <Activity size={20} className="text-brand-green" />
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Radar Chart */}
                <div className="h-64 glass-card p-4 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                  <div className="absolute inset-0 bg-brand-green/5 animate-pulse"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: 'المحرك', A: ad.engineRating || 10, fullMark: 10 },
                      { subject: 'التعليق', A: ad.suspensionRating || 10, fullMark: 10 },
                      { subject: 'الهيكل', A: ad.bodyRating || 10, fullMark: 10 },
                      { subject: 'الصالون', A: ad.interiorRating || 10, fullMark: 10 },
                      { subject: 'العجلات', A: ad.tiresRating || 10, fullMark: 10 },
                    ]}>
                      <PolarGrid stroke="#ffffff10" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar
                        name="Condition"
                        dataKey="A"
                        stroke="#10b981"
                        fill="url(#radarGradient)"
                        fillOpacity={0.7}
                      />
                      <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Percentage Bars */}
                <div className="space-y-6">
                  {[
                    { label: 'المحرك', value: ad.engineRating || 10, color: 'from-emerald-400 via-teal-500 to-cyan-600' },
                    { label: 'جهاز التعليق', value: ad.suspensionRating || 10, color: 'from-blue-400 via-indigo-500 to-violet-600' },
                    { label: 'الهيكل', value: ad.bodyRating || 10, color: 'from-amber-400 via-orange-500 to-red-600' },
                    { label: 'الصالون', value: ad.interiorRating || 10, color: 'from-fuchsia-400 via-purple-500 to-violet-600' },
                    { label: 'العجلات', value: ad.tiresRating || 10, color: 'from-rose-400 via-red-500 to-orange-600' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-black shadow-lg",
                            item.value >= 8 ? "bg-emerald-500/20 text-emerald-400" :
                            item.value >= 5 ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                          )}>
                            {item.value * 10}%
                          </span>
                        </div>
                        <span className="text-white/60">{item.label}</span>
                      </div>
                      <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value * 10}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full bg-gradient-to-l relative group",
                            item.color
                          )}
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Engine Health Display */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-bold flex items-center gap-2 justify-end">
                صحة المحرك والأداء
                <ShieldCheck size={20} className="text-brand-green" />
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Oil Consumption Display */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                      ad.oilConsumption ? "bg-brand-red/10 text-brand-red" : "bg-brand-green/10 text-brand-green"
                    )}>
                      {ad.oilConsumption ? "ينقص زيت" : "محرك نظيف"}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold">استهلاك الزيت</span>
                       <Droplets size={18} className="text-blue-400" />
                    </div>
                  </div>

                  {ad.oilConsumption && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-brand-red">{ad.oilConsumptionPercentage}%</span>
                        <span className="text-white/40">نسبة النقص</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-red" style={{ width: `${ad.oilConsumptionPercentage}%` }}></div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-[10px] text-white/20 text-center">
                    {ad.oilConsumption 
                      ? "المحرك يستهلك كمية من الزيت حسب تصريح البائع" 
                      : "المحرك لا يستهلك الزيت (Pas de consommation d'huile)"}
                  </p>
                </div>

                {/* Overheating Display */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                      ad.overheats ? "bg-brand-red/10 text-brand-red animate-pulse" : "bg-brand-green/10 text-brand-green"
                    )}>
                      {ad.overheats ? "يسخن" : "حرارة طبيعية"}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold">درجة الحرارة</span>
                       <Activity size={18} className={ad.overheats ? "text-brand-red" : "text-brand-green"} />
                    </div>
                  </div>

                  <div className="relative h-12 flex items-center gap-2">
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 flex gap-0.5 p-0.5">
                      <div className={cn("h-full rounded-full transition-all duration-1000", ad.overheats ? "w-full bg-brand-red shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "w-1/3 bg-brand-green")}></div>
                    </div>
                    <Activity size={24} className={cn("shrink-0", ad.overheats ? "text-brand-red animate-bounce" : "text-white/10")} />
                  </div>

                  <p className="text-[10px] text-white/20 text-center">
                    {ad.overheats 
                      ? "تنبيه: محرك السيارة يعاني من مشاكل في السخونة" 
                      : "نظام التبريد يعمل بشكل مثالي (Température Normale)"}
                  </p>
                </div>
              </div>
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
                <div key={comment.id} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User size={20} className="text-white/40" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{comment.userName}</span>
                        <span className="text-[10px] text-white/20">{comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : ''}</span>
                        {comment.edited && !comment.deleted && <span className="text-[8px] text-white/20">(معدل)</span>}
                      </div>
                      {user?.uid === comment.userId && !comment.deleted && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.text); }} className="text-white/20 hover:text-white"><Edit2 size={12} /></button>
                          <button onClick={() => handleDeleteComment(comment.id)} className="text-white/20 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2 mt-2">
                        <input 
                          type="text" 
                          value={editCommentText} 
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm outline-none"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingCommentId(null)} className="text-xs text-white/40">إلغاء</button>
                          <button onClick={() => handleEditComment(comment.id)} className="text-xs text-brand-green font-bold">حفظ</button>
                        </div>
                      </div>
                    ) : (
                      <p className={cn("text-sm text-white/60", comment.deleted && "italic text-white/20")}>{comment.text}</p>
                    )}
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

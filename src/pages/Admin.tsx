import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Users, Car, AlertTriangle, Trash2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Ad, UserProfile } from '../types';
import { toast } from 'sonner';

export default function Admin() {
  const { user, profile } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ads' | 'users'>('ads');

  const isAdmin = profile?.role === 'admin' || user?.email === "dalinadjib1990@gmail.com";

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        const adsSnap = await getDocs(query(collection(db, 'ads'), orderBy('createdAt', 'desc'), limit(50)));
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
        
        setAds(adsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Ad)));
        setUsers(usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      await deleteDoc(doc(db, 'ads', adId));
      setAds(prev => prev.filter(a => a.id !== adId));
      toast.success("تم حذف الإعلان بنجاح");
    } catch (error) {
      toast.error("فشل حذف الإعلان");
    }
  };

  const handleToggleVerification = async (ad: Ad) => {
    try {
      await updateDoc(doc(db, 'ads', ad.id), { isVerified: !ad.isVerified });
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, isVerified: !ad.isVerified } : a));
      toast.success(ad.isVerified ? "تم إلغاء توثيق الإعلان" : "تم توثيق الإعلان");
    } catch (error) {
      toast.error("فشل تحديث التوثيق");
    }
  };

  const handleToggleUserAdmin = async (u: UserProfile) => {
    if (u.email === "dalinadjib1990@gmail.com") {
      toast.error("لا يمكن تغيير صلاحيات المسؤول الرئيسي");
      return;
    }
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', u.uid), { role: newRole });
      setUsers(prev => prev.map(usr => usr.uid === u.uid ? { ...usr, role: newRole as any } : usr));
      toast.success(newRole === 'admin' ? "تم منح صلاحيات الأدمن" : "تم سحب صلاحيات الأدمن");
    } catch (error) {
      toast.error("فشل تحديث الصلاحيات");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته.")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.uid !== userId));
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error) {
      toast.error("فشل حذف المستخدم");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Shield className="text-brand-green" size={32} />
            لوحة تحكم المسؤول
          </h1>
          <p className="text-white/40">إدارة الإعلانات، المستخدمين، وحماية المنصة</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ads' ? 'bg-brand-green text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <Car size={18} />
            الإعلانات
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-brand-green text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <Users size={18} />
            المستخدمين
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {activeTab === 'ads' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold">الإعلان</th>
                  <th className="px-6 py-4 text-sm font-bold">السعر</th>
                  <th className="px-6 py-4 text-sm font-bold">الحالة</th>
                  <th className="px-6 py-4 text-sm font-bold">التوثيق</th>
                  <th className="px-6 py-4 text-sm font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {ad.images && ad.images.length > 0 ? (
                          <img src={ad.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                            <Car size={20} className="text-white/20" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm">{ad.title}</p>
                          <p className="text-[10px] text-white/40">{ad.sellerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-brand-green">
                      {ad.price.toLocaleString()} دج
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ad.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-brand-red/10 text-brand-red'}`}>
                        {ad.status === 'active' ? 'نشط' : 'مباع'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleVerification(ad)}
                        className={`p-2 rounded-lg transition-colors ${ad.isVerified ? 'text-brand-green bg-brand-green/10' : 'text-white/20 bg-white/5 hover:text-white'}`}
                      >
                        <CheckCircle size={18} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-2 text-brand-red hover:bg-brand-red/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold">المستخدم</th>
                  <th className="px-6 py-4 text-sm font-bold">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-sm font-bold">الرتبة</th>
                  <th className="px-6 py-4 text-sm font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-bold text-sm">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/40">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-white/5 text-white/40'}`}>
                        {u.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleUserAdmin(u)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${u.role === 'admin' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-green/10 text-brand-green'}`}
                        >
                          {u.role === 'admin' ? 'سحب الأدمن' : 'جعل أدمن'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.uid)}
                          className="p-1.5 text-brand-red hover:bg-brand-red/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-6 bg-brand-red/5 border border-brand-red/20 rounded-[2rem] space-y-3">
        <h3 className="font-bold flex items-center gap-2 text-brand-red">
          <AlertTriangle size={20} />
          منطقة الحماية والأمان
        </h3>
        <p className="text-sm text-white/60 leading-relaxed">
          تذكر بصفتك مسؤولاً أنك تملك السيطرة الكاملة على البيانات. كن حذراً عند إجراء عمليات الحذف أو تغيير الصلاحيات. النظام محمي بقواعد Firebase Security Rules لمنع أي قرصنة خارجية.
        </p>
      </div>
    </div>
  );
}

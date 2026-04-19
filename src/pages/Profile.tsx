import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { WILAYAS } from '../constants/data';
import { User, Mail, Phone, MapPin, Camera, Loader2, CheckCircle2, LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin' || user?.email === "dalinadjib1990@gmail.com";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    wilaya: 'الجزائر',
    phone: '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        wilaya: profile.wilaya || 'الجزائر',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      toast.error('فشل تسجيل الخروج');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      toast.error('فشل تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white/10 group-hover:border-brand-green transition-all">
            <img src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-0 right-0 p-3 bg-brand-green text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
            <Camera size={20} />
          </button>
        </div>
        <div className="text-center md:text-right space-y-2">
          <h1 className="text-4xl font-black tracking-tighter">{profile?.firstName} {profile?.lastName}</h1>
          <p className="text-white/40">{user.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-brand-green font-bold text-sm">
            <CheckCircle2 size={16} />
            حساب موثوق
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="glass-card p-8 space-y-8">
            <h3 className="text-xl font-bold">المعلومات الشخصية</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الاسم</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">اللقب</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">رقم الهاتف</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الولاية</label>
                <select
                  value={formData.wilaya}
                  onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                  className="input-field appearance-none"
                >
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
            <button disabled={loading} type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'حفظ التغييرات'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-bold">إحصائيات الحساب</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                <span className="text-sm text-white/40">إعلانات نشطة</span>
                <span className="font-bold">3</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                <span className="text-sm text-white/40">إعلانات مباعة</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5">
                <span className="text-sm text-white/40">التقييم العام</span>
                <span className="font-bold text-amber-500">4.8/5</span>
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full py-4 bg-brand-green text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl shadow-brand-green/20 mb-4"
              >
                <Shield size={22} fill="currentColor" />
                دخول لوحة تحكم المسؤول
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="w-full py-3 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

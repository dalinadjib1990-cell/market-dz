import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Car, Mail, Lock, Chrome, ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { WILAYAS } from '../constants/data';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [wilaya, setWilaya] = useState('الجزائر');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        wilaya: 'الجزائر',
        phone: '',
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      }, { merge: true });

      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (error: any) {
      console.error('Google Login Error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('هذا النطاق (Domain) غير مصرح به في Firebase. يرجى إضافته في إعدادات Firebase Console.');
      } else {
        toast.error(`فشل تسجيل الدخول: ${error.message || 'خطأ غير معروف'}`);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email,
          firstName,
          lastName,
          wilaya,
          phone,
          createdAt: serverTimestamp(),
        });
        
        toast.success('تم إنشاء الحساب بنجاح');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('تم تسجيل الدخول بنجاح');
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1603584173870-7f3ca99a8141?auto=format&fit=crop&q=80" 
          alt="Car Background" 
          className="w-full h-full object-cover opacity-30 scale-110 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/90 to-[#0a0a0a]"></div>
      </div>

      <div className="max-w-xl w-full space-y-8 relative z-10 p-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-brand-green rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-brand-green/40 rotate-12 hover:rotate-0 transition-transform duration-500">
            <Car className="text-white" size={40} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter">
            {isRegister ? 'انضم إلينا الآن' : 'مرحباً بك مجدداً'}
          </h2>
          <p className="text-white/40 font-medium">أكبر منصة لبيع وشراء السيارات في الجزائر 🇩🇿</p>
        </div>

        <div className="glass-card p-8 md:p-10 space-y-8 border-white/5">
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">الاسم</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      required
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input-field pr-12 !py-3"
                      placeholder="الاسم"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">اللقب</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      required
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input-field pr-12 !py-3"
                      placeholder="اللقب"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pr-12 !py-3"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">الولاية</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <select
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      className="input-field pr-12 !py-3 appearance-none"
                    >
                      {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field pr-12 !py-3"
                      placeholder="06XXXXXXXX"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12 !py-3"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full btn-primary !py-4 text-lg">
              {loading ? 'جاري التحميل...' : (isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول')}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-[#111111] px-4 text-white/20">أو عبر</span>
            </div>
          </div>

          <button onClick={handleGoogleLogin} className="w-full btn-secondary !py-4 flex items-center justify-center gap-3">
            <Chrome size={20} />
            Google تسجيل الدخول عبر
          </button>

          <p className="text-center text-sm text-white/40">
            {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="mr-2 text-brand-green font-bold hover:underline"
            >
              {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب الآن'}
            </button>
          </p>
        </div>

        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mx-auto text-sm font-bold">
          <ArrowLeft size={16} />
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}

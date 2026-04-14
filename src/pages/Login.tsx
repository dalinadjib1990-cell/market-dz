import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Car, Mail, Lock, Chrome, ArrowLeft, User, Phone, MapPin, Loader2 } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
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
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('فشل الاتصال بالشبكة. يرجى التأكد من إيقاف مانع الإعلانات (Ad-blocker) وتفعيل ملفات تعريف الارتباط (Cookies).');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('تم حظر النافذة المنبثقة. يرجى السماح بالمنبثقات لهذا الموقع.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.info('تم إغلاق نافذة تسجيل الدخول.');
      } else {
        toast.error(`فشل تسجيل الدخول: ${error.message || 'خطأ غير معروف'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        // If user provided phone but no email, we create a dummy email for Firebase Auth
        const authEmail = email || `${phone}@marketautodz.com`;
        const result = await createUserWithEmailAndPassword(auth, authEmail, password);
        const user = result.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: email || '',
          phone,
          firstName,
          lastName,
          wilaya,
          createdAt: serverTimestamp(),
        });
        
        toast.success('تم إنشاء الحساب بنجاح');
      } else {
        const authEmail = email || `${phone}@marketautodz.com`;
        await signInWithEmailAndPassword(auth, authEmail, password);
        toast.success('تم تسجيل الدخول بنجاح');
      }
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('هذا البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل');
      } else {
        toast.error(error.message || 'حدث خطأ ما');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0a0a0a]">
      {/* Left Side: Image (Desktop Only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80" 
          alt="Luxury Car" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]"></div>
        <div className="absolute bottom-20 right-20 max-w-md space-y-4 text-right">
          <h3 className="text-4xl font-black tracking-tighter leading-tight">
            ابحث عن سيارة <br /> أحلامك في <span className="text-brand-green">الجزائر</span>
          </h3>
          <p className="text-white/60 font-medium">آلاف الإعلانات المتجددة يومياً بين يديك.</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative">
        {/* Background for Mobile */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <img 
            src="https://images.unsplash.com/photo-1603584173870-7f3ca99a8141?auto=format&fit=crop&q=80" 
            alt="Car Background" 
            className="w-full h-full object-cover opacity-20 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/90 to-[#0a0a0a]"></div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-green/40 rotate-12 hover:rotate-0 transition-transform duration-500">
              <Car className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">
              MARKET<span className="text-brand-green">AUTO</span><span className="text-brand-red">DZ</span>
            </h1>
            <h2 className="text-2xl font-black tracking-tighter text-white/80">
              {isRegister ? 'انضم إلينا الآن' : 'مرحباً بك مجدداً'}
            </h2>
          </div>

          <div className="glass-card p-8 space-y-8 border-white/5">
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
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">البريد الإلكتروني أو رقم الهاتف</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  required
                  type="text"
                  value={email || phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d+$/.test(val) || (val.startsWith('0') && val.length > 1)) {
                      setPhone(val);
                      setEmail('');
                    } else {
                      setEmail(val);
                      setPhone('');
                    }
                  }}
                  className="input-field pr-12 !py-3"
                  placeholder="name@example.com أو 06XXXXXXXX"
                />
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-green focus:ring-brand-green"
                />
                <label htmlFor="remember" className="text-xs text-white/40 cursor-pointer">تذكرني</label>
              </div>
            )}

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

            <button disabled={loading} type="submit" className="w-full btn-primary !py-4 text-lg flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>جاري التحميل...</span>
                </>
              ) : (
                <span>{isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</span>
              )}
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

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <p className="text-[10px] text-white/40 font-bold text-center">
              تواجه مشكلة في تسجيل الدخول بجوجل؟
            </p>
            <p className="text-[9px] text-white/20 text-center leading-relaxed">
              يرجى التأكد من إيقاف مانع الإعلانات (Ad-blocker) والسماح بملفات تعريف الارتباط (Cookies) في متصفحك.
            </p>
          </div>

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
  </div>
  );
}

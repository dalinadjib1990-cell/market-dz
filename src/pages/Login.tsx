import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Car, Mail, Lock, Chrome, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (error) {
      toast.error('فشل تسجيل الدخول عبر Google');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
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
    <div className="min-h-[calc(100-80px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-green/20">
            <Car className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter">
            {isRegister ? 'إنشاء حساب جديد' : 'مرحباً بك مجدداً'}
          </h2>
          <p className="text-white/40">انضم إلى أكبر سوق للسيارات في الجزائر</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pr-12"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full btn-primary">
              {loading ? 'جاري التحميل...' : (isRegister ? 'إنشاء حساب' : 'تسجيل الدخول')}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1a1a1a] px-2 text-white/20">أو عبر</span>
            </div>
          </div>

          <button onClick={handleGoogleLogin} className="w-full btn-secondary flex items-center justify-center gap-3">
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

        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mx-auto text-sm">
          <ArrowLeft size={16} />
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}

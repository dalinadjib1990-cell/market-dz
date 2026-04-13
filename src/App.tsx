import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Search from './pages/Search';
import PostAd from './pages/PostAd';
import Login from './pages/Login';
import AdDetails from './pages/AdDetails';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/post" element={<PostAd />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ad/:id" element={<AdDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </main>
        <MobileNav />
        <footer className="bg-[#0a0a0a] border-t border-white/10 py-12 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="text-lg font-black tracking-tighter">
                  MARKET<span className="text-brand-green">AUTO</span><span className="text-brand-red">DZ</span>
                </span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                المنصة الجزائرية الأولى لبيع وشراء السيارات باحترافية وسهولة. نحن نربط البائعين والمشترين في كل أنحاء الوطن.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">روابط سريعة</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><a href="#" className="hover:text-brand-green transition-colors">عن المنصة</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">شروط الاستخدام</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">اتصل بنا</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">الماركات الشهيرة</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><a href="#" className="hover:text-brand-green transition-colors">Renault</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Hyundai</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Volkswagen</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Dacia</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">تابعنا</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors cursor-pointer">
                  <span className="text-xs font-bold">FB</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors cursor-pointer">
                  <span className="text-xs font-bold">IG</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand-green transition-colors cursor-pointer">
                  <span className="text-xs font-bold">YT</span>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-xs text-white/20">
            © 2026 Market Auto DZ. جميع الحقوق محفوظة. صنع بكل فخر في الجزائر 🇩🇿
          </div>
        </footer>
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}

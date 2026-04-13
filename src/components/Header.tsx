import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, User, LogOut, PlusSquare, MessageSquare, Search } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Car className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter">
            MARKET<span className="text-brand-green">AUTO</span><span className="text-brand-red">DZ</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium hover:text-brand-green transition-colors">الرئيسية</Link>
          <Link to="/search" className="text-sm font-medium hover:text-brand-green transition-colors">البحث</Link>
          <Link to="/verified" className="text-sm font-medium hover:text-brand-green transition-colors">سيارات موثوقة</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/messages" className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
                <MessageSquare size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full"></span>
              </Link>
              <Link to="/post" className="hidden sm:flex items-center gap-2 btn-primary !py-2 !px-4 text-sm">
                <PlusSquare size={18} />
                أضف إعلان
              </Link>
              <div className="group relative">
                <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-brand-green transition-colors">
                  <img src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" />
                </button>
                <div className="absolute left-0 top-full mt-2 w-48 glass-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/profile" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-sm">
                    <User size={16} />
                    حسابي
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 hover:bg-brand-red/10 text-brand-red rounded-lg text-sm">
                    <LogOut size={16} />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-primary !py-2 !px-6 text-sm">
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

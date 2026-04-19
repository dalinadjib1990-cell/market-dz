import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, MessageSquare, User, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export default function MobileNav() {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: Search, label: 'البحث', path: '/search' },
    { icon: PlusSquare, label: 'نشر', path: '/post', primary: true },
    { icon: MessageSquare, label: 'الرسائل', path: '/messages' },
    isAdmin 
      ? { icon: Shield, label: 'المسؤول', path: '/admin' }
      : { icon: User, label: 'حسابي', path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/10 px-1 py-2">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-all flex-1",
                item.primary ? "relative -top-6" : "p-1",
                isActive ? "text-brand-green" : "text-white/40"
              )}
            >
              <div className={cn(
                "transition-all",
                item.primary ? "w-14 h-14 bg-brand-green rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-green/40 scale-110" : "w-6 h-6"
              )}>
                <item.icon size={item.primary ? 28 : 22} />
              </div>
              {!item.primary && <span className="text-[8px] font-bold whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

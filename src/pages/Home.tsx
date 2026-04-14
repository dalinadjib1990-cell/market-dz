import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ad } from '../types';
import Hero from '../components/Hero';
import { AdCard } from '../components/AdCard';
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const [latestAds, setLatestAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'), limit(8));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLatestAds(snap.docs.map(d => ({ id: d.id, ...d.data() } as Ad)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      <div className="pt-8 text-center space-y-4">
        <h2 className="shiny-text text-2xl md:text-5xl">بسم الله الرحمن الرحيم</h2>
        <div className="flex justify-center">
          <h3 className="shiny-text text-xl md:text-3xl italic">
            اللهم صلي و سلم على سيدنا محمد
          </h3>
        </div>
      </div>
      <Hero />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 space-y-4 hover:border-brand-green/30 transition-colors">
          <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="text-brand-green" size={28} />
          </div>
          <h3 className="text-xl font-bold">أمان تام</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            نحن نتحقق من الإعلانات لضمان تجربة شراء آمنة وموثوقة لكل المستخدمين في الجزائر.
          </p>
        </div>
        <div className="glass-card p-8 space-y-4 hover:border-brand-green/30 transition-colors">
          <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center">
            <Zap className="text-brand-green" size={28} />
          </div>
          <h3 className="text-xl font-bold">سرعة في النشر</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            أضف إعلانك في أقل من دقيقتين مع نظام رفع الصور الذكي والمباشر إلى Cloudinary.
          </p>
        </div>
        <div className="glass-card p-8 space-y-4 hover:border-brand-green/30 transition-colors">
          <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center">
            <Star className="text-brand-green" size={28} />
          </div>
          <h3 className="text-xl font-bold">أفضل العروض</h3>
          <p className="text-white/40 text-sm leading-relaxed">
            تصفح آلاف السيارات يومياً واحصل على أفضل الأسعار في السوق الجزائري.
          </p>
        </div>
      </section>

      {/* Latest Ads */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tighter">أحدث الإعلانات</h2>
            <p className="text-white/40 text-sm">اكتشف أحدث السيارات المضافة مؤخراً</p>
          </div>
          <button className="flex items-center gap-2 text-brand-green font-bold hover:gap-3 transition-all">
            عرض الكل
            <ArrowRight size={20} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card aspect-[16/20] animate-pulse"></div>
            ))}
          </div>
        ) : latestAds.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {latestAds.map(ad => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card">
            <p className="text-white/40">لا توجد إعلانات حالياً. كن أول من ينشر!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-[40px] overflow-hidden bg-brand-green p-12 md:p-20 text-center space-y-8">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white relative z-10">
            هل تريد بيع سيارتك؟
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto relative z-10">
            انضم إلى آلاف البائعين الناجحين على Market Auto DZ وابدأ في استقبال العروض اليوم.
          </p>
          <div className="relative z-10">
            <button className="bg-white text-brand-green font-black py-4 px-12 rounded-2xl text-xl hover:scale-105 transition-transform shadow-2xl">
              انشر إعلانك مجاناً
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

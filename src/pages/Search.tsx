import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ad } from '../types';
import { AdCard } from '../components/AdCard';
import { Search as SearchIcon, Filter, SlidersHorizontal, X } from 'lucide-react';
import { BRANDS, WILAYAS, FUEL_TYPES } from '../constants/data';
import { cn } from '../lib/utils';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const qParam = searchParams.get('q') || '';
  const brandParam = searchParams.get('brand') || '';
  const wilayaParam = searchParams.get('wilaya') || '';

  useEffect(() => {
    let baseQuery = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));

    if (brandParam) {
      baseQuery = query(baseQuery, where('brand', '==', brandParam));
    }
    if (wilayaParam) {
      baseQuery = query(baseQuery, where('wilaya', '==', wilayaParam));
    }

    const unsubscribe = onSnapshot(baseQuery, (snap) => {
      let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ad));
      
      if (qParam) {
        const lowQ = qParam.toLowerCase();
        results = results.filter(ad => 
          ad.title.toLowerCase().includes(lowQ) || 
          ad.description.toLowerCase().includes(lowQ) ||
          ad.model.toLowerCase().includes(lowQ)
        );
      }

      setAds(results);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [qParam, brandParam, wilayaParam]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">نتائج البحث</h1>
          <p className="text-white/40">وجدنا {ads.length} سيارة مطابقة لبحثك</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 btn-secondary md:hidden"
        >
          <Filter size={20} />
          تصفية
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <aside className={cn(
          "lg:block space-y-8",
          showFilters ? "fixed inset-0 z-[60] bg-[#0a0a0a] p-8 overflow-y-auto" : "hidden"
        )}>
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="text-2xl font-bold">تصفية النتائج</h2>
            <button onClick={() => setShowFilters(false)}><X size={24} /></button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">الماركة</h4>
              <select 
                value={brandParam}
                onChange={(e) => {
                  searchParams.set('brand', e.target.value);
                  setSearchParams(searchParams);
                }}
                className="input-field appearance-none"
              >
                <option value="">كل الماركات</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">الولاية</h4>
              <select 
                value={wilayaParam}
                onChange={(e) => {
                  searchParams.set('wilaya', e.target.value);
                  setSearchParams(searchParams);
                }}
                className="input-field appearance-none"
              >
                <option value="">كل الولايات</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">نوع الطاقة</h4>
              <div className="space-y-2">
                {FUEL_TYPES.map(f => (
                  <label key={f} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 accent-brand-green" />
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">السعر (دج)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="من" className="input-field !py-2 text-sm" />
                <input type="number" placeholder="إلى" className="input-field !py-2 text-sm" />
              </div>
            </div>
          </div>

          {showFilters && (
            <button 
              onClick={() => setShowFilters(false)}
              className="w-full btn-primary mt-8"
            >
              تطبيق التصفية
            </button>
          )}
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card aspect-[16/20] animate-pulse"></div>
              ))}
            </div>
          ) : ads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {ads.map(ad => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <div className="text-center py-40 glass-card space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <SearchIcon size={32} className="text-white/20" />
              </div>
              <p className="text-white/40 font-bold">لم نجد أي سيارة تطابق معايير بحثك</p>
              <button 
                onClick={() => setSearchParams({})}
                className="text-brand-green font-bold hover:underline"
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

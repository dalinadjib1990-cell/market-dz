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
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const priceRange = searchParams.get('priceRange') || '';
  const mileageRange = searchParams.get('mileageRange') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const minYear = searchParams.get('minYear') || '';
  const maxYear = searchParams.get('maxYear') || '';

  useEffect(() => {
    let baseQuery = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));

    if (brandParam) {
      baseQuery = query(baseQuery, where('brand', '==', brandParam));
    }
    if (wilayaParam) {
      baseQuery = query(baseQuery, where('wilaya', '==', wilayaParam));
    }
    if (fuelType) {
      baseQuery = query(baseQuery, where('fuelType', '==', fuelType));
    }

    const unsubscribe = onSnapshot(baseQuery, (snap) => {
      let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ad));
      
      // Client-side filtering for ranges and text search
      if (qParam) {
        const lowQ = qParam.toLowerCase();
        results = results.filter(ad => 
          ad.title.toLowerCase().includes(lowQ) || 
          ad.description.toLowerCase().includes(lowQ) ||
          ad.model.toLowerCase().includes(lowQ)
        );
      }

      if (minPrice) results = results.filter(ad => ad.price >= Number(minPrice));
      if (maxPrice) results = results.filter(ad => ad.price <= Number(maxPrice));
      
      // Price Range Filtering (in Millions)
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(v => Number(v) * 10000); // Convert Million to actual price (assuming price is in 1000s or similar, but user said 20 million, usually 200,000,000 in DZ context or 2,000,000? Actually 1 Million = 10,000 DA in some contexts, or 1,000,000 DA. In Algeria 1 Million = 10,000 DA. So 20 Million = 200,000 DA.)
        // Let's assume price in DB is in DA.
        // 1 Million Centimes = 10,000 DA.
        // 20 Million Centimes = 200,000 DA.
        const factor = 10000;
        if (max) {
          results = results.filter(ad => ad.price >= Number(min) * factor && ad.price <= Number(max) * factor);
        } else {
          results = results.filter(ad => ad.price >= Number(min) * factor);
        }
      }

      // Mileage Range Filtering
      if (mileageRange) {
        if (mileageRange === '300000+') {
          results = results.filter(ad => (ad.mileage || 0) >= 300000);
        } else if (mileageRange === '<100000') {
          results = results.filter(ad => (ad.mileage || 0) < 100000);
        } else {
          const [min, max] = mileageRange.split('-').map(Number);
          results = results.filter(ad => (ad.mileage || 0) >= min && (ad.mileage || 0) <= max);
        }
      }

      if (minYear) results = results.filter(ad => ad.year >= Number(minYear));
      if (maxYear) results = results.filter(ad => ad.year <= Number(maxYear));

      setAds(results);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [qParam, brandParam, wilayaParam, minPrice, maxPrice, priceRange, mileageRange, fuelType, minYear, maxYear]);

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
              <select 
                value={fuelType}
                onChange={(e) => {
                  searchParams.set('fuelType', e.target.value);
                  setSearchParams(searchParams);
                }}
                className="input-field appearance-none"
              >
                <option value="">كل الأنواع</option>
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">نطاق السعر (مليون سنتيم)</h4>
              <select 
                value={priceRange}
                onChange={(e) => {
                  searchParams.set('priceRange', e.target.value);
                  setSearchParams(searchParams);
                }}
                className="input-field appearance-none"
              >
                <option value="">كل الأسعار</option>
                <option value="20-50">20 - 50 مليون</option>
                <option value="50-80">50 - 80 مليون</option>
                <option value="80-120">80 - 120 مليون</option>
                <option value="120-160">120 - 160 مليون</option>
                <option value="160-200">160 - 200 مليون</option>
                <option value="200-250">200 - 250 مليون</option>
                <option value="250-300">250 - 300 مليون</option>
                <option value="300">أكثر من 300 مليون</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">المسافة المقطوعة (كم)</h4>
              <select 
                value={mileageRange}
                onChange={(e) => {
                  searchParams.set('mileageRange', e.target.value);
                  setSearchParams(searchParams);
                }}
                className="input-field appearance-none"
              >
                <option value="">كل المسافات</option>
                <option value="<100000">أقل من 100 ألف</option>
                <option value="100000-200000">100 ألف - 200 ألف</option>
                <option value="200000-300000">200 ألف - 300 ألف</option>
                <option value="300000+">أكثر من 300 ألف</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">السعر (دج)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  placeholder="من" 
                  value={minPrice}
                  onChange={(e) => {
                    searchParams.set('minPrice', e.target.value);
                    setSearchParams(searchParams);
                  }}
                  className="input-field !py-2 text-sm" 
                />
                <input 
                  type="number" 
                  placeholder="إلى" 
                  value={maxPrice}
                  onChange={(e) => {
                    searchParams.set('maxPrice', e.target.value);
                    setSearchParams(searchParams);
                  }}
                  className="input-field !py-2 text-sm" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">السنة</h4>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  placeholder="من" 
                  value={minYear}
                  onChange={(e) => {
                    searchParams.set('minYear', e.target.value);
                    setSearchParams(searchParams);
                  }}
                  className="input-field !py-2 text-sm" 
                />
                <input 
                  type="number" 
                  placeholder="إلى" 
                  value={maxYear}
                  onChange={(e) => {
                    searchParams.set('maxYear', e.target.value);
                    setSearchParams(searchParams);
                  }}
                  className="input-field !py-2 text-sm" 
                />
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <button 
                onClick={() => setSearchParams({})}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl font-bold text-sm transition-all"
              >
                إعادة ضبط الفلاتر
              </button>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card aspect-[16/20] animate-pulse"></div>
              ))}
            </div>
          ) : ads.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Car, Star } from 'lucide-react';
import { BRANDS, WILAYAS } from '../constants/data';

export default function Hero() {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [wilaya, setWilaya] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (brand) params.append('brand', brand);
    if (wilaya) params.append('wilaya', wilaya);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="relative h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background with Algerian Flag Colors Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-green/30 via-[#0a0a0a] to-brand-red/20"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-green/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-red/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-5xl w-full px-4 text-center space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-brand-green animate-bounce">
            <Star size={14} fill="currentColor" />
            المنصة رقم 1 في الجزائر 🇩🇿
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight drop-shadow-2xl">
            سوق السيارات <br />
            <span className="text-brand-green drop-shadow-[0_0_15px_rgba(0,102,51,0.5)]">الأول</span> في <span className="text-brand-red drop-shadow-[0_0_15px_rgba(210,16,52,0.5)]">الجزائر</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            اكتشف آلاف العروض يومياً. بيع وشراء السيارات أصبح أسهل، أسرع، وأكثر أماناً مع <span className="text-white font-bold">Market Auto DZ</span>.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => navigate('/post')}
              className="btn-primary !py-4 !px-10 text-xl shadow-[0_0_30px_rgba(0,102,51,0.3)] hover:scale-105 transition-all flex items-center gap-3 mx-auto"
            >
              <PlusSquare size={24} />
              انشر إعلانك الآن مجاناً
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="glass-card p-3 flex flex-col md:flex-row gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10">
          <div className="flex-1 relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-green transition-colors" size={22} />
            <input
              type="text"
              placeholder="ابحث عن ماركة، موديل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 rounded-xl py-5 pr-14 pl-4 outline-none text-lg border border-transparent focus:border-brand-green/30 transition-all"
            />
          </div>
          
          <div className="w-full md:w-56 relative group">
            <Car className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-green transition-colors" size={22} />
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-white/5 rounded-xl py-5 pr-14 pl-4 outline-none appearance-none cursor-pointer border border-transparent focus:border-brand-green/30 transition-all"
            >
              <option value="" className="bg-[#0a0a0a]">كل الماركات</option>
              {BRANDS.map(b => <option key={b} value={b} className="bg-[#0a0a0a]">{b}</option>)}
            </select>
          </div>

          <div className="w-full md:w-56 relative group">
            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-green transition-colors" size={22} />
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="w-full bg-white/5 rounded-xl py-5 pr-14 pl-4 outline-none appearance-none cursor-pointer border border-transparent focus:border-brand-green/30 transition-all"
            >
              <option value="" className="bg-[#0a0a0a]">كل الولايات</option>
              {WILAYAS.map(w => <option key={w} value={w} className="bg-[#0a0a0a]">{w}</option>)}
            </select>
          </div>

          <button type="submit" className="btn-primary flex items-center justify-center gap-3 min-w-[160px] !py-5 text-lg shadow-2xl hover:scale-105 transition-transform">
            <Search size={22} />
            بحث سريع
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-white/40">
          <span>الأكثر بحثاً:</span>
          {['Renault Symbol', 'Hyundai Accent', 'Volkswagen Golf', 'Dacia Stepway'].map(tag => (
            <button key={tag} onClick={() => { setSearch(tag); }} className="hover:text-brand-green transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

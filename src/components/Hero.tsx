import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Car } from 'lucide-react';
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
    <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with Algerian Flag Colors Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 via-[#0a0a0a] to-brand-red/10"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-green/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-red/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-4xl w-full px-4 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            سوق السيارات <br />
            <span className="text-brand-green">الأول</span> في <span className="text-brand-red">الجزائر</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            ابحث عن سيارة أحلامك أو بع سيارتك في دقائق. منصة آمنة، سريعة، وموثوقة 100%.
          </p>
        </div>

        <form onSubmit={handleSearch} className="glass-card p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input
              type="text"
              placeholder="ابحث عن ماركة، موديل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent py-4 pr-12 pl-4 outline-none text-lg"
            />
          </div>
          
          <div className="w-full md:w-48 relative border-r border-white/10 pr-2">
            <Car className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-transparent py-4 pr-12 pl-4 outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a1a1a]">كل الماركات</option>
              {BRANDS.map(b => <option key={b} value={b} className="bg-[#1a1a1a]">{b}</option>)}
            </select>
          </div>

          <div className="w-full md:w-48 relative border-r border-white/10 pr-2">
            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="w-full bg-transparent py-4 pr-12 pl-4 outline-none appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a1a1a]">كل الولايات</option>
              {WILAYAS.map(w => <option key={w} value={w} className="bg-[#1a1a1a]">{w}</option>)}
            </select>
          </div>

          <button type="submit" className="btn-primary flex items-center justify-center gap-2 min-w-[120px]">
            <Search size={20} />
            بحث
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

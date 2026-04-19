import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gauge, CheckCircle2 } from 'lucide-react';
import { Ad } from '../types';
import { cn } from '../lib/utils';

interface AdCardProps {
  ad: Ad;
}

export const AdCard: React.FC<{ ad: Ad }> = ({ ad }) => {
  const templateClass = ad.template === 'commercial' ? 'border-brand-green/30 shadow-brand-green/5' :
                        ad.template === 'attractive' ? 'border-brand-red/30 shadow-brand-red/5' :
                        ad.template === 'special' ? 'border-amber-500/30 shadow-amber-500/5' :
                        'border-white/10';

  return (
    <Link to={`/ad/${ad.id}`} className={cn(
      "group glass-card overflow-hidden transition-all duration-500 hover:-translate-y-2 border-2",
      templateClass,
      ad.template === 'special' && "bg-gradient-to-br from-amber-500/5 to-transparent"
    )}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={ad.images[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80'} 
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
          <div className="bg-brand-green/90 backdrop-blur-xl text-white text-xs font-black px-4 py-2 rounded-2xl shadow-2xl border border-white/20 ring-1 ring-white/10">
            {ad.price.toLocaleString()} دج
          </div>
          {ad.samouni && (
            <div className="bg-brand-red/90 backdrop-blur-xl text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl border border-white/20 ring-1 ring-white/10">
              ساموني: {ad.samouni.toLocaleString()}
            </div>
          )}
        </div>
        {ad.isVerified && (
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white p-1.5 rounded-lg border border-white/20">
            <CheckCircle2 size={16} className="text-brand-green" />
          </div>
        )}
        {ad.status === 'sold' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="bg-brand-red text-white text-[10px] font-black px-4 py-1.5 rounded-full rotate-[-15deg] shadow-2xl border-2 border-white/20 animate-pulse uppercase tracking-widest">
              Vendu / تم البيع
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg group-hover:text-brand-green transition-colors line-clamp-1">{ad.title}</h3>
          <p className="text-white/40 text-sm">{ad.brand} {ad.model}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Calendar size={14} className="text-brand-green" />
            <span>{ad.year}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Gauge size={14} className="text-brand-green" />
            <span>{ad.mileage?.toLocaleString() || '---'} كم</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <MapPin size={14} className="text-brand-green" />
            <span>{ad.wilaya}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
            <span>{ad.fuelType}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-white/20 uppercase tracking-wider font-bold">
            {new Date(ad.createdAt?.seconds * 1000).toLocaleDateString('ar-DZ')}
          </span>
          {ad.isNegotiable && (
            <span className="text-[10px] bg-brand-red/10 text-brand-red px-2 py-1 rounded font-bold">
              قابل للتفاوض
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gauge, CheckCircle2 } from 'lucide-react';
import { Ad } from '../types';
import { cn } from '../lib/utils';

interface AdCardProps {
  ad: Ad;
}

export const AdCard: React.FC<{ ad: Ad }> = ({ ad }) => {
  return (
    <Link to={`/ad/${ad.id}`} className="group glass-card overflow-hidden hover:border-brand-green/50 transition-all">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={ad.images[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80'} 
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-brand-green text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
          {ad.price.toLocaleString()} دج
        </div>
        {ad.isVerified && (
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white p-1.5 rounded-lg border border-white/20">
            <CheckCircle2 size={16} className="text-brand-green" />
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

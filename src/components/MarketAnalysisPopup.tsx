import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, Clock, MapPin, Search, AlertCircle, CheckCircle2, Loader2, LineChart as LineChartIcon, Activity, Bot } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ad } from '../types';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface MarketAnalysisPopupProps {
  isOpen: boolean;
  onClose: () => void;
  ad?: Ad;
}

interface MarketData {
  trendData: { name: string; price: number }[];
  marketStatus: 'Rising' | 'Stable' | 'Falling';
  fairPrice: number;
  supplyDemand: 'High' | 'Medium' | 'Low';
  avgSellingTime: string;
  similarListings: number;
  regionalComparison: { region: string; price: number }[];
  bestTimeToBuy: string;
  recommendation: 'Buy Now' | 'Wait' | 'Negotiate' | 'Avoid';
  explanation: string;
}

export default function MarketAnalysisPopup({ isOpen, onClose, ad }: MarketAnalysisPopupProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    if (isOpen && !data && !loading) {
      fetchAnalysis();
    }
  }, [isOpen, ad]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      // Fetch similar ads
      let q;
      if (ad) {
        q = query(collection(db, 'ads'), where('brand', '==', ad.brand));
      } else {
        q = query(collection(db, 'ads'));
      }
      const snapshot = await getDocs(q);
      const similarAds = snapshot.docs.map(doc => doc.data()).slice(0, 10);

      const response = await fetch('/api/gemini/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adDetails: ad || {},
          marketData: similarAds
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market analysis');
      }

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء تحميل بيانات السوق');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Rising': return <TrendingUp className="text-red-500" size={24} />;
      case 'Falling': return <TrendingDown className="text-green-500" size={24} />;
      case 'Stable': return <Minus className="text-blue-500" size={24} />;
      default: return null;
    }
  };
  
  const getStatusText = (status: string) => {
      switch (status) {
        case 'Rising': return 'الأسعار في ارتفاع';
        case 'Falling': return 'الأسعار في انخفاض';
        case 'Stable': return 'الأسعار مستقرة';
        default: return status;
      }
  };

  const getRecColor = (rec: string) => {
    switch (rec) {
      case 'Buy Now': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Wait': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Negotiate': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Avoid': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-white bg-white/10 border-white/20';
    }
  };

  const getRecText = (rec: string) => {
    switch (rec) {
      case 'Buy Now': return 'اشترِ الآن';
      case 'Wait': return 'تريث';
      case 'Negotiate': return 'فاوض';
      case 'Avoid': return 'تجنب الشراء';
      default: return rec;
    }
  };
  
  const getSupplyDemandText = (sd: string) => {
      switch (sd) {
          case 'High': return 'مرتفع';
          case 'Medium': return 'متوسط';
          case 'Low': return 'منخفض';
          default: return sd;
      }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#0f1115] w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">تحليل السوق</h2>
                  <p className="text-sm text-white/50">{ad ? ad.title : "نظرة عامة على السوق الجزائري"}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-8">
              {loading || !data ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={40} className="text-brand-green animate-spin" />
                  <p className="text-white/60 font-medium">جاري جمع بيانات السوق وتحليلها...</p>
                </div>
              ) : (
                <>
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-full">
                      <div className="flex items-center gap-2 text-white/60 mb-2">
                        <LineChartIcon size={16} />
                        <span className="text-xs font-bold">حالة السوق</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-white">{getStatusText(data.marketStatus)}</span>
                        {getStatusIcon(data.marketStatus)}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-full">
                      <div className="flex items-center gap-2 text-white/60 mb-2">
                        <TrendingUp size={16} />
                        <span className="text-xs font-bold">السعر العادل</span>
                      </div>
                      <div className="text-xl font-black text-brand-green">{data.fairPrice.toLocaleString()} دج</div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-full">
                      <div className="flex items-center gap-2 text-white/60 mb-2">
                        <Activity size={16} />
                        <span className="text-xs font-bold">الطلب والعرض</span>
                      </div>
                      <div className="text-lg font-black text-white">{getSupplyDemandText(data.supplyDemand)}</div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-full">
                      <div className="flex items-center gap-2 text-white/60 mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-bold">متوسط وقت البيع</span>
                      </div>
                      <div className="text-lg font-black text-white">{data.avgSellingTime} يوم</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-6">تطور الأسعار</h3>
                    <div className="h-64 w-full" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.trendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="rgba(255,255,255,0.4)" 
                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} 
                            axisLine={false} 
                            tickLine={false} 
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.4)" 
                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '12px', color: '#fff', textAlign: 'right', direction: 'rtl' }}
                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                            formatter={(value: any) => [`${value.toLocaleString()} دج`, 'السعر']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#10b981" 
                            strokeWidth={4} 
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 6, stroke: '#111' }} 
                            activeDot={{ r: 8, strokeWidth: 0 }} 
                            animationDuration={1500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recommendation */}
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <div className="flex items-center gap-3 mb-6">
                        <Bot size={24} className="text-brand-green" />
                        <h3 className="text-lg font-bold text-white">توصية الذكاء الاصطناعي</h3>
                      </div>
                      <div className={cn("text-center p-4 rounded-xl font-black text-2xl mb-6 border", getRecColor(data.recommendation))}>
                        {getRecText(data.recommendation)}
                      </div>
                      <p className="text-white/70 leading-relaxed text-sm">
                        {data.explanation}
                      </p>
                    </div>

                    {/* Regional & Info */}
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                         <div className="flex items-center justify-between mb-4 text-white/60">
                           <span className="text-sm font-bold flex items-center gap-2"><MapPin size={16} /> الأسعار حسب المنطقة</span>
                         </div>
                         <div className="space-y-3">
                           {data.regionalComparison.map((region, i) => (
                             <div key={i} className="flex items-center justify-between">
                               <span className="text-white font-medium">{region.region}</span>
                               <span className="text-brand-green font-bold text-sm">{region.price.toLocaleString()} دج</span>
                             </div>
                           ))}
                         </div>
                      </div>


                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Search className="text-white/40" size={20} />
                          <span className="text-white font-medium">سيارات مشابهة معروضة</span>
                        </div>
                        <span className="text-xl font-black text-white">{data.similarListings}</span>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="text-brand-green" size={20} />
                          <span className="text-white font-medium text-sm">أفضل وقت للشراء/البيع</span>
                        </div>
                        <span className="text-brand-green font-bold text-sm text-left max-w-[50%]">{data.bestTimeToBuy}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

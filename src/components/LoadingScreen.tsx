import React, { useState, useEffect } from 'react';
import { Settings, Zap } from 'lucide-react';

const AZKAR = [
  "سبحان الله وبحمده، سبحان الله العظيم",
  "لا إله إلا الله، محمد رسول الله",
  "أستغفر الله العظيم وأتوب إليه",
  "اللهم صل وسلم على نبينا محمد",
  "لا حول ولا قوة إلا بالله العلي العظيم",
  "الحمد لله حمداً كثيراً طيباً مباركاً فيه"
];

export const LoadingScreen: React.FC = () => {
  const [zekrIndex, setZekrIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setZekrIndex((prev) => (prev + 1) % AZKAR.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-8">
      <div className="relative">
        {/* Animated Engine/Crankshaft Concept */}
        <div className="flex items-center gap-1">
          <Settings 
            size={64} 
            className="text-brand-green animate-[spin_3s_linear_infinite]" 
          />
          <Settings 
            size={48} 
            className="text-brand-red animate-[spin_2s_linear_infinite_reverse] -mt-8" 
          />
          <Settings 
            size={56} 
            className="text-white/20 animate-[spin_4s_linear_infinite] -ml-4" 
          />
        </div>
        
        {/* Spark/Zap Animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Zap 
            size={24} 
            className="text-amber-500 animate-pulse" 
          />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black tracking-tighter shiny-text">
          جاري تشغيل المحرك...
        </h2>
        <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto border border-white/5">
          <div className="h-full bg-brand-green animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] mb-4">
          Market Auto DZ
        </p>
        
        {/* Azkar Section */}
        <div className="h-10 flex items-center justify-center overflow-hidden transition-all duration-500 pt-8">
          <p 
            key={zekrIndex}
            className="text-brand-green/80 font-bold text-sm md:text-base animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {AZKAR[zekrIndex]}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

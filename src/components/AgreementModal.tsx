import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AgreementModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAgreed = localStorage.getItem('market_auto_dz_agreed');
    if (!hasAgreed) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('market_auto_dz_agreed', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80" 
              alt="Car Background" 
              className="w-full h-full object-cover opacity-40 scale-110 blur-md"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/95 to-[#0a0a0a]"></div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="max-w-lg w-full glass-card p-5 md:p-8 space-y-5 md:space-y-8 text-center border-brand-green/30 shadow-[0_0_50px_rgba(0,102,51,0.3)] relative z-10 max-h-[85dvh] overflow-y-auto no-scrollbar flex flex-col"
          >
            <div className="space-y-3 md:space-y-4 shrink-0">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-green rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-white/10 shadow-2xl shadow-brand-green/40 rotate-12">
                <ShieldCheck className="text-white w-8 h-8 md:w-12 md:h-12" />
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter">
                  MARKET<span className="text-brand-green">AUTO</span><span className="text-brand-red">DZ</span>
                </h1>
                <p className="text-brand-green font-bold text-[8px] md:text-sm tracking-[0.2em] uppercase">الجزائر 🇩🇿 ALGERIA</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h2 className="text-xl md:text-3xl font-black tracking-tighter">تعهد بالأمانة والمصداقية</h2>
              <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3 md:space-y-4 text-right">
                <div className="space-y-1">
                  <p className="text-base md:text-lg font-bold text-brand-green flex items-center justify-end gap-2">
                    بسم الله الرحمن الرحيم
                  </p>
                  <div className="relative overflow-hidden inline-block w-full">
                    <p className="text-xs md:text-base font-bold text-brand-green/60 italic text-right">
                      اللهم صلي و سلم على سيدنا محمد
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer"></div>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed font-medium text-xs md:text-base">
                  قال رسول الله صلى الله عليه وسلم: <span className="text-brand-red">"مَنْ غَشَّ فَلَيْسَ مِنِّي"</span>.
                </p>
                <p className="text-white/60 text-[10px] md:text-sm leading-relaxed">
                  أقر وأتعهد أمام الله عز وجل أن أكون صادقاً في كل المعلومات التي أقدمها، وأن لا أغش ولا أدلس في وصف السيارة أو حالتها، وأن تكون نيتي هي البيع والشراء بالحلال والمصداقية التامة.
                </p>
              </div>
            </div>

            <div className="space-y-4 shrink-0">
              <div className="flex items-start gap-2 md:gap-3 text-right p-3 md:p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5 w-4 h-4 md:w-5 md:h-5" />
                <p className="text-[10px] md:text-xs text-amber-500/80 leading-relaxed">
                  تذكر أنك مسؤول أمام الله وأمام القانون عن أي تضليل أو غش في المعلومات المقدمة.
                </p>
              </div>

              <button
                onClick={handleAgree}
                className="w-full btn-primary !py-3 md:!py-4 text-base md:text-lg flex items-center justify-center gap-3 group"
              >
                <CheckCircle2 className="group-hover:scale-110 transition-transform w-5 h-5 md:w-6 md:h-6" />
                أوافق وأتعهد بالصدق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

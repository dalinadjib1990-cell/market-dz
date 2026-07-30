import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

// Replace the return statement
const newReturn = `  return (
    <>
      {/* The Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] sm:inset-auto sm:bottom-[100px] sm:right-6 overflow-hidden sm:rounded-2xl border-0 sm:border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col w-full h-[100dvh] sm:w-[450px] lg:w-[600px] sm:h-[70vh] sm:max-h-[800px] pointer-events-auto"
          >
            <div className="bg-gradient-to-r from-brand-green/20 to-black border-b border-brand-green/30 p-4 pt-6 flex justify-between items-center z-10 shrink-0">
              <span className="font-black text-brand-green flex items-center gap-2 text-lg">
                <CarFront size={20} className="text-emerald-400" />
                الرسائل
              </span>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors backdrop-blur-md">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 w-full relative min-h-0 bg-brand-black">
              <div className="absolute inset-0 sm:rounded-b-2xl overflow-hidden flex flex-col">
                <Messages isWidget={true} initialChatId={targetChatId} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Floating Button */}
      <div className="fixed bottom-20 right-4 md:right-6 z-[90] pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-300 shadow-2xl",
            isOpen 
              ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30" 
              : "bg-gradient-to-tr from-emerald-600 to-brand-green border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 md:w-8 md:h-8" />
          ) : (
            <CarFront className="w-7 h-7 md:w-8 md:h-8" />
          )}
        </motion.button>
        
        {!isOpen && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] md:text-xs font-bold w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg"
          >
            {unreadCount > 9 ? '+9' : unreadCount}
          </motion.div>
        )}
      </div>
    </>
  );
}`;

content = content.replace(/  return \([\s\S]*?\);\n\}/, newReturn + '\n}');
fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble rewritten");

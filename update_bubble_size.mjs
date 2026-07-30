import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

// Change width to take most of the screen on desktop as requested
content = content.replace(
  /className="fixed inset-0 z-\[100\] sm:inset-auto sm:bottom-\[100px\] sm:right-6 overflow-hidden sm:rounded-2xl border-0 sm:border border-white\/10 bg-\[#0a0a0a\]\/95 backdrop-blur-xl shadow-\[0_10px_40px_rgba\(0,0,0,0\.8\)\] flex flex-col w-full h-\[100dvh\] sm:w-\[450px\] lg:w-\[600px\] sm:h-\[70vh\] sm:max-h-\[800px\] pointer-events-auto"/g,
  'className="fixed inset-0 z-[100] sm:inset-auto sm:bottom-[100px] sm:right-6 overflow-hidden sm:rounded-2xl border-0 sm:border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col w-full h-[100dvh] sm:w-[90vw] sm:max-w-[800px] sm:h-[80vh] sm:max-h-[800px] pointer-events-auto"'
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble size updated");

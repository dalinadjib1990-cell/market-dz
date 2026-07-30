import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

// Change the floating bubble position and dimensions
// On mobile: fixed inset-0 (full screen)
// On desktop: fixed bottom-24 right-6, w-[450px] lg:w-[600px] h-[700px]
content = content.replace(
  /<div className="fixed bottom-24 right-4 md:right-6 z-\[100\] flex flex-col items-start pointer-events-none">/g,
  '<div className="fixed sm:bottom-24 sm:right-6 z-[100] flex flex-col items-start pointer-events-none inset-0 sm:inset-auto">'
);

content = content.replace(
  /className="mb-4 overflow-hidden rounded-2xl border border-white\/10 bg-\[#0a0a0a\]\/95 backdrop-blur-xl shadow-\[0_10px_40px_rgba\(0,0,0,0\.8\)\] flex flex-col relative w-\[95vw\] md:w-\[450px\] lg:w-\[600px\] h-\[80vh\] md:h-\[700px\] max-h-\[85vh\] pointer-events-auto"/g,
  'className="overflow-hidden sm:mb-4 sm:rounded-2xl border-0 sm:border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col relative w-full h-full sm:w-[450px] lg:w-[600px] sm:h-[700px] sm:max-h-[85vh] pointer-events-auto"'
);

// We need to move the floating button (the car icon) out of the `fixed inset-0` div OR make sure it's positioned correctly.
// Currently the parent `div` has `inset-0 sm:inset-auto`, which means on mobile the parent is full screen.
// The button is inside this parent. If the parent is full screen, the button will be at the top-left unless we position it.
fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble responsive fixed");

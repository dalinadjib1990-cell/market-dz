import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

// Change the main container styling to be like messenger (95vw wide, responsive, no phone border)
content = content.replace(
  /className="mb-4 overflow-hidden rounded-\[2\.5rem\] border-\[6px\] border-\[#1a1a1a\] bg-\[#0a0a0a\] shadow-\[0_20px_50px_rgba\(0,0,0,0\.8\),_0_0_0_1px_rgba\(255,255,255,0\.1\)\] flex flex-col relative w-\[calc\(100vw-2rem\)\] sm:w-\[380px\] h-\[75vh\] sm:h-\[650px\] max-h-\[85vh\] pointer-events-auto"/g,
  'className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col relative w-[95vw] md:w-[450px] lg:w-[600px] h-[80vh] md:h-[700px] max-h-[85vh] pointer-events-auto"'
);

// Remove the phone notch
content = content.replace(
  /\{\/\* Phone Top Notch area \*\/\}\s*<div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 pointer-events-none">\s*<div className="w-24 h-5 bg-\[#1a1a1a\] rounded-b-2xl"><\/div>\s*<\/div>/g,
  ''
);

// Remove rounded-b-[2rem] from messages container
content = content.replace(
  /<div className="absolute inset-0 overflow-hidden rounded-b-\[2rem\]">/g,
  '<div className="absolute inset-0 overflow-hidden rounded-b-2xl">'
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble styling updated");

import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// Ensure form stays at bottom without sticky issues, by making it shrink-0
content = content.replace(
  /className=\{`p-4 md:p-6 border-t border-white\/10 flex gap-2 md:gap-4 bg-\[#0a0a0a\]\/90 backdrop-blur-xl sticky bottom-0 z-10 \$\{isWidget \? '' : 'pb-24 md:pb-6'\}`\}/g,
  'className={`p-4 md:p-6 border-t border-white/10 flex gap-2 md:gap-4 bg-[#0a0a0a]/90 backdrop-blur-xl shrink-0 ${isWidget ? \'\' : \'pb-24 md:pb-6\'}`}'
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages form fixed");

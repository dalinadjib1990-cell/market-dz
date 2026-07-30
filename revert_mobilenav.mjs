import fs from 'fs';
let content = fs.readFileSync('src/components/MobileNav.tsx', 'utf8');

content = content.replace(
  /item.primary \? "w-12 h-12 bg-\[#0a0a0a\] rounded-md border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-\[0_0_15px_rgba\(34,211,238,0.6\)\]" : "w-6 h-6"/g,
  'item.primary ? "w-14 h-14 bg-brand-green rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-green/40 scale-110 -translate-y-2" : "w-6 h-6"'
);

fs.writeFileSync('src/components/MobileNav.tsx', content);
console.log("MobileNav reverted");

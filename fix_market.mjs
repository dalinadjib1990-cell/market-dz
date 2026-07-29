import fs from 'fs';
let content = fs.readFileSync('src/components/MarketAnalysisPopup.tsx', 'utf8');

// Add bestTimeToBuy to MarketData interface
content = content.replace(
  /regionalComparison: { region: string; price: number }\[\];/,
  "regionalComparison: { region: string; price: number }[];\n  bestTimeToBuy: string;"
);

// Add bestTimeToBuy section below Regional & Info or inside Regional & Info
let infoSection = `
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
                      </div>`;

content = content.replace(
  /                      <div className="bg-white\/5 rounded-2xl p-5 border border-white\/5 flex items-center justify-between">\s*<div className="flex items-center gap-3">\s*<Search className="text-white\/40" size=\{20\} \/>\s*<span className="text-white font-medium">سيارات مشابهة معروضة<\/span>\s*<\/div>\s*<span className="text-xl font-black text-white">\{data\.similarListings\}<\/span>\s*<\/div>/,
  infoSection
);

fs.writeFileSync('src/components/MarketAnalysisPopup.tsx', content);

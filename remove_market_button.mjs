import fs from 'fs';
let content = fs.readFileSync('src/pages/AdDetails.tsx', 'utf8');

// The button has "تحليل السوق"
content = content.replace(
  /              <button \n                onClick=\{\(\) => setShowMarketAnalysis\(true\)\}\n                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-\[0_0_15px_rgba\(16,185,129,0\.3\)\] hover:shadow-\[0_0_25px_rgba\(16,185,129,0\.5\)\]"\n              >\n                <LineChartIcon size=\{20\} \/>\n                تحليل السوق\n              <\/button>\n/,
  ""
);

fs.writeFileSync('src/pages/AdDetails.tsx', content);

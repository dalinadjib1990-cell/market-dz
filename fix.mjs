import fs from 'fs';
let content = fs.readFileSync('src/pages/AdDetails.tsx', 'utf8');
content = content.replace(/    <\/div>\n      <MarketAnalysisPopup isOpen=\{showMarketAnalysis\} onClose=\{\(\) => setShowMarketAnalysis\(false\)\} ad=\{ad\} \/>\n    <\/div>\n  \);\n\}/, '      {ad && <MarketAnalysisPopup isOpen={showMarketAnalysis} onClose={() => setShowMarketAnalysis(false)} ad={ad} />}\n    </div>\n  );\n}');
fs.writeFileSync('src/pages/AdDetails.tsx', content);

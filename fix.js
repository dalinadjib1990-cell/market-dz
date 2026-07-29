const fs = require('fs');
let content = fs.readFileSync('src/pages/AdDetails.tsx', 'utf8');
content = content.replace(/      <MarketAnalysisPopup isOpen=\{showMarketAnalysis\} onClose=\{\(\) => setShowMarketAnalysis\(false\)\} ad=\{ad\} \/>\n    <\/div>\n  \);\n\}/, '');
content = content.replace(/    <\/div>$/, '      <MarketAnalysisPopup isOpen={showMarketAnalysis} onClose={() => setShowMarketAnalysis(false)} ad={ad} />\n    </div>\n  );\n}');
fs.writeFileSync('src/pages/AdDetails.tsx', content);

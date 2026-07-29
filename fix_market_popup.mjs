import fs from 'fs';
let content = fs.readFileSync('src/components/MarketAnalysisPopup.tsx', 'utf8');

content = content.replace(/ad: Ad;/, 'ad?: Ad;');
content = content.replace(/<p className="text-sm text-white\/50">\{ad\.title\}<\/p>/, '<p className="text-sm text-white/50">{ad ? ad.title : "نظرة عامة على السوق الجزائري"}</p>');

content = content.replace(/const q = query\(collection\(db, 'ads'\), where\('brand', '==', ad\.brand\)\);/, 
  "let q;\n      if (ad) {\n        q = query(collection(db, 'ads'), where('brand', '==', ad.brand));\n      } else {\n        q = query(collection(db, 'ads'));\n      }");

content = content.replace(/adDetails: ad,/, 'adDetails: ad || {},');

fs.writeFileSync('src/components/MarketAnalysisPopup.tsx', content);

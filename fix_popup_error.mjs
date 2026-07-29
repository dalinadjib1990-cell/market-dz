import fs from 'fs';
let content = fs.readFileSync('src/components/MarketAnalysisPopup.tsx', 'utf8');

content = content.replace(
  /const result = await response\.json\(\);\n\s*setData\(result\);/,
  "if (!response.ok) {\n        throw new Error('فشل في جلب البيانات');\n      }\n      const result = await response.json();\n      setData(result);"
);

fs.writeFileSync('src/components/MarketAnalysisPopup.tsx', content);

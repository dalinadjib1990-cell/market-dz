import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Add search tool to assess-car
content = content.replace(
  /config: \{\s*systemInstruction: systemInstruction,\s*temperature: 0\.7,\s*\}/g,
  "config: {\n                systemInstruction: systemInstruction,\n                temperature: 0.7,\n                tools: [{ googleSearch: {} }]\n              }"
);

// Add search tool to market-analysis
content = content.replace(
  /config: \{\s*systemInstruction: systemInstruction,\s*temperature: 0\.5,\s*\}/g,
  "config: {\n                systemInstruction: systemInstruction,\n                temperature: 0.5,\n                tools: [{ googleSearch: {} }]\n              }"
);

// Update system prompt to mention searching outside the app
content = content.replace(
  /ملاحظة: السعر في trendData، fairPrice، و regionalComparison يجب أن يكون بالدينار الجزائري \(دج\)\./,
  "ملاحظة: السعر في trendData، fairPrice، و regionalComparison يجب أن يكون بالدينار الجزائري (دج).\n      أنت متصل بالإنترنت الآن! استخدم محرك بحث جوجل للبحث في المواقع الجزائرية (مثل واد كنيس Ouedkniss، Autobip، وغيرها) لمعرفة أحدث الأسعار لسيارات مماثلة في السوق الحقيقي وتوفير بيانات دقيقة ومحدثة (Mise à jour) اليوم."
);

fs.writeFileSync('server.ts', content);

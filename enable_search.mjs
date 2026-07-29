import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /أنت متصل بالإنترنت الآن!/g,
  ""
);

content = content.replace(
  /ملاحظة: السعر في trendData، fairPrice، و regionalComparison يجب أن يكون بالدينار الجزائري \(دج\)\./,
  "ملاحظة: السعر في trendData، fairPrice، و regionalComparison يجب أن يكون بالدينار الجزائري (دج).\n      أنت متصل بالإنترنت الآن! استخدم أداة البحث في جوجل (googleSearch tool) للبحث في المواقع الجزائرية لمعرفة أحدث الأسعار لسيارات مماثلة في السوق الحقيقي وتوفير بيانات دقيقة ومحدثة اليوم."
);

content = content.replace(
  /config: \{\s*systemInstruction: systemInstruction,\s*temperature: 0\.5\s*\}/g,
  "config: {\n                systemInstruction: systemInstruction,\n                temperature: 0.5,\n                tools: [{ googleSearch: {} }]\n              }"
);

fs.writeFileSync('server.ts', content);

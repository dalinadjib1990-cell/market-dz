import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /أنت متصل بالإنترنت الآن! استخدم محرك بحث جوجل للبحث في المواقع الجزائرية \(مثل واد كنيس Ouedkniss، Autobip، وغيرها\) لمعرفة أحدث الأسعار لسيارات مماثلة في السوق الحقيقي وتوفير بيانات دقيقة ومحدثة \(Mise à jour\) اليوم\.\n/,
  ""
);

fs.writeFileSync('server.ts', content);

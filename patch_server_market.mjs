import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /let textContent = `معلومات الإعلان الحالي:\nالعنوان: \$\{adDetails\.title \|\| 'غير متوفر'\}\nالسعر: \$\{adDetails\.price \? adDetails\.price \+ ' دج' : 'غير متوفر'\}\nسوموني \(أعلى عرض\): \$\{adDetails\.samouni \? adDetails\.samouni \+ ' دج' : 'غير متوفر'\}\nالولاية: \$\{adDetails\.wilaya \|\| 'غير متوفر'\}\nالماركة: \$\{adDetails\.brand \|\| 'غير متوفر'\}\nسنة الصنع: \$\{adDetails\.year \|\| 'غير متوفر'\}\nالمسافة المقطوعة: \$\{adDetails\.mileage \? adDetails\.mileage \+ ' كم' : 'غير متوفر'\}\n\nبيانات السوق المتاحة \(سيارات مشابهة\):\n\$\{JSON\.stringify\(marketData \|\| \[\]\)\}`;/,
  `let textContent = adDetails.title ? \`معلومات الإعلان الحالي:
العنوان: \${adDetails.title || 'غير متوفر'}
السعر: \${adDetails.price ? adDetails.price + ' دج' : 'غير متوفر'}
سوموني (أعلى عرض): \${adDetails.samouni ? adDetails.samouni + ' دج' : 'غير متوفر'}
الولاية: \${adDetails.wilaya || 'غير متوفر'}
الماركة: \${adDetails.brand || 'غير متوفر'}
سنة الصنع: \${adDetails.year || 'غير متوفر'}
المسافة المقطوعة: \${adDetails.mileage ? adDetails.mileage + ' كم' : 'غير متوفر'}

بيانات السوق المتاحة (سيارات مشابهة):
\${JSON.stringify(marketData || [])}\` : \`طلب تحليل عام للسوق الجزائري للسيارات، يرجى تقديم نظرة عامة عن الأسعار، أكثر السيارات مبيعاً والتوجه الحالي للسوق.
بيانات السوق الحالية:
\${JSON.stringify(marketData || [])}\`;`
);

fs.writeFileSync('server.ts', content);

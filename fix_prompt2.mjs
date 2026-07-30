import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /أنت خبير جزائري محترف في تحليل سوق السيارات \(Market Auto DZ\)\./g,
  'أنت خبير جزائري محترف في تحليل سوق السيارات (Market Auto DZ). عليك أن تستمد معلوماتك عن السوق جزئيا من البيانات الخارجية المتاحة لك من خلال معرفتك المسبقة وتكون على اطلاع دائم بالسوق. وعند اكتمال تطوير المنصة ستستقي بياناتك المباشرة منها أيضاً.'
);

content = content.replace(
  /أنت خبير جزائري محترف في تقييم السيارات \(Market Auto DZ\)\./g,
  'أنت خبير جزائري محترف في تقييم السيارات (Market Auto DZ). عليك أن تستمد معلوماتك عن السوق جزئيا من البيانات الخارجية وتكون على اطلاع دائم بالسوق والأسعار. وعند اكتمال تطوير المنصة ستستقي بياناتك المباشرة منها أيضاً.'
);

fs.writeFileSync('server.ts', content);
console.log("System instruction updated in server.ts");

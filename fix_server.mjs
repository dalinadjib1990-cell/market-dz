import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Update JSON structure instruction in server.ts
content = content.replace(
  /"recommendation": "Buy Now" \| "Wait" \| "Negotiate" \| "Avoid",/,
  `"recommendation": "Buy Now" | "Wait" | "Negotiate" | "Avoid",\n        "bestTimeToBuy": "نصيحة قصيرة جداً، مثلاً: بداية الشتاء أو الآن لأن الأسعار منخفضة",`
);

fs.writeFileSync('server.ts', content);

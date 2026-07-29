import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /config: \{\s*systemInstruction: systemInstruction,\s*temperature: 0\.7\s*\}/g,
  "config: {\n                systemInstruction: systemInstruction,\n                temperature: 0.7,\n                tools: [{ googleSearch: {} }]\n              }"
);

content = content.replace(
  /\*\*مهم جداً\*\*: يجب أن تكون على دراية تامة بأسعار قطع الغيار والمحركات في السوق الجزائري/,
  "**مهم جداً**: استخدم أداة بحث جوجل (googleSearch) للبحث عن أحدث أسعار قطع الغيار والمحركات في السوق الجزائري،"
);

fs.writeFileSync('server.ts', content);

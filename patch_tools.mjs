import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /config: \{\s*systemInstruction: systemInstruction,\s*temperature: ([0-9\.]+),\s*\}/g,
  "config: {\n                systemInstruction: systemInstruction,\n                temperature: $1,\n                tools: [{ googleSearch: {} }]\n              }"
);

fs.writeFileSync('server.ts', content);

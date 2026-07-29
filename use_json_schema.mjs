import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /config: \{\s*systemInstruction: systemInstruction,\s*temperature: 0\.5,\s*tools: \[\{ googleSearch: \{\} \}\]\s*\}/g,
  "config: {\n                systemInstruction: systemInstruction,\n                temperature: 0.5,\n                tools: [{ googleSearch: {} }],\n                responseMimeType: \"application/json\"\n              }"
);

fs.writeFileSync('server.ts', content);

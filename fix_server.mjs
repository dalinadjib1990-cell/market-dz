import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /tools: \[\{ googleSearch: \{\} \}\]/g,
  ""
);

// We need to fix the trailing comma issue. It was:
// config: {
//   systemInstruction: systemInstruction,
//   temperature: 0.7,
//   
// }

content = content.replace(
  /config: \{\s*systemInstruction: systemInstruction,\s*temperature: ([0-9\.]+),\s*\}\s*\}/g,
  "config: { systemInstruction: systemInstruction, temperature: $1 } }"
);

// Wait, let's just do a simpler replace.
fs.writeFileSync('server.ts', content);

import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Remove googleSearch
content = content.replace(
  /,\s*tools: \[\{ googleSearch: \{\} \}\]/g,
  ""
);

content = content.replace(
  /const modelsToTry = \[.*?\];/g,
  'const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b"];'
);

fs.writeFileSync('server.ts', content);

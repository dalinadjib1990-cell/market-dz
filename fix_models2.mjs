import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const modelsToTry = \["gemini-2\.5-flash", "gemini-2\.0-flash", "gemini-1\.5-flash"\];/g,
  'const modelsToTry = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-2.5-flash", "gemini-2.0-flash-exp"];'
);

fs.writeFileSync('server.ts', content);

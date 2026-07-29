import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const modelsToTry = \["gemini-3\.6-flash", "gemini-3\.1-pro-preview", "gemini-flash-latest"\];/g,
  'const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];'
);

fs.writeFileSync('server.ts', content);

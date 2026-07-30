import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/const modelsToTry = \["gemini-2\.5-flash", "gemini-2\.0-flash", "gemini-1\.5-flash"\];/g, 'const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];');

fs.writeFileSync('server.ts', content);

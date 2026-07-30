import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/\/\/ tools: \[\{ googleSearch: \{\} \}\]/g, 'tools: [{ googleSearch: {} }]');
content = content.replace(/responseMimeType: "application\/json"/g, '// responseMimeType: "application/json"');

fs.writeFileSync('server.ts', content);
console.log("Search Re-enabled");

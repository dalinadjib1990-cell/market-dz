import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// For assess-car
content = content.replace(
  /const jsonMatch = responseText\.match\(\/```json\\n\(\[\\s\\S\]\*\?\)\\n```\/\);\n\s*if \(jsonMatch\) \{\n\s*responseText = jsonMatch\[1\];\n\s*\} else \{\n\s*responseText = responseText\.replace\(\/```\/g, ''\)\.trim\(\);\n\s*\}/g,
  `const jsonMatch = responseText.match(/\\{.*\\}/s);
            if (jsonMatch) {
              responseText = jsonMatch[0];
            } else {
              responseText = responseText.replace(/\`\`\`(json)?/g, '').trim();
            }`
);

fs.writeFileSync('server.ts', content);

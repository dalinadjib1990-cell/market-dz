import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const target = "let responseText = response.text || '';\n\n            return res.json(JSON.parse(responseText));";

const replacement = `let responseText = response.text || '';
            const jsonMatch = responseText.match(/\\{.*\\}/s);
            if (jsonMatch) {
              responseText = jsonMatch[0];
            } else {
              responseText = responseText.replace(/\`\`\`(json)?/g, '').trim();
            }
            return res.json(JSON.parse(responseText));`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);

import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const target = `            let responseText = response.text || '';
            const jsonMatch = responseText.match(/\\{.*\\}/s);
            if (jsonMatch) {
              responseText = jsonMatch[0];
            } else {
              responseText = responseText.replace(/\`\`\`(json)?/g, '').trim();
            }`;

content = content.replace(target, "let responseText = response.text || '';");

fs.writeFileSync('server.ts', content);

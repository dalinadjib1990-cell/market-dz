import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Remove responseMimeType
content = content.replace(
  /,\s*responseMimeType: "application\/json"/g,
  ""
);

// Restore jsonMatch block for market-analysis
const target = `            let responseText = response.text || '';
            return res.json(JSON.parse(responseText));`;

const replacement = `            let responseText = response.text || '';
            const jsonMatch = responseText.match(/\\{.*\\}/s);
            if (jsonMatch) {
              responseText = jsonMatch[0];
            } else {
              responseText = responseText.replace(/\`\`\`(json)?/g, '').trim();
            }
            return res.json(JSON.parse(responseText));`;

content = content.replace(target, replacement);

fs.writeFileSync('server.ts', content);

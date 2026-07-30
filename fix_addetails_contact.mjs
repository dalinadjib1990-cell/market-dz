import fs from 'fs';
let content = fs.readFileSync('src/pages/AdDetails.tsx', 'utf8');

content = content.replace(
  /navigate\('\/messages'\);/g,
  "window.dispatchEvent(new CustomEvent('open-chat-bubble', { detail: { chatId } }));"
);

fs.writeFileSync('src/pages/AdDetails.tsx', content);
console.log("AdDetails contact logic updated");

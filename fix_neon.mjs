import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

content = content.replace(
  /className="w-full h-full object-cover"\n            \/>/g,
  'className="w-full h-full object-cover"\n              style={{ filter: \'drop-shadow(0 0 5px cyan)\' }}\n            />'
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("Neon shadow added back");

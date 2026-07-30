import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

content = content.replace(
  /<img[\s\S]*?alt="Chat"[\s\S]*?\/>/g,
  '<MessageSquare className="text-cyan-400 w-6 h-6 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />'
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble icon fixed again");

import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

content = content.replace(
  /<MessageSquare className="text-cyan-400 w-6 h-6 drop-shadow-\[0_0_5px_rgba\(34,211,238,0\.8\)\]" \/>/g,
  `<img 
               src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=200&auto=format&fit=crop" 
               alt="Chat" 
               className="w-full h-full object-cover"
              style={{ filter: 'drop-shadow(0 0 5px cyan)' }}
            />`
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("Reverted icon");

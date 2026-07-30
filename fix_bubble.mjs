import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

content = content.replace(
  /w-\[calc\(100vw-2rem\)\] sm:w-\[350px\] md:w-\[380px\] h-\[55vh\] sm:h-\[500px\] md:h-\[600px\] max-h-\[800px\]/g,
  "w-[calc(100vw-2rem)] md:w-[350px] h-[60vh] md:h-[500px]"
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble fixed");

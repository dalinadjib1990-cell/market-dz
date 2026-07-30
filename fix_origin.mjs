import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

// Ensure origin is correct and flex-col alignment is correct for RTL
// Start is right, so items-start aligns to right.
content = content.replace(
  /flex flex-col items-\w+ pointer-events-auto/g,
  "flex flex-col items-start pointer-events-auto"
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble alignment fixed");

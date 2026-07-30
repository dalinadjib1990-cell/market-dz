import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

content = content.replace(
  /export default function Messages\(\{ isWidget = false \}: \{ isWidget\?: boolean \}\) \{/g,
  'export default function Messages({ isWidget = false, initialChatId }: { isWidget?: boolean, initialChatId?: string | null }) {'
);

content = content.replace(
  /setActiveChat\(updatedChats\[0\]\);\n\s+\}/g,
  "setActiveChat(updatedChats[0]);\n        }\n      }\n      if (initialChatId && !activeChat) {\n        const target = updatedChats.find(c => c.id === initialChatId);\n        if (target) setActiveChat(target);\n      }"
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages initialChatId added");

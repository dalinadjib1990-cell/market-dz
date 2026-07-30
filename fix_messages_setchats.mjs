import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

content = content.replace(
  /setChats\(updatedChats\);/g,
  "setChats(updatedChats);\n      if (initialChatId && !activeChat) {\n        const target = updatedChats.find(c => c.id === initialChatId);\n        if (target) setActiveChat(target);\n      }"
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages setChats logic updated");

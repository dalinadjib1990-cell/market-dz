import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// Remove the inline check
content = content.replace(
  /if \(initialChatId && !activeChat\) \{\n        const target = updatedChats\.find\(c => c\.id === initialChatId\);\n        if \(target\) setActiveChat\(target\);\n      \}/g,
  ""
);

// Add a proper useEffect for initialChatId
content = content.replace(
  /useEffect\(\(\) => \{\n    if \(!activeChat\) \{/g,
  "useEffect(() => {\n    if (initialChatId && chats.length > 0) {\n      const target = chats.find(c => c.id === initialChatId);\n      if (target && target.id !== activeChat?.id) {\n        setActiveChat(target);\n      }\n    }\n  }, [initialChatId, chats]);\n\n  useEffect(() => {\n    if (!activeChat) {"
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages initialChatId useEffect added");

import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

content = content.replace(
  /const \[isOpen, setIsOpen\] = useState\(false\);/g,
  "const [isOpen, setIsOpen] = useState(false);\n  const [targetChatId, setTargetChatId] = useState<string | null>(null);\n\n  useEffect(() => {\n    const handleOpen = (e: any) => {\n      setIsOpen(true);\n      if (e.detail?.chatId) {\n        setTargetChatId(e.detail.chatId);\n      }\n    };\n    window.addEventListener('open-chat-bubble', handleOpen);\n    return () => window.removeEventListener('open-chat-bubble', handleOpen);\n  }, []);"
);

// We should remove the Hide on messages route logic if we still want it, wait, we'll keep it just in case.
// But we also need to pass targetChatId to Messages.
content = content.replace(
  /<Messages isWidget=\{true\} \/>/g,
  '<Messages isWidget={true} initialChatId={targetChatId} />'
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble event listener added");

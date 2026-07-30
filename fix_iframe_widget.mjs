import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /function AppContent\(\) \{/g,
  `function AppContent() {\n  const isWidget = new URLSearchParams(window.location.search).get('widget') === 'true';`
);

content = content.replace(
  /<Header \/>/g,
  `{!isWidget && <Header />}`
);

content = content.replace(
  /<MobileNav \/>/g,
  `{!isWidget && <MobileNav />}`
);

content = content.replace(
  /<FloatingChatBubble \/>/g,
  `{!isWidget && <FloatingChatBubble />}`
);

content = content.replace(
  /<footer className="bg-\[#0a0a0a\] border-t border-white\/10 py-12 hidden md:block">/g,
  `{!isWidget && (\n<footer className="bg-[#0a0a0a] border-t border-white/10 py-12 hidden md:block">`
);

content = content.replace(
  /        <Toaster position="top-center" richColors \/>/g,
  `        </footer>\n        )}\n        <Toaster position="top-center" richColors />`
);

// We need to fix the main padding for widget mode
content = content.replace(
  /<main className="flex-1 pb-20 md:pb-0 w-full">/g,
  `<main className={\`flex-1 \${isWidget ? 'pb-0' : 'pb-20 md:pb-0'} w-full\`}>`
);

fs.writeFileSync('src/App.tsx', content);

let bubbleContent = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');
bubbleContent = bubbleContent.replace(/src="\/messages"/g, 'src="/messages?widget=true"');
fs.writeFileSync('src/components/FloatingChatBubble.tsx', bubbleContent);

console.log("Widget mode implemented");

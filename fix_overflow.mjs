import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// Ensure the main container in Messages is w-full
content = content.replace(
  /className=\{`max-w-7xl mx-auto px-0 md:px-4 \$\{isWidget \? 'h-full py-0' : 'h-\[calc\(100dvh-64px\)\] md:h-\[calc\(100vh-80px\)\] py-0 md:py-8'\}`\}/g,
  'className={`max-w-7xl w-full mx-auto px-0 md:px-4 ${isWidget ? \'h-full py-0\' : \'h-[calc(100dvh-64px)] md:h-[calc(100vh-80px)] py-0 md:py-8\'}`}'
);

// Add min-w-0 to the active chat flex container to prevent it from growing beyond its parent due to wide content (like quick replies)
content = content.replace(
  /className=\{cn\(\n          "flex-1 flex flex-col transition-all duration-300 relative h-full",/g,
  'className={cn(\n          "flex-1 flex flex-col transition-all duration-300 relative h-full min-w-0 w-full",'
);

// Add min-w-0 to the Quick Replies container
content = content.replace(
  /<div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-t border-white\/5 bg-\[#0a0a0a\]\/50">/g,
  '<div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-[#0a0a0a]/50 min-w-0 w-full shrink-0">'
);

// Add min-w-0 to the messages area
content = content.replace(
  /<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 no-scrollbar">/g,
  '<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 no-scrollbar min-w-0 w-full">'
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Overflow fixes applied");

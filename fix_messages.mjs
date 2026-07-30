import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// Update message bubble width
content = content.replace(
  /<div className="flex flex-col gap-1 max-w-\[85%\] md:max-w-\[70%\]">/g,
  '<div className="flex flex-col gap-1 w-full max-w-[95%] md:max-w-[85%]">'
);

// Update message text wrapping
content = content.replace(
  /className=\{cn\(\n                        "relative shadow-sm whitespace-pre-wrap leading-relaxed w-fit",/g,
  'className={cn(\n                        "relative shadow-sm whitespace-pre-wrap leading-relaxed w-fit break-words",'
);

// Ensure ad card doesn't cut things off
content = content.replace(
  /<p className="text-xs font-bold truncate text-brand-green">/g,
  '<p className="text-sm font-bold text-brand-green line-clamp-2">'
);

content = content.replace(
  /<div className="flex-1 min-w-0">/g,
  '<div className="flex-1 min-w-0 py-1">'
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages styling updated");

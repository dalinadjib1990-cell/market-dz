import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// Remove w-full from the flex-col wrapper so it properly aligns left/right
content = content.replace(
  /<div className="flex flex-col gap-1 w-full max-w-\[95%\] md:max-w-\[85%\]">/g,
  '<div className="flex flex-col gap-1 max-w-[95%] md:max-w-[85%]">'
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages width fixed");

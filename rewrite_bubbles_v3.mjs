import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

content = content.replace(
  /"max-w-\[85%\] md:max-w-\[70%\] relative shadow-sm whitespace-pre-wrap leading-relaxed"/g,
  '"max-w-[85%] md:max-w-[70%] w-fit relative shadow-sm whitespace-pre-wrap leading-relaxed inline-block"'
);

fs.writeFileSync('src/pages/Messages.tsx', content);

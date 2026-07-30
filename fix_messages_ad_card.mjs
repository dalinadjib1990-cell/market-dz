import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

// The image for the ad card at the top of the chat
content = content.replace(
  /className="w-16 h-12 rounded-lg object-cover"/g,
  'className="w-20 h-16 rounded-lg object-cover shrink-0"'
);
content = content.replace(
  /className="w-16 h-12 rounded-lg bg-black\/50 flex items-center justify-center"/g,
  'className="w-20 h-16 rounded-lg bg-black/50 flex items-center justify-center shrink-0"'
);

// We already changed truncate to line-clamp-2, let's make sure there are no other truncates in the chat header
content = content.replace(
  /<p className="font-bold text-white truncate text-base">/g,
  '<p className="font-bold text-white text-base break-words">'
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages ad card fixed");

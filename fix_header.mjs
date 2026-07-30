import fs from 'fs';
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

content = content.replace(
  /<Link to="\/messages"/g,
  '<button onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent(\'open-chat-bubble\')); }}'
);

// Note: Need to make sure closing tags are fixed too.
content = content.replace(
  /<\/Link>(\s*<div className="absolute -top-1 -right-1)/g,
  '</button>$1'
);
content = content.replace(
  /<\/Link>(\s*<div className="w-10 h-10)/g,
  '</button>$1'
);

// We need a more robust way to fix the closing tags.

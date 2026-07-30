import fs from 'fs';
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

content = content.replace(
  /<Link to="\/messages" className="p-2 hover:bg-white\/5 rounded-full transition-colors relative hidden xs:flex">/g,
  '<button onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent(\'open-chat-bubble\')); }} className="p-2 hover:bg-white/5 rounded-full transition-colors relative hidden xs:flex">'
);
content = content.replace(
  /<span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full"><\/span>\n              <\/Link>/g,
  '<span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full"></span>\n              </button>'
);

content = content.replace(
  /<Link to="\/messages" className="flex xs:hidden items-center gap-2 p-2.5 hover:bg-white\/5 rounded-lg text-sm transition-colors">/g,
  '<button onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent(\'open-chat-bubble\')); }} className="flex xs:hidden items-center gap-2 w-full p-2.5 hover:bg-white/5 rounded-lg text-sm transition-colors">'
);
content = content.replace(
  /الرسائل\n                  <\/Link>/g,
  'الرسائل\n                  </button>'
);

fs.writeFileSync('src/components/Header.tsx', content);
console.log("Header links replaced with buttons");

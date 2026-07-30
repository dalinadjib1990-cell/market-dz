import fs from 'fs';
let content = fs.readFileSync('src/components/MobileNav.tsx', 'utf8');

content = content.replace(
  /<Link\n              key=\{item\.path\}\n              to=\{item\.path\}/g,
  `<button
              key={item.path}
              onClick={(e) => {
                if (item.path === '/messages') {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('open-chat-bubble'));
                } else {
                  window.location.href = item.path;
                }
              }}`
);

content = content.replace(
  /<\/Link>/g,
  `</button>`
);

fs.writeFileSync('src/components/MobileNav.tsx', content);
console.log("MobileNav updated to use button");

import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

content = content.replace(
  /<div className="max-w-7xl mx-auto px-0 md:px-4 h-\[calc\(100dvh-64px\)\] md:h-\[calc\(100vh-80px\)\] py-0 md:py-8">/g,
  `{/* Added widget height logic */}
  <div className={\`max-w-7xl mx-auto px-0 md:px-4 \${new URLSearchParams(window.location.search).get('widget') === 'true' ? 'h-[100dvh] py-0' : 'h-[calc(100dvh-64px)] md:h-[calc(100vh-80px)] py-0 md:py-8'}\`}>`
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages height fixed");

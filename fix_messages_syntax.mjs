import fs from 'fs';
let content = fs.readFileSync('src/pages/Messages.tsx', 'utf8');

content = content.replace(
  /    \{\/\* Added widget height logic \*\/}\n  <div className=\{`max-w-7xl/g,
  `    <div className={\`max-w-7xl`
);

fs.writeFileSync('src/pages/Messages.tsx', content);
console.log("Messages syntax fixed");

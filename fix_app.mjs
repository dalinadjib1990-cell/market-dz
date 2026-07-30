import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /        <\/footer>\n        <\/footer>\n        \)}\n        <Toaster/g,
  `        </footer>\n        )}\n        <Toaster`
);

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx fixed");

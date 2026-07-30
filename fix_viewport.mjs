import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
  /<meta name="viewport" content="width=device-width, initial-scale=1.0" \/>/g,
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />'
);

fs.writeFileSync('index.html', content);
console.log("Viewport fixed");

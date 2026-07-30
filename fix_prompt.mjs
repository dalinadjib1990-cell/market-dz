import fs from 'fs';
let content = fs.readFileSync('src/lib/gemini.ts', 'utf8');

content = content.replace(
  /You are an expert car market analyst in Algeria./g,
  'You are an expert car market analyst in Algeria. You must analyze the market using the most recent data conceptually available to you, acting as an external live source of market dynamics. Once the platform is fully launched, this prompt will be augmented with live platform data.'
);

fs.writeFileSync('src/lib/gemini.ts', content);
console.log("Prompt updated");

import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /console\.error\(\`Error with key index \$\{i\} using model \$\{modelName\} in market-analysis:\`, error\.message\);/,
  "fs.appendFileSync('gemini_error.log', `Error with key index ${i} using model ${modelName} in market-analysis: ${error.message}\\n`);\nconsole.error(`Error with key index ${i} using model ${modelName} in market-analysis:`, error.message);"
);

content = "import fs from 'fs';\n" + content;

fs.writeFileSync('server.ts', content);

import fs from 'fs';
let content = fs.readFileSync('src/components/FloatingChatBubble.tsx', 'utf8');

if (!content.includes('import Messages')) {
  content = content.replace(
    /import \{ cn \} from '\.\.\/lib\/utils';/g,
    "import { cn } from '../lib/utils';\nimport Messages from '../pages/Messages';"
  );
}

content = content.replace(
  /<iframe \n                src="\/messages\?widget=true" \n                className="w-full h-full absolute inset-0 border-none" \n                title="Messages"\n              \/>/g,
  '<div className="absolute inset-0 overflow-hidden"><Messages isWidget={true} /></div>'
);

fs.writeFileSync('src/components/FloatingChatBubble.tsx', content);
console.log("FloatingChatBubble iframe removed");
